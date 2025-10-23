"""
button.py

This module defines a custom Button class for Pygame UI components. 
It supports shadow rendering, hover color changes, and click detection.

Used throughout the UI (menus, sidebar, replay controls).
"""

import pygame
from config import (screen, COLOR_BACKGROUND)

class Button:
    """
    Represents a clickable UI button in the game interface.

    Attributes:
        rect (pygame.Rect): Defines the position and size of the button.
        text (str): The label displayed on the button.
        colors (tuple): A tuple of (text_color, base_color, hover_color, border_color).
        available (bool): Whether the button is currently active (visible and interactive).
    """

    def __init__(self, x, y, width, height, text, colors):
        """
        Initializes a Button instance.

        Args:
            x (int): The x-coordinate of the button's top-left corner.
            y (int): The y-coordinate of the button's top-left corner.
            width (int): Button width in pixels.
            height (int): Button height in pixels.
            text (str): Text label of the button.
            colors (tuple): Colors in the format (text, base, hover, border).
        """
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.colors = colors
        self.available = True

    def draw(self, font, border_width=2):
        """
        Renders the button on the screen with visual effects.

        Args:
            font (pygame.font.Font): Font used for rendering the button text.
            border_width (int): Width of the button border. Defaults to 2.

        Returns:
            pygame.Rect: The button's rectangle (useful for event handling).
        """
        text_color, base_color, hover_color, border_color = self.colors

        if self.available:
            # Change color on hover
            color = hover_color if self.is_clicked(pygame.mouse.get_pos()) else base_color

            # Draw shadow behind the button
            shadow_offset = (4, 4)
            shadow_surface = pygame.Surface((self.rect.width, self.rect.height), pygame.SRCALPHA)
            shadow_surface.fill((0, 0, 0, 0))
            pygame.draw.rect(shadow_surface, (0, 0, 0, 100), shadow_surface.get_rect(), border_radius=12)
            screen.blit(shadow_surface, (self.rect.x + shadow_offset[0], self.rect.y + shadow_offset[1]))

            # Draw button rectangle
            pygame.draw.rect(screen, color, self.rect, border_radius=12)
            pygame.draw.rect(screen, border_color, self.rect, width=border_width, border_radius=12)
        else:
            # Inactive state (blank background)
            pygame.draw.rect(screen, COLOR_BACKGROUND, self.rect, border_radius=12)

        # Draw centered text
        text_surf = font.render(self.text, True, text_color)
        text_rect = text_surf.get_rect(center=self.rect.center)
        screen.blit(text_surf, text_rect)

        return self.rect

    def is_clicked(self, mouse_pos):
        """
        Checks if the button is being hovered or clicked.

        Args:
            mouse_pos (tuple): The current mouse position.

        Returns:
            bool: True if mouse is over the button, False otherwise.
        """
        return self.rect.collidepoint(mouse_pos)
