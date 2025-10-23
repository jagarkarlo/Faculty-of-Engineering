# astar_solver.py

from solvers.solver_base import Solver, SearchNode
from heapq import heappush, heappop
from copy import deepcopy
import time
import pygame

class AStarSolver(Solver):
    def __init__(self, initial_state, verbose=True):
        super().__init__(initial_state)
        self.heuristic = self.default_heuristic
        self.verbose = verbose

    def solve(self):
        start_time = time.time()
        root = SearchNode(self.initial_state)
        open_list = []
        heappush(open_list, (self.f(root), root))
        self.visited.add(root)

        while open_list:
            pygame.event.pump()
            _, current = heappop(open_list)
            self.nodes_expanded += 1

            if self.verbose:
                print(f"Expanding move: {current.prev_move} | f(n): {self.f(current):.2f}")

            if current.state.is_goal_state():
                end_time = time.time()
                print(f"Goal found in {self.nodes_expanded} steps")
                print(f"Time taken: {end_time - start_time:.2f} seconds")
                return self.extract_solution(current)

            for move in current.state.get_valid_moves():
                new_state = deepcopy(current.state)
                new_state.apply_move(move)
                child = SearchNode(new_state, parent=current, prev_move=move, depth=current.depth + 1)

                if child not in self.visited:
                    self.visited.add(child)
                    heappush(open_list, (self.f(child), child))

        print("No solution found.")
        return None

    def f(self, node):
        """Total cost function f(n) = g(n) + h(n)"""
        return node.depth + self.heuristic(node.state)

    def default_heuristic(self, state):
        score = 1000

        # Foundation progress
        score -= sum(len(pile) for pile in state.foundations.values()) * 10

        # Empty columns
        score -= sum(1 for col in state.tableau if not col) * 3

        # Ordered cards
        for col in state.tableau:
            for i in range(len(col) - 1):
                above = col[i]
                below = col[i + 1]
                if above.value() == below.value() + 1:
                    score -= 2
                    if above.suit == below.suit:
                        score -= 2

        # Available moves
        score -= len(state.get_valid_moves()) * 1.5

        return score
