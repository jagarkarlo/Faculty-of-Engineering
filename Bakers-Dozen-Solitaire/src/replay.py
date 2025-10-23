"""
replay.py

Handles the animation-free playback of a recorded game sequence.

This module is used to replay a list of moves from a given GameState,
after a game ends. It visually updates the game screen
at each step to show the progression of moves made during the game.

Expected use:
- Called from end screen ("Watch Replay" button)
- Used to verify solutions or review gameplay
"""

import pygame
import time
import copy
from gamestate import GameState
from config import *
from button import Button
from game_draw import update_visuals


def replay_moves(initial_state, move_history, draw_func, delay=1000):
    """
    Plays back a sequence of moves from an initial game state.

    Args:
        initial_state (GameState): The starting GameState object to replay from.
                                   Will be deepcopied to preserve the original.
        move_history (list): A list of move tuples representing the game's history.
                             Each move follows the format:
                             - ("tableau", from_col, to_col)
                             - ("foundation", from_col)
        draw_func (function): Function used to draw the current GameState.
                              Must accept at least one argument (game_state).
        delay (int): Time in milliseconds to wait between moves.

    Behavior:
        - Deepcopies the initial state to avoid mutating the original.
        - Applies each move in order with visual updates in between.
        - Waits after the last move before returning to allow the user
          to observe the final board state.
    """
    game_state = copy.deepcopy(initial_state)

    def handle_events():
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

    draw_func(game_state)
    pygame.display.flip()
    pygame.time.wait(delay)
    handle_events()

    for move in move_history:
        game_state.apply_move(move)
        update_visuals(game_state)
        draw_func(game_state)
        pygame.display.flip()
        pygame.time.wait(delay)
        handle_events()  # <-- process events between moves

    pygame.time.wait(1000)
    handle_events()  # final check before return

