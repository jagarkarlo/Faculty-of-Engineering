"""
main_menu.py

Displays the main UI menu for Baker's Dozen Solitaire.

Includes:
- Main menu with four options (Play, Load, AI, Exit)
- Dynamic loading of board files for custom game selection
- AI solver selection menu (DFS, BFS, A*)
- Button rendering and menu mode switching
"""

import pygame
import sys
import os
from game import run_game
from gamestate import GameState
from button import Button
from replay import replay_moves
from file_interaction import load_game_from_file
from config import *
from solvers.bfs_solver import BFSSolver
from solvers.dfs_solver import DFSSolver
from solvers.greedy_solver import GreedySolver
from solvers.astar_solver import AStarSolver
from solvers.astar_2_solver import a_star,createRootNode,get_solutions
from deck import generate_random_game_state

# -------------------------
# Button Setup
# -------------------------

# Common position for menu buttons
button_x = WINDOW_WIDTH // 2 - 240
button_y = 400

# Predefined main menu buttons
button_play_human  = Button(button_x, button_y, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU, "Start Random Game", normal_button_colors)
button_load_custom = Button(button_x, button_y + 100, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU, "Load Custom Game", normal_button_colors)
button_play_ai     = Button(button_x, button_y + 200, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU, "Choose a Solver", normal_button_colors)
button_exit_game   = Button(button_x, button_y + 300, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU, "Quit Game", exit_button_colors)


# -------------------------
# Draw Main Menu
# -------------------------

