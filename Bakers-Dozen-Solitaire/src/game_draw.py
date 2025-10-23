# game_draw.py
# Handles all visual rendering logic for Baker's Dozen Solitaire

import pygame
import time
import math
from config import *
from button import Button
from card import Card

# Buttons for sidebar
button_hint = None
button_solve = None
button_undo = None
button_exit = None

def draw(game_state, start_time, max_undos, active_card=None, hint_card=None, hint_target_card=None):
    screen.fill(COLOR_BUTTON)
    draw_tableau(game_state, active_card, hint_card, hint_target_card)
    draw_foundations(game_state)
    return draw_sidebar(game_state, start_time, max_undos)

def draw_replay(game_state):
    screen.fill(COLOR_BUTTON)
    draw_tableau(game_state)
    draw_foundations(game_state)

def draw_tableau(game_state, active_card=None, hint_card=None, hint_target_card=None):
    for column in game_state.tableau:
        for card in column:
            if card == active_card:
                continue
            if card == hint_card:
                draw_card_glow(card, COLOR_HINT)
            elif card == hint_target_card:
                draw_card_glow(card, COLOR_HINT_TARGET)
            screen.blit(card.image, card.rect.topleft)

def draw_foundations(game_state):
    for suit, (x, y) in foundation_positions.items():
        rect = pygame.Rect(x, y, 140, 200)
        foundation_surface = pygame.Surface((rect.width, rect.height), pygame.SRCALPHA)
        pygame.draw.rect(foundation_surface, (0, 0, 0, 100), foundation_surface.get_rect(), border_radius=12)
        pygame.draw.rect(foundation_surface, COLOR_BORDER, foundation_surface.get_rect(), width=3, border_radius=12)
        screen.blit(foundation_surface, (x, y))

        for idx, card in enumerate(game_state.foundations[suit]):
            screen_position = (card.rect.x, card.rect.y - 2 * idx)
            screen.blit(card.image, screen_position)

def draw_sidebar(game_state, start_time, max_undos):
    global button_hint, button_solve, button_undo, button_exit

    sidebar_x = 1640
    sidebar_width = 280
    pygame.draw.rect(screen, COLOR_BACKGROUND, pygame.Rect(sidebar_x, 0, sidebar_width, WINDOW_HEIGHT))
    pygame.draw.rect(screen, COLOR_BORDER, pygame.Rect(sidebar_x, 0, sidebar_width, WINDOW_WIDTH), width=2)

    # Timer
    elapsed = int(time.time() - start_time)
    minutes = elapsed // 60
    seconds = elapsed % 60
    colon = ":" if seconds % 2 == 0 else " "
    time_str = f"{minutes:02d}{colon}{seconds:02d}"

    screen.blit(FONT_DIGITAL.render("TIME", True, COLOR_BUTTON), (sidebar_x + 40, 0))
    pygame.draw.rect(screen, COLOR_BORDER, (sidebar_x + 40, 60, BUTTON_WIDTH, BUTTON_HEIGHT), border_radius=10)
    pygame.draw.rect(screen, COLOR_BUTTON, (sidebar_x + 40, 60, BUTTON_WIDTH, BUTTON_HEIGHT), width=2, border_radius=10)
    screen.blit(FONT_DIGITAL.render(time_str, True, COLOR_BUTTON), (sidebar_x + 80, 60))

    # Score
    screen.blit(FONT_DIGITAL.render("SCORE", True, COLOR_SCORE), (sidebar_x + 40, 120))
    pygame.draw.rect(screen, COLOR_BORDER, (sidebar_x + 40, 180, BUTTON_WIDTH, BUTTON_HEIGHT), border_radius=10)
    pygame.draw.rect(screen, COLOR_SCORE, (sidebar_x + 40, 180, BUTTON_WIDTH, BUTTON_HEIGHT), 2, border_radius=10)
    screen.blit(FONT_DIGITAL.render(f"{game_state.score}", True, COLOR_SCORE), (sidebar_x + 80, 180))

    # Buttons
    button_hint = Button(sidebar_x + 40, 260, BUTTON_WIDTH, BUTTON_HEIGHT, "Hint", normal_button_colors)
    button_solve = Button(sidebar_x + 40, 340, BUTTON_WIDTH, BUTTON_HEIGHT, "Solve", normal_button_colors)
    undo_label = f"Undo ({max_undos})" if max_undos > 0 else "Undo (None)"
    button_undo = Button(sidebar_x + 40, 420, BUTTON_WIDTH, BUTTON_HEIGHT, undo_label, normal_button_colors)
    button_undo.available = max_undos > 0
    button_exit = Button(sidebar_x + 40, 900, BUTTON_WIDTH, BUTTON_HEIGHT, "Exit", exit_button_colors)

    button_hint.draw(FONT_MEDIUM)
    button_solve.draw(FONT_MEDIUM)
    button_undo.draw(FONT_MEDIUM)
    button_exit.draw(FONT_MEDIUM)

    return {
        "hint": button_hint,
        "solve": button_solve,
        "undo": button_undo,
        "exit": button_exit
    }


