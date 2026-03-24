export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Legendary';
export type Category = 'Sorting' | 'Linear' | 'Trees' | 'Graphs' | 'Dynamic Programming' | 'Math';

export interface Algorithm {
    id: string;
    title: string;
    category: Category;
    difficulty: Difficulty;
    timeComplexity: string;
    spaceComplexity: string;
    description: string;
    shortDescription: string;
    pseudocode: string;
    implementations: {
        python: string;
        javascript: string;
        java: string;
        c: string;
        cpp: string;
    };
}

export const DSA_DATA: Algorithm[] = [
    {
        "id": "bubble-sort",
        "title": "Bubble Sort",
        "category": "Sorting",
        "difficulty": "Beginner",
        "timeComplexity": "O(n\u00b2)",
        "spaceComplexity": "O(1)",
        "shortDescription": "Interactive visualization and implementation for Bubble Sort in multiple languages.",
        "description": "Bubble Sort is a fundamental concept in the Sorting category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Bubble Sort\\nfunction run() {\\n  // Execute Bubble Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_bubble_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runbubblesort() {\\n    // JS implementation\\n}",
            "java": "class BubbleSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_bubble_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_bubble_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "selection-sort",
        "title": "Selection Sort",
        "category": "Sorting",
        "difficulty": "Beginner",
        "timeComplexity": "O(n\u00b2)",
        "spaceComplexity": "O(1)",
        "shortDescription": "Interactive visualization and implementation for Selection Sort in multiple languages.",
        "description": "Selection Sort is a fundamental concept in the Sorting category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Selection Sort\\nfunction run() {\\n  // Execute Selection Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_selection_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runselectionsort() {\\n    // JS implementation\\n}",
            "java": "class SelectionSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_selection_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_selection_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "insertion-sort",
        "title": "Insertion Sort",
        "category": "Sorting",
        "difficulty": "Beginner",
        "timeComplexity": "O(n\u00b2)",
        "spaceComplexity": "O(1)",
        "shortDescription": "Interactive visualization and implementation for Insertion Sort in multiple languages.",
        "description": "Insertion Sort is a fundamental concept in the Sorting category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Insertion Sort\\nfunction run() {\\n  // Execute Insertion Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_insertion_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runinsertionsort() {\\n    // JS implementation\\n}",
            "java": "class InsertionSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_insertion_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_insertion_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "merge-sort",
        "title": "Merge Sort",
        "category": "Sorting",
        "difficulty": "Intermediate",
        "timeComplexity": "O(n log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Merge Sort in multiple languages.",
        "description": "Merge Sort is a fundamental concept in the Sorting category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Merge Sort\\nfunction run() {\\n  // Execute Merge Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_merge_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runmergesort() {\\n    // JS implementation\\n}",
            "java": "class MergeSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_merge_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_merge_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "quick-sort",
        "title": "Quick Sort",
        "category": "Sorting",
        "difficulty": "Intermediate",
        "timeComplexity": "O(n log n)",
        "spaceComplexity": "O(log n)",
        "shortDescription": "Interactive visualization and implementation for Quick Sort in multiple languages.",
        "description": "Quick Sort is a fundamental concept in the Sorting category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Quick Sort\\nfunction run() {\\n  // Execute Quick Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_quick_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runquicksort() {\\n    // JS implementation\\n}",
            "java": "class QuickSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_quick_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_quick_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "heap-sort",
        "title": "Heap Sort",
        "category": "Sorting",
        "difficulty": "Advanced",
        "timeComplexity": "O(n log n)",
        "spaceComplexity": "O(1)",
        "shortDescription": "Interactive visualization and implementation for Heap Sort in multiple languages.",
        "description": "Heap Sort is a fundamental concept in the Sorting category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Heap Sort\\nfunction run() {\\n  // Execute Heap Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_heap_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runheapsort() {\\n    // JS implementation\\n}",
            "java": "class HeapSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_heap_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_heap_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "radix-sort",
        "title": "Radix Sort",
        "category": "Sorting",
        "difficulty": "Advanced",
        "timeComplexity": "O(nk)",
        "spaceComplexity": "O(n + k)",
        "shortDescription": "Interactive visualization and implementation for Radix Sort in multiple languages.",
        "description": "Radix Sort is a fundamental concept in the Sorting category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Radix Sort\\nfunction run() {\\n  // Execute Radix Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_radix_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runradixsort() {\\n    // JS implementation\\n}",
            "java": "class RadixSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_radix_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_radix_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "counting-sort",
        "title": "Counting Sort",
        "category": "Sorting",
        "difficulty": "Intermediate",
        "timeComplexity": "O(n + k)",
        "spaceComplexity": "O(k)",
        "shortDescription": "Interactive visualization and implementation for Counting Sort in multiple languages.",
        "description": "Counting Sort is a fundamental concept in the Sorting category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Counting Sort\\nfunction run() {\\n  // Execute Counting Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_counting_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runcountingsort() {\\n    // JS implementation\\n}",
            "java": "class CountingSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_counting_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_counting_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "bucket-sort",
        "title": "Bucket Sort",
        "category": "Sorting",
        "difficulty": "Intermediate",
        "timeComplexity": "O(n + k)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Bucket Sort in multiple languages.",
        "description": "Bucket Sort is a fundamental concept in the Sorting category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Bucket Sort\\nfunction run() {\\n  // Execute Bucket Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_bucket_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runbucketsort() {\\n    // JS implementation\\n}",
            "java": "class BucketSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_bucket_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_bucket_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "shell-sort",
        "title": "Shell Sort",
        "category": "Sorting",
        "difficulty": "Intermediate",
        "timeComplexity": "O(n log n)",
        "spaceComplexity": "O(1)",
        "shortDescription": "Interactive visualization and implementation for Shell Sort in multiple languages.",
        "description": "Shell Sort is a fundamental concept in the Sorting category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Shell Sort\\nfunction run() {\\n  // Execute Shell Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_shell_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runshellsort() {\\n    // JS implementation\\n}",
            "java": "class ShellSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_shell_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_shell_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "stack",
        "title": "Stack",
        "category": "Linear",
        "difficulty": "Beginner",
        "timeComplexity": "O(1)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Stack in multiple languages.",
        "description": "Stack is a fundamental concept in the Linear category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Stack\\nfunction run() {\\n  // Execute Stack logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_stack():\\n    # Python implementation\\n    pass",
            "javascript": "function runstack() {\\n    // JS implementation\\n}",
            "java": "class Stack {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_stack() {\\n    // C implementation\\n}",
            "cpp": "void run_stack() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "queue",
        "title": "Queue",
        "category": "Linear",
        "difficulty": "Beginner",
        "timeComplexity": "O(1)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Queue in multiple languages.",
        "description": "Queue is a fundamental concept in the Linear category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Queue\\nfunction run() {\\n  // Execute Queue logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_queue():\\n    # Python implementation\\n    pass",
            "javascript": "function runqueue() {\\n    // JS implementation\\n}",
            "java": "class Queue {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_queue() {\\n    // C implementation\\n}",
            "cpp": "void run_queue() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "deque",
        "title": "Deque",
        "category": "Linear",
        "difficulty": "Intermediate",
        "timeComplexity": "O(1)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Deque in multiple languages.",
        "description": "Deque is a fundamental concept in the Linear category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Deque\\nfunction run() {\\n  // Execute Deque logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_deque():\\n    # Python implementation\\n    pass",
            "javascript": "function rundeque() {\\n    // JS implementation\\n}",
            "java": "class Deque {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_deque() {\\n    // C implementation\\n}",
            "cpp": "void run_deque() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "linked-list",
        "title": "Linked List",
        "category": "Linear",
        "difficulty": "Beginner",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Linked List in multiple languages.",
        "description": "Linked List is a fundamental concept in the Linear category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Linked List\\nfunction run() {\\n  // Execute Linked List logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_linked_list():\\n    # Python implementation\\n    pass",
            "javascript": "function runlinkedlist() {\\n    // JS implementation\\n}",
            "java": "class LinkedList {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_linked_list() {\\n    // C implementation\\n}",
            "cpp": "void run_linked_list() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "doubly-linked-list",
        "title": "Doubly Linked List",
        "category": "Linear",
        "difficulty": "Intermediate",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Doubly Linked List in multiple languages.",
        "description": "Doubly Linked List is a fundamental concept in the Linear category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Doubly Linked List\\nfunction run() {\\n  // Execute Doubly Linked List logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_doubly_linked_list():\\n    # Python implementation\\n    pass",
            "javascript": "function rundoublylinkedlist() {\\n    // JS implementation\\n}",
            "java": "class DoublyLinkedList {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_doubly_linked_list() {\\n    // C implementation\\n}",
            "cpp": "void run_doubly_linked_list() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "circular-linked-list",
        "title": "Circular Linked List",
        "category": "Linear",
        "difficulty": "Intermediate",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Circular Linked List in multiple languages.",
        "description": "Circular Linked List is a fundamental concept in the Linear category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Circular Linked List\\nfunction run() {\\n  // Execute Circular Linked List logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_circular_linked_list():\\n    # Python implementation\\n    pass",
            "javascript": "function runcircularlinkedlist() {\\n    // JS implementation\\n}",
            "java": "class CircularLinkedList {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_circular_linked_list() {\\n    // C implementation\\n}",
            "cpp": "void run_circular_linked_list() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "hash-table",
        "title": "Hash Table",
        "category": "Linear",
        "difficulty": "Intermediate",
        "timeComplexity": "O(1)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Hash Table in multiple languages.",
        "description": "Hash Table is a fundamental concept in the Linear category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Hash Table\\nfunction run() {\\n  // Execute Hash Table logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_hash_table():\\n    # Python implementation\\n    pass",
            "javascript": "function runhashtable() {\\n    // JS implementation\\n}",
            "java": "class HashTable {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_hash_table() {\\n    // C implementation\\n}",
            "cpp": "void run_hash_table() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "array",
        "title": "Array",
        "category": "Linear",
        "difficulty": "Beginner",
        "timeComplexity": "O(1)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Array in multiple languages.",
        "description": "Array is a fundamental concept in the Linear category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Array\\nfunction run() {\\n  // Execute Array logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_array():\\n    # Python implementation\\n    pass",
            "javascript": "function runarray() {\\n    // JS implementation\\n}",
            "java": "class Array {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_array() {\\n    // C implementation\\n}",
            "cpp": "void run_array() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "dynamic-array",
        "title": "Dynamic Array",
        "category": "Linear",
        "difficulty": "Beginner",
        "timeComplexity": "O(1)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Dynamic Array in multiple languages.",
        "description": "Dynamic Array is a fundamental concept in the Linear category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Dynamic Array\\nfunction run() {\\n  // Execute Dynamic Array logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_dynamic_array():\\n    # Python implementation\\n    pass",
            "javascript": "function rundynamicarray() {\\n    // JS implementation\\n}",
            "java": "class DynamicArray {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_dynamic_array() {\\n    // C implementation\\n}",
            "cpp": "void run_dynamic_array() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "skip-list",
        "title": "Skip List",
        "category": "Linear",
        "difficulty": "Advanced",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(n log n)",
        "shortDescription": "Interactive visualization and implementation for Skip List in multiple languages.",
        "description": "Skip List is a fundamental concept in the Linear category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Skip List\\nfunction run() {\\n  // Execute Skip List logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_skip_list():\\n    # Python implementation\\n    pass",
            "javascript": "function runskiplist() {\\n    // JS implementation\\n}",
            "java": "class SkipList {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_skip_list() {\\n    // C implementation\\n}",
            "cpp": "void run_skip_list() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "binary-tree",
        "title": "Binary Tree",
        "category": "Trees",
        "difficulty": "Beginner",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Binary Tree in multiple languages.",
        "description": "Binary Tree is a fundamental concept in the Trees category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Binary Tree\\nfunction run() {\\n  // Execute Binary Tree logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_binary_tree():\\n    # Python implementation\\n    pass",
            "javascript": "function runbinarytree() {\\n    // JS implementation\\n}",
            "java": "class BinaryTree {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_binary_tree() {\\n    // C implementation\\n}",
            "cpp": "void run_binary_tree() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "binary-search-tree",
        "title": "Binary Search Tree",
        "category": "Trees",
        "difficulty": "Intermediate",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Binary Search Tree in multiple languages.",
        "description": "Binary Search Tree is a fundamental concept in the Trees category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Binary Search Tree\\nfunction run() {\\n  // Execute Binary Search Tree logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_binary_search_tree():\\n    # Python implementation\\n    pass",
            "javascript": "function runbinarysearchtree() {\\n    // JS implementation\\n}",
            "java": "class BinarySearchTree {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_binary_search_tree() {\\n    // C implementation\\n}",
            "cpp": "void run_binary_search_tree() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "avl-tree",
        "title": "AVL Tree",
        "category": "Trees",
        "difficulty": "Advanced",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for AVL Tree in multiple languages.",
        "description": "AVL Tree is a fundamental concept in the Trees category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for AVL Tree\\nfunction run() {\\n  // Execute AVL Tree logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_avl_tree():\\n    # Python implementation\\n    pass",
            "javascript": "function runavltree() {\\n    // JS implementation\\n}",
            "java": "class AVLTree {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_avl_tree() {\\n    // C implementation\\n}",
            "cpp": "void run_avl_tree() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "red-black-tree",
        "title": "Red-Black Tree",
        "category": "Trees",
        "difficulty": "Legendary",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Red-Black Tree in multiple languages.",
        "description": "Red-Black Tree is a fundamental concept in the Trees category, typically classified as Legendary level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Red-Black Tree\\nfunction run() {\\n  // Execute Red-Black Tree logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_red_black_tree():\\n    # Python implementation\\n    pass",
            "javascript": "function runredblacktree() {\\n    // JS implementation\\n}",
            "java": "class RedBlackTree {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_red_black_tree() {\\n    // C implementation\\n}",
            "cpp": "void run_red_black_tree() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "b-tree",
        "title": "B-Tree",
        "category": "Trees",
        "difficulty": "Legendary",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for B-Tree in multiple languages.",
        "description": "B-Tree is a fundamental concept in the Trees category, typically classified as Legendary level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for B-Tree\\nfunction run() {\\n  // Execute B-Tree logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_b_tree():\\n    # Python implementation\\n    pass",
            "javascript": "function runbtree() {\\n    // JS implementation\\n}",
            "java": "class BTree {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_b_tree() {\\n    // C implementation\\n}",
            "cpp": "void run_b_tree() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "trie",
        "title": "Trie",
        "category": "Trees",
        "difficulty": "Advanced",
        "timeComplexity": "O(m)",
        "spaceComplexity": "O(n * m)",
        "shortDescription": "Interactive visualization and implementation for Trie in multiple languages.",
        "description": "Trie is a fundamental concept in the Trees category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Trie\\nfunction run() {\\n  // Execute Trie logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_trie():\\n    # Python implementation\\n    pass",
            "javascript": "function runtrie() {\\n    // JS implementation\\n}",
            "java": "class Trie {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_trie() {\\n    // C implementation\\n}",
            "cpp": "void run_trie() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "segment-tree",
        "title": "Segment Tree",
        "category": "Trees",
        "difficulty": "Legendary",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Segment Tree in multiple languages.",
        "description": "Segment Tree is a fundamental concept in the Trees category, typically classified as Legendary level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Segment Tree\\nfunction run() {\\n  // Execute Segment Tree logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_segment_tree():\\n    # Python implementation\\n    pass",
            "javascript": "function runsegmenttree() {\\n    // JS implementation\\n}",
            "java": "class SegmentTree {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_segment_tree() {\\n    // C implementation\\n}",
            "cpp": "void run_segment_tree() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "fenwick-tree",
        "title": "Fenwick Tree",
        "category": "Trees",
        "difficulty": "Advanced",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Fenwick Tree in multiple languages.",
        "description": "Fenwick Tree is a fundamental concept in the Trees category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Fenwick Tree\\nfunction run() {\\n  // Execute Fenwick Tree logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_fenwick_tree():\\n    # Python implementation\\n    pass",
            "javascript": "function runfenwicktree() {\\n    // JS implementation\\n}",
            "java": "class FenwickTree {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_fenwick_tree() {\\n    // C implementation\\n}",
            "cpp": "void run_fenwick_tree() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "splay-tree",
        "title": "Splay Tree",
        "category": "Trees",
        "difficulty": "Legendary",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Splay Tree in multiple languages.",
        "description": "Splay Tree is a fundamental concept in the Trees category, typically classified as Legendary level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Splay Tree\\nfunction run() {\\n  // Execute Splay Tree logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_splay_tree():\\n    # Python implementation\\n    pass",
            "javascript": "function runsplaytree() {\\n    // JS implementation\\n}",
            "java": "class SplayTree {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_splay_tree() {\\n    // C implementation\\n}",
            "cpp": "void run_splay_tree() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "treap",
        "title": "Treap",
        "category": "Trees",
        "difficulty": "Legendary",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Treap in multiple languages.",
        "description": "Treap is a fundamental concept in the Trees category, typically classified as Legendary level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Treap\\nfunction run() {\\n  // Execute Treap logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_treap():\\n    # Python implementation\\n    pass",
            "javascript": "function runtreap() {\\n    // JS implementation\\n}",
            "java": "class Treap {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_treap() {\\n    // C implementation\\n}",
            "cpp": "void run_treap() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "breadth-first-search",
        "title": "Breadth-First Search",
        "category": "Graphs",
        "difficulty": "Intermediate",
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V)",
        "shortDescription": "Interactive visualization and implementation for Breadth-First Search in multiple languages.",
        "description": "Breadth-First Search is a fundamental concept in the Graphs category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Breadth-First Search\\nfunction run() {\\n  // Execute Breadth-First Search logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_breadth_first_search():\\n    # Python implementation\\n    pass",
            "javascript": "function runbreadthfirstsearch() {\\n    // JS implementation\\n}",
            "java": "class BreadthFirstSearch {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_breadth_first_search() {\\n    // C implementation\\n}",
            "cpp": "void run_breadth_first_search() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "depth-first-search",
        "title": "Depth-First Search",
        "category": "Graphs",
        "difficulty": "Intermediate",
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V)",
        "shortDescription": "Interactive visualization and implementation for Depth-First Search in multiple languages.",
        "description": "Depth-First Search is a fundamental concept in the Graphs category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Depth-First Search\\nfunction run() {\\n  // Execute Depth-First Search logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_depth_first_search():\\n    # Python implementation\\n    pass",
            "javascript": "function rundepthfirstsearch() {\\n    // JS implementation\\n}",
            "java": "class DepthFirstSearch {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_depth_first_search() {\\n    // C implementation\\n}",
            "cpp": "void run_depth_first_search() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "dijkstras-algorithm",
        "title": "Dijkstra's Algorithm",
        "category": "Graphs",
        "difficulty": "Advanced",
        "timeComplexity": "O((V + E) log V)",
        "spaceComplexity": "O(V)",
        "shortDescription": "Interactive visualization and implementation for Dijkstra's Algorithm in multiple languages.",
        "description": "Dijkstra's Algorithm is a fundamental concept in the Graphs category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Dijkstra's Algorithm\\nfunction run() {\\n  // Execute Dijkstra's Algorithm logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_dijkstras_algorithm():\\n    # Python implementation\\n    pass",
            "javascript": "function rundijkstrasalgorithm() {\\n    // JS implementation\\n}",
            "java": "class Dijkstra'sAlgorithm {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_dijkstras_algorithm() {\\n    // C implementation\\n}",
            "cpp": "void run_dijkstras_algorithm() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "bellman-ford",
        "title": "Bellman-Ford",
        "category": "Graphs",
        "difficulty": "Advanced",
        "timeComplexity": "O(V * E)",
        "spaceComplexity": "O(V)",
        "shortDescription": "Interactive visualization and implementation for Bellman-Ford in multiple languages.",
        "description": "Bellman-Ford is a fundamental concept in the Graphs category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Bellman-Ford\\nfunction run() {\\n  // Execute Bellman-Ford logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_bellman_ford():\\n    # Python implementation\\n    pass",
            "javascript": "function runbellmanford() {\\n    // JS implementation\\n}",
            "java": "class BellmanFord {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_bellman_ford() {\\n    // C implementation\\n}",
            "cpp": "void run_bellman_ford() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "floyd-warshall",
        "title": "Floyd-Warshall",
        "category": "Graphs",
        "difficulty": "Advanced",
        "timeComplexity": "O(V\u00b3)",
        "spaceComplexity": "O(V\u00b2)",
        "shortDescription": "Interactive visualization and implementation for Floyd-Warshall in multiple languages.",
        "description": "Floyd-Warshall is a fundamental concept in the Graphs category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Floyd-Warshall\\nfunction run() {\\n  // Execute Floyd-Warshall logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_floyd_warshall():\\n    # Python implementation\\n    pass",
            "javascript": "function runfloydwarshall() {\\n    // JS implementation\\n}",
            "java": "class FloydWarshall {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_floyd_warshall() {\\n    // C implementation\\n}",
            "cpp": "void run_floyd_warshall() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "kruskals-algorithm",
        "title": "Kruskal's Algorithm",
        "category": "Graphs",
        "difficulty": "Advanced",
        "timeComplexity": "O(E log E)",
        "spaceComplexity": "O(V)",
        "shortDescription": "Interactive visualization and implementation for Kruskal's Algorithm in multiple languages.",
        "description": "Kruskal's Algorithm is a fundamental concept in the Graphs category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Kruskal's Algorithm\\nfunction run() {\\n  // Execute Kruskal's Algorithm logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_kruskals_algorithm():\\n    # Python implementation\\n    pass",
            "javascript": "function runkruskalsalgorithm() {\\n    // JS implementation\\n}",
            "java": "class Kruskal'sAlgorithm {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_kruskals_algorithm() {\\n    // C implementation\\n}",
            "cpp": "void run_kruskals_algorithm() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "prims-algorithm",
        "title": "Prim's Algorithm",
        "category": "Graphs",
        "difficulty": "Advanced",
        "timeComplexity": "O((V + E) log V)",
        "spaceComplexity": "O(V)",
        "shortDescription": "Interactive visualization and implementation for Prim's Algorithm in multiple languages.",
        "description": "Prim's Algorithm is a fundamental concept in the Graphs category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Prim's Algorithm\\nfunction run() {\\n  // Execute Prim's Algorithm logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_prims_algorithm():\\n    # Python implementation\\n    pass",
            "javascript": "function runprimsalgorithm() {\\n    // JS implementation\\n}",
            "java": "class Prim'sAlgorithm {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_prims_algorithm() {\\n    // C implementation\\n}",
            "cpp": "void run_prims_algorithm() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "topological-sort",
        "title": "Topological Sort",
        "category": "Graphs",
        "difficulty": "Intermediate",
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V)",
        "shortDescription": "Interactive visualization and implementation for Topological Sort in multiple languages.",
        "description": "Topological Sort is a fundamental concept in the Graphs category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Topological Sort\\nfunction run() {\\n  // Execute Topological Sort logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_topological_sort():\\n    # Python implementation\\n    pass",
            "javascript": "function runtopologicalsort() {\\n    // JS implementation\\n}",
            "java": "class TopologicalSort {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_topological_sort() {\\n    // C implementation\\n}",
            "cpp": "void run_topological_sort() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "tarjans-algorithm",
        "title": "Tarjan's Algorithm",
        "category": "Graphs",
        "difficulty": "Legendary",
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V)",
        "shortDescription": "Interactive visualization and implementation for Tarjan's Algorithm in multiple languages.",
        "description": "Tarjan's Algorithm is a fundamental concept in the Graphs category, typically classified as Legendary level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Tarjan's Algorithm\\nfunction run() {\\n  // Execute Tarjan's Algorithm logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_tarjans_algorithm():\\n    # Python implementation\\n    pass",
            "javascript": "function runtarjansalgorithm() {\\n    // JS implementation\\n}",
            "java": "class Tarjan'sAlgorithm {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_tarjans_algorithm() {\\n    // C implementation\\n}",
            "cpp": "void run_tarjans_algorithm() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "astar-search",
        "title": "A* Search",
        "category": "Graphs",
        "difficulty": "Advanced",
        "timeComplexity": "O(E)",
        "spaceComplexity": "O(V)",
        "shortDescription": "Interactive visualization and implementation for A* Search in multiple languages.",
        "description": "A* Search is a fundamental concept in the Graphs category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for A* Search\\nfunction run() {\\n  // Execute A* Search logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_astar_search():\\n    # Python implementation\\n    pass",
            "javascript": "function runastarsearch() {\\n    // JS implementation\\n}",
            "java": "class A*Search {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_astar_search() {\\n    // C implementation\\n}",
            "cpp": "void run_astar_search() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "fibonacci-(dp)",
        "title": "Fibonacci (DP)",
        "category": "Dynamic Programming",
        "difficulty": "Beginner",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Fibonacci (DP) in multiple languages.",
        "description": "Fibonacci (DP) is a fundamental concept in the Dynamic Programming category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Fibonacci (DP)\\nfunction run() {\\n  // Execute Fibonacci (DP) logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_fibonacci_(dp)():\\n    # Python implementation\\n    pass",
            "javascript": "function runfibonacci(dp)() {\\n    // JS implementation\\n}",
            "java": "class Fibonacci(DP) {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_fibonacci_(dp)() {\\n    // C implementation\\n}",
            "cpp": "void run_fibonacci_(dp)() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "0-1-knapsack",
        "title": "0/1 Knapsack",
        "category": "Dynamic Programming",
        "difficulty": "Intermediate",
        "timeComplexity": "O(nW)",
        "spaceComplexity": "O(nW)",
        "shortDescription": "Interactive visualization and implementation for 0/1 Knapsack in multiple languages.",
        "description": "0/1 Knapsack is a fundamental concept in the Dynamic Programming category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for 0/1 Knapsack\\nfunction run() {\\n  // Execute 0/1 Knapsack logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_0_1_knapsack():\\n    # Python implementation\\n    pass",
            "javascript": "function run01knapsack() {\\n    // JS implementation\\n}",
            "java": "class 0/1Knapsack {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_0_1_knapsack() {\\n    // C implementation\\n}",
            "cpp": "void run_0_1_knapsack() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "longest-common-subsequence",
        "title": "Longest Common Subsequence",
        "category": "Dynamic Programming",
        "difficulty": "Intermediate",
        "timeComplexity": "O(nm)",
        "spaceComplexity": "O(nm)",
        "shortDescription": "Interactive visualization and implementation for Longest Common Subsequence in multiple languages.",
        "description": "Longest Common Subsequence is a fundamental concept in the Dynamic Programming category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Longest Common Subsequence\\nfunction run() {\\n  // Execute Longest Common Subsequence logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_longest_common_subsequence():\\n    # Python implementation\\n    pass",
            "javascript": "function runlongestcommonsubsequence() {\\n    // JS implementation\\n}",
            "java": "class LongestCommonSubsequence {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_longest_common_subsequence() {\\n    // C implementation\\n}",
            "cpp": "void run_longest_common_subsequence() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "longest-increasing-subsequence",
        "title": "Longest Increasing Subsequence",
        "category": "Dynamic Programming",
        "difficulty": "Intermediate",
        "timeComplexity": "O(n log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Longest Increasing Subsequence in multiple languages.",
        "description": "Longest Increasing Subsequence is a fundamental concept in the Dynamic Programming category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Longest Increasing Subsequence\\nfunction run() {\\n  // Execute Longest Increasing Subsequence logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_longest_increasing_subsequence():\\n    # Python implementation\\n    pass",
            "javascript": "function runlongestincreasingsubsequence() {\\n    // JS implementation\\n}",
            "java": "class LongestIncreasingSubsequence {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_longest_increasing_subsequence() {\\n    // C implementation\\n}",
            "cpp": "void run_longest_increasing_subsequence() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "matrix-chain-multiplication",
        "title": "Matrix Chain Multiplication",
        "category": "Dynamic Programming",
        "difficulty": "Advanced",
        "timeComplexity": "O(n\u00b3)",
        "spaceComplexity": "O(n\u00b2)",
        "shortDescription": "Interactive visualization and implementation for Matrix Chain Multiplication in multiple languages.",
        "description": "Matrix Chain Multiplication is a fundamental concept in the Dynamic Programming category, typically classified as Advanced level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Matrix Chain Multiplication\\nfunction run() {\\n  // Execute Matrix Chain Multiplication logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_matrix_chain_multiplication():\\n    # Python implementation\\n    pass",
            "javascript": "function runmatrixchainmultiplication() {\\n    // JS implementation\\n}",
            "java": "class MatrixChainMultiplication {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_matrix_chain_multiplication() {\\n    // C implementation\\n}",
            "cpp": "void run_matrix_chain_multiplication() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "coin-change",
        "title": "Coin Change",
        "category": "Dynamic Programming",
        "difficulty": "Intermediate",
        "timeComplexity": "O(nV)",
        "spaceComplexity": "O(V)",
        "shortDescription": "Interactive visualization and implementation for Coin Change in multiple languages.",
        "description": "Coin Change is a fundamental concept in the Dynamic Programming category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Coin Change\\nfunction run() {\\n  // Execute Coin Change logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_coin_change():\\n    # Python implementation\\n    pass",
            "javascript": "function runcoinchange() {\\n    // JS implementation\\n}",
            "java": "class CoinChange {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_coin_change() {\\n    // C implementation\\n}",
            "cpp": "void run_coin_change() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "edit-distance",
        "title": "Edit Distance",
        "category": "Dynamic Programming",
        "difficulty": "Intermediate",
        "timeComplexity": "O(nm)",
        "spaceComplexity": "O(nm)",
        "shortDescription": "Interactive visualization and implementation for Edit Distance in multiple languages.",
        "description": "Edit Distance is a fundamental concept in the Dynamic Programming category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Edit Distance\\nfunction run() {\\n  // Execute Edit Distance logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_edit_distance():\\n    # Python implementation\\n    pass",
            "javascript": "function runeditdistance() {\\n    // JS implementation\\n}",
            "java": "class EditDistance {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_edit_distance() {\\n    // C implementation\\n}",
            "cpp": "void run_edit_distance() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "euclidean-algorithm",
        "title": "Euclidean Algorithm",
        "category": "Math",
        "difficulty": "Beginner",
        "timeComplexity": "O(log(min(a,b)))",
        "spaceComplexity": "O(1)",
        "shortDescription": "Interactive visualization and implementation for Euclidean Algorithm in multiple languages.",
        "description": "Euclidean Algorithm is a fundamental concept in the Math category, typically classified as Beginner level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Euclidean Algorithm\\nfunction run() {\\n  // Execute Euclidean Algorithm logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_euclidean_algorithm():\\n    # Python implementation\\n    pass",
            "javascript": "function runeuclideanalgorithm() {\\n    // JS implementation\\n}",
            "java": "class EuclideanAlgorithm {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_euclidean_algorithm() {\\n    // C implementation\\n}",
            "cpp": "void run_euclidean_algorithm() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "sieve-of-eratosthenes",
        "title": "Sieve of Eratosthenes",
        "category": "Math",
        "difficulty": "Intermediate",
        "timeComplexity": "O(n log log n)",
        "spaceComplexity": "O(n)",
        "shortDescription": "Interactive visualization and implementation for Sieve of Eratosthenes in multiple languages.",
        "description": "Sieve of Eratosthenes is a fundamental concept in the Math category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Sieve of Eratosthenes\\nfunction run() {\\n  // Execute Sieve of Eratosthenes logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_sieve_of_eratosthenes():\\n    # Python implementation\\n    pass",
            "javascript": "function runsieveoferatosthenes() {\\n    // JS implementation\\n}",
            "java": "class SieveofEratosthenes {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_sieve_of_eratosthenes() {\\n    // C implementation\\n}",
            "cpp": "void run_sieve_of_eratosthenes() {\\n    // C++ implementation\\n}"
        }
    },
    {
        "id": "fast-exponentiation",
        "title": "Fast Exponentiation",
        "category": "Math",
        "difficulty": "Intermediate",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(1)",
        "shortDescription": "Interactive visualization and implementation for Fast Exponentiation in multiple languages.",
        "description": "Fast Exponentiation is a fundamental concept in the Math category, typically classified as Intermediate level. It explores advanced optimization and structural patterns.",
        "pseudocode": "// Pseudocode for Fast Exponentiation\\nfunction run() {\\n  // Execute Fast Exponentiation logic\\n  return result;\\n}",
        "implementations": {
            "python": "def run_fast_exponentiation():\\n    # Python implementation\\n    pass",
            "javascript": "function runfastexponentiation() {\\n    // JS implementation\\n}",
            "java": "class FastExponentiation {\\n    void run() {\\n        // Java implementation\\n    }\\n}",
            "c": "void run_fast_exponentiation() {\\n    // C implementation\\n}",
            "cpp": "void run_fast_exponentiation() {\\n    // C++ implementation\\n}"
        }
    }
];