# solver_base.py

from copy import deepcopy
from collections import deque
from abc import ABC, abstractmethod

class Solver(ABC):
    def __init__(self, initial_state):
        self.initial_state = deepcopy(initial_state)
        self.visited = set()
        self.nodes_expanded = 0

    @abstractmethod
    def solve(self):
        """Override in subclasses: returns a list of moves that solve the game"""
        pass

    def extract_solution(self, goal_node):
        """Backtrack from goal node to root to get list of moves"""
        moves = []
        node = goal_node
        while node.parent is not None:
            moves.append(node.prev_move)
            node = node.parent
        moves.reverse()
        return moves


class SearchNode:
    def __init__(self, state, parent=None, prev_move=None, depth=0):
        self.state = deepcopy(state)
        self.parent = parent
        self.prev_move = prev_move
        self.depth = depth

    def __eq__(self, other):
        return self.serialize() == other.serialize()

    def __lt__(self, other):
        return self.depth < other.depth

    def __hash__(self):
        return hash(self.serialize())

    def serialize(self):
        """Returns a hashable unique string for the current game state"""
        tableau_str = ''.join([''.join(f"{c.suit[0]}{c.rank}" for c in col) for col in self.state.tableau])
        foundation_str = ''.join(f"{k[0]}{len(v)}" for k, v in self.state.foundations.items())
        return tableau_str + "|" + foundation_str
