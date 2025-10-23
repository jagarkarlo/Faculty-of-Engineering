"""
game.py

Main game logic and loop for Baker's Dozen Solitaire.

Responsibilities:
- Initializes and runs the game session (random or from file)
- Handles player input (drag/drop, hints, undo)
- Manages card rendering, animations, and visual effects
- Tracks game progress, scoring, and win/loss conditions
- Supports game replays and end-of-game options

Key Modules Used:
- GameState: logic and rule enforcement
- Deck: shuffling and dealing
- Button: UI button rendering and interaction
- Config: layout constants and styles
- Replay: move playback
- File Interaction: logging and loading game state
- End Game: draw end screen

Entry point: run_game()
"""


import pygame
import time
import sys
import copy
import math
from collections import deque
from gamestate import GameState
from deck import Deck, generate_random_game_state
from file_interaction import write_game_log
from button import Button
from config import *
from replay import replay_moves
from game_draw import draw, draw_end_screen, draw_replay, update_visuals


def run_game(load_path=None):
    """
    Main entry point for starting and running a game session.

    Args:
        load_path (str, optional): If provided, loads a game from the specified file.
                                   Otherwise, a new randomized game is initialized.
    """
    # -----------------------------
    # Initialization Variables
    # -----------------------------

    # Timing control
    start_time = None

    # Game state and logic
    deck = None
    game_over = False
    game_state = None
    game_state_history = deque()  # Used for undo functionality (deepcopies)
    move_history = []             # Stores sequence of player moves

    # Drag-and-drop tracking
    active_card = None
    dragging_from_col = None
    mouse_offset = (0, 0)

    # Hint logic
    hint_card = None
    hint_target_card = None
    given_hints = []

    # Undo control
    max_undos = 3

    # -----------------------------
    # Initialization Functions
    # -----------------------------

    def initialize_deck():
        """
        Sets up a new game:

        - Loads a saved layout if `load_path` is provided
        - Otherwise, generates a random GameState using a shuffled deck
        - Initializes undo history, visuals, and timer
        """
        nonlocal deck, start_time, game_over, game_state, game_state_history

        if load_path:
            from file_interaction import load_game_from_file
            tableau, foundations = load_game_from_file(load_path)
            deck = None  # Not needed when loading from file
            game_state = GameState(tableau, foundations)
        else:
            game_state = generate_random_game_state()

        update_visuals(game_state)
        game_state_history.append(copy.deepcopy(game_state))  # For undo functionality
        start_time = time.time()
        game_over = False

    # -----------------------------
    # Drawing Functions
    # -----------------------------

    def update_card_movement(mouse_position):
        """
        Smoothly moves the active card toward the mouse position using linear interpolation.

        Args:
            mouse_position (tuple): Current (x, y) position of the mouse.
        """
        lerp_factor = 0.5  # Controls card "snappiness" when following the cursor

        current_x, current_y = active_card.rect.topleft
        target_x = mouse_position[0] - mouse_offset[0]
        target_y = mouse_position[1] - mouse_offset[1]

        # Linear interpolation toward target
        new_x = current_x + (target_x - current_x) * lerp_factor
        new_y = current_y + (target_y - current_y) * lerp_factor

        # Update card's rectangle position
        active_card.rect.topleft = (new_x, new_y)

        # Redraw card at new position
        screen.blit(active_card.image, active_card.rect.topleft)


    # -----------------------------
    # Action Functions
    # -----------------------------
    def pick_up_card(mouse_position):
        """
        Handles picking up a card when the player clicks on it.

        - If the card can go directly to a foundation, auto-plays it.
        - Otherwise, prepares the card for drag-and-drop.

        Args:
            mouse_position (tuple): The current mouse (x, y) position.
        """
        nonlocal active_card, dragging_from_col, mouse_offset

        active_card = None
        dragging_from_col = None

        # Check each tableau column for topmost card under cursor
        for col_id, column in enumerate(game_state.tableau):
            if column and column[-1].rect.collidepoint(mouse_position):
                top_card = column[-1]

                # Auto-play to foundation if valid
                if game_state.valid_foundation_move(top_card):
                    move = ("foundation", col_id)
                    move_history.append(move)
                    game_state.apply_move(move)
                    update_visuals(game_state)
                    return

                # Otherwise, start dragging
                active_card = top_card
                dragging_from_col = col_id

                # Store offset between mouse and card's top-left to keep it centered while dragging
                mouse_offset = (
                    mouse_position[0] - active_card.rect.x,
                    mouse_position[1] - active_card.rect.y
                )
                return


    def after_move_procedure():
        """
        Common cleanup procedure after a move has been applied:
        - Resets drag/drop variables
        - Clears hint state
        - Repositions cards
        """
        nonlocal active_card, dragging_from_col, hint_card, hint_target_card, given_hints

        update_visuals(game_state)
        active_card = None
        dragging_from_col = None
        hint_card = None
        hint_target_card = None
        given_hints = []


    def drop_card(mouse_position):
        """
        Attempts to place the currently dragged card on another card (tableau)
        or onto a foundation if valid. Reverts if no valid destination found.

        Args:
            mouse_position (tuple): Current mouse position where card is dropped.
        """
        if active_card is None:
            return

        # Attempt tableau drop
        for to_col_id, column in enumerate(game_state.tableau):
            if column:
                last_card = column[-1]

                # Check if dragged card can legally follow last_card
                if active_card.is_valid_move(last_card) and last_card.rect.collidepoint(mouse_position):
                    move = ("tableau", dragging_from_col, to_col_id)
                    move_history.append(move)
                    game_state.apply_move(move)
                    update_visuals(game_state)
                    game_state_history.append(copy.deepcopy(game_state))
                    after_move_procedure()
                    return

        # Attempt foundation drop (even if cursor is not directly over target)
        if game_state.valid_foundation_move(active_card):
            move = ("foundation", dragging_from_col)
            move_history.append(move)
            game_state.apply_move(move)
            update_visuals(game_state)
            game_state_history.append(copy.deepcopy(game_state))
            after_move_procedure()
            return

        # No valid move — revert card to original state
        after_move_procedure()


    # -----------------------------
    # Endgame Functions
    # -----------------------------
    def calculate_final_score(elapsed_time):
        """
        Calculates the final score based on remaining time.

        Players earn 15 bonus points for each second left before the 12-minute mark (720s),
        but only if they successfully complete the game.

        Args:
            elapsed_time (float): Total duration the player has been playing.

        Returns:
            int: The final computed score.
        """
        remaining_seconds = 720 - elapsed_time

        # Bonus points only apply if the game was actually won
        if remaining_seconds > 0 and game_state.is_goal_state():
            return game_state.score + 15 * remaining_seconds
        else:
            return game_state.score


    def end_game(result):
        """
        Handles game-over logic and transitions to end screen.

        - Displays end screen with score and options.
        - Saves game log.
        - Replays game if selected.
        - Restarts a new game if selected.

        Args:
            result (str): End result message (e.g., win, timeout, no more moves).
        """
        nonlocal game_over

        final_time = time.time() - start_time
        final_score = calculate_final_score(final_time)

        # Display end screen and get player choice
        end_choice = draw_end_screen(result, final_score)

        if end_choice == "EXIT":
            game_over = True
            write_game_log("../logs/last_game.txt", final_time, final_score, game_state, result)

        elif end_choice == "REPLAY":
            print("---")
            for id, move in enumerate(move_history):
                print(f"Move {id + 1}: {move}")
            print("---")
            game_over = True
            
            draw_replay_callback = lambda gs: draw_replay(gs)
            replay_moves(game_state_history[0], move_history, draw_func=draw_replay_callback)
            end_game(result)

        elif end_choice == "PLAY":
            game_over = True
            write_game_log("../logs/last_game.txt", final_time, final_score, game_state, result)
            run_game()  # Start a new game session


    def check_game_end():
        """
        Evaluates if the game should end, based on:
        - Win condition (all foundations full)
        - No valid moves remaining
        - Timer exceeding 12 minutes (720 seconds)
        """
        if game_state.is_goal_state():
            end_game("You Win! All foundations are complete.")

        elif len(game_state.get_valid_moves()) == 0:
            end_game("Game over, no more moves available.")

        elif time.time() - start_time >= 720:
            end_game("Time's up! You lose.")

    # -----------------------------
    # Hint Functions
    # -----------------------------
    def get_hint_move():
        """
        Determines the next best move to suggest to the player.

        Prioritizes foundation moves over tableau moves and avoids repeating
        the same hints in a cycle by tracking previously suggested moves.

        Returns:
            tuple or None: A valid move tuple not yet suggested, or None if exhausted.
        """
        nonlocal given_hints

        # Sort valid moves with foundation moves first
        sorted_valid_moves = sorted(
            game_state.get_valid_moves(),
            key=lambda x: 0 if x[0] == 'foundation' else 1
        )

        # Reset if all hints have been shown
        if len(sorted_valid_moves) == len(given_hints):
            given_hints = []

        # Return the next move that hasn't been hinted yet
        for move in sorted_valid_moves:
            if given_hints and move in given_hints:
                continue
            return move


    def process_hint():
        """
        Processes a hint by selecting a card to glow and optionally its target.

        Updates:
            - `hint_card`: the card to move
            - `hint_target_card`: the card to place it on (if tableau move)
            - `given_hints`: logs the move to avoid repetition
        """
        nonlocal hint_card, hint_target_card, given_hints

        # Reset previous hint visuals
        hint_card = None
        hint_target_card = None

        # Get next hint
        hint_move = get_hint_move()
        if not hint_move:
            return

        move_type = hint_move[0]
        from_col = hint_move[1]
        hint_card = game_state.tableau[from_col][-1]  # Card to be moved
        given_hints.append(hint_move)

        if move_type == "tableau":
            to_col = hint_move[2]
            hint_target_card = game_state.tableau[to_col][-1]  # Destination card


    # -----------------------------
    # Undo Functionality
    # -----------------------------

    def process_undo():
        """
        Handles undo functionality:
        - Restores the previous game state from history
        - Updates visuals
        - Deducts an undo count

        Only works if:
        - At least one move was made
        - Player has undo credits remaining
        """
        nonlocal game_state, game_state_history, max_undos, move_history

        if max_undos > 0 and len(game_state_history) >= 2:
            game_state_history.pop()  # Remove current state
            game_state = copy.deepcopy(game_state_history[-1])  # Restore previous
            move_history.pop()
            update_visuals(game_state)
            max_undos -= 1
        else:
            return

    ## -----------------------------
    ## Main Game Loop
    ## -----------------------------

    # Initialize game state and layout (random or from file)
    initialize_deck()

    # Flag to control loop state
    running = True

    while running:
        # Check for win, loss, or timeout
        check_game_end()

        if game_over:
            break

        # Handle input events
        for event in pygame.event.get():
            
            if event.type == pygame.QUIT:
                # Exit via window close
                pygame.quit()
                sys.exit()

            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                # Allow ESC key to exit the game loop
                running = False

            elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                # Left mouse button pressed
                mouse_position = pygame.mouse.get_pos()

                # Handle UI buttons
                if buttons['exit'].is_clicked(mouse_position):
                    running = False

                if buttons['hint'].is_clicked(mouse_position):
                    process_hint()

                if buttons['undo'].is_clicked(mouse_position):
                    process_undo()

                # If not interacting with buttons, try to pick up a card
                elif active_card is None:
                    pick_up_card(mouse_position)

            elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
                # On release, drop the card if one is being dragged
                if active_card is not None:
                    drop_card(pygame.mouse.get_pos())

        # Draw frame
        buttons = draw(
            game_state=game_state,
            start_time=start_time,
            max_undos=max_undos,
            active_card=active_card,
            hint_card=hint_card,
            hint_target_card=hint_target_card
            )

        # If dragging a card, update its animation position
        if active_card:
            update_card_movement(pygame.mouse.get_pos())

        # Refresh display and cap framerate
        pygame.display.flip()
        clock.tick(60)  # Limit to 60 FPS

    