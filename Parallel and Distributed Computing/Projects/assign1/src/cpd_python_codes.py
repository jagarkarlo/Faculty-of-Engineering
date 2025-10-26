import time

def initialize_matrices(m_ar, m_br):
    # The matrix A is initialized with 1.0
    pha = []
    for i in range(m_ar):
        row = []
        for j in range(m_ar):
            row.append(1.0)
        pha.append(row)
    
    # The matrix B is initialized with the row number
    phb = []
    for i in range(m_br):
        row = []
        for j in range(m_br):
            row.append(float(i+1))
        phb.append(row)
    
    # The result matrix is initialized with 0.0
    phc = []
    for i in range(m_ar):
        row = []
        for j in range(m_br):  
            row.append(0.0)
        phc.append(row)
        
    return pha, phb, phc

def print_matrix(phc, m_br):
    print("Result matrix:")
    for i in range(1):
        for j in range(min(10, m_br)): # Print the first 10 elements of the result matrix
            print(phc[i][j], end=" ")
        print()
    
def onMult(m_ar, m_br):
    pha, phb, phc = initialize_matrices(m_ar, m_br)
    
    start_time = time.time()
    
    for i in range(m_ar): # For each row in the matrix A
        for j in range(m_br): # For each column in the matrix B
            temp = 0.0  # Temporary value for the result matrix cell (i, j)
            for k in range(m_ar): # For each element in the row/column pair of the two matrices
                temp += pha[i][k] * phb[k][j] # Multiply and add to the temporary value
            phc[i][j] = temp # Assign the temporary value to the result matrix cell (i, j)
    
    end_time = time.time()
    time_passed = end_time - start_time
    
    print(f"Time: {time_passed:.3f} seconds")
    
    print_matrix(phc, m_br)
    
    return time_passed

def onMultLine(m_ar, m_br):
    pha, phb, phc = initialize_matrices(m_ar, m_br)
    
    start_time = time.time()
    
    for i in range(m_ar): # For each row in the matrix A 
        for k in range(m_ar): # For each element in the row of the matrix A
            temp = pha[i][k] # Store the element in a temporary variable
            for j in range(m_br): # For each column in the matrix B
                # Multiply the element with the corresponding element in the matrix B and 
                # add to the result matrix cell (i, j)
                phc[i][j] += temp * phb[k][j]
    
    end_time = time.time()  
    time_passed = end_time - start_time
    
    print(f"Time: {time_passed:.3f} seconds")
    
    print_matrix(phc, m_br)
    return time_passed

def onMultBlock(m_ar, m_br, block_size):
    pha, phb, phc = initialize_matrices(m_ar, m_br)
    
    start_time = time.time()
    
    for ii in range(0, m_ar, block_size): # For each block row in the matrix A
        for kk in range(0, m_ar, block_size): # For each block column in the matrix A
            for jj in range(0, m_br, block_size): # For each block column in the matrix B
                for i in range(ii, min(ii + block_size, m_ar)): # For each row in the block row of the matrix A
                    for k in range(kk, min(kk + block_size, m_ar)): # For each element in the row of the block row of the matrix A
                        temp = pha[i][k] # Store the element in a temporary variable
                        for j in range(jj, min(jj + block_size, m_br)): # For each column in the block column of the matrix B
                            phc[i][j] += temp * phb[k][j] # Multiply the element with the corresponding element in the matrix B and add to the result matrix cell (i, j)
    
    end_time = time.time()
    time_passed = end_time - start_time
    
    print(f"Time: {time_passed:.3f} seconds")
    
    print_matrix(phc, m_br)
    
    return time_passed

def run_benchmark(size_range, algorithm, block_size=0):
    print(f"Matrix Multiplication Benchmark (Python)")
    
    results = []
    
    # For each matrix size in the range run the selected algorithm
    for size in size_range:
        print(f"\nMatrix size: {size}x{size}")
        if algorithm == 1:
            print("Standard multiplication:")
            time_result = onMult(size, size)
        elif algorithm == 2:
            print("Line multiplication:")
            time_result = onMultLine(size, size)
        elif algorithm == 3:
            print(f"Block multiplication (block size = {block_size}):")
            time_result = onMultBlock(size, size, block_size)
        
        results.append((size, time_result))
    
    print("\n\nSummary of Results")
    print("----------------------------------------")
    print("Matrix Size | Time (s)")
    print("------------|----------")

    for size, time_result in results:
        print(f"{size:11} | {time_result:8.3f}")

def run_single_test(size, algorithm, block_size=0):
    if algorithm == 1:
        print(f"\nStandard multiplication with size {size}x{size}:")
        onMult(size, size)
    elif algorithm == 2:
        print(f"\nLine multiplication with size {size}x{size}:")
        onMultLine(size, size)
    elif algorithm == 3:
        print(f"\nBlock multiplication with size {size}x{size} and block size {block_size}:")
        onMultBlock(size, size, block_size)


if __name__ == "__main__":
    choice = 0
    while True:
        print("\n1. Standard Multiplication")
        print("2. Line Multiplication")
        print("3. Block Multiplication")
        print("4. Run Benchmark (600-3000)")
        print("5. Run Large Matrices Benchmark (4096-10240)")
        print("0. Exit")
        choice = int(input("Selection?: "))
        
        if choice == 0:
            break
        elif choice == 4:
            benchmark_choice = int(input("Select algorithm for benchmark (1-3): "))
            if benchmark_choice == 3:
                block_size = int(input("Block Size? "))
                run_benchmark(range(600, 3001, 400), benchmark_choice, block_size)
            else:
                run_benchmark(range(600, 3001, 400), benchmark_choice)
        elif choice == 5:
            benchmark_choice = int(input("Select algorithm for large matrices benchmark (1-3): "))
            if benchmark_choice == 3:
                block_size = int(input("Block Size? "))
                run_benchmark(range(4096, 10241, 2048), benchmark_choice, block_size)
            else:
                run_benchmark(range(4096, 10241, 2048), benchmark_choice)
        else:
            size = int(input("Dimensions: lins=cols ? "))
            if choice == 3:
                block_size = int(input("Block Size? "))
                run_single_test(size, choice, block_size)
            else:
                run_single_test(size, choice)