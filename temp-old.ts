export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Legendary';
export type Category = 'Sorting' | 'Linear' | 'Trees' | 'Graphs';

export interface Algorithm {
    id: string;
    title: string;
    category: Category;
    difficulty: Difficulty;
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
        id: 'bubble-sort',
        title: 'Bubble Sort',
        category: 'Sorting',
        difficulty: 'Beginner',
        shortDescription: 'Slow but simple sorting by swapping adjacent elements.',
        description: 'Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in wrong order. It is called "bubble" sort because smaller elements slowly "bubble" to the top of the list.',
        pseudocode: `for i from 0 to N-1:
    for j from 0 to N-i-2:
        if array[j] > array[j+1]:
            swap(array[j], array[j+1])`,
        implementations: {
            python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]`,
            javascript: `function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j+1]) {
                [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
            }
        }
    }
}`,
            java: `void bubbleSort(int arr[]) {
    int n = arr.length;
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
}`,
            c: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
}`,
            cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1])
                swap(arr[j], arr[j+1]);
}`
        }
    },
    {
        id: 'binary-search',
        title: 'Binary Search',
        category: 'Linear',
        difficulty: 'Beginner',
        shortDescription: 'Efficiently find an element in a sorted list by halving the search space.',
        description: 'Binary Search is a searching algorithm used in a sorted array by repeatedly dividing the search interval in half. The idea of binary search is to use the information that the array is sorted and reduce the time complexity to O(Log n).',
        pseudocode: `while low <= high:
    mid = (low + high) / 2
    if array[mid] == target:
        return mid
    else if array[mid] < target:
        low = mid + 1
    else:
        high = mid - 1`,
        implementations: {
            python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: low = mid + 1
        else: high = mid - 1
    return -1`,
            javascript: `function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
            java: `int binarySearch(int arr[], int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
            c: `int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
            cpp: `int binarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
        }
    },
    {
        id: 'linked-list',
        title: 'Linked List',
        category: 'Linear',
        difficulty: 'Intermediate',
        shortDescription: 'A linear collection of data elements whose order is not given by their physical placement in memory.',
        description: 'A Linked List is a linear data structure, in which the elements are not stored at contiguous memory locations. The elements in a linked list are linked using pointers.',
        pseudocode: `class Node:
    data, next = val, null

class LinkedList:
    head = null
    def add(val):
        new_node = Node(val)
        if head is null: head = new_node
        else:
            current = head
            while current.next: current = current.next
            current.next = new_node`,
        implementations: {
            python: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None`,
            javascript: `class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }
}`,
            java: `class Node {
    int data;
    Node next;
    Node(int d) { data = d; next = null; }
}`,
            c: `struct Node {
    int data;
    struct Node* next;
};`,
            cpp: `struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};`
        }
    },
    {
        id: 'binary-tree',
        title: 'Binary Tree',
        category: 'Trees',
        difficulty: 'Advanced',
        shortDescription: 'A tree data structure in which each node has at most two children.',
        description: 'A Binary Tree is a non-linear data structure where each node has at most two children, referred to as the left child and the right child. It is used to represent hierarchical relationships.',
        pseudocode: `class Node:
    data, left, right = val, null, null

def traverse(node):
    if node is null: return
    traverse(node.left)
    print(node.data)
    traverse(node.right)`,
        implementations: {
            python: `class Node:
    def __init__(self, key):
        self.left = None
        self.right = None
        self.val = key`,
            javascript: `class Node {
    constructor(item) {
        this.key = item;
        this.left = this.right = null;
    }
}`,
            java: `class Node {
    int key;
    Node left, right;
    public Node(int item) {
        key = item;
        left = right = null;
    }
}`,
            c: `struct Node {
    int data;
    struct Node *left, *right;
};`,
            cpp: `struct Node {
    int data;
    Node *left, *right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};`
        }
    }
];
