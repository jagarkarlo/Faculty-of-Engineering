from copy import deepcopy
from collections import deque
from gamestate import GameState 
import bisect
class TreeNode:
    def __init__(self, state, parent=None,prev_move = None, level=0):
        self.state = state
        self.parent = parent
        self.prev_move = prev_move 
        self.level =level 
        self.children = []

    def __eq__(self, other):
        return (self.state.tableau == other.state.tableau)

    def add_child(self, child_node):
        self.children.append(child_node)

    def __str__(self):
        return f"Node - {self.level}:\nPrev move: {self.prev_move}\nValidMoves: {self.state.get_valid_moves()}"

def createRootNode(game_state):
    return TreeNode(game_state)

def get_solutions(node):
    move_list = [] 
    if not node.state.is_goal_state():
        return move_list
    else:
        get_sol(node,move_list) 
    return move_list

def get_sol(node, move_list):
    if node.parent is None:
        return move_list;
    else:
        get_sol(node.parent,move_list)
        move_list.append(node.prev_move)
        return move_list


def buildGameStateString(game_state):
    gs_str = ""
    tableau = game_state.tableau
    s_l =[]
    for i in range(len(tableau)):
        temp=":"
        for card in tableau[i]:
            temp+=card.suit[0]
            temp+=card.rank
        s_l.append(temp)
    s_l.sort()
    for i in range(len(s_l)):
        gs_str+=s_l[i]
    return gs_str

def buildGameStateStringWithF(game_state):
    gs_str = ""
    tableau = game_state.tableau
    s_l =[]
    for i in range(len(tableau)):
        temp=":"
        for card in tableau[i]:
            temp+=card.suit[0]
            temp+=str(card.value())
            temp+="-"
        if temp[-1] == "-":
            temp = temp[:-1]
        s_l.append(temp)
    s_l.sort()
    for i in range(len(s_l)):
        gs_str+=s_l[i]
    foundations = game_state.foundations
    temp = 0
    for suit in foundations:
        temp += len(foundations[suit])

    gs_str+="|"
    gs_str+=str(temp)
    return gs_str

def print_tree(node):
    if node.parent is not None:
        print_tree(node.parent)
    print(node)
    if node.parent is None:
        print(buildGameStateString(node.state))

def next_foundation(node):
    low={}
    if node.state.foundations["Spades"]:
        low["S"]=node.state.foundations["Spades"][-1].value()+1
    else:
        low["S"]=0
    if node.state.foundations["Clubs"]:
        low["C"]=node.state.foundations["Clubs"][-1].value()+1
    else:
        low["C"]=0
    if node.state.foundations["Hearts"]:
        low["H"]=node.state.foundations["Hearts"][-1].value()+1
    else:
        low["H"]=0
    if node.state.foundations["Diamonds"]:
        low["D"]=node.state.foundations["Diamonds"][-1].value()+1
    else:
        low["D"]=0
    return low;
    
def a_star(game_state):
    root = createRootNode(game_state)
    queue = [(root,evaluate(root))]

    MAX_AS_COUNT=20000 
    curr_level = root.level
    count = 0
    
    while(queue):
        count+=1
        pair = queue.pop(0)
        node = pair[0]  

        print(str(node.prev_move) + " " + str(pair[1]))

        if(node.state.is_goal_state()):
            print(count)
            return node
        if(curr_level < node.level):
            curr_level = node.level
            print("new level")
            print(count)

        if(count >= MAX_AS_COUNT): 
            print(count)
            print("Max nodes reached")
            return node

        node_list = []  
        for move in node.state.get_valid_moves():
            
            if node.prev_move is not None and  move[0] == "tableau" and node.prev_move[0] =="tableau" and node.prev_move[2] == move[1]:
                continue
            state = deepcopy(node.state)
            state.apply_move(move)
            child_node = TreeNode(state,node,move,node.level + 1)             
            node.add_child(child_node)
            node_list.append(child_node)
        
        ordered_insert(queue, node_list)

    return root;