def draw_main_menu():
    """
    Renders the primary main menu with title and four core buttons.
    """
    screen.fill(COLOR_BACKGROUND)

    title_text = FONT_LARGE.render("Baker's Dozen Solitaire", True, COLOR_TEXT)
    title_rect = title_text.get_rect(center=(WINDOW_WIDTH // 2, 200))
    screen.blit(title_text, title_rect)

    button_play_human.draw(FONT_MEDIUM)
    button_load_custom.draw(FONT_MEDIUM)
    button_play_ai.draw(FONT_MEDIUM)
    button_exit_game.draw(FONT_MEDIUM)

    pygame.display.flip()


# -------------------------
# Load Custom Game Menu
# -------------------------

def draw_load_custom_menu_buttons(board_files, button_rects):
    """
    Renders a list of custom board file buttons with wrapping layout.

    Args:
        board_files (list): List of filenames representing board states.
        button_rects (list): Container to store the Button objects.
    """
    max_per_column = 0
    row_id = 0
    
    for i, file in enumerate(board_files):
        current_button_id = i - max_per_column
        new_button_y = button_y // 4 + 50 * current_button_id
        if new_button_y >= WINDOW_HEIGHT - 100:
            row_id += 1
            new_button_x = button_x // 5 + 300 * row_id
            new_button_y = button_y // 4
            max_per_column = i
        else: 
            new_button_x = button_x // 5 + 300 * row_id

        if new_button_x >= WINDOW_WIDTH - 300:
            break

        button_rect = Button(new_button_x, new_button_y, BUTTON_WIDTH_MENU // 2, BUTTON_HEIGHT_MENU // 2, file, normal_button_colors)
        button_rect.draw(FONT_SMALL)
        button_rects.append(button_rect)

    pygame.display.flip()


def draw_load_custom_menu(board_files):
    """
    Draws the full screen for loading a custom board from file.

    Args:
        board_files (list): List of board filenames in /boards directory.

    Returns:
        list: List of all Button objects rendered (including exit).
    """
    screen.fill(COLOR_BACKGROUND)

    title_text = FONT_LARGE.render("Choose a Board", True, COLOR_TEXT)
    screen.blit(title_text, (80, 40))

    button_exit_load_custom = Button(480, 40, BUTTON_WIDTH_MENU // 2, BUTTON_HEIGHT_MENU // 2, "Exit to Main Menu", exit_button_colors)
    button_exit_load_custom.draw(FONT_SMALL)

    button_rects = [button_exit_load_custom]
    draw_load_custom_menu_buttons(board_files, button_rects)
    
    return button_rects


# -------------------------
# AI Solver Menu
# -------------------------

def draw_play_ai_menu():
    """
    Draws the AI solver selection screen with available algorithm options.

    Returns:
        list: List of Button objects (exit, DFS, BFS, A*).
    """
    screen.fill(COLOR_BACKGROUND)

    title_text = FONT_LARGE.render("Choose a Solver", True, COLOR_TEXT)
    title_rect = title_text.get_rect(center=(WINDOW_WIDTH // 2, 200))
    screen.blit(title_text, title_rect)

    button_dfs = Button(button_x, button_y, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU, "DFS", normal_button_colors)
    button_bfs = Button(button_x, button_y + 100, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU, "BFS", normal_button_colors)
    button_greedy = Button(button_x, button_y + 200, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU, "GREEDY", normal_button_colors)
    button_a_star = Button(button_x, button_y + 300, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU, "A*", normal_button_colors)
    button_a_star_2 = Button(button_x, button_y + 400, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU, "A* 2", normal_button_colors)
    button_exit_solver = Button(button_x, button_y + 500, BUTTON_WIDTH_MENU, BUTTON_HEIGHT_MENU, "Exit to Main Menu", exit_button_colors)

    button_dfs.draw(FONT_MEDIUM)
    button_bfs.draw(FONT_MEDIUM)
    button_greedy.draw(FONT_MEDIUM)
    button_a_star.draw(FONT_MEDIUM)
    button_a_star_2.draw(FONT_MEDIUM)
    button_exit_solver.draw(FONT_MEDIUM)

    pygame.display.flip()
    return [button_exit_solver, button_dfs, button_bfs, button_greedy, button_a_star, button_a_star_2]

def run_solver_and_replay_2(board_source):
    from game_draw import draw_replay, update_visuals
    from replay import replay_moves

    # Load initial state
    if isinstance(board_source, str):
        tableau, foundations = load_game_from_file(board_source)
        initial_state = GameState(tableau, foundations)
    else:
        initial_state = board_source()

    # Run solver with flexible kwargs
    solved = a_star(initial_state)
    solution_moves = get_solutions(solved)

    if solution_moves:
        print(f"Solution found in {len(solution_moves)} moves")
        print("Moves:", solution_moves)

        # Draw replay
        draw_replay_callback = lambda gs: (
            update_visuals(gs),
            draw_replay(gs)
        )
        replay_moves(initial_state, solution_moves, draw_func=draw_replay_callback)
    else:
        print("No solution found.")
def run_solver_and_replay(solver_class, board_source, **solver_kwargs):
    from game_draw import draw_replay, update_visuals
    from replay import replay_moves

    # Load initial state
    if isinstance(board_source, str):
        tableau, foundations = load_game_from_file(board_source)
        initial_state = GameState(tableau, foundations)
    else:
        initial_state = board_source()

    # Run solver with flexible kwargs
    solver = solver_class(initial_state, **solver_kwargs)
    solution_moves = solver.solve()

    if solution_moves:
        print(f"Solution found in {len(solution_moves)} moves")
        print("Moves:", solution_moves)

        # Draw replay
        draw_replay_callback = lambda gs: (
            update_visuals(gs),
            draw_replay(gs)
        )
        replay_moves(initial_state, solution_moves, draw_func=draw_replay_callback)
    else:
        print("No solution found.")



# -------------------------
# Menu Loop
# -------------------------

mode = "menu"
board_buttons = []
board_files = [f for f in os.listdir("../boards") if f.endswith(".txt")]

running = True
while running:
    mouse_position = pygame.mouse.get_pos()

    # MAIN MENU
    if mode == "menu":
        draw_main_menu()

        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                running = False

            elif event.type == pygame.MOUSEBUTTONDOWN:
                if button_play_human.is_clicked(mouse_position):
                    run_game()
                    mode = "menu"

                elif button_load_custom.is_clicked(mouse_position):
                    mode = "load"

                elif button_play_ai.is_clicked(mouse_position):
                    mode = "ai"

                elif button_exit_game.is_clicked(mouse_position):
                    running = False

    # CUSTOM BOARD MENU
    elif mode == "load":
        board_buttons = draw_load_custom_menu(board_files)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                mode = "menu"

            elif event.type == pygame.MOUSEBUTTONDOWN:
                for button in board_buttons:
                    if board_buttons[0].is_clicked(mouse_position):
                        mode = "menu"
                    elif button.is_clicked(mouse_position):
                        run_game(os.path.join("../boards", button.text))
                        mode = "menu"

    # AI SOLVER MENU
    elif mode == "ai":
        solver_buttons = draw_play_ai_menu()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                mode = "menu"

# TODO: SOLVERS
            elif event.type == pygame.MOUSEBUTTONDOWN:
                for button in solver_buttons:
                    if solver_buttons[0].is_clicked(mouse_position):
                        mode = "menu"
                    elif button.is_clicked(mouse_position):
                        if button.text == "DFS":
                            run_solver_and_replay(DFSSolver, "../boards/algorithm_test.txt")
                            mode == "menu"

                        elif button.text == "BFS":
                            run_solver_and_replay(BFSSolver, "../boards/algorithm_test.txt")
                            mode == "menu"

                        elif button.text == "GREEDY":
                            run_solver_and_replay(GreedySolver, generate_random_game_state)
                            mode == "menu"

                        elif button.text == "A*":
                            run_solver_and_replay(AStarSolver, generate_random_game_state)
                            mode == "menu"
                        elif button.text == "A* 2":
                            run_solver_and_replay_2( generate_random_game_state)
                            mode == "menu"
    clock.tick(60)

pygame.quit()
sys.exit()
