"""
file_interaction.py

Provides utilities for reading and writing game state from and to files.

Includes:
- Parsing card strings from text
- Loading game states from test/replay files
- Writing logs of completed games (for replay, scoring, or analysis)
"""

from card import Card
import time

# Maps shorthand suit initials to full suit names
suit_map = {'H': 'Hearts', 'D': 'Diamonds', 'C': 'Clubs', 'S': 'Spades'}


def parse_card(card_str):
    """
    Parses a string representation of a card (e.g., "9H") into a Card object.

    Args:
        card_str (str): Two-part string with rank followed by suit initial (e.g., "10S", "AD").

    Returns:
        Card: A Card instance corresponding to the parsed data.
    """
    rank = card_str[:-1]
    suit_initial = card_str[-1]
    return Card(suit_map[suit_initial], rank)


def load_game_from_file(path):
    """
    Loads a saved game state from a text file.

    Supports loading both tableau and foundation states.
    File format:
        - First lines represent tableau columns (each line is a column)
        - Line "FOUNDATIONS:" marks start of foundation data

    Args:
        path (str): Path to the saved game state file.

    Returns:
        tuple: (tableau, foundations)
            - tableau: list of lists of Card objects
            - foundations: dict with suits as keys and card lists as values
    """
    tableau = []
    foundations = {suit: [] for suit in ["Hearts", "Diamonds", "Clubs", "Spades"]}
    reading_foundations = False

    with open(path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            if line.startswith("FOUNDATIONS"):
                reading_foundations = True
                continue

            if not reading_foundations:
                # Parse tableau column
                cards = [parse_card(token) for token in line.split()]
                tableau.append(cards)
            else:
                # Parse foundation row
                suit_name, *cards_str = line.replace(':', '').split()
                suit = suit_name
                if cards_str:
                    cards = [parse_card(token) for token in cards_str]
                    foundations[suit] = cards

    return tableau, foundations


def write_game_log(filename, elapsed_time, final_score, game_state, result):
    """
    Writes a summary of the last played game to a file.

    Includes:
        - Game outcome
        - Time taken
        - Final score
        - Final foundation states

    Args:
        filename (str): Path to the output log file.
        elapsed_time (float): Total duration of the game (in seconds).
        final_score (float): Final score achieved by the player.
        game_state (GameState): The final GameState object.
        result (str): Outcome message (e.g., "You Win!", "Game Over").
    """
    with open(filename, "w") as f:
        f.write("=== Baker's Dozen - Last Game ===\n")
        f.write(f"Result: {result}\n")
        f.write(f"Time elapsed: {elapsed_time:.2f} seconds\n")
        f.write(f"Final score: {final_score:.2f}\n\n")

        f.write("Foundations:\n")
        for suit, pile in game_state.foundations.items():
            cards = ' '.join(f"{card.rank}{card.suit[0]}" for card in pile)
            f.write(f"{suit}: {cards}\n")
