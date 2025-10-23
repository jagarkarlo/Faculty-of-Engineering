# dfs_solver.py

from solvers.solver_base import Solver, SearchNode
from collections import deque
from copy import deepcopy
import time
import pygame

class DFSSolver(Solver):
    def __init__(self, initial_state, max_depth=100, verbose=False):
        super().__init__(initial_state)
        self.max_depth = max_depth
        self.verbose = verbose

    def solve(self):
        start_time = time.time()
        root = SearchNode(self.initial_state)
        stack = deque([root])
        self.visited.add(root)

        while stack:
            pygame.event.pump()
            current = stack.pop()
            self.nodes_expanded += 1

            if self.verbose:
                print(f"[Depth {current.depth}] Trying move: {current.prev_move}")

            if current.state.is_goal_state():
                end_time = time.time()
                print(f"Goal reached in {self.nodes_expanded} steps, {len(self.visited)} unique states")
                print(f"Time taken: {end_time - start_time:.2f} seconds")
                return self.extract_solution(current)

            if current.depth >= self.max_depth:
                continue

            for move in reversed(current.state.get_valid_moves()):
                new_state = deepcopy(current.state)
                new_state.apply_move(move)
                child = SearchNode(new_state, parent=current, prev_move=move, depth=current.depth + 1)

                if child not in self.visited:
                    self.visited.add(child)
                    stack.append(child)

        print("No solution found within depth limit.")
        return None
