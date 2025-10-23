"""
gamestate.py

Defines the GameState class, which holds the current layout of the game board,
manages card moves, scoring, goal detection, and automatic foundation promotion.

This is the primary logic layer that abstracts game rules from rendering.
"""

class GameState:
    """
    Represents the full state of a Baker's Dozen Solitaire game.

    Attributes:
        tableau (list of list of Card): 10 tableau columns, each a list of Card objects.
        foundations (dict): Mapping of suits to lists of Card objects (completed piles).
        score (int): Current player score, incremented for foundation placements.
    """

    def __init__(self, tableau, foundations):
        """
        Initializes the game state.

        Args:
            tableau (list of list): The starting tableau configuration.
            foundations (dict): Initial foundation piles, typically empty.
        """
        self.tableau = tableau
        self.foundations = foundations
        self.score = 0

    def is_goal_state(self):
        """
        Checks whether the game is complete (all cards moved to foundations).

        Returns:
            bool: True if all four foundations contain 13 cards.
        """
        return all(len(pile) == 13 for pile in self.foundations.values())

    def valid_foundation_move(self, card):
        """
        Determines whether a card can be legally moved to its foundation.

        Args:
            card (Card): The card to test.

        Returns:
            bool: True if the move is valid, False otherwise.
        """
        pile = self.foundations[card.suit]
        if not pile:
            return card.rank == "A"
        return card.value() == pile[-1].value() + 1

    def get_lowest_value(self):
        """
        Finds the lowest top-card value across all foundation piles.

        Used to help automatically move cards that are no longer needed.

        Returns:
            int: The lowest "safe to move" value threshold.
        """
        val = 99 
        for suit in self.foundations:
            pile = self.foundations[suit]
            if not pile: 
                return 0
            if val > pile[-1].value():
                val = pile[-1].value()
        
        # Ensure all suits have reached this level to auto-promote
        count = 0
        for suit in self.foundations:
            pile = self.foundations[suit]
            if pile[-1].value() >= val:
                count += 1
        return val + 1 if count == 4 else val

    def apply_move(self, move):
        """
        Applies a move to the game state, mutating tableau/foundations accordingly.

        Also triggers automatic foundation promotion for lowest-value eligible cards.

        Args:
            move (tuple): One of:
                - ("foundation", from_col)
                - ("tableau", from_col, to_col)
        """
        move_type = move[0]
        
        if move_type == "foundation":
            from_col = move[1]
            if not self.tableau[from_col]:
                return
            card = self.tableau[from_col].pop()
            self.foundations[card.suit].append(card)
            self.score += 50
        
        elif move_type == "tableau":
            from_col = move[1]
            to_col = move[2]
            if not self.tableau[from_col]:
                return
            card = self.tableau[from_col].pop()
            self.tableau[to_col].append(card)
        
        # Automatically move cards to foundation if all suits have passed a threshold
        lv = self.get_lowest_value()
        for col_id, column in enumerate(self.tableau):
            if column and column[-1].value() == lv:
                self.apply_move(("foundation", col_id))

    def get_valid_moves(self):
        """
        Generates all valid legal moves available in the current state.

        Returns:
            list: A list of move tuples, each either:
                  - ("foundation", from_col)
                  - ("tableau", from_col, to_col)
        """
        moves = []

        for from_col, column in enumerate(self.tableau):
            if not column:
                continue
            card = column[-1]

            # Valid move to foundation
            if self.valid_foundation_move(card):
                moves.append(("foundation", from_col))

            # Valid move to other tableau columns
            for to_col, target_col in enumerate(self.tableau):
                if to_col == from_col or not target_col:
                    continue

                top_card = target_col[-1]
                if card.value() == top_card.value() - 1:
                    moves.append(("tableau", from_col, to_col))
        
        return moves
