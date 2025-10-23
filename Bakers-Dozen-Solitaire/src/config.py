"""
config.py

Global configuration and constants used throughout the game,
including screen setup, fonts, colors, button sizes, and shared assets.

This file centralizes all UI styling and ensures consistent rendering across
menus, gameplay, replay screens, and buttons.
"""

import pygame

# Initialize Pygame modules
pygame.init()
clock = pygame.time.Clock()

# ---------------------------
# Window configuration
# ---------------------------

WINDOW_WIDTH = 1920
WINDOW_HEIGHT = 1080
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Baker's Dozen Solitaire")

# ---------------------------
# Color palette
# ---------------------------

COLOR_BACKGROUND     = (46, 46, 46)       # Dark gray background
COLOR_TEXT           = (255, 255, 255)    # Standard white text
COLOR_BUTTON         = (78, 154, 6)       # Green button color
COLOR_BUTTON_HOVER   = (108, 194, 74)     # Lighter green on hover
COLOR_EXIT           = (204, 59, 59)      # Red for exit buttons
COLOR_EXIT_HOVER     = (231, 76, 60)      # Brighter red on hover
COLOR_BORDER         = (0, 0, 0)          # Standard black for outlines
COLOR_SCORE          = (255, 215, 0)      # Gold color for scores
COLOR_HINT           = (255, 255, 0)      # Yellow for hints (card glow)
COLOR_HINT_TARGET    = (0, 255, 255)      # Cyan for hint destination

# ---------------------------
# Predefined button color sets
# ---------------------------

# (text_color, base_color, hover_color, border_color)
normal_button_colors = (COLOR_TEXT, COLOR_BUTTON, COLOR_BUTTON_HOVER, COLOR_BORDER)
exit_button_colors   = (COLOR_TEXT, COLOR_EXIT, COLOR_EXIT_HOVER, COLOR_BORDER)

# ---------------------------
# Fonts
# ---------------------------

# Default system fonts; FONT_DIGITAL uses a custom digital style
FONT_LARGE    = pygame.font.SysFont(None, 72)
FONT_MEDIUM   = pygame.font.SysFont(None, 48)
FONT_SMALL    = pygame.font.SysFont(None, 24)
FONT_DIGITAL  = pygame.font.Font("../assets/fonts/digital-7.ttf", 60)

# ---------------------------
# Button dimensions
# ---------------------------

BUTTON_WIDTH        = 200
BUTTON_HEIGHT       = 60
BUTTON_WIDTH_MENU   = 480
BUTTON_HEIGHT_MENU  = 80

# Card positions for foundation piles (mapped by suit)
foundation_positions = {
    suit: (1400, 25 + i * 220) for i, suit in enumerate(["Hearts", "Diamonds", "Clubs", "Spades"])
}