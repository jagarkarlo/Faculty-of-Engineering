"""
deck.py

Defines the Deck class used to manage a full set of playing cards
and handle card dealing for initializing the game.

The deck starts with all 52 standard cards and can deal a specified
number of cards at a time. Card order is randomized using Python's
built-in `random.shuffle()`.
"""

import random
from card import Card, SUITS, RANKS
from gamestate import GameState


class Deck:
    """
    Represents a standard 52-card deck used for shuffling and dealing.

    Attributes:
        cards (list): List of Card objects in current shuffled order.
    """

    def __init__(self):
        """
        Initializes a new shuffled deck containing one of each card.
        """
        self.cards = [Card(suit, rank) for suit in SUITS for rank in RANKS]
        random.shuffle(self.cards)

    def deal(self, num):
        """
        Deals a specified number of cards from the top of the deck.

        Args:
            num (int): Number of cards to deal.

        Returns:
            list: List of Card objects removed from the deck.

        Raises:
            IndexError: If the deck does not have enough cards.
        """
        return [self.cards.pop() for _ in range(num)]

    from gamestate import GameState

def generate_random_game_state():
    """
    Creates a new randomized GameState with:
    - A shuffled deck
    - 13 tableau columns of 4 cards each
    - Kings moved to the bottom of each column
    - Empty foundations
    """
    deck = Deck()
    tableau = [deck.deal(4) for _ in range(13)]
    send_kings_to_back(tableau)
    foundations = {suit: [] for suit in ["Hearts", "Diamonds", "Clubs", "Spades"]}
    return GameState(tableau, foundations)

def send_kings_to_back(tableau):
    """Moves Kings to the bottom of their stacks for improved solvability"""
    for column in tableau:
        kings = [card for card in column if card.rank == "K"]
        others = [card for card in column if card.rank != "K"]
        column[:] = kings + others

