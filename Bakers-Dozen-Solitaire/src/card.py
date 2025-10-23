"""
card.py

This module defines the Card class used throughout the game to represent individual playing cards.
It also includes a utility function for loading card images efficiently with border rendering.

Cards are Pygame sprites that store their rank, suit, position, and image. 
"""

import pygame
from config import COLOR_BORDER

# Constants for suits and ranks used in deck construction and display
SUITS = ["Hearts", "Diamonds", "Clubs", "Spades"]
RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

# Internal image cache to avoid reloading images unnecessarily
_card_image_cache = {}

def get_card_image(suit, rank, card_size):
    """
    Loads a card image with a black rounded border, using an internal cache.

    Args:
        suit (str): Suit of the card (e.g., "Hearts").
        rank (str): Rank of the card (e.g., "K", "3", "A").
        card_size (tuple): Width and height of the final card surface.

    Returns:
        pygame.Surface: The final image surface with border applied.
    """
    key = f"{suit}_{rank}"
    if key not in _card_image_cache:
        path = f"../assets/cards/{key}.png"

        # Create inner image (shrunk to allow border visibility)
        border_thickness = 2
        inner_size = (card_size[0] - 2 * border_thickness, card_size[1] - 2 * border_thickness)
        card_image = pygame.transform.scale(pygame.image.load(path), inner_size)

        # Create transparent surface and draw a black border
        bordered_surface = pygame.Surface(card_size, pygame.SRCALPHA)
        pygame.draw.rect(
            bordered_surface,
            (0, 0, 0),
            bordered_surface.get_rect(),
            width=border_thickness,
            border_radius=12
        )

        # Center the image within the border
        bordered_surface.blit(card_image, (border_thickness, border_thickness))

        # Store in cache
        _card_image_cache[key] = bordered_surface

    return _card_image_cache[key]


class Card(pygame.sprite.Sprite):
    """
    Represents a single playing card used in the game logic and display.

    Attributes:
        suit (str): Suit of the card ("Hearts", "Spades", etc.).
        rank (str): Rank of the card ("A", "2", ..., "K").
        card_size (tuple): Dimensions of the card image.
        image_path (str): Path to the card asset image.
        image (pygame.Surface): Rendered image of the card with border.
        rect (pygame.Rect): Position and size of the card for rendering/collision.
    """

    def __init__(self, suit, rank):
        """
        Initializes a Card instance.

        Args:
            suit (str): Suit of the card.
            rank (str): Rank of the card.
        """
        super().__init__()
        self.suit = suit
        self.rank = rank
        self.card_size = (140, 200)
        self.image_path = f"../assets/cards/{suit}_{rank}.png"
        self.image = get_card_image(suit, rank, self.card_size)
        self.rect = self.image.get_rect()

    def __repr__(self):
        """Returns a string representation of the card."""
        return f"{self.rank} of {self.suit}"

    def value(self):
        """
        Returns the card's numeric value used for sequencing logic.

        Returns:
            int: Index of the card's rank in the RANKS list.
        """
        return RANKS.index(self.rank)

    def update_position(self, pos):
        """
        Updates the visual position of the card.

        Args:
            pos (tuple): New (x, y) topleft position.
        """
        self.rect.topleft = pos

    def is_valid_move(self, drop_position_card):
        """
        Determines if this card can legally be placed on another card.

        Args:
            drop_position_card (Card): The target card on which this one would be dropped.

        Returns:
            bool: True if move is valid (i.e., one less in value).
        """
        return self.value() == drop_position_card.value() - 1

    def __deepcopy__(self, memo):
        """
        Custom deepcopy to avoid copying Pygame surface objects.

        Returns:
            Card: A new card instance with the same suit, rank, and position.
        """
        new_card = type(self)(self.suit, self.rank)
        new_card.rect = self.rect.copy()
        return new_card
