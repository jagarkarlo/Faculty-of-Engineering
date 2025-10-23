# greedy_solver.py

from solvers.solver_base import Solver, SearchNode
from heapq import heappush, heappop
from copy import deepcopy
import time
import pygame

class GreedySolver(Solver):
    def __init__(self, initial_state, verbose=True):
        super().__init__(initial_state)
        self.heuristic = self.default_heuristic
        self.verbose = verbose

    def solve(self):
        start_time = time.time()
        root = SearchNode(self.initial_state)
        open_list = []
        heappush(open_list, (self.heuristic(root.state), root))
        self.visited.add(root)

        while open_list:
            pygame.event.pump()
            _, current = heappop(open_list)
            self.nodes_expanded += 1

            if self.verbose:
                print(f"Expanding move: {current.prev_move} | Heuristic: {self.heuristic(current.state):.4f}")

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
                    heappush(open_list, (self.heuristic(child.state), child))

        return None

    def default_heuristic(self, state):
        score = 1000  # base cost

        # 1. Foundation progress
        total_foundation = sum(len(pile) for pile in state.foundations.values())
        score -= total_foundation * 10

        # 2. Empty columns
        empty_cols = sum(1 for col in state.tableau if not col)
        score -= empty_cols * 3

        # 3. Ordered sequences & suit consistency
        for col in state.tableau:
            for i in range(len(col) - 1):
                above = col[i]
                below = col[i + 1]
                if above.value() == below.value() + 1:
                    score -= 2
                    if above.suit == below.suit:
                        score -= 2

        # 4. Available moves
        score -= len(state.get_valid_moves()) * 1.5

        return score