#initially 1 ->
def evaluate(node):
    FOUNDATION_MULT = 35.0 
    ORDERED_MULT = 2.0
    SUIT_ORDERED_MULT = 2.5
    LEVEL_MULT = 10.0
    EMPTY_MULT = 0.5
    VALID_MOVES_MULT = 1.0
    BLOCKED_MULT = 0.5
    DIST_TO_LOWEST = 4.5
    DIST_TO_LOWEST_2 = 3.0
    DISPATCH_ACE_MULT = 10.0

    n_str = buildGameStateStringWithF(node.state)
    print(str(node.level)+" - "+n_str)
    if node.state.is_goal_state():
        return 0.0 
    else:
        num_aces = 0 
        ev = 4000 + (node.level * LEVEL_MULT)
        low =next_foundation(node) 
        print("low " + str(low))
        split_str = n_str.split("|")
        ev -= int(split_str[1]) * FOUNDATION_MULT
        #print("FOUNDATION R: "+str(int(split_str[1]) * FOUNDATION_MULT))
        tableau_split = split_str[0].split(":")
        valid = node.state.get_valid_moves()
        ev-=diferent_valid(valid) *VALID_MOVES_MULT
        #print("DIFERENT_VALID R: "+str(diferent_valid(valid) *VALID_MOVES_MULT))
        empty = 0
        for pile_str in tableau_split:
            if pile_str != "":
                e = 0.0
                ordered = 0.0
                ordered_suit = 0.0
                pile = pile_str.split("-")
                for i in range(len(pile)):
                    card1 =pile[i]
                    suit1=card1[0]
                    rank1=card1[1:]

                    if rank1 == 0:
                        num_aces +=1

                    if int(rank1) == low[suit1]:
                        if len(pile) > 1:
                            if int(rank1) < 13/2:
                                e+= (i/(len(pile)-1))*DIST_TO_LOWEST
                                #print("DIST LOW R: "+str((i/(len(pile)-1))*DIST_TO_LOWEST))
                            else:
                                e+= (i/(len(pile)-1))*DIST_TO_LOWEST_2
                                #print("DIST LOW R: "+str((i/(len(pile)-1))*DIST_TO_LOWEST_2))
                        else: 
                            if int(rank1) < 13/2:
                                e+= DIST_TO_LOWEST
                                #print("DIST LOW R: "+str(DIST_TO_LOWEST))
                            else:
                                e+= DIST_TO_LOWEST_2
                                #print("DIST LOW R: "+str(DIST_TO_LOWEST_2))
                    if i < len(pile) -1:
                        card2 = pile[i+1]
                        suit2=card2[0]
                        rank2=card2[1:]
                        # if the card that is t
                        if int(rank1) > int(rank2):
                            if suit1 == suit2:
                                ordered_suit+=1
                            else: ordered+=1
                e += (ordered/len(pile))*ORDERED_MULT
                #print("ORDERED R: "+ str((ordered/len(pile))*ORDERED_MULT))
                e += (ordered_suit/len(pile))*SUIT_ORDERED_MULT
                #print("ORDERED S R: "+ str((ordered_suit/len(pile))*SUIT_ORDERED_MULT))
                ev-=e
            else: empty +=1

        ev -= EMPTY_MULT * (empty/13.0)
        #print("EMPTY R" + str(EMPTY_MULT * empty))
        ev += ((len(tableau_split) - empty)- diferent_valid(valid)) * BLOCKED_MULT
        #print("BLOCKED R" + str(((len(tableau_split) - empty)- diferent_valid(valid)) * BLOCKED_MULT))
        ev -= (4 - num_aces) * DISPATCH_ACE_MULT
        #print("ACES R: "+str((4 - num_aces) * DISPATCH_ACE_MULT))

    return ev / 7000.0 
        
def diferent_valid(valid):
    unique = set(v[1] for v in valid)
    return len(unique)

def contains_foundation(valid):
    for move in valid:
        if move[0]== 'foundation': return True
    return False
    
def getFoundNr(node):
    temp = 0
    for suit in node.state.foundations:
        temp += len(node.state.foundations[suit])
    return temp
def ordered_insert(queue, node_list):
    pair_list = []
    for node in node_list:
        n_p = (node, evaluate(node))
        pair_list.append(n_p)
    for pair in pair_list:
        bisect.insort(queue, pair,key=lambda x: x[1])
def bfs(game_state):
    root = createRootNode(game_state)
    queue = deque([root])
    #visited = set(buildGameStateString(game_state)) 
    MAX_BFS_LEVEL =1 
    curr_level = root.level
    count = 0
    while(queue):
        node = queue.popleft();  
        if(node.state.is_goal_state()):
            return node
        if(curr_level < node.level):
            curr_level = node.level
            print("new level")
            print(count)

        if(node.level >= MAX_BFS_LEVEL): 
            print(count)
            print("Max level reached")
            return node

        for move in node.state.get_valid_moves():
            if move[0] == "tableau" and node.prev_move[0] =="tableau" and node.prev_move[2] == move[1]:
                continue
            count+=1
            state = deepcopy(node.state)
            state.apply_move(move)
            #state_str = buildGameStateString(state)
        #    if state_str not in visited:
            child_node = TreeNode(state,node,move,node.level + 1)             
            node.add_child(child_node)
            queue.append(child_node)
        #        visited.add(state)
        
    return root;


def dfs(game_state):
    root = createRootNode(game_state)
    queue = deque([root])
    visited = set(buildGameStateString(game_state)) 
    MAX_DFS_LEVEL =53 
    curr_level = root.level
    count = 0
    while(queue):
        node = queue.pop();  
        if(node.state.is_goal_state()):
            return node
        if(curr_level < node.level):
            curr_level = node.level
            print(curr_level)
        if(node.level >= MAX_BFS_LEVEL): 
            print(count)
            print("Max level reached")
            return node

        for move in node.state.get_valid_moves():
            if move[0] == "tableau" and node.prev_move[0] =="tableau" and node.prev_move[2] == move[1]:
                continue
            count+=1
            state = deepcopy(node.state)
            state.apply_move(move)
            state_str = buildGameStateString(state)
            if state_str not in visited:
                child_node = TreeNode(state,node,move,node.level + 1)             
                node.add_child(child_node)
                queue.append(child_node)
                visited.add(state)
        
    return root;