def draw_card_glow(card, color, time_offset=0):
    x, y = card.rect.topleft
    width, height = card.card_size
    padding = 6

    glow_surface = pygame.Surface((width + padding * 2, height + padding * 2), pygame.SRCALPHA)
    t = time.time() + time_offset
    pulse = (math.sin(t * 3) + 1) / 2
    alpha = int(100 + pulse * 100)

    glow_color = (*color, alpha)
    pygame.draw.rect(glow_surface, glow_color, (0, 0, width + padding * 2, height + padding * 2), border_radius=12)
    screen.blit(glow_surface, (x - padding, y - padding))

def update_visuals(game_state):
    """
    Reassigns the pixel positions of all cards based on their current location
    in the tableau or foundations.
    Args:
        game_state (GameState): The current game state instance.
    """
    # Update tableau positions
    for col_id, column in enumerate(game_state.tableau):
        for row_id, card in enumerate(column):
            assign_position_tableau(card, col_id, row_id)
    # Update foundation positions
    for suit, pile in game_state.foundations.items():
        for card in pile:
            card.update_position(foundation_positions[suit])

def assign_position_tableau(card, col_id, row_id):
    """
    Assigns on-screen position to a card within the tableau layout.

    Args:
        card (Card): The card to position.
        col_id (int): Index of the column.
        row_id (int): Row position within the column.
    """
    x_spacing = 180  # Horizontal spacing between columns
    y_spacing = 45   # Vertical spacing between stacked cards

    is_top = col_id < 7  # Split layout: 7 columns on top row, 6 on bottom
    x_index = col_id if is_top else col_id - 7

    x = 80 + x_index * x_spacing
    y_base = 25 if is_top else 500
    y = y_base + row_id * y_spacing

    card.update_position((x, y))

def draw_end_screen(result, final_score):
    """
    Displays the end-of-game screen with final score and navigation options.

    Args:
        result (str): Game outcome message (e.g., "You Win!", "Game Over").
        final_score (float): The player's score to display.

    Returns:
        str: A command string indicating the next action:
             - "PLAY" to start a new game
             - "REPLAY" to watch the game replay
             - "EXIT" to return to the main menu
    """
    # Define central end screen area
    end_screen_x      = 100
    end_screen_y      = 50
    end_screen_width  = WINDOW_WIDTH - 200
    end_screen_height = WINDOW_HEIGHT - 200
    end_screen_rect   = pygame.Rect(end_screen_x, end_screen_y, end_screen_width, end_screen_height)

    # Create buttons
    button_x = end_screen_rect.centerx - BUTTON_WIDTH_MENU // 2
    button_y = end_screen_rect.centery - BUTTON_HEIGHT_MENU // 2

    button_play_new_game   = Button(button_x, button_y, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU,
                                    "Play New Game", normal_button_colors)
    button_watch_replay    = Button(button_x, button_y + 100, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU,
                                    "Watch Replay", normal_button_colors)
    button_exit_end_screen = Button(button_x, button_y + 200, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU,
                                    "Exit to Main Menu", exit_button_colors)

    # Event loop for end screen
    while True:
        mouse_position = pygame.mouse.get_pos()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                if button_exit_end_screen.is_clicked(mouse_position):
                    return "EXIT"
                elif button_play_new_game.is_clicked(mouse_position):
                    return "PLAY"
                elif button_watch_replay.is_clicked(mouse_position):
                    return "REPLAY"

        # Draw background panel
        pygame.draw.rect(screen, COLOR_BACKGROUND, end_screen_rect, border_radius=12)
        pygame.draw.rect(screen, COLOR_BORDER, end_screen_rect, width=5, border_radius=12)

        # Render result text and score
        result_text = FONT_LARGE.render(result, True, COLOR_TEXT)
        score_text = FONT_MEDIUM.render(f"Final score: {final_score:.2f}", True, COLOR_SCORE)

        screen.blit(result_text, result_text.get_rect(center=(end_screen_rect.centerx, end_screen_rect.top + 100)))
        screen.blit(score_text, score_text.get_rect(center=(end_screen_rect.centerx, end_screen_rect.top + 180)))

        # Draw interactive buttons
        button_play_new_game.draw(FONT_MEDIUM)
        button_watch_replay.draw(FONT_MEDIUM)
        button_exit_end_screen.draw(FONT_MEDIUM)

        pygame.display.flip()
        clock.tick(60)