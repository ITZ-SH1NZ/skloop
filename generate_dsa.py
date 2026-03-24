import json

CATEGORIES = ["Sorting", "Linear", "Trees", "Graphs", "Dynamic Programming", "Math"]
DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Legendary"]

algo_list = [
    ("Bubble Sort", "Sorting", "Beginner", "O(n²)", "O(1)"),
    ("Selection Sort", "Sorting", "Beginner", "O(n²)", "O(1)"),
    ("Insertion Sort", "Sorting", "Beginner", "O(n²)", "O(1)"),
    ("Merge Sort", "Sorting", "Intermediate", "O(n log n)", "O(n)"),
    ("Quick Sort", "Sorting", "Intermediate", "O(n log n)", "O(log n)"),
    ("Heap Sort", "Sorting", "Advanced", "O(n log n)", "O(1)"),
    ("Radix Sort", "Sorting", "Advanced", "O(nk)", "O(n + k)"),
    ("Counting Sort", "Sorting", "Intermediate", "O(n + k)", "O(k)"),
    ("Bucket Sort", "Sorting", "Intermediate", "O(n + k)", "O(n)"),
    ("Shell Sort", "Sorting", "Intermediate", "O(n log n)", "O(1)"),
    
    ("Stack", "Linear", "Beginner", "O(1)", "O(n)"),
    ("Queue", "Linear", "Beginner", "O(1)", "O(n)"),
    ("Deque", "Linear", "Intermediate", "O(1)", "O(n)"),
    ("Linked List", "Linear", "Beginner", "O(n)", "O(n)"),
    ("Doubly Linked List", "Linear", "Intermediate", "O(n)", "O(n)"),
    ("Circular Linked List", "Linear", "Intermediate", "O(n)", "O(n)"),
    ("Hash Table", "Linear", "Intermediate", "O(1)", "O(n)"),
    ("Array", "Linear", "Beginner", "O(1)", "O(n)"),
    ("Dynamic Array", "Linear", "Beginner", "O(1)", "O(n)"),
    ("Skip List", "Linear", "Advanced", "O(log n)", "O(n log n)"),
    
    ("Binary Tree", "Trees", "Beginner", "O(n)", "O(n)"),
    ("Binary Search Tree", "Trees", "Intermediate", "O(log n)", "O(n)"),
    ("AVL Tree", "Trees", "Advanced", "O(log n)", "O(n)"),
    ("Red-Black Tree", "Trees", "Legendary", "O(log n)", "O(n)"),
    ("B-Tree", "Trees", "Legendary", "O(log n)", "O(n)"),
    ("Trie", "Trees", "Advanced", "O(m)", "O(n * m)"),
    ("Segment Tree", "Trees", "Legendary", "O(log n)", "O(n)"),
    ("Fenwick Tree", "Trees", "Advanced", "O(log n)", "O(n)"),
    ("Splay Tree", "Trees", "Legendary", "O(log n)", "O(n)"),
    ("Treap", "Trees", "Legendary", "O(log n)", "O(n)"),
    
    ("Breadth-First Search", "Graphs", "Intermediate", "O(V + E)", "O(V)"),
    ("Depth-First Search", "Graphs", "Intermediate", "O(V + E)", "O(V)"),
    ("Dijkstra's Algorithm", "Graphs", "Advanced", "O((V + E) log V)", "O(V)"),
    ("Bellman-Ford", "Graphs", "Advanced", "O(V * E)", "O(V)"),
    ("Floyd-Warshall", "Graphs", "Advanced", "O(V³)", "O(V²)"),
    ("Kruskal's Algorithm", "Graphs", "Advanced", "O(E log E)", "O(V)"),
    ("Prim's Algorithm", "Graphs", "Advanced", "O((V + E) log V)", "O(V)"),
    ("Topological Sort", "Graphs", "Intermediate", "O(V + E)", "O(V)"),
    ("Tarjan's Algorithm", "Graphs", "Legendary", "O(V + E)", "O(V)"),
    ("A* Search", "Graphs", "Advanced", "O(E)", "O(V)"),

    ("Fibonacci (DP)", "Dynamic Programming", "Beginner", "O(n)", "O(n)"),
    ("0/1 Knapsack", "Dynamic Programming", "Intermediate", "O(nW)", "O(nW)"),
    ("Longest Common Subsequence", "Dynamic Programming", "Intermediate", "O(nm)", "O(nm)"),
    ("Longest Increasing Subsequence", "Dynamic Programming", "Intermediate", "O(n log n)", "O(n)"),
    ("Matrix Chain Multiplication", "Dynamic Programming", "Advanced", "O(n³)", "O(n²)"),
    ("Coin Change", "Dynamic Programming", "Intermediate", "O(nV)", "O(V)"),
    ("Edit Distance", "Dynamic Programming", "Intermediate", "O(nm)", "O(nm)"),

    ("Euclidean Algorithm", "Math", "Beginner", "O(log(min(a,b)))", "O(1)"),
    ("Sieve of Eratosthenes", "Math", "Intermediate", "O(n log log n)", "O(n)"),
    ("Fast Exponentiation", "Math", "Intermediate", "O(log n)", "O(1)")
]

algorithms = []

for title, category, difficulty, tc, sc in algo_list:
    slug = title.lower().replace(" ", "-").replace("'", "").replace("*", "star").replace("/", "-")
    desc = f"{title} is a fundamental concept in the {category} category, typically classified as {difficulty} level. It explores advanced optimization and structural patterns."
    
    algo = {
        "id": slug,
        "title": title,
        "category": category,
        "difficulty": difficulty,
        "timeComplexity": tc,
        "spaceComplexity": sc,
        "shortDescription": f"Interactive visualization and implementation for {title} in multiple languages.",
        "description": desc,
        "pseudocode": f"// Pseudocode for {title}\\nfunction run() {{\\n  // Execute {title} logic\\n  return result;\\n}}",
        "implementations": {
            "python": f"def run_{slug.replace('-', '_')}():\\n    # Python implementation\\n    pass",
            "javascript": f"function run{slug.replace('-', '')}() {{\\n    // JS implementation\\n}}",
            "java": f"class {title.replace(' ', '').replace('-', '')} {{\\n    void run() {{\\n        // Java implementation\\n    }}\\n}}",
            "c": f"void run_{slug.replace('-', '_')}() {{\\n    // C implementation\\n}}",
            "cpp": f"void run_{slug.replace('-', '_')}() {{\\n    // C++ implementation\\n}}"
        }
    }
    algorithms.append(algo)

with open("generate_dsa.ts", "w") as f:
    f.write("export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Legendary';\n")
    f.write("export type Category = 'Sorting' | 'Linear' | 'Trees' | 'Graphs' | 'Dynamic Programming' | 'Math';\n\n")
    f.write("export interface Algorithm {\n")
    f.write("    id: string;\n")
    f.write("    title: string;\n")
    f.write("    category: Category;\n")
    f.write("    difficulty: Difficulty;\n")
    f.write("    timeComplexity: string;\n")
    f.write("    spaceComplexity: string;\n")
    f.write("    description: string;\n")
    f.write("    shortDescription: string;\n")
    f.write("    pseudocode: string;\n")
    f.write("    implementations: {\n")
    f.write("        python: string;\n")
    f.write("        javascript: string;\n")
    f.write("        java: string;\n")
    f.write("        c: string;\n")
    f.write("        cpp: string;\n")
    f.write("    };\n")
    f.write("}\n\n")
    f.write("export const DSA_DATA: Algorithm[] = ")
    f.write(json.dumps(algorithms, indent=4))
    f.write(";")
