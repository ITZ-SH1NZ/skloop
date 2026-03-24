export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Legendary';
export type Category = 'Sorting' | 'Linear' | 'Trees' | 'Graphs' | 'Dynamic Programming' | 'Math' | 'String';

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

export const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced", "Legendary"];
export const CATEGORIES: Category[] = ["Sorting", "Linear", "Trees", "Graphs", "Dynamic Programming", "Math", "String"];

export const difficultyColors: Record<Difficulty, string> = {
    Beginner: "bg-lime-100 text-lime-800 border-lime-200",
    Intermediate: "bg-blue-100 text-blue-800 border-blue-200",
    Advanced: "bg-orange-100 text-orange-800 border-orange-200",
    Legendary: "bg-purple-100 text-purple-800 border-purple-200",
};

export const categoryColors: Record<Category, string> = {
    Sorting: "bg-pink-100 text-pink-800",
    Linear: "bg-emerald-100 text-emerald-800",
    Trees: "bg-amber-100 text-amber-800",
    Graphs: "bg-indigo-100 text-indigo-800",
    "Dynamic Programming": "bg-rose-100 text-rose-800",
    Math: "bg-cyan-100 text-cyan-800",
    String: "bg-violet-100 text-violet-800"
};

export const DSA_DATA: Algorithm[] = [
    {
        id: "bubble-sort",
        title: "Bubble Sort",
        category: "Sorting",
        difficulty: "Beginner",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        shortDescription: "Simple comparison-based sorting algorithm that repeatedly swaps adjacent elements until sorted.",
        description: "Bubble Sort is a fundamental comparison-based sorting algorithm. It works by repeatedly iterating through the array, comparing adjacent elements, and swapping them if they are in the wrong order.\n\nAfter each full pass, the largest unsorted element \"bubbles up\" to its correct position at the end of the array. This process continues until no swaps are needed, indicating that the array is sorted.\n\nAlthough inefficient for large datasets due to its quadratic time complexity, Bubble Sort is useful for educational purposes and scenarios where simplicity matters more than performance. An optimized version can detect already sorted arrays and terminate early.",
        pseudocode: "for i from 0 to n-1:\\n    swapped = false\\n    for j from 0 to n-i-2:\\n        if arr[j] > arr[j+1]:\\n            swap(arr[j], arr[j+1])\\n            swapped = true\\n    if swapped == false:\\n        break",
        implementations: {
            python: "def bubble_sort(arr):\\n    n = len(arr)\\n    for i in range(n):\\n        swapped = False\\n        for j in range(0, n - i - 1):\\n            if arr[j] > arr[j + 1]:\\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\\n                swapped = True\\n        if not swapped:\\n            break\\n    return arr",
            javascript: "function bubbleSort(arr) {\\n    let n = arr.length;\\n    for (let i = 0; i < n; i++) {\\n        let swapped = false;\\n        for (let j = 0; j < n - i - 1; j++) {\\n            if (arr[j] > arr[j + 1]) {\\n                let temp = arr[j];\\n                arr[j] = arr[j + 1];\\n                arr[j + 1] = temp;\\n                swapped = true;\\n            }\\n        }\\n        if (!swapped) break;\\n    }\\n    return arr;\\n}",
            java: "public static void bubbleSort(int[] arr) {\\n    int n = arr.length;\\n    for (int i = 0; i < n; i++) {\\n        boolean swapped = false;\\n        for (int j = 0; j < n - i - 1; j++) {\\n            if (arr[j] > arr[j + 1]) {\\n                int temp = arr[j];\\n                arr[j] = arr[j + 1];\\n                arr[j + 1] = temp;\\n                swapped = true;\\n            }\\n        }\\n        if (!swapped) break;\\n    }\\n}",
            c: "#include <stdio.h>\\nvoid bubbleSort(int arr[], int n) {\\n    for (int i = 0; i < n; i++) {\\n        int swapped = 0;\\n        for (int j = 0; j < n - i - 1; j++) {\\n            if (arr[j] > arr[j + 1]) {\\n                int temp = arr[j];\\n                arr[j] = arr[j + 1];\\n                arr[j + 1] = temp;\\n                swapped = 1;\\n            }\\n        }\\n        if (!swapped) break;\\n    }\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvoid bubbleSort(vector<int>& arr) {\\n    int n = arr.size();\\n    for (int i = 0; i < n; i++) {\\n        bool swapped = false;\\n        for (int j = 0; j < n - i - 1; j++) {\\n            if (arr[j] > arr[j + 1]) {\\n                int temp = arr[j];\\n                arr[j] = arr[j + 1];\\n                arr[j + 1] = temp;\\n                swapped = true;\\n            }\\n        }\\n        if (!swapped) break;\\n    }\\n}"
        }
    },
    {
        id: "selection-sort",
        title: "Selection Sort",
        category: "Sorting",
        difficulty: "Beginner",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        shortDescription: "Selects the minimum element from the unsorted portion and places it at its correct position.",
        description: "Selection Sort is a simple comparison-based sorting algorithm. It works by dividing the array into a sorted and an unsorted region. Initially, the sorted region is empty.\n\nIn each iteration, the algorithm scans the unsorted portion of the array to find the smallest element and swaps it with the first element of the unsorted region. This effectively grows the sorted region one element at a time.\n\nUnlike Bubble Sort, Selection Sort performs fewer swaps, making it useful when write operations are costly. However, it still has O(n²) time complexity, making it inefficient for large datasets.",
        pseudocode: "for i from 0 to n-1:\\n    min_index = i\\n    for j from i+1 to n-1:\\n        if arr[j] < arr[min_index]:\\n            min_index = j\\n    swap(arr[i], arr[min_index])",
        implementations: {
            python: "def selection_sort(arr):\\n    n = len(arr)\\n    for i in range(n):\\n        min_index = i\\n        for j in range(i + 1, n):\\n            if arr[j] < arr[min_index]:\\n                min_index = j\\n        arr[i], arr[min_index] = arr[min_index], arr[i]\\n    return arr",
            javascript: "function selectionSort(arr) {\\n    let n = arr.length;\\n    for (let i = 0; i < n; i++) {\\n        let minIndex = i;\\n        for (let j = i + 1; j < n; j++) {\\n            if (arr[j] < arr[minIndex]) {\\n                minIndex = j;\\n            }\\n        }\\n        let temp = arr[i];\\n        arr[i] = arr[minIndex];\\n        arr[minIndex] = temp;\\n    }\\n    return arr;\\n}",
            java: "public static void selectionSort(int[] arr) {\\n    int n = arr.length;\\n    for (int i = 0; i < n; i++) {\\n        int minIndex = i;\\n        for (int j = i + 1; j < n; j++) {\\n            if (arr[j] < arr[minIndex]) {\\n                minIndex = j;\\n            }\\n        }\\n        int temp = arr[i];\\n        arr[i] = arr[minIndex];\\n        arr[minIndex] = temp;\\n    }\\n}",
            c: "#include <stdio.h>\\nvoid selectionSort(int arr[], int n) {\\n    for (int i = 0; i < n; i++) {\\n        int minIndex = i;\\n        for (int j = i + 1; j < n; j++) {\\n            if (arr[j] < arr[minIndex]) {\\n                minIndex = j;\\n            }\\n        }\\n        int temp = arr[i];\\n        arr[i] = arr[minIndex];\\n        arr[minIndex] = temp;\\n    }\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvoid selectionSort(vector<int>& arr) {\\n    int n = arr.size();\\n    for (int i = 0; i < n; i++) {\\n        int minIndex = i;\\n        for (int j = i + 1; j < n; j++) {\\n            if (arr[j] < arr[minIndex]) {\\n                minIndex = j;\\n            }\\n        }\\n        int temp = arr[i];\\n        arr[i] = arr[minIndex];\\n        arr[minIndex] = temp;\\n    }\\n}"
        }
    },
    {
        id: "insertion-sort",
        title: "Insertion Sort",
        category: "Sorting",
        difficulty: "Beginner",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        shortDescription: "Builds a sorted array one element at a time by inserting into correct position.",
        description: "Insertion Sort works by taking one element at a time and inserting it into its correct position in the already sorted portion of the array.\n\nIt is efficient for small datasets or nearly sorted arrays, and is stable. However, its worst-case performance is O(n²), making it unsuitable for large datasets.",
        pseudocode: "for i from 1 to n-1:\\n    key = arr[i]\\n    j = i - 1\\n    while j >= 0 and arr[j] > key:\\n        arr[j+1] = arr[j]\\n        j = j - 1\\n    arr[j+1] = key",
        implementations: {
            python: "def insertion_sort(arr):\\n    for i in range(1, len(arr)):\\n        key = arr[i]\\n        j = i - 1\\n        while j >= 0 and arr[j] > key:\\n            arr[j + 1] = arr[j]\\n            j -= 1\\n        arr[j + 1] = key\\n    return arr",
            javascript: "function insertionSort(arr) {\\n    for (let i = 1; i < arr.length; i++) {\\n        let key = arr[i];\\n        let j = i - 1;\\n        while (j >= 0 && arr[j] > key) {\\n            arr[j + 1] = arr[j];\\n            j--;\\n        }\\n        arr[j + 1] = key;\\n    }\\n    return arr;\\n}",
            java: "public static void insertionSort(int[] arr) {\\n    for (int i = 1; i < arr.length; i++) {\\n        int key = arr[i];\\n        int j = i - 1;\\n        while (j >= 0 && arr[j] > key) {\\n            arr[j + 1] = arr[j];\\n            j--;\\n        }\\n        arr[j + 1] = key;\\n    }\\n}",
            c: "#include <stdio.h>\\nvoid insertionSort(int arr[], int n) {\\n    for (int i = 1; i < n; i++) {\\n        int key = arr[i];\\n        int j = i - 1;\\n        while (j >= 0 && arr[j] > key) {\\n            arr[j + 1] = arr[j];\\n            j--;\\n        }\\n        arr[j + 1] = key;\\n    }\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvoid insertionSort(vector<int>& arr) {\\n    for (int i = 1; i < arr.size(); i++) {\\n        int key = arr[i];\\n        int j = i - 1;\\n        while (j >= 0 && arr[j] > key) {\\n            arr[j + 1] = arr[j];\\n            j--;\\n        }\\n        arr[j + 1] = key;\\n    }\\n}"
        }
    },

    {
        id: "merge-sort",
        title: "Merge Sort",
        category: "Sorting",
        difficulty: "Intermediate",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        shortDescription: "Divide-and-conquer algorithm that splits, sorts, and merges arrays.",
        description: "Merge Sort is a divide-and-conquer algorithm that recursively splits the array into halves until single elements remain, then merges them back in sorted order.\n\nIt guarantees O(n log n) time complexity regardless of input, and is stable. However, it requires additional memory for merging.",
        pseudocode: "if array size <= 1 return\\ndivide array into two halves\\nrecursively sort both halves\\nmerge the sorted halves",
        implementations: {
            python: "def merge_sort(arr):\\n    if len(arr) <= 1:\\n        return arr\\n    mid = len(arr) // 2\\n    left = merge_sort(arr[:mid])\\n    right = merge_sort(arr[mid:])\\n    return merge(left, right)\\n\\ndef merge(left, right):\\n    result = []\\n    i = j = 0\\n    while i < len(left) and j < len(right):\\n        if left[i] < right[j]:\\n            result.append(left[i])\\n            i += 1\\n        else:\\n            result.append(right[j])\\n            j += 1\\n    result.extend(left[i:])\\n    result.extend(right[j:])\\n    return result",
            javascript: "function mergeSort(arr) {\\n    if (arr.length <= 1) return arr;\\n    let mid = Math.floor(arr.length / 2);\\n    let left = mergeSort(arr.slice(0, mid));\\n    let right = mergeSort(arr.slice(mid));\\n    return merge(left, right);\\n}\\n\\nfunction merge(left, right) {\\n    let result = [], i = 0, j = 0;\\n    while (i < left.length && j < right.length) {\\n        if (left[i] < right[j]) result.push(left[i++]);\\n        else result.push(right[j++]);\\n    }\\n    return result.concat(left.slice(i)).concat(right.slice(j));\\n}",
            java: "public static int[] mergeSort(int[] arr) {\\n    if (arr.length <= 1) return arr;\\n    int mid = arr.length / 2;\\n    int[] left = mergeSort(java.util.Arrays.copyOfRange(arr, 0, mid));\\n    int[] right = mergeSort(java.util.Arrays.copyOfRange(arr, mid, arr.length));\\n    return merge(left, right);\\n}\\n\\npublic static int[] merge(int[] left, int[] right) {\\n    int[] result = new int[left.length + right.length];\\n    int i = 0, j = 0, k = 0;\\n    while (i < left.length && j < right.length) {\\n        if (left[i] < right[j]) result[k++] = left[i++];\\n        else result[k++] = right[j++];\\n    }\\n    while (i < left.length) result[k++] = left[i++];\\n    while (j < right.length) result[k++] = right[j++];\\n    return result;\\n}",
            c: "#include <stdio.h>\\nvoid merge(int arr[], int l, int m, int r) {\\n    int n1 = m - l + 1, n2 = r - m;\\n    int L[n1], R[n2];\\n    for (int i = 0; i < n1; i++) L[i] = arr[l + i];\\n    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];\\n    int i = 0, j = 0, k = l;\\n    while (i < n1 && j < n2) {\\n        if (L[i] <= R[j]) arr[k++] = L[i++];\\n        else arr[k++] = R[j++];\\n    }\\n    while (i < n1) arr[k++] = L[i++];\\n    while (j < n2) arr[k++] = R[j++];\\n}\\n\\nvoid mergeSort(int arr[], int l, int r) {\\n    if (l < r) {\\n        int m = l + (r - l) / 2;\\n        mergeSort(arr, l, m);\\n        mergeSort(arr, m + 1, r);\\n        merge(arr, l, m, r);\\n    }\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvoid merge(vector<int>& arr, int l, int m, int r) {\\n    vector<int> L(arr.begin()+l, arr.begin()+m+1);\\n    vector<int> R(arr.begin()+m+1, arr.begin()+r+1);\\n    int i=0,j=0,k=l;\\n    while(i<L.size() && j<R.size()) {\\n        if(L[i]<=R[j]) arr[k++]=L[i++];\\n        else arr[k++]=R[j++];\\n    }\\n    while(i<L.size()) arr[k++]=L[i++];\\n    while(j<R.size()) arr[k++]=R[j++];\\n}\\n\\nvoid mergeSort(vector<int>& arr, int l, int r) {\\n    if(l<r){\\n        int m=l+(r-l)/2;\\n        mergeSort(arr,l,m);\\n        mergeSort(arr,m+1,r);\\n        merge(arr,l,m,r);\\n    }\\n}"
        }
    },
    {
        id: "quick-sort",
        title: "Quick Sort",
        category: "Sorting",
        difficulty: "Intermediate",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(log n)",
        shortDescription: "Efficient divide-and-conquer sort using pivot partitioning.",
        description: "Quick Sort selects a pivot element and partitions the array into elements smaller and greater than the pivot. It then recursively sorts the partitions.\n\nIt is one of the fastest sorting algorithms in practice due to cache efficiency and in-place operations. However, poor pivot selection can degrade performance to O(n²).",
        pseudocode: "function quickSort(arr, low, high):\\n    if low < high:\\n        pi = partition(arr, low, high)\\n        quickSort(arr, low, pi-1)\\n        quickSort(arr, pi+1, high)\\n\\nfunction partition(arr, low, high):\\n    pivot = arr[high]\\n    i = low - 1\\n    for j from low to high-1:\\n        if arr[j] <= pivot:\\n            i++\\n            swap(arr[i], arr[j])\\n    swap(arr[i+1], arr[high])\\n    return i+1",
        implementations: {
            python: "def partition(arr, low, high):\\n    pivot = arr[high]\\n    i = low - 1\\n    for j in range(low, high):\\n        if arr[j] <= pivot:\\n            i += 1\\n            arr[i], arr[j] = arr[j], arr[i]\\n    arr[i+1], arr[high] = arr[high], arr[i+1]\\n    return i + 1\\n\\ndef quick_sort(arr, low, high):\\n    if low < high:\\n        pi = partition(arr, low, high)\\n        quick_sort(arr, low, pi - 1)\\n        quick_sort(arr, pi + 1, high)\\n    return arr",
            javascript: "function partition(arr, low, high) {\\n    let pivot = arr[high];\\n    let i = low - 1;\\n    for (let j = low; j < high; j++) {\\n        if (arr[j] <= pivot) {\\n            i++;\\n            [arr[i], arr[j]] = [arr[j], arr[i]];\\n        }\\n    }\\n    [arr[i+1], arr[high]] = [arr[high], arr[i+1]];\\n    return i + 1;\\n}\\n\\nfunction quickSort(arr, low, high) {\\n    if (low < high) {\\n        let pi = partition(arr, low, high);\\n        quickSort(arr, low, pi - 1);\\n        quickSort(arr, pi + 1, high);\\n    }\\n    return arr;\\n}",
            java: "public static int partition(int[] arr, int low, int high) {\\n    int pivot = arr[high];\\n    int i = low - 1;\\n    for (int j = low; j < high; j++) {\\n        if (arr[j] <= pivot) {\\n            i++;\\n            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;\\n        }\\n    }\\n    int temp = arr[i+1]; arr[i+1] = arr[high]; arr[high] = temp;\\n    return i + 1;\\n}\\n\\npublic static void quickSort(int[] arr, int low, int high) {\\n    if (low < high) {\\n        int pi = partition(arr, low, high);\\n        quickSort(arr, low, pi - 1);\\n        quickSort(arr, pi + 1, high);\\n    }\\n}",
            c: "#include <stdio.h>\\nint partition(int arr[], int low, int high) {\\n    int pivot = arr[high];\\n    int i = low - 1;\\n    for (int j = low; j < high; j++) {\\n        if (arr[j] <= pivot) {\\n            i++;\\n            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;\\n        }\\n    }\\n    int temp = arr[i+1]; arr[i+1] = arr[high]; arr[high] = temp;\\n    return i + 1;\\n}\\n\\nvoid quickSort(int arr[], int low, int high) {\\n    if (low < high) {\\n        int pi = partition(arr, low, high);\\n        quickSort(arr, low, pi - 1);\\n        quickSort(arr, pi + 1, high);\\n    }\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nint partition(vector<int>& arr, int low, int high) {\\n    int pivot = arr[high];\\n    int i = low - 1;\\n    for (int j = low; j < high; j++) {\\n        if (arr[j] <= pivot) {\\n            i++;\\n            swap(arr[i], arr[j]);\\n        }\\n    }\\n    swap(arr[i+1], arr[high]);\\n    return i + 1;\\n}\\n\\nvoid quickSort(vector<int>& arr, int low, int high) {\\n    if (low < high) {\\n        int pi = partition(arr, low, high);\\n        quickSort(arr, low, pi - 1);\\n        quickSort(arr, pi + 1, high);\\n    }\\n}"
        }
    },

    {
        id: "heap-sort",
        title: "Heap Sort",
        category: "Sorting",
        difficulty: "Intermediate",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1)",
        shortDescription: "Sorts by building a max heap and extracting elements.",
        description: "Heap Sort first builds a max heap from the array, then repeatedly swaps the root (largest element) with the last element and reduces the heap size.\n\nIt guarantees O(n log n) time and uses no extra memory, but is not stable.",
        pseudocode: "build max heap\\nfor i from n-1 downto 1:\\n    swap(arr[0], arr[i])\\n    heapify(arr, i, 0)",
        implementations: {
            python: "def heapify(arr, n, i):\\n    largest = i\\n    l = 2*i + 1\\n    r = 2*i + 2\\n    if l < n and arr[l] > arr[largest]: largest = l\\n    if r < n and arr[r] > arr[largest]: largest = r\\n    if largest != i:\\n        arr[i], arr[largest] = arr[largest], arr[i]\\n        heapify(arr, n, largest)\\n\\ndef heap_sort(arr):\\n    n = len(arr)\\n    for i in range(n//2 - 1, -1, -1):\\n        heapify(arr, n, i)\\n    for i in range(n-1, 0, -1):\\n        arr[i], arr[0] = arr[0], arr[i]\\n        heapify(arr, i, 0)\\n    return arr",
            javascript: "function heapify(arr, n, i) {\\n    let largest = i;\\n    let l = 2*i + 1;\\n    let r = 2*i + 2;\\n    if (l < n && arr[l] > arr[largest]) largest = l;\\n    if (r < n && arr[r] > arr[largest]) largest = r;\\n    if (largest !== i) {\\n        [arr[i], arr[largest]] = [arr[largest], arr[i]];\\n        heapify(arr, n, largest);\\n    }\\n}\\n\\nfunction heapSort(arr) {\\n    let n = arr.length;\\n    for (let i = Math.floor(n/2)-1; i >= 0; i--) heapify(arr, n, i);\\n    for (let i = n-1; i > 0; i--) {\\n        [arr[0], arr[i]] = [arr[i], arr[0]];\\n        heapify(arr, i, 0);\\n    }\\n    return arr;\\n}",
            java: "public static void heapify(int[] arr, int n, int i) {\\n    int largest = i;\\n    int l = 2*i + 1;\\n    int r = 2*i + 2;\\n    if (l < n && arr[l] > arr[largest]) largest = l;\\n    if (r < n && arr[r] > arr[largest]) largest = r;\\n    if (largest != i) {\\n        int temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;\\n        heapify(arr, n, largest);\\n    }\\n}\\n\\npublic static void heapSort(int[] arr) {\\n    int n = arr.length;\\n    for (int i = n/2 - 1; i >= 0; i--) heapify(arr, n, i);\\n    for (int i = n - 1; i > 0; i--) {\\n        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;\\n        heapify(arr, i, 0);\\n    }\\n}",
            c: "#include <stdio.h>\\nvoid heapify(int arr[], int n, int i) {\\n    int largest = i;\\n    int l = 2*i + 1;\\n    int r = 2*i + 2;\\n    if (l < n && arr[l] > arr[largest]) largest = l;\\n    if (r < n && arr[r] > arr[largest]) largest = r;\\n    if (largest != i) {\\n        int temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;\\n        heapify(arr, n, largest);\\n    }\\n}\\n\\nvoid heapSort(int arr[], int n) {\\n    for (int i = n/2 - 1; i >= 0; i--) heapify(arr, n, i);\\n    for (int i = n - 1; i > 0; i--) {\\n        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;\\n        heapify(arr, i, 0);\\n    }\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvoid heapify(vector<int>& arr, int n, int i) {\\n    int largest = i;\\n    int l = 2*i + 1;\\n    int r = 2*i + 2;\\n    if (l < n && arr[l] > arr[largest]) largest = l;\\n    if (r < n && arr[r] > arr[largest]) largest = r;\\n    if (largest != i) {\\n        swap(arr[i], arr[largest]);\\n        heapify(arr, n, largest);\\n    }\\n}\\n\\nvoid heapSort(vector<int>& arr) {\\n    int n = arr.size();\\n    for (int i = n/2 - 1; i >= 0; i--) heapify(arr, n, i);\\n    for (int i = n - 1; i > 0; i--) {\\n        swap(arr[0], arr[i]);\\n        heapify(arr, i, 0);\\n    }\\n}"
        }
    },
    {
        id: "counting-sort",
        title: "Counting Sort",
        category: "Sorting",
        difficulty: "Intermediate",
        timeComplexity: "O(n + k)",
        spaceComplexity: "O(k)",
        shortDescription: "Sorts integers by counting occurrences of each value.",
        description: "Counting Sort is a non-comparison sorting algorithm that works by counting how many times each value appears. It then reconstructs the sorted array using cumulative counts.\n\nIt is efficient when the range of input values (k) is not significantly larger than the number of elements (n). It is also stable when implemented properly, making it useful as a subroutine in Radix Sort.",
        pseudocode: "find max value k\\ncreate count array of size k+1\\ncount occurrences\\ncompute prefix sums\\nplace elements into output array in stable order",
        implementations: {
            python: "def counting_sort(arr):\\n    if not arr: return arr\\n    max_val = max(arr)\\n    count = [0] * (max_val + 1)\\n    for num in arr:\\n        count[num] += 1\\n    for i in range(1, len(count)):\\n        count[i] += count[i - 1]\\n    output = [0] * len(arr)\\n    for num in reversed(arr):\\n        output[count[num] - 1] = num\\n        count[num] -= 1\\n    return output",
            javascript: "function countingSort(arr) {\\n    if (arr.length === 0) return arr;\\n    let max = Math.max(...arr);\\n    let count = new Array(max + 1).fill(0);\\n    for (let num of arr) count[num]++;\\n    for (let i = 1; i < count.length; i++) count[i] += count[i - 1];\\n    let output = new Array(arr.length);\\n    for (let i = arr.length - 1; i >= 0; i--) {\\n        output[count[arr[i]] - 1] = arr[i];\\n        count[arr[i]]--;\\n    }\\n    return output;\\n}",
            java: "public static int[] countingSort(int[] arr) {\\n    if (arr.length == 0) return arr;\\n    int max = arr[0];\\n    for (int num : arr) if (num > max) max = num;\\n    int[] count = new int[max + 1];\\n    for (int num : arr) count[num]++;\\n    for (int i = 1; i < count.length; i++) count[i] += count[i - 1];\\n    int[] output = new int[arr.length];\\n    for (int i = arr.length - 1; i >= 0; i--) {\\n        output[count[arr[i]] - 1] = arr[i];\\n        count[arr[i]]--;\\n    }\\n    return output;\\n}",
            c: "#include <stdio.h>\\nvoid countingSort(int arr[], int n) {\\n    int max = arr[0];\\n    for (int i = 1; i < n; i++) if (arr[i] > max) max = arr[i];\\n    int count[max+1];\\n    for (int i = 0; i <= max; i++) count[i] = 0;\\n    for (int i = 0; i < n; i++) count[arr[i]]++;\\n    for (int i = 1; i <= max; i++) count[i] += count[i-1];\\n    int output[n];\\n    for (int i = n-1; i >= 0; i--) {\\n        output[count[arr[i]] - 1] = arr[i];\\n        count[arr[i]]--;\\n    }\\n    for (int i = 0; i < n; i++) arr[i] = output[i];\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvector<int> countingSort(vector<int>& arr) {\\n    if (arr.empty()) return arr;\\n    int maxVal = *max_element(arr.begin(), arr.end());\\n    vector<int> count(maxVal + 1, 0);\\n    for (int num : arr) count[num]++;\\n    for (int i = 1; i < count.size(); i++) count[i] += count[i - 1];\\n    vector<int> output(arr.size());\\n    for (int i = arr.size() - 1; i >= 0; i--) {\\n        output[count[arr[i]] - 1] = arr[i];\\n        count[arr[i]]--;\\n    }\\n    return output;\\n}"
        }
    },

    {
        id: "radix-sort",
        title: "Radix Sort",
        category: "Sorting",
        difficulty: "Advanced",
        timeComplexity: "O(nk)",
        spaceComplexity: "O(n + k)",
        shortDescription: "Sorts numbers digit by digit using stable sorting.",
        description: "Radix Sort processes numbers digit by digit, starting from the least significant digit (LSD) to the most significant digit (MSD). It uses Counting Sort as a subroutine to maintain stability.\n\nIt avoids direct comparisons, making it efficient for sorting integers or strings when the number of digits is limited.",
        pseudocode: "find max number\\nfor exp = 1 while max/exp > 0:\\n    perform counting sort on digit at exp\\n    exp *= 10",
        implementations: {
            python: "def counting_sort_exp(arr, exp):\\n    n = len(arr)\\n    output = [0]*n\\n    count = [0]*10\\n    for i in range(n):\\n        index = (arr[i] // exp) % 10\\n        count[index] += 1\\n    for i in range(1,10):\\n        count[i] += count[i-1]\\n    for i in range(n-1,-1,-1):\\n        index = (arr[i] // exp) % 10\\n        output[count[index]-1] = arr[i]\\n        count[index] -= 1\\n    for i in range(n):\\n        arr[i] = output[i]\\n\\ndef radix_sort(arr):\\n    if not arr: return arr\\n    max_val = max(arr)\\n    exp = 1\\n    while max_val // exp > 0:\\n        counting_sort_exp(arr, exp)\\n        exp *= 10\\n    return arr",
            javascript: "function countingSortExp(arr, exp) {\\n    let n = arr.length;\\n    let output = new Array(n).fill(0);\\n    let count = new Array(10).fill(0);\\n    for (let i = 0; i < n; i++) {\\n        let index = Math.floor(arr[i] / exp) % 10;\\n        count[index]++;\\n    }\\n    for (let i = 1; i < 10; i++) count[i] += count[i - 1];\\n    for (let i = n - 1; i >= 0; i--) {\\n        let index = Math.floor(arr[i] / exp) % 10;\\n        output[count[index] - 1] = arr[i];\\n        count[index]--;\\n    }\\n    for (let i = 0; i < n; i++) arr[i] = output[i];\\n}\\n\\nfunction radixSort(arr) {\\n    if (arr.length === 0) return arr;\\n    let max = Math.max(...arr);\\n    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {\\n        countingSortExp(arr, exp);\\n    }\\n    return arr;\\n}",
            java: "public static void countingSortExp(int[] arr, int exp) {\\n    int n = arr.length;\\n    int[] output = new int[n];\\n    int[] count = new int[10];\\n    for (int i = 0; i < n; i++) count[(arr[i]/exp)%10]++;\\n    for (int i = 1; i < 10; i++) count[i] += count[i-1];\\n    for (int i = n-1; i >= 0; i--) {\\n        int index = (arr[i]/exp)%10;\\n        output[count[index]-1] = arr[i];\\n        count[index]--;\\n    }\\n    for (int i = 0; i < n; i++) arr[i] = output[i];\\n}\\n\\npublic static void radixSort(int[] arr) {\\n    int max = arr[0];\\n    for (int num : arr) if (num > max) max = num;\\n    for (int exp = 1; max/exp > 0; exp *= 10) countingSortExp(arr, exp);\\n}",
            c: "#include <stdio.h>\\nvoid countingSortExp(int arr[], int n, int exp) {\\n    int output[n];\\n    int count[10] = {0};\\n    for (int i = 0; i < n; i++) count[(arr[i]/exp)%10]++;\\n    for (int i = 1; i < 10; i++) count[i] += count[i-1];\\n    for (int i = n-1; i >= 0; i--) {\\n        int index = (arr[i]/exp)%10;\\n        output[count[index]-1] = arr[i];\\n        count[index]--;\\n    }\\n    for (int i = 0; i < n; i++) arr[i] = output[i];\\n}\\n\\nvoid radixSort(int arr[], int n) {\\n    int max = arr[0];\\n    for (int i = 1; i < n; i++) if (arr[i] > max) max = arr[i];\\n    for (int exp = 1; max/exp > 0; exp *= 10) countingSortExp(arr, n, exp);\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvoid countingSortExp(vector<int>& arr, int exp) {\\n    int n = arr.size();\\n    vector<int> output(n);\\n    int count[10] = {0};\\n    for (int i = 0; i < n; i++) count[(arr[i]/exp)%10]++;\\n    for (int i = 1; i < 10; i++) count[i] += count[i-1];\\n    for (int i = n-1; i >= 0; i--) {\\n        int index = (arr[i]/exp)%10;\\n        output[count[index]-1] = arr[i];\\n        count[index]--;\\n    }\\n    for (int i = 0; i < n; i++) arr[i] = output[i];\\n}\\n\\nvoid radixSort(vector<int>& arr) {\\n    int maxVal = *max_element(arr.begin(), arr.end());\\n    for (int exp = 1; maxVal/exp > 0; exp *= 10) countingSortExp(arr, exp);\\n}"
        }
    },
    {
        id: "shell-sort",
        title: "Shell Sort",
        category: "Sorting",
        difficulty: "Intermediate",
        timeComplexity: "O(n log n) (best), O(n²) (worst)",
        spaceComplexity: "O(1)",
        shortDescription: "Improves insertion sort by comparing distant elements using gaps.",
        description: "Shell Sort is an optimization over Insertion Sort. It starts by sorting elements far apart using a gap sequence and progressively reduces the gap until it becomes 1.\n\nBy allowing swaps over larger distances early on, it significantly reduces the number of shifts required compared to standard insertion sort. The performance depends on the chosen gap sequence.",
        pseudocode: "gap = n/2\\nwhile gap > 0:\\n    for i from gap to n-1:\\n        temp = arr[i]\\n        j = i\\n        while j >= gap and arr[j-gap] > temp:\\n            arr[j] = arr[j-gap]\\n            j -= gap\\n        arr[j] = temp\\n    gap = gap/2",
        implementations: {
            python: "def shell_sort(arr):\\n    n = len(arr)\\n    gap = n // 2\\n    while gap > 0:\\n        for i in range(gap, n):\\n            temp = arr[i]\\n            j = i\\n            while j >= gap and arr[j-gap] > temp:\\n                arr[j] = arr[j-gap]\\n                j -= gap\\n            arr[j] = temp\\n        gap //= 2\\n    return arr",
            javascript: "function shellSort(arr) {\\n    let n = arr.length;\\n    let gap = Math.floor(n / 2);\\n    while (gap > 0) {\\n        for (let i = gap; i < n; i++) {\\n            let temp = arr[i];\\n            let j = i;\\n            while (j >= gap && arr[j - gap] > temp) {\\n                arr[j] = arr[j - gap];\\n                j -= gap;\\n            }\\n            arr[j] = temp;\\n        }\\n        gap = Math.floor(gap / 2);\\n    }\\n    return arr;\\n}",
            java: "public static void shellSort(int[] arr) {\\n    int n = arr.length;\\n    for (int gap = n/2; gap > 0; gap /= 2) {\\n        for (int i = gap; i < n; i++) {\\n            int temp = arr[i];\\n            int j = i;\\n            while (j >= gap && arr[j-gap] > temp) {\\n                arr[j] = arr[j-gap];\\n                j -= gap;\\n            }\\n            arr[j] = temp;\\n        }\\n    }\\n}",
            c: "#include <stdio.h>\\nvoid shellSort(int arr[], int n) {\\n    for (int gap = n/2; gap > 0; gap /= 2) {\\n        for (int i = gap; i < n; i++) {\\n            int temp = arr[i];\\n            int j = i;\\n            while (j >= gap && arr[j-gap] > temp) {\\n                arr[j] = arr[j-gap];\\n                j -= gap;\\n            }\\n            arr[j] = temp;\\n        }\\n    }\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvoid shellSort(vector<int>& arr) {\\n    int n = arr.size();\\n    for (int gap = n/2; gap > 0; gap /= 2) {\\n        for (int i = gap; i < n; i++) {\\n            int temp = arr[i];\\n            int j = i;\\n            while (j >= gap && arr[j-gap] > temp) {\\n                arr[j] = arr[j-gap];\\n                j -= gap;\\n            }\\n            arr[j] = temp;\\n        }\\n    }\\n}"
        }
    },

    {
        id: "bucket-sort",
        title: "Bucket Sort",
        category: "Sorting",
        difficulty: "Advanced",
        timeComplexity: "O(n + k)",
        spaceComplexity: "O(n + k)",
        shortDescription: "Distributes elements into buckets and sorts each bucket individually.",
        description: "Bucket Sort divides the input into multiple buckets based on value ranges. Each bucket is sorted individually (often using insertion sort), and then all buckets are concatenated.\n\nIt performs best when the input is uniformly distributed. It is commonly used for floating-point numbers or data mapped to a range.",
        pseudocode: "create n empty buckets\\nfor each element:\\n    insert into appropriate bucket\\nsort each bucket\\nconcatenate buckets",
        implementations: {
            python: "def bucket_sort(arr):\\n    if len(arr) == 0: return arr\\n    bucket_count = len(arr)\\n    buckets = [[] for _ in range(bucket_count)]\\n    for num in arr:\\n        index = int(num * bucket_count)\\n        buckets[index].append(num)\\n    for b in buckets:\\n        b.sort()\\n    result = []\\n    for b in buckets:\\n        result.extend(b)\\n    return result",
            javascript: "function bucketSort(arr) {\\n    if (arr.length === 0) return arr;\\n    let bucketCount = arr.length;\\n    let buckets = Array.from({length: bucketCount}, () => []);\\n    for (let num of arr) {\\n        let index = Math.floor(num * bucketCount);\\n        buckets[index].push(num);\\n    }\\n    for (let b of buckets) b.sort((a,b)=>a-b);\\n    return [].concat(...buckets);\\n}",
            java: "import java.util.*;\\npublic static float[] bucketSort(float[] arr) {\\n    int n = arr.length;\\n    List<Float>[] buckets = new ArrayList[n];\\n    for (int i = 0; i < n; i++) buckets[i] = new ArrayList<>();\\n    for (float num : arr) buckets[(int)(num * n)].add(num);\\n    for (List<Float> b : buckets) Collections.sort(b);\\n    int i = 0;\\n    for (List<Float> b : buckets) for (float num : b) arr[i++] = num;\\n    return arr;\\n}",
            c: "#include <stdio.h>\\n#include <stdlib.h>\\nvoid bucketSort(float arr[], int n) {\\n    float buckets[n][n];\\n    int count[n];\\n    for(int i=0;i<n;i++) count[i]=0;\\n    for(int i=0;i<n;i++){\\n        int idx = n * arr[i];\\n        buckets[idx][count[idx]++] = arr[i];\\n    }\\n    for(int i=0;i<n;i++){\\n        for(int j=0;j<count[i];j++){\\n            for(int k=j+1;k<count[i];k++){\\n                if(buckets[i][j] > buckets[i][k]){\\n                    float temp=buckets[i][j];\\n                    buckets[i][j]=buckets[i][k];\\n                    buckets[i][k]=temp;\\n                }\\n            }\\n        }\\n    }\\n    int idx=0;\\n    for(int i=0;i<n;i++)\\n        for(int j=0;j<count[i];j++)\\n            arr[idx++] = buckets[i][j];\\n}",
            cpp: "#include <vector>\\n#include <algorithm>\\nusing namespace std;\\nvector<float> bucketSort(vector<float>& arr) {\\n    int n = arr.size();\\n    vector<vector<float>> buckets(n);\\n    for (float num : arr) {\\n        int idx = n * num;\\n        buckets[idx].push_back(num);\\n    }\\n    for (auto &b : buckets) sort(b.begin(), b.end());\\n    vector<float> result;\\n    for (auto &b : buckets) result.insert(result.end(), b.begin(), b.end());\\n    return result;\\n}"
        }
    },
    {
        id: "singly-linked-list",
        title: "Singly Linked List",
        category: "Linear",
        difficulty: "Beginner",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        shortDescription: "A dynamic data structure where each node points to the next node.",
        description: "A Singly Linked List is a linear data structure where elements (nodes) are connected using pointers. Each node contains data and a reference to the next node in the sequence.\n\nUnlike arrays, linked lists do not require contiguous memory, allowing efficient insertions and deletions. However, accessing elements is slower since traversal must be sequential.\n\nCommon operations include insertion, deletion, traversal, and search.",
        pseudocode: "Node:\\n    data\\n    next\\n\\ninsert(value):\\n    create new node\\n    if head is null:\\n        head = new node\\n    else:\\n        traverse to end\\n        last.next = new node\\n\\ndelete(value):\\n    if head.data == value:\\n        head = head.next\\n    else:\\n        find node before target\\n        bypass target node",
        implementations: {
            python: "class Node:\\n    def __init__(self, data):\\n        self.data = data\\n        self.next = None\\n\\nclass LinkedList:\\n    def __init__(self):\\n        self.head = None\\n\\n    def insert(self, data):\\n        new_node = Node(data)\\n        if not self.head:\\n            self.head = new_node\\n            return\\n        temp = self.head\\n        while temp.next:\\n            temp = temp.next\\n        temp.next = new_node\\n\\n    def delete(self, key):\\n        temp = self.head\\n        if temp and temp.data == key:\\n            self.head = temp.next\\n            return\\n        prev = None\\n        while temp and temp.data != key:\\n            prev = temp\\n            temp = temp.next\\n        if temp:\\n            prev.next = temp.next\\n\\n    def search(self, key):\\n        temp = self.head\\n        while temp:\\n            if temp.data == key:\\n                return True\\n            temp = temp.next\\n        return False",
            javascript: "class Node {\\n    constructor(data) {\\n        this.data = data;\\n        this.next = null;\\n    }\\n}\\n\\nclass LinkedList {\\n    constructor() {\\n        this.head = null;\\n    }\\n\\n    insert(data) {\\n        let newNode = new Node(data);\\n        if (!this.head) {\\n            this.head = newNode;\\n            return;\\n        }\\n        let temp = this.head;\\n        while (temp.next) temp = temp.next;\\n        temp.next = newNode;\\n    }\\n\\n    delete(key) {\\n        let temp = this.head, prev = null;\\n        if (temp && temp.data === key) {\\n            this.head = temp.next;\\n            return;\\n        }\\n        while (temp && temp.data !== key) {\\n            prev = temp;\\n            temp = temp.next;\\n        }\\n        if (temp) prev.next = temp.next;\\n    }\\n\\n    search(key) {\\n        let temp = this.head;\\n        while (temp) {\\n            if (temp.data === key) return true;\\n            temp = temp.next;\\n        }\\n        return false;\\n    }\\n}",
            java: "class Node {\\n    int data;\\n    Node next;\\n    Node(int data) { this.data = data; this.next = null; }\\n}\\n\\nclass LinkedList {\\n    Node head;\\n\\n    void insert(int data) {\\n        Node newNode = new Node(data);\\n        if (head == null) { head = newNode; return; }\\n        Node temp = head;\\n        while (temp.next != null) temp = temp.next;\\n        temp.next = newNode;\\n    }\\n\\n    void delete(int key) {\\n        Node temp = head, prev = null;\\n        if (temp != null && temp.data == key) { head = temp.next; return; }\\n        while (temp != null && temp.data != key) { prev = temp; temp = temp.next; }\\n        if (temp != null) prev.next = temp.next;\\n    }\\n\\n    boolean search(int key) {\\n        Node temp = head;\\n        while (temp != null) {\\n            if (temp.data == key) return true;\\n            temp = temp.next;\\n        }\\n        return false;\\n    }\\n}",
            c: "#include <stdio.h>\\n#include <stdlib.h>\\nstruct Node { int data; struct Node* next; };\\n\\nvoid insert(struct Node** head, int data) {\\n    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));\\n    newNode->data = data; newNode->next = NULL;\\n    if (*head == NULL) { *head = newNode; return; }\\n    struct Node* temp = *head;\\n    while (temp->next) temp = temp->next;\\n    temp->next = newNode;\\n}\\n\\nvoid delete(struct Node** head, int key) {\\n    struct Node* temp = *head, *prev = NULL;\\n    if (temp && temp->data == key) { *head = temp->next; return; }\\n    while (temp && temp->data != key) { prev = temp; temp = temp->next; }\\n    if (temp) prev->next = temp->next;\\n}",
            cpp: "#include <iostream>\\nusing namespace std;\\nclass Node {\\npublic:\\n    int data;\\n    Node* next;\\n    Node(int d) { data = d; next = NULL; }\\n};\\n\\nclass LinkedList {\\npublic:\\n    Node* head = NULL;\\n\\n    void insert(int data) {\\n        Node* newNode = new Node(data);\\n        if (!head) { head = newNode; return; }\\n        Node* temp = head;\\n        while (temp->next) temp = temp->next;\\n        temp->next = newNode;\\n    }\\n\\n    void deleteNode(int key) {\\n        Node* temp = head;\\n        Node* prev = NULL;\\n        if (temp && temp->data == key) { head = temp->next; return; }\\n        while (temp && temp->data != key) { prev = temp; temp = temp->next; }\\n        if (temp) prev->next = temp->next;\\n    }\\n\\n    bool search(int key) {\\n        Node* temp = head;\\n        while (temp) {\\n            if (temp->data == key) return true;\\n            temp = temp->next;\\n        }\\n        return false;\\n    }\\n};"
        }
    },
    {
        id: "doubly-linked-list",
        title: "Doubly Linked List",
        category: "Linear",
        difficulty: "Intermediate",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        shortDescription: "Linked list where each node has both next and previous pointers.",
        description: "A Doubly Linked List extends the singly linked list by adding a pointer to the previous node. This allows traversal in both directions.\n\nIt enables more efficient deletions since you don't need to track the previous node during traversal. However, it uses more memory due to the extra pointer.",
        pseudocode: "Node:\\n    data\\n    prev\\n    next\\n\\ninsert(value):\\n    create new node\\n    if head null -> head = node\\n    else traverse to end\\n    last.next = node\\n    node.prev = last\\n\\ndelete(value):\\n    find node\\n    if node.prev exists -> node.prev.next = node.next\\n    if node.next exists -> node.next.prev = node.prev",
        implementations: {
            python: "class Node:\\n    def __init__(self, data):\\n        self.data = data\\n        self.prev = None\\n        self.next = None\\n\\nclass DoublyLinkedList:\\n    def __init__(self):\\n        self.head = None\\n\\n    def insert(self, data):\\n        new_node = Node(data)\\n        if not self.head:\\n            self.head = new_node\\n            return\\n        temp = self.head\\n        while temp.next:\\n            temp = temp.next\\n        temp.next = new_node\\n        new_node.prev = temp\\n\\n    def delete(self, key):\\n        temp = self.head\\n        while temp:\\n            if temp.data == key:\\n                if temp.prev:\\n                    temp.prev.next = temp.next\\n                else:\\n                    self.head = temp.next\\n                if temp.next:\\n                    temp.next.prev = temp.prev\\n                return\\n            temp = temp.next",
            javascript: "class Node {\\n    constructor(data) {\\n        this.data = data;\\n        this.prev = null;\\n        this.next = null;\\n    }\\n}\\n\\nclass DoublyLinkedList {\\n    constructor() { this.head = null; }\\n\\n    insert(data) {\\n        let newNode = new Node(data);\\n        if (!this.head) { this.head = newNode; return; }\\n        let temp = this.head;\\n        while (temp.next) temp = temp.next;\\n        temp.next = newNode;\\n        newNode.prev = temp;\\n    }\\n\\n    delete(key) {\\n        let temp = this.head;\\n        while (temp) {\\n            if (temp.data === key) {\\n                if (temp.prev) temp.prev.next = temp.next;\\n                else this.head = temp.next;\\n                if (temp.next) temp.next.prev = temp.prev;\\n                return;\\n            }\\n            temp = temp.next;\\n        }\\n    }\\n}",
            java: "class Node {\\n    int data; Node prev, next;\\n    Node(int d){ data=d; }\\n}\\n\\nclass DoublyLinkedList {\\n    Node head;\\n\\n    void insert(int data){\\n        Node newNode = new Node(data);\\n        if(head==null){ head=newNode; return; }\\n        Node temp=head;\\n        while(temp.next!=null) temp=temp.next;\\n        temp.next=newNode; newNode.prev=temp;\\n    }\\n\\n    void delete(int key){\\n        Node temp=head;\\n        while(temp!=null){\\n            if(temp.data==key){\\n                if(temp.prev!=null) temp.prev.next=temp.next;\\n                else head=temp.next;\\n                if(temp.next!=null) temp.next.prev=temp.prev;\\n                return;\\n            }\\n            temp=temp.next;\\n        }\\n    }\\n}",
            c: "#include <stdlib.h>\\nstruct Node { int data; struct Node* prev; struct Node* next; };\\n\\nvoid insert(struct Node** head, int data){\\n    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));\\n    newNode->data=data; newNode->prev=NULL; newNode->next=NULL;\\n    if(*head==NULL){ *head=newNode; return; }\\n    struct Node* temp=*head;\\n    while(temp->next) temp=temp->next;\\n    temp->next=newNode; newNode->prev=temp;\\n}\\n\\nvoid delete(struct Node** head,int key){\\n    struct Node* temp=*head;\\n    while(temp){\\n        if(temp->data==key){\\n            if(temp->prev) temp->prev->next=temp->next;\\n            else *head=temp->next;\\n            if(temp->next) temp->next->prev=temp->prev;\\n            return;\\n        }\\n        temp=temp->next;\\n    }\\n}",
            cpp: "#include <iostream>\\nusing namespace std;\\nclass Node {\\npublic:\\n    int data; Node* prev; Node* next;\\n    Node(int d){ data=d; prev=next=NULL; }\\n};\\n\\nclass DoublyLinkedList {\\npublic:\\n    Node* head=NULL;\\n\\n    void insert(int data){\\n        Node* newNode=new Node(data);\\n        if(!head){ head=newNode; return; }\\n        Node* temp=head;\\n        while(temp->next) temp=temp->next;\\n        temp->next=newNode; newNode->prev=temp;\\n    }\\n\\n    void deleteNode(int key){\\n        Node* temp=head;\\n        while(temp){\\n            if(temp->data==key){\\n                if(temp->prev) temp->prev->next=temp->next;\\n                else head=temp->next;\\n                if(temp->next) temp->next->prev=temp->prev;\\n                return;\\n            }\\n            temp=temp->next;\\n        }\\n    }\\n};"
        }
    },

    {
        id: "stack",
        title: "Stack",
        category: "Linear",
        difficulty: "Beginner",
        timeComplexity: "O(1)",
        spaceComplexity: "O(n)",
        shortDescription: "LIFO data structure supporting push, pop, and peek operations.",
        description: "A Stack follows the Last-In-First-Out principle. The last element inserted is the first one removed.\n\nStacks are widely used in recursion, backtracking, expression evaluation, and undo/redo systems.",
        pseudocode: "push(x): add element\\npop(): remove top element\\npeek(): return top element",
        implementations: {
            python: "class Stack:\\n    def __init__(self):\\n        self.stack = []\\n\\n    def push(self, x):\\n        self.stack.append(x)\\n\\n    def pop(self):\\n        return self.stack.pop() if self.stack else None\\n\\n    def peek(self):\\n        return self.stack[-1] if self.stack else None",
            javascript: "class Stack {\\n    constructor() { this.stack = []; }\\n    push(x) { this.stack.push(x); }\\n    pop() { return this.stack.length ? this.stack.pop() : null; }\\n    peek() { return this.stack.length ? this.stack[this.stack.length - 1] : null; }\\n}",
            java: "class Stack {\\n    int[] arr; int top;\\n    Stack(int size){ arr=new int[size]; top=-1; }\\n    void push(int x){ arr[++top]=x; }\\n    int pop(){ return top>=0?arr[top--]:-1; }\\n    int peek(){ return top>=0?arr[top]:-1; }\\n}",
            c: "#include <stdio.h>\\n#define MAX 100\\nint stack[MAX], top=-1;\\nvoid push(int x){ stack[++top]=x; }\\nint pop(){ return top>=0?stack[top--]:-1; }\\nint peek(){ return top>=0?stack[top]:-1; }",
            cpp: "#include <vector>\\nusing namespace std;\\nclass Stack {\\n    vector<int> s;\\npublic:\\n    void push(int x){ s.push_back(x); }\\n    int pop(){ int v=s.back(); s.pop_back(); return v; }\\n    int peek(){ return s.back(); }\\n};"
        }
    },
    {
        id: "queue",
        title: "Queue",
        category: "Linear",
        difficulty: "Beginner",
        timeComplexity: "O(1)",
        spaceComplexity: "O(n)",
        shortDescription: "FIFO data structure where elements are added at rear and removed from front.",
        description: "A Queue follows the First-In-First-Out principle. The first element inserted is the first one removed.\n\nQueues are widely used in scheduling, buffering, and graph traversal (BFS). This implementation uses an array-based approach.",
        pseudocode: "enqueue(x): add element at rear\\ndequeue(): remove element from front\\npeek(): return front element",
        implementations: {
            python: "from collections import deque\\nclass Queue:\\n    def __init__(self):\\n        self.q = deque()\\n\\n    def enqueue(self, x):\\n        self.q.append(x)\\n\\n    def dequeue(self):\\n        return self.q.popleft() if self.q else None\\n\\n    def peek(self):\\n        return self.q[0] if self.q else None",
            javascript: "class Queue {\\n    constructor() { this.q = []; }\\n    enqueue(x) { this.q.push(x); }\\n    dequeue() { return this.q.length ? this.q.shift() : null; }\\n    peek() { return this.q.length ? this.q[0] : null; }\\n}",
            java: "class Queue {\\n    int[] arr; int front=0,rear=-1,size;\\n    Queue(int s){ size=s; arr=new int[s]; }\\n    void enqueue(int x){ if(rear<size-1) arr[++rear]=x; }\\n    int dequeue(){ return front<=rear?arr[front++]:-1; }\\n    int peek(){ return front<=rear?arr[front]:-1; }\\n}",
            c: "#include <stdio.h>\\n#define MAX 100\\nint q[MAX], front=0, rear=-1;\\nvoid enqueue(int x){ if(rear<MAX-1) q[++rear]=x; }\\nint dequeue(){ return front<=rear?q[front++]:-1; }\\nint peek(){ return front<=rear?q[front]:-1; }",
            cpp: "#include <queue>\\nusing namespace std;\\nclass Queue {\\n    queue<int> q;\\npublic:\\n    void enqueue(int x){ q.push(x); }\\n    int dequeue(){ int v=q.front(); q.pop(); return v; }\\n    int peek(){ return q.front(); }\\n};"
        }
    },

    {
        id: "deque",
        title: "Deque (Double-Ended Queue)",
        category: "Linear",
        difficulty: "Intermediate",
        timeComplexity: "O(1)",
        spaceComplexity: "O(n)",
        shortDescription: "Allows insertion and deletion from both front and rear.",
        description: "A Deque (Double-Ended Queue) allows elements to be inserted and removed from both ends. It combines properties of both stacks and queues.\n\nIt is commonly used in sliding window problems, caching, and scheduling algorithms.",
        pseudocode: "push_front(x)\\npush_back(x)\\npop_front()\\npop_back()\\npeek_front()\\npeek_back()",
        implementations: {
            python: "from collections import deque\\nclass Deque:\\n    def __init__(self):\\n        self.d = deque()\\n\\n    def push_front(self, x):\\n        self.d.appendleft(x)\\n\\n    def push_back(self, x):\\n        self.d.append(x)\\n\\n    def pop_front(self):\\n        return self.d.popleft() if self.d else None\\n\\n    def pop_back(self):\\n        return self.d.pop() if self.d else None\\n\\n    def peek_front(self):\\n        return self.d[0] if self.d else None\\n\\n    def peek_back(self):\\n        return self.d[-1] if self.d else None",
            javascript: "class Deque {\\n    constructor() { this.d = []; }\\n    push_front(x) { this.d.unshift(x); }\\n    push_back(x) { this.d.push(x); }\\n    pop_front() { return this.d.length ? this.d.shift() : null; }\\n    pop_back() { return this.d.length ? this.d.pop() : null; }\\n    peek_front() { return this.d.length ? this.d[0] : null; }\\n    peek_back() { return this.d.length ? this.d[this.d.length - 1] : null; }\\n}",
            java: "import java.util.*;\\nclass DequeDS {\\n    Deque<Integer> d = new ArrayDeque<>();\\n    void pushFront(int x){ d.addFirst(x); }\\n    void pushBack(int x){ d.addLast(x); }\\n    int popFront(){ return d.isEmpty()? -1 : d.removeFirst(); }\\n    int popBack(){ return d.isEmpty()? -1 : d.removeLast(); }\\n    int peekFront(){ return d.isEmpty()? -1 : d.peekFirst(); }\\n    int peekBack(){ return d.isEmpty()? -1 : d.peekLast(); }\\n}",
            c: "#include <stdio.h>\\n#define MAX 100\\nint d[MAX], front=-1, rear=0;\\nvoid push_front(int x){ if(front==-1){ front=rear=0; d[front]=x; } else d[--front]=x; }\\nvoid push_back(int x){ d[++rear]=x; }\\nint pop_front(){ return front<=rear?d[front++]:-1; }\\nint pop_back(){ return front<=rear?d[rear--]:-1; }",
            cpp: "#include <deque>\\nusing namespace std;\\nclass DequeDS {\\n    deque<int> d;\\npublic:\\n    void pushFront(int x){ d.push_front(x); }\\n    void pushBack(int x){ d.push_back(x); }\\n    int popFront(){ int v=d.front(); d.pop_front(); return v; }\\n    int popBack(){ int v=d.back(); d.pop_back(); return v; }\\n    int peekFront(){ return d.front(); }\\n    int peekBack(){ return d.back(); }\\n};"
        }
    },
    {
        id: "circular-queue",
        title: "Circular Queue",
        category: "Linear",
        difficulty: "Intermediate",
        timeComplexity: "O(1)",
        spaceComplexity: "O(n)",
        shortDescription: "Queue implementation that wraps around to reuse empty space.",
        description: "A Circular Queue is an optimized version of a linear queue where the last position is connected back to the first. This prevents wasted space when elements are dequeued.\n\nIt uses modulo arithmetic to wrap indices, making it memory efficient for fixed-size buffers such as CPU scheduling and streaming systems.",
        pseudocode: "enqueue(x):\\n    if full -> reject\\n    rear = (rear + 1) % size\\n    arr[rear] = x\\n\\ndequeue():\\n    if empty -> reject\\n    value = arr[front]\\n    front = (front + 1) % size\\n    return value",
        implementations: {
            python: "class CircularQueue:\\n    def __init__(self, size):\\n        self.size = size\\n        self.q = [None] * size\\n        self.front = -1\\n        self.rear = -1\\n\\n    def enqueue(self, x):\\n        if (self.rear + 1) % self.size == self.front:\\n            return None\\n        if self.front == -1:\\n            self.front = 0\\n        self.rear = (self.rear + 1) % self.size\\n        self.q[self.rear] = x\\n\\n    def dequeue(self):\\n        if self.front == -1:\\n            return None\\n        val = self.q[self.front]\\n        if self.front == self.rear:\\n            self.front = self.rear = -1\\n        else:\\n            self.front = (self.front + 1) % self.size\\n        return val",
            javascript: "class CircularQueue {\\n    constructor(size) {\\n        this.size = size;\\n        this.q = new Array(size);\\n        this.front = -1;\\n        this.rear = -1;\\n    }\\n\\n    enqueue(x) {\\n        if ((this.rear + 1) % this.size === this.front) return null;\\n        if (this.front === -1) this.front = 0;\\n        this.rear = (this.rear + 1) % this.size;\\n        this.q[this.rear] = x;\\n    }\\n\\n    dequeue() {\\n        if (this.front === -1) return null;\\n        let val = this.q[this.front];\\n        if (this.front === this.rear) {\\n            this.front = this.rear = -1;\\n        } else {\\n            this.front = (this.front + 1) % this.size;\\n        }\\n        return val;\\n    }\\n}",
            java: "class CircularQueue {\\n    int[] arr; int front=-1,rear=-1,size;\\n    CircularQueue(int s){ size=s; arr=new int[s]; }\\n    void enqueue(int x){\\n        if((rear+1)%size==front) return;\\n        if(front==-1) front=0;\\n        rear=(rear+1)%size;\\n        arr[rear]=x;\\n    }\\n    int dequeue(){\\n        if(front==-1) return -1;\\n        int val=arr[front];\\n        if(front==rear) front=rear=-1;\\n        else front=(front+1)%size;\\n        return val;\\n    }\\n}",
            c: "#include <stdio.h>\\n#define MAX 100\\nint q[MAX], front=-1, rear=-1;\\nvoid enqueue(int x){\\n    if((rear+1)%MAX==front) return;\\n    if(front==-1) front=0;\\n    rear=(rear+1)%MAX;\\n    q[rear]=x;\\n}\\nint dequeue(){\\n    if(front==-1) return -1;\\n    int val=q[front];\\n    if(front==rear) front=rear=-1;\\n    else front=(front+1)%MAX;\\n    return val;\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nclass CircularQueue {\\n    vector<int> q; int front,rear,size;\\npublic:\\n    CircularQueue(int s):q(s),front(-1),rear(-1),size(s){}\\n    void enqueue(int x){\\n        if((rear+1)%size==front) return;\\n        if(front==-1) front=0;\\n        rear=(rear+1)%size;\\n        q[rear]=x;\\n    }\\n    int dequeue(){\\n        if(front==-1) return -1;\\n        int val=q[front];\\n        if(front==rear) front=rear=-1;\\n        else front=(front+1)%size;\\n        return val;\\n    }\\n};"
        }
    },

    {
        id: "priority-queue",
        title: "Priority Queue (Heap-based)",
        category: "Linear",
        difficulty: "Intermediate",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(n)",
        shortDescription: "Queue where elements are served based on priority instead of order.",
        description: "A Priority Queue serves elements based on priority rather than insertion order. Typically implemented using a binary heap.\n\nIt is widely used in scheduling, Dijkstra’s algorithm, and greedy problems. Insert and delete operations maintain heap structure to ensure efficient access to the highest (or lowest) priority element.",
        pseudocode: "insert(x):\\n    add element to heap\\n    heapify up\\n\\nextract():\\n    remove root\\n    replace with last\\n    heapify down",
        implementations: {
            python: "import heapq\\nclass PriorityQueue:\\n    def __init__(self):\\n        self.heap = []\\n\\n    def push(self, x):\\n        heapq.heappush(self.heap, x)\\n\\n    def pop(self):\\n        return heapq.heappop(self.heap) if self.heap else None\\n\\n    def peek(self):\\n        return self.heap[0] if self.heap else None",
            javascript: "class PriorityQueue {\\n    constructor(){ this.heap=[]; }\\n    push(x){ this.heap.push(x); this.heap.sort((a,b)=>a-b); }\\n    pop(){ return this.heap.shift()||null; }\\n    peek(){ return this.heap[0]||null; }\\n}",
            java: "import java.util.*;\\nclass PriorityQueueDS {\\n    PriorityQueue<Integer> pq = new PriorityQueue<>();\\n    void push(int x){ pq.add(x); }\\n    int pop(){ return pq.isEmpty()? -1 : pq.poll(); }\\n    int peek(){ return pq.isEmpty()? -1 : pq.peek(); }\\n}",
            c: "#include <stdio.h>\\n#define MAX 100\\nint heap[MAX], size=0;\\nvoid swap(int*a,int*b){int t=*a;*a=*b;*b=t;}\\nvoid push(int x){\\n    int i=size++; heap[i]=x;\\n    while(i>0 && heap[(i-1)/2]>heap[i]){\\n        swap(&heap[i],&heap[(i-1)/2]);\\n        i=(i-1)/2;\\n    }\\n}\\nint pop(){\\n    if(size==0) return -1;\\n    int root=heap[0];\\n    heap[0]=heap[--size];\\n    int i=0;\\n    while(2*i+1<size){\\n        int j=2*i+1;\\n        if(j+1<size && heap[j+1]<heap[j]) j++;\\n        if(heap[i]<=heap[j]) break;\\n        swap(&heap[i],&heap[j]);\\n        i=j;\\n    }\\n    return root;\\n}",
            cpp: "#include <queue>\\nusing namespace std;\\nclass PriorityQueueDS {\\n    priority_queue<int, vector<int>, greater<int>> pq;\\npublic:\\n    void push(int x){ pq.push(x); }\\n    int pop(){ int v=pq.top(); pq.pop(); return v; }\\n    int peek(){ return pq.top(); }\\n};"
        }
    },
    {
        id: "binary-tree",
        title: "Binary Tree",
        category: "Trees",
        difficulty: "Beginner",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        shortDescription: "A hierarchical structure where each node has at most two children.",
        description: "A Binary Tree is a tree data structure where each node has at most two children: left and right.\n\nIt forms the basis for many advanced structures like BSTs, heaps, and segment trees. Common operations include traversal (inorder, preorder, postorder), insertion, and search.",
        pseudocode: "Node:\\n    data\\n    left\\n    right\\n\\ninorder(node):\\n    if node != null:\\n        inorder(node.left)\\n        visit(node)\\n        inorder(node.right)",
        implementations: {
            python: "class Node:\\n    def __init__(self, data):\\n        self.data = data\\n        self.left = None\\n        self.right = None\\n\\ndef inorder(root):\\n    if root:\\n        inorder(root.left)\\n        print(root.data, end=' ')\\n        inorder(root.right)",
            javascript: "class Node {\\n    constructor(data) {\\n        this.data = data;\\n        this.left = null;\\n        this.right = null;\\n    }\\n}\\n\\nfunction inorder(root) {\\n    if (root) {\\n        inorder(root.left);\\n        console.log(root.data);\\n        inorder(root.right);\\n    }\\n}",
            java: "class Node {\\n    int data; Node left, right;\\n    Node(int d){ data=d; }\\n}\\n\\nvoid inorder(Node root){\\n    if(root!=null){\\n        inorder(root.left);\\n        System.out.print(root.data + \" \");\\n        inorder(root.right);\\n    }\\n}",
            c: "#include <stdio.h>\\n#include <stdlib.h>\\nstruct Node { int data; struct Node* left; struct Node* right; };\\n\\nvoid inorder(struct Node* root){\\n    if(root){\\n        inorder(root->left);\\n        printf(\"%d \", root->data);\\n        inorder(root->right);\\n    }\\n}",
            cpp: "#include <iostream>\\nusing namespace std;\\nclass Node {\\npublic:\\n    int data; Node* left; Node* right;\\n    Node(int d){ data=d; left=right=NULL; }\\n};\\n\\nvoid inorder(Node* root){\\n    if(root){\\n        inorder(root->left);\\n        cout << root->data << \" \";\\n        inorder(root->right);\\n    }\\n}"
        }
    },

    {
        id: "binary-search-tree",
        title: "Binary Search Tree (BST)",
        category: "Trees",
        difficulty: "Intermediate",
        timeComplexity: "O(log n) (avg), O(n) (worst)",
        spaceComplexity: "O(n)",
        shortDescription: "Binary tree where left < root < right for efficient searching.",
        description: "A Binary Search Tree (BST) is a binary tree with the property that all values in the left subtree are smaller than the root, and all values in the right subtree are greater.\n\nThis property allows efficient searching, insertion, and deletion. However, if the tree becomes unbalanced, performance degrades to O(n).",
        pseudocode: "insert(root, key):\\n    if root is null: return new node\\n    if key < root.data:\\n        root.left = insert(root.left, key)\\n    else:\\n        root.right = insert(root.right, key)\\n    return root",
        implementations: {
            python: "class Node:\\n    def __init__(self, data):\\n        self.data = data\\n        self.left = None\\n        self.right = None\\n\\ndef insert(root, key):\\n    if root is None:\\n        return Node(key)\\n    if key < root.data:\\n        root.left = insert(root.left, key)\\n    else:\\n        root.right = insert(root.right, key)\\n    return root\\n\\ndef search(root, key):\\n    if root is None or root.data == key:\\n        return root\\n    if key < root.data:\\n        return search(root.left, key)\\n    return search(root.right, key)",
            javascript: "class Node {\\n    constructor(data){\\n        this.data=data;\\n        this.left=null;\\n        this.right=null;\\n    }\\n}\\n\\nfunction insert(root, key){\\n    if(!root) return new Node(key);\\n    if(key < root.data) root.left = insert(root.left, key);\\n    else root.right = insert(root.right, key);\\n    return root;\\n}\\n\\nfunction search(root, key){\\n    if(!root || root.data===key) return root;\\n    return key < root.data ? search(root.left,key) : search(root.right,key);\\n}",
            java: "class Node {\\n    int data; Node left,right;\\n    Node(int d){ data=d; }\\n}\\n\\nNode insert(Node root,int key){\\n    if(root==null) return new Node(key);\\n    if(key<root.data) root.left=insert(root.left,key);\\n    else root.right=insert(root.right,key);\\n    return root;\\n}\\n\\nNode search(Node root,int key){\\n    if(root==null||root.data==key) return root;\\n    return key<root.data?search(root.left,key):search(root.right,key);\\n}",
            c: "#include <stdio.h>\\n#include <stdlib.h>\\nstruct Node{int data; struct Node* left; struct Node* right;};\\n\\nstruct Node* newNode(int data){\\n    struct Node* node=(struct Node*)malloc(sizeof(struct Node));\\n    node->data=data; node->left=node->right=NULL;\\n    return node;\\n}\\n\\nstruct Node* insert(struct Node* root,int key){\\n    if(root==NULL) return newNode(key);\\n    if(key<root->data) root->left=insert(root->left,key);\\n    else root->right=insert(root->right,key);\\n    return root;\\n}",
            cpp: "#include <iostream>\\nusing namespace std;\\nclass Node{\\npublic:\\n    int data; Node* left; Node* right;\\n    Node(int d){data=d;left=right=NULL;}\\n};\\n\\nNode* insert(Node* root,int key){\\n    if(!root) return new Node(key);\\n    if(key<root->data) root->left=insert(root->left,key);\\n    else root->right=insert(root->right,key);\\n    return root;\\n}\\n\\nNode* search(Node* root,int key){\\n    if(!root||root->data==key) return root;\\n    return key<root->data?search(root->left,key):search(root->right,key);\\n}"
        }
    },
    {
        id: "tree-traversals",
        title: "Tree Traversals (DFS)",
        category: "Trees",
        difficulty: "Intermediate",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        shortDescription: "Inorder, Preorder, and Postorder traversals of a binary tree.",
        description: "Tree traversal refers to visiting all nodes in a tree in a specific order. The three primary Depth-First Search traversals are:\n\nInorder: Left → Root → Right\nPreorder: Root → Left → Right\nPostorder: Left → Right → Root\n\nThese traversals are fundamental for tree-based algorithms such as expression parsing, serialization, and tree reconstruction.",
        pseudocode: "inorder(node):\\n    if node:\\n        inorder(node.left)\\n        visit(node)\\n        inorder(node.right)\\n\\npreorder(node):\\n    if node:\\n        visit(node)\\n        preorder(node.left)\\n        preorder(node.right)\\n\\npostorder(node):\\n    if node:\\n        postorder(node.left)\\n        postorder(node.right)\\n        visit(node)",
        implementations: {
            python: "def inorder(root):\\n    if root:\\n        inorder(root.left)\\n        print(root.data, end=' ')\\n        inorder(root.right)\\n\\ndef preorder(root):\\n    if root:\\n        print(root.data, end=' ')\\n        preorder(root.left)\\n        preorder(root.right)\\n\\ndef postorder(root):\\n    if root:\\n        postorder(root.left)\\n        postorder(root.right)\\n        print(root.data, end=' ')",
            javascript: "function inorder(root){\\n    if(root){\\n        inorder(root.left);\\n        console.log(root.data);\\n        inorder(root.right);\\n    }\\n}\\nfunction preorder(root){\\n    if(root){\\n        console.log(root.data);\\n        preorder(root.left);\\n        preorder(root.right);\\n    }\\n}\\nfunction postorder(root){\\n    if(root){\\n        postorder(root.left);\\n        postorder(root.right);\\n        console.log(root.data);\\n    }\\n}",
            java: "void inorder(Node root){\\n    if(root!=null){\\n        inorder(root.left);\\n        System.out.print(root.data+\" \");\\n        inorder(root.right);\\n    }\\n}\\nvoid preorder(Node root){\\n    if(root!=null){\\n        System.out.print(root.data+\" \");\\n        preorder(root.left);\\n        preorder(root.right);\\n    }\\n}\\nvoid postorder(Node root){\\n    if(root!=null){\\n        postorder(root.left);\\n        postorder(root.right);\\n        System.out.print(root.data+\" \");\\n    }\\n}",
            c: "#include <stdio.h>\\nvoid inorder(struct Node* root){\\n    if(root){\\n        inorder(root->left);\\n        printf(\"%d \",root->data);\\n        inorder(root->right);\\n    }\\n}\\nvoid preorder(struct Node* root){\\n    if(root){\\n        printf(\"%d \",root->data);\\n        preorder(root->left);\\n        preorder(root->right);\\n    }\\n}\\nvoid postorder(struct Node* root){\\n    if(root){\\n        postorder(root->left);\\n        postorder(root->right);\\n        printf(\"%d \",root->data);\\n    }\\n}",
            cpp: "#include <iostream>\\nusing namespace std;\\nvoid inorder(Node* root){\\n    if(root){\\n        inorder(root->left);\\n        cout<<root->data<<\" \";\\n        inorder(root->right);\\n    }\\n}\\nvoid preorder(Node* root){\\n    if(root){\\n        cout<<root->data<<\" \";\\n        preorder(root->left);\\n        preorder(root->right);\\n    }\\n}\\nvoid postorder(Node* root){\\n    if(root){\\n        postorder(root->left);\\n        postorder(root->right);\\n        cout<<root->data<<\" \";\\n    }\\n}"
        }
    },

    {
        id: "avl-tree",
        title: "AVL Tree",
        category: "Trees",
        difficulty: "Advanced",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(n)",
        shortDescription: "Self-balancing BST that maintains height balance using rotations.",
        description: "An AVL Tree is a self-balancing Binary Search Tree where the height difference (balance factor) between left and right subtrees is at most 1.\n\nAfter every insertion or deletion, rotations (left, right, left-right, right-left) are performed to maintain balance. This guarantees O(log n) operations for search, insert, and delete.",
        pseudocode: "insert(node, key):\\n    perform BST insert\\n    update height\\n    balance = height(left) - height(right)\\n    if balance > 1 or < -1:\\n        perform rotations\\n    return node",
        implementations: {
            python: "class Node:\\n    def __init__(self, key):\\n        self.key = key\\n        self.left = None\\n        self.right = None\\n        self.height = 1\\n\\ndef height(n): return n.height if n else 0\\ndef balance(n): return height(n.left) - height(n.right) if n else 0\\n\\ndef right_rotate(y):\\n    x = y.left\\n    T2 = x.right\\n    x.right = y\\n    y.left = T2\\n    y.height = max(height(y.left), height(y.right)) + 1\\n    x.height = max(height(x.left), height(x.right)) + 1\\n    return x\\n\\ndef left_rotate(x):\\n    y = x.right\\n    T2 = y.left\\n    y.left = x\\n    x.right = T2\\n    x.height = max(height(x.left), height(x.right)) + 1\\n    y.height = max(height(y.left), height(y.right)) + 1\\n    return y\\n\\ndef insert(node, key):\\n    if not node: return Node(key)\\n    if key < node.key: node.left = insert(node.left, key)\\n    else: node.right = insert(node.right, key)\\n    node.height = 1 + max(height(node.left), height(node.right))\\n    b = balance(node)\\n    if b > 1 and key < node.left.key: return right_rotate(node)\\n    if b < -1 and key > node.right.key: return left_rotate(node)\\n    if b > 1 and key > node.left.key:\\n        node.left = left_rotate(node.left)\\n        return right_rotate(node)\\n    if b < -1 and key < node.right.key:\\n        node.right = right_rotate(node.right)\\n        return left_rotate(node)\\n    return node",
            javascript: "class Node{constructor(k){this.key=k;this.left=this.right=null;this.height=1;}}\\nfunction height(n){return n?n.height:0;}\\nfunction balance(n){return n?height(n.left)-height(n.right):0;}\\nfunction rightRotate(y){let x=y.left,T2=x.right;x.right=y;y.left=T2;y.height=Math.max(height(y.left),height(y.right))+1;x.height=Math.max(height(x.left),height(x.right))+1;return x;}\\nfunction leftRotate(x){let y=x.right,T2=y.left;y.left=x;x.right=T2;x.height=Math.max(height(x.left),height(x.right))+1;y.height=Math.max(height(y.left),height(y.right))+1;return y;}\\nfunction insert(node,key){if(!node)return new Node(key);if(key<node.key)node.left=insert(node.left,key);else node.right=insert(node.right,key);node.height=1+Math.max(height(node.left),height(node.right));let b=balance(node);if(b>1&&key<node.left.key)return rightRotate(node);if(b<-1&&key>node.right.key)return leftRotate(node);if(b>1&&key>node.left.key){node.left=leftRotate(node.left);return rightRotate(node);}if(b<-1&&key<node.right.key){node.right=rightRotate(node.right);return leftRotate(node);}return node;}",
            java: "class Node{int key,height;Node left,right;Node(int k){key=k;height=1;}}\\nint height(Node n){return n==null?0:n.height;}\\nNode rightRotate(Node y){Node x=y.left;Node T2=x.right;x.right=y;y.left=T2;y.height=Math.max(height(y.left),height(y.right))+1;x.height=Math.max(height(x.left),height(x.right))+1;return x;}\\nNode leftRotate(Node x){Node y=x.right;Node T2=y.left;y.left=x;x.right=T2;x.height=Math.max(height(x.left),height(x.right))+1;y.height=Math.max(height(y.left),height(y.right))+1;return y;}\\nNode insert(Node node,int key){if(node==null)return new Node(key);if(key<node.key)node.left=insert(node.left,key);else node.right=insert(node.right,key);node.height=1+Math.max(height(node.left),height(node.right));int b=height(node.left)-height(node.right);if(b>1&&key<node.left.key)return rightRotate(node);if(b<-1&&key>node.right.key)return leftRotate(node);if(b>1&&key>node.left.key){node.left=leftRotate(node.left);return rightRotate(node);}if(b<-1&&key<node.right.key){node.right=rightRotate(node.right);return leftRotate(node);}return node;}",
            c: "#include <stdio.h>\\n#include <stdlib.h>\\nstruct Node{int key,height;struct Node* left,*right;};\\nint height(struct Node* n){return n?n->height:0;}\\nstruct Node* newNode(int key){struct Node* n=malloc(sizeof(struct Node));n->key=key;n->left=n->right=NULL;n->height=1;return n;}\\nstruct Node* rightRotate(struct Node* y){struct Node* x=y->left;struct Node* T2=x->right;x->right=y;y->left=T2;y->height=1+ (height(y->left)>height(y->right)?height(y->left):height(y->right));x->height=1+ (height(x->left)>height(x->right)?height(x->left):height(x->right));return x;}\\nstruct Node* leftRotate(struct Node* x){struct Node* y=x->right;struct Node* T2=y->left;y->left=x;x->right=T2;x->height=1+ (height(x->left)>height(x->right)?height(x->left):height(x->right));y->height=1+ (height(y->left)>height(y->right)?height(y->left):height(y->right));return y;}\\nstruct Node* insert(struct Node* node,int key){if(!node)return newNode(key);if(key<node->key)node->left=insert(node->left,key);else node->right=insert(node->right,key);node->height=1+ (height(node->left)>height(node->right)?height(node->left):height(node->right));int b=height(node->left)-height(node->right);if(b>1&&key<node->left->key)return rightRotate(node);if(b<-1&&key>node->right->key)return leftRotate(node);if(b>1&&key>node->left->key){node->left=leftRotate(node->left);return rightRotate(node);}if(b<-1&&key<node->right->key){node->right=rightRotate(node->right);return leftRotate(node);}return node;}",
            cpp: "#include <algorithm>\\nusing namespace std;\\nclass Node{public:int key,height;Node* left;Node* right;Node(int k){key=k;height=1;left=right=NULL;}};\\nint height(Node* n){return n?n->height:0;}\\nNode* rightRotate(Node* y){Node* x=y->left;Node* T2=x->right;x->right=y;y->left=T2;y->height=max(height(y->left),height(y->right))+1;x->height=max(height(x->left),height(x->right))+1;return x;}\\nNode* leftRotate(Node* x){Node* y=x->right;Node* T2=y->left;y->left=x;x->right=T2;x->height=max(height(x->left),height(x->right))+1;y->height=max(height(y->left),height(y->right))+1;return y;}\\nNode* insert(Node* node,int key){if(!node)return new Node(key);if(key<node->key)node->left=insert(node->left,key);else node->right=insert(node->right,key);node->height=1+max(height(node->left),height(node->right));int b=height(node->left)-height(node->right);if(b>1&&key<node->left->key)return rightRotate(node);if(b<-1&&key>node->right->key)return leftRotate(node);if(b>1&&key>node->left->key){node->left=leftRotate(node->left);return rightRotate(node);}if(b<-1&&key<node->right->key){node->right=rightRotate(node->right);return leftRotate(node);}return node;}"
        }
    },
    {
        id: "binary-heap",
        title: "Binary Heap (Min Heap)",
        category: "Trees",
        difficulty: "Intermediate",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(n)",
        shortDescription: "Complete binary tree used for efficient priority operations.",
        description: "A Binary Heap is a complete binary tree that satisfies the heap property. In a Min Heap, the parent node is always smaller than its children.\n\nIt is commonly used to implement priority queues and algorithms like Dijkstra’s and Heap Sort. Insertions and deletions maintain heap order using heapify operations.",
        pseudocode: "insert(x):\\n    add to end\\n    heapify up\\n\\nextractMin():\\n    remove root\\n    replace with last\\n    heapify down",
        implementations: {
            python: "class MinHeap:\\n    def __init__(self):\\n        self.heap = []\\n\\n    def insert(self, x):\\n        self.heap.append(x)\\n        i = len(self.heap) - 1\\n        while i > 0:\\n            parent = (i - 1) // 2\\n            if self.heap[parent] > self.heap[i]:\\n                self.heap[parent], self.heap[i] = self.heap[i], self.heap[parent]\\n                i = parent\\n            else:\\n                break\\n\\n    def extract_min(self):\\n        if not self.heap: return None\\n        root = self.heap[0]\\n        last = self.heap.pop()\\n        if self.heap:\\n            self.heap[0] = last\\n            self.heapify(0)\\n        return root\\n\\n    def heapify(self, i):\\n        smallest = i\\n        l = 2*i + 1\\n        r = 2*i + 2\\n        if l < len(self.heap) and self.heap[l] < self.heap[smallest]:\\n            smallest = l\\n        if r < len(self.heap) and self.heap[r] < self.heap[smallest]:\\n            smallest = r\\n        if smallest != i:\\n            self.heap[i], self.heap[smallest] = self.heap[smallest], self.heap[i]\\n            self.heapify(smallest)",
            javascript: "class MinHeap {\\n    constructor(){ this.heap=[]; }\\n    insert(x){\\n        this.heap.push(x);\\n        let i=this.heap.length-1;\\n        while(i>0){\\n            let p=Math.floor((i-1)/2);\\n            if(this.heap[p]>this.heap[i]){\\n                [this.heap[p],this.heap[i]]=[this.heap[i],this.heap[p]];\\n                i=p;\\n            } else break;\\n        }\\n    }\\n    extractMin(){\\n        if(!this.heap.length) return null;\\n        let root=this.heap[0];\\n        let last=this.heap.pop();\\n        if(this.heap.length){\\n            this.heap[0]=last;\\n            this.heapify(0);\\n        }\\n        return root;\\n    }\\n    heapify(i){\\n        let smallest=i;\\n        let l=2*i+1, r=2*i+2;\\n        if(l<this.heap.length && this.heap[l]<this.heap[smallest]) smallest=l;\\n        if(r<this.heap.length && this.heap[r]<this.heap[smallest]) smallest=r;\\n        if(smallest!==i){\\n            [this.heap[i],this.heap[smallest]]=[this.heap[smallest],this.heap[i]];\\n            this.heapify(smallest);\\n        }\\n    }\\n}",
            java: "class MinHeap {\\n    int[] heap; int size;\\n    MinHeap(int cap){ heap=new int[cap]; size=0; }\\n    void insert(int x){\\n        int i=size++; heap[i]=x;\\n        while(i>0 && heap[(i-1)/2]>heap[i]){\\n            int t=heap[i]; heap[i]=heap[(i-1)/2]; heap[(i-1)/2]=t;\\n            i=(i-1)/2;\\n        }\\n    }\\n    int extractMin(){\\n        if(size==0) return -1;\\n        int root=heap[0]; heap[0]=heap[--size]; heapify(0);\\n        return root;\\n    }\\n    void heapify(int i){\\n        int smallest=i,l=2*i+1,r=2*i+2;\\n        if(l<size && heap[l]<heap[smallest]) smallest=l;\\n        if(r<size && heap[r]<heap[smallest]) smallest=r;\\n        if(smallest!=i){\\n            int t=heap[i]; heap[i]=heap[smallest]; heap[smallest]=t;\\n            heapify(smallest);\\n        }\\n    }\\n}",
            c: "#include <stdio.h>\\n#define MAX 100\\nint heap[MAX], size=0;\\nvoid insert(int x){\\n    int i=size++; heap[i]=x;\\n    while(i>0 && heap[(i-1)/2]>heap[i]){\\n        int t=heap[i]; heap[i]=heap[(i-1)/2]; heap[(i-1)/2]=t;\\n        i=(i-1)/2;\\n    }\\n}\\nvoid heapify(int i){\\n    int smallest=i,l=2*i+1,r=2*i+2;\\n    if(l<size && heap[l]<heap[smallest]) smallest=l;\\n    if(r<size && heap[r]<heap[smallest]) smallest=r;\\n    if(smallest!=i){\\n        int t=heap[i]; heap[i]=heap[smallest]; heap[smallest]=t;\\n        heapify(smallest);\\n    }\\n}\\nint extractMin(){\\n    if(size==0) return -1;\\n    int root=heap[0]; heap[0]=heap[--size]; heapify(0);\\n    return root;\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nclass MinHeap{\\n    vector<int> h;\\npublic:\\n    void insert(int x){\\n        h.push_back(x);\\n        int i=h.size()-1;\\n        while(i>0 && h[(i-1)/2]>h[i]){\\n            swap(h[i],h[(i-1)/2]);\\n            i=(i-1)/2;\\n        }\\n    }\\n    int extractMin(){\\n        int root=h[0]; h[0]=h.back(); h.pop_back(); heapify(0); return root;\\n    }\\n    void heapify(int i){\\n        int smallest=i,l=2*i+1,r=2*i+2;\\n        if(l<h.size() && h[l]<h[smallest]) smallest=l;\\n        if(r<h.size() && h[r]<h[smallest]) smallest=r;\\n        if(smallest!=i){ swap(h[i],h[smallest]); heapify(smallest); }\\n    }\\n};"
        }
    },

    {
        id: "trie",
        title: "Trie (Prefix Tree)",
        category: "Trees",
        difficulty: "Advanced",
        timeComplexity: "O(L)",
        spaceComplexity: "O(N * L)",
        shortDescription: "Tree structure used for efficient string storage and prefix search.",
        description: "A Trie is a tree-like data structure used to store strings efficiently. Each node represents a character, and paths from root to leaf form words.\n\nIt is widely used in autocomplete systems, spell checkers, and prefix-based searches. Operations like insert, search, and prefix matching run in O(L), where L is the word length.",
        pseudocode: "insert(word):\\n    for each char:\\n        if not exists -> create node\\n    mark end\\n\\nsearch(word):\\n    traverse characters\\n    return true if end marked",
        implementations: {
            python: "class TrieNode:\\n    def __init__(self):\\n        self.children = {}\\n        self.end = False\\n\\nclass Trie:\\n    def __init__(self):\\n        self.root = TrieNode()\\n\\n    def insert(self, word):\\n        node = self.root\\n        for ch in word:\\n            if ch not in node.children:\\n                node.children[ch] = TrieNode()\\n            node = node.children[ch]\\n        node.end = True\\n\\n    def search(self, word):\\n        node = self.root\\n        for ch in word:\\n            if ch not in node.children:\\n                return False\\n            node = node.children[ch]\\n        return node.end",
            javascript: "class TrieNode {\\n    constructor(){ this.children={}; this.end=false; }\\n}\\nclass Trie {\\n    constructor(){ this.root=new TrieNode(); }\\n    insert(word){\\n        let node=this.root;\\n        for(let ch of word){\\n            if(!node.children[ch]) node.children[ch]=new TrieNode();\\n            node=node.children[ch];\\n        }\\n        node.end=true;\\n    }\\n    search(word){\\n        let node=this.root;\\n        for(let ch of word){\\n            if(!node.children[ch]) return false;\\n            node=node.children[ch];\\n        }\\n        return node.end;\\n    }\\n}",
            java: "class TrieNode{\\n    TrieNode[] children=new TrieNode[26];\\n    boolean end=false;\\n}\\nclass Trie{\\n    TrieNode root=new TrieNode();\\n    void insert(String word){\\n        TrieNode node=root;\\n        for(char c:word.toCharArray()){\\n            int i=c-'a';\\n            if(node.children[i]==null) node.children[i]=new TrieNode();\\n            node=node.children[i];\\n        }\\n        node.end=true;\\n    }\\n    boolean search(String word){\\n        TrieNode node=root;\\n        for(char c:word.toCharArray()){\\n            int i=c-'a';\\n            if(node.children[i]==null) return false;\\n            node=node.children[i];\\n        }\\n        return node.end;\\n    }\\n}",
            c: "#include <stdbool.h>\\n#include <stdlib.h>\\nstruct Trie{ struct Trie* children[26]; bool end; };\\nstruct Trie* newNode(){ struct Trie* node=malloc(sizeof(struct Trie)); for(int i=0;i<26;i++) node->children[i]=NULL; node->end=false; return node;}\\nvoid insert(struct Trie* root,char* word){\\n    while(*word){ int i=*word-'a'; if(!root->children[i]) root->children[i]=newNode(); root=root->children[i]; word++; }\\n    root->end=true;\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nclass TrieNode{\\npublic:\\n    TrieNode* children[26]; bool end;\\n    TrieNode(){ for(int i=0;i<26;i++) children[i]=NULL; end=false;}\\n};\\nclass Trie{\\n    TrieNode* root;\\npublic:\\n    Trie(){ root=new TrieNode(); }\\n    void insert(string word){\\n        TrieNode* node=root;\\n        for(char c:word){\\n            int i=c-'a';\\n            if(!node->children[i]) node->children[i]=new TrieNode();\\n            node=node->children[i];\\n        }\\n        node->end=true;\\n    }\\n    bool search(string word){\\n        TrieNode* node=root;\\n        for(char c:word){\\n            int i=c-'a';\\n            if(!node->children[i]) return false;\\n            node=node->children[i];\\n        }\\n        return node->end;\\n    }\\n};"
        }
    },
    {
        id: "breadth-first-search",
        title: "Breadth-First Search (BFS)",
        category: "Graphs",
        difficulty: "Beginner",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        shortDescription: "Traverses graph level by level using a queue.",
        description: "Breadth-First Search (BFS) explores a graph layer by layer starting from a source node. It visits all neighbors first before moving to the next level.\n\nIt is widely used for shortest path in unweighted graphs, level-order traversal in trees, and connectivity checks.",
        pseudocode: "create queue\\nmark source as visited\\nenqueue source\\nwhile queue not empty:\\n    node = dequeue\\n    visit node\\n    for each neighbor:\\n        if not visited:\\n            mark visited\\n            enqueue",
        implementations: {
            python: "from collections import deque\\ndef bfs(graph, start):\\n    visited = set()\\n    queue = deque([start])\\n    visited.add(start)\\n    while queue:\\n        node = queue.popleft()\\n        print(node, end=' ')\\n        for neighbor in graph[node]:\\n            if neighbor not in visited:\\n                visited.add(neighbor)\\n                queue.append(neighbor)",
            javascript: "function bfs(graph, start){\\n    let visited = new Set();\\n    let queue = [start];\\n    visited.add(start);\\n    while(queue.length){\\n        let node = queue.shift();\\n        console.log(node);\\n        for(let neighbor of graph[node]){\\n            if(!visited.has(neighbor)){\\n                visited.add(neighbor);\\n                queue.push(neighbor);\\n            }\\n        }\\n    }\\n}",
            java: "import java.util.*;\\nvoid bfs(Map<Integer,List<Integer>> graph,int start){\\n    Set<Integer> visited=new HashSet<>();\\n    Queue<Integer> q=new LinkedList<>();\\n    q.add(start); visited.add(start);\\n    while(!q.isEmpty()){\\n        int node=q.poll();\\n        System.out.print(node+\" \");\\n        for(int nei:graph.get(node)){\\n            if(!visited.contains(nei)){\\n                visited.add(nei); q.add(nei);\\n            }\\n        }\\n    }\\n}",
            c: "#include <stdio.h>\\n#include <stdbool.h>\\n#define MAX 100\\nint queue[MAX], front=0, rear=0;\\nvoid bfs(int graph[MAX][MAX], int n, int start){\\n    bool visited[MAX]={0};\\n    queue[rear++]=start; visited[start]=1;\\n    while(front<rear){\\n        int node=queue[front++];\\n        printf(\"%d \",node);\\n        for(int i=0;i<n;i++){\\n            if(graph[node][i] && !visited[i]){\\n                visited[i]=1; queue[rear++]=i;\\n            }\\n        }\\n    }\\n}",
            cpp: "#include <vector>\\n#include <queue>\\nusing namespace std;\\nvoid bfs(vector<vector<int>>& graph,int start){\\n    vector<bool> vis(graph.size(),false);\\n    queue<int> q; q.push(start); vis[start]=true;\\n    while(!q.empty()){\\n        int node=q.front(); q.pop();\\n        for(int nei:graph[node]){\\n            if(!vis[nei]){ vis[nei]=true; q.push(nei); }\\n        }\\n    }\\n}"
        }
    },

    {
        id: "depth-first-search",
        title: "Depth-First Search (DFS)",
        category: "Graphs",
        difficulty: "Beginner",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        shortDescription: "Traverses graph deeply before backtracking.",
        description: "Depth-First Search (DFS) explores as far as possible along a branch before backtracking.\n\nIt is used for cycle detection, topological sorting, and connected components. DFS can be implemented recursively or using a stack.",
        pseudocode: "dfs(node):\\n    mark visited\\n    visit node\\n    for each neighbor:\\n        if not visited:\\n            dfs(neighbor)",
        implementations: {
            python: "def dfs(graph, node, visited=None):\\n    if visited is None:\\n        visited = set()\\n    visited.add(node)\\n    print(node, end=' ')\\n    for neighbor in graph[node]:\\n        if neighbor not in visited:\\n            dfs(graph, neighbor, visited)",
            javascript: "function dfs(graph, node, visited=new Set()){\\n    visited.add(node);\\n    console.log(node);\\n    for(let neighbor of graph[node]){\\n        if(!visited.has(neighbor)) dfs(graph, neighbor, visited);\\n    }\\n}",
            java: "void dfs(Map<Integer,List<Integer>> graph,int node,Set<Integer> visited){\\n    visited.add(node);\\n    System.out.print(node+\" \");\\n    for(int nei:graph.get(node)){\\n        if(!visited.contains(nei)) dfs(graph,nei,visited);\\n    }\\n}",
            c: "#include <stdio.h>\\n#include <stdbool.h>\\n#define MAX 100\\nvoid dfs(int graph[MAX][MAX], int n, int node, bool visited[]){\\n    visited[node]=1;\\n    printf(\"%d \",node);\\n    for(int i=0;i<n;i++){\\n        if(graph[node][i] && !visited[i]) dfs(graph,n,i,visited);\\n    }\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvoid dfs(vector<vector<int>>& graph,int node,vector<bool>& vis){\\n    vis[node]=true;\\n    for(int nei:graph[node]){\\n        if(!vis[nei]) dfs(graph,nei,vis);\\n    }\\n}"
        }
    },
    {
        id: "dijkstra-algorithm",
        title: "Dijkstra’s Algorithm",
        category: "Graphs",
        difficulty: "Intermediate",
        timeComplexity: "O((V + E) log V)",
        spaceComplexity: "O(V)",
        shortDescription: "Finds shortest paths from a source node in a weighted graph.",
        description: "Dijkstra’s Algorithm computes the shortest path from a source node to all other nodes in a graph with non-negative edge weights.\n\nIt uses a priority queue (min-heap) to greedily select the next closest node. It is widely used in navigation systems and network routing.",
        pseudocode: "initialize distance array with infinity\\ndistance[source] = 0\\ncreate min heap\\nwhile heap not empty:\\n    extract node with smallest distance\\n    for each neighbor:\\n        if shorter path found:\\n            update distance\\n            push to heap",
        implementations: {
            python: "import heapq\\ndef dijkstra(graph, start):\\n    dist = {node: float('inf') for node in graph}\\n    dist[start] = 0\\n    pq = [(0, start)]\\n    while pq:\\n        d, node = heapq.heappop(pq)\\n        if d > dist[node]: continue\\n        for nei, w in graph[node]:\\n            if dist[node] + w < dist[nei]:\\n                dist[nei] = dist[node] + w\\n                heapq.heappush(pq, (dist[nei], nei))\\n    return dist",
            javascript: "function dijkstra(graph, start){\\n    let dist = {};\\n    for(let node in graph) dist[node]=Infinity;\\n    dist[start]=0;\\n    let pq=[[0,start]];\\n    while(pq.length){\\n        pq.sort((a,b)=>a[0]-b[0]);\\n        let [d,node]=pq.shift();\\n        for(let [nei,w] of graph[node]){\\n            if(dist[node]+w < dist[nei]){\\n                dist[nei]=dist[node]+w;\\n                pq.push([dist[nei],nei]);\\n            }\\n        }\\n    }\\n    return dist;\\n}",
            java: "import java.util.*;\\nclass Pair{int node,dist;Pair(int n,int d){node=n;dist=d;}}\\nvoid dijkstra(List<List<Pair>> graph,int start){\\n    int n=graph.size();\\n    int[] dist=new int[n]; Arrays.fill(dist,Integer.MAX_VALUE);\\n    dist[start]=0;\\n    PriorityQueue<Pair> pq=new PriorityQueue<>((a,b)->a.dist-b.dist);\\n    pq.add(new Pair(start,0));\\n    while(!pq.isEmpty()){\\n        Pair cur=pq.poll();\\n        for(Pair nei:graph.get(cur.node)){\\n            if(dist[cur.node]+nei.dist < dist[nei.node]){\\n                dist[nei.node]=dist[cur.node]+nei.dist;\\n                pq.add(new Pair(nei.node,dist[nei.node]));\\n            }\\n        }\\n    }\\n}",
            c: "#include <stdio.h>\\n#define MAX 100\\nint minDist(int dist[], int visited[], int n){\\n    int min=1e9, idx=-1;\\n    for(int i=0;i<n;i++) if(!visited[i] && dist[i]<min){min=dist[i];idx=i;}\\n    return idx;\\n}\\nvoid dijkstra(int graph[MAX][MAX], int n, int src){\\n    int dist[MAX], visited[MAX]={0};\\n    for(int i=0;i<n;i++) dist[i]=1e9;\\n    dist[src]=0;\\n    for(int i=0;i<n-1;i++){\\n        int u=minDist(dist,visited,n);\\n        visited[u]=1;\\n        for(int v=0;v<n;v++){\\n            if(!visited[v] && graph[u][v] && dist[u]+graph[u][v]<dist[v])\\n                dist[v]=dist[u]+graph[u][v];\\n        }\\n    }\\n}",
            cpp: "#include <vector>\\n#include <queue>\\nusing namespace std;\\nvector<int> dijkstra(vector<vector<pair<int,int>>>& g,int s){\\n    int n=g.size();\\n    vector<int> dist(n,1e9); dist[s]=0;\\n    priority_queue<pair<int,int>,vector<pair<int,int>>,greater<>> pq;\\n    pq.push({0,s});\\n    while(!pq.empty()){\\n        auto [d,u]=pq.top(); pq.pop();\\n        if(d>dist[u]) continue;\\n        for(auto [v,w]:g[u]){\\n            if(dist[u]+w<dist[v]){\\n                dist[v]=dist[u]+w;\\n                pq.push({dist[v],v});\\n            }\\n        }\\n    }\\n    return dist;\\n}"
        }
    },

    {
        id: "topological-sort",
        title: "Topological Sort",
        category: "Graphs",
        difficulty: "Intermediate",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)",
        shortDescription: "Linear ordering of DAG nodes such that u → v means u comes before v.",
        description: "Topological Sort orders nodes in a Directed Acyclic Graph (DAG) such that for every directed edge u → v, u appears before v.\n\nIt is used in scheduling, dependency resolution, and build systems. This implementation uses DFS.",
        pseudocode: "dfs(node):\\n    mark visited\\n    for each neighbor:\\n        if not visited:\\n            dfs(neighbor)\\n    push node to stack\\n\\nreverse stack gives order",
        implementations: {
            python: "def topo_sort(graph):\\n    visited=set()\\n    stack=[]\\n    def dfs(node):\\n        visited.add(node)\\n        for nei in graph[node]:\\n            if nei not in visited: dfs(nei)\\n        stack.append(node)\\n    for node in graph:\\n        if node not in visited: dfs(node)\\n    return stack[::-1]",
            javascript: "function topoSort(graph){\\n    let visited=new Set(),stack=[];\\n    function dfs(node){\\n        visited.add(node);\\n        for(let nei of graph[node])\\n            if(!visited.has(nei)) dfs(nei);\\n        stack.push(node);\\n    }\\n    for(let node in graph) if(!visited.has(node)) dfs(node);\\n    return stack.reverse();\\n}",
            java: "void topoSort(Map<Integer,List<Integer>> graph){\\n    Set<Integer> visited=new HashSet<>();\\n    Stack<Integer> stack=new Stack<>();\\n    for(int node:graph.keySet())\\n        if(!visited.contains(node)) dfs(node,graph,visited,stack);\\n    while(!stack.isEmpty()) System.out.print(stack.pop()+\" \");\\n}\\nvoid dfs(int node,Map<Integer,List<Integer>> g,Set<Integer> v,Stack<Integer> s){\\n    v.add(node);\\n    for(int nei:g.get(node)) if(!v.contains(nei)) dfs(nei,g,v,s);\\n    s.push(node);\\n}",
            c: "#include <stdio.h>\\n#include <stdbool.h>\\n#define MAX 100\\nint stack[MAX], top=-1;\\nvoid dfs(int graph[MAX][MAX], int n, int node, bool vis[]){\\n    vis[node]=1;\\n    for(int i=0;i<n;i++)\\n        if(graph[node][i] && !vis[i]) dfs(graph,n,i,vis);\\n    stack[++top]=node;\\n}\\nvoid topo(int graph[MAX][MAX], int n){\\n    bool vis[MAX]={0};\\n    for(int i=0;i<n;i++) if(!vis[i]) dfs(graph,n,i,vis);\\n    while(top>=0) printf(\"%d \",stack[top--]);\\n}",
            cpp: "#include <vector>\\n#include <stack>\\nusing namespace std;\\nvoid dfs(int u,vector<vector<int>>& g,vector<bool>& vis,stack<int>& st){\\n    vis[u]=true;\\n    for(int v:g[u]) if(!vis[v]) dfs(v,g,vis,st);\\n    st.push(u);\\n}\\nvector<int> topoSort(vector<vector<int>>& g){\\n    int n=g.size();\\n    vector<bool> vis(n,false);\\n    stack<int> st;\\n    for(int i=0;i<n;i++) if(!vis[i]) dfs(i,g,vis,st);\\n    vector<int> res;\\n    while(!st.empty()){ res.push_back(st.top()); st.pop(); }\\n    return res;\\n}"
        }
    },
    {
        id: "kruskal-algorithm",
        title: "Kruskal’s Algorithm (Minimum Spanning Tree)",
        category: "Graphs",
        difficulty: "Intermediate",
        timeComplexity: "O(E log E)",
        spaceComplexity: "O(V)",
        shortDescription: "Builds MST by adding smallest edges without forming cycles.",
        description: "Kruskal’s Algorithm constructs a Minimum Spanning Tree (MST) by sorting all edges and adding them one by one, ensuring no cycles are formed.\n\nIt uses the Union-Find (Disjoint Set) structure to efficiently detect cycles. It is widely used in network design and clustering problems.",
        pseudocode: "sort edges by weight\\ninitialize DSU\\nfor each edge:\\n    if endpoints not connected:\\n        add edge to MST\\n        union them",
        implementations: {
            python: "def kruskal(n, edges):\\n    parent = list(range(n))\\n    def find(x):\\n        if parent[x] != x:\\n            parent[x] = find(parent[x])\\n        return parent[x]\\n    def union(a,b):\\n        parent[find(a)] = find(b)\\n    edges.sort(key=lambda x: x[2])\\n    mst = []\\n    for u,v,w in edges:\\n        if find(u) != find(v):\\n            union(u,v)\\n            mst.append((u,v,w))\\n    return mst",
            javascript: "function kruskal(n, edges){\\n    let parent = Array.from({length:n},(_,i)=>i);\\n    function find(x){\\n        if(parent[x]!==x) parent[x]=find(parent[x]);\\n        return parent[x];\\n    }\\n    function union(a,b){ parent[find(a)] = find(b); }\\n    edges.sort((a,b)=>a[2]-b[2]);\\n    let mst=[];\\n    for(let [u,v,w] of edges){\\n        if(find(u)!==find(v)){\\n            union(u,v); mst.push([u,v,w]);\\n        }\\n    }\\n    return mst;\\n}",
            java: "import java.util.*;\\nclass Edge{int u,v,w;}\\nclass Kruskal{\\n    int find(int[] parent,int x){\\n        if(parent[x]!=x) parent[x]=find(parent,parent[x]);\\n        return parent[x];\\n    }\\n    void union(int[] parent,int a,int b){ parent[find(parent,a)]=find(parent,b); }\\n    void mst(int n,List<Edge> edges){\\n        Collections.sort(edges,(a,b)->a.w-b.w);\\n        int[] parent=new int[n];\\n        for(int i=0;i<n;i++) parent[i]=i;\\n        for(Edge e:edges){\\n            if(find(parent,e.u)!=find(parent,e.v)){\\n                union(parent,e.u,e.v);\\n                System.out.println(e.u+\"-\"+e.v);\\n            }\\n        }\\n    }\\n}",
            c: "#include <stdio.h>\\n#include <stdlib.h>\\nint parent[100];\\nint find(int x){ if(parent[x]!=x) parent[x]=find(parent[x]); return parent[x]; }\\nvoid unite(int a,int b){ parent[find(a)]=find(b); }\\nvoid kruskal(int edges[][3],int e,int n){\\n    for(int i=0;i<n;i++) parent[i]=i;\\n    for(int i=0;i<e;i++){\\n        for(int j=i+1;j<e;j++){\\n            if(edges[i][2]>edges[j][2]){\\n                for(int k=0;k<3;k++){int t=edges[i][k];edges[i][k]=edges[j][k];edges[j][k]=t;}\\n            }\\n        }\\n    }\\n    for(int i=0;i<e;i++){\\n        int u=edges[i][0],v=edges[i][1];\\n        if(find(u)!=find(v)){ unite(u,v); printf(\"%d-%d\\n\",u,v); }\\n    }\\n}",
            cpp: "#include <vector>\\n#include <algorithm>\\nusing namespace std;\\nstruct Edge{int u,v,w;};\\nvector<int> parent;\\nint find(int x){return parent[x]==x?x:parent[x]=find(parent[x]);}\\nvoid unite(int a,int b){parent[find(a)]=find(b);}\\nvector<Edge> kruskal(int n,vector<Edge>& edges){\\n    parent.resize(n); for(int i=0;i<n;i++) parent[i]=i;\\n    sort(edges.begin(),edges.end(),[](Edge a,Edge b){return a.w<b.w;});\\n    vector<Edge> mst;\\n    for(auto e:edges){\\n        if(find(e.u)!=find(e.v)){ unite(e.u,e.v); mst.push_back(e); }\\n    }\\n    return mst;\\n}"
        }
    },

    {
        id: "union-find",
        title: "Union-Find (Disjoint Set)",
        category: "Graphs",
        difficulty: "Intermediate",
        timeComplexity: "O(α(n))",
        spaceComplexity: "O(n)",
        shortDescription: "Efficient structure for tracking connected components.",
        description: "Union-Find (Disjoint Set) keeps track of elements partitioned into disjoint sets. It supports two operations:\n\nFind: Determine which set an element belongs to.\nUnion: Merge two sets.\n\nWith path compression and union by rank, operations are nearly constant time. It is heavily used in MST, cycle detection, and connectivity problems.",
        pseudocode: "find(x):\\n    if parent[x]!=x:\\n        parent[x]=find(parent[x])\\n    return parent[x]\\n\\nunion(a,b):\\n    parent[find(a)] = find(b)",
        implementations: {
            python: "class DSU:\\n    def __init__(self,n):\\n        self.parent=list(range(n))\\n        self.rank=[0]*n\\n    def find(self,x):\\n        if self.parent[x]!=x:\\n            self.parent[x]=self.find(self.parent[x])\\n        return self.parent[x]\\n    def union(self,a,b):\\n        pa,pb=self.find(a),self.find(b)\\n        if pa!=pb:\\n            if self.rank[pa]<self.rank[pb]:\\n                self.parent[pa]=pb\\n            elif self.rank[pa]>self.rank[pb]:\\n                self.parent[pb]=pa\\n            else:\\n                self.parent[pb]=pa\\n                self.rank[pa]+=1",
            javascript: "class DSU{\\n    constructor(n){\\n        this.parent=Array.from({length:n},(_,i)=>i);\\n        this.rank=new Array(n).fill(0);\\n    }\\n    find(x){\\n        if(this.parent[x]!==x) this.parent[x]=this.find(this.parent[x]);\\n        return this.parent[x];\\n    }\\n    union(a,b){\\n        let pa=this.find(a),pb=this.find(b);\\n        if(pa!==pb){\\n            if(this.rank[pa]<this.rank[pb]) this.parent[pa]=pb;\\n            else if(this.rank[pa]>this.rank[pb]) this.parent[pb]=pa;\\n            else{ this.parent[pb]=pa; this.rank[pa]++; }\\n        }\\n    }\\n}",
            java: "class DSU{\\n    int[] parent,rank;\\n    DSU(int n){ parent=new int[n]; rank=new int[n]; for(int i=0;i<n;i++) parent[i]=i; }\\n    int find(int x){ if(parent[x]!=x) parent[x]=find(parent[x]); return parent[x]; }\\n    void union(int a,int b){ int pa=find(a),pb=find(b);\\n        if(pa!=pb){\\n            if(rank[pa]<rank[pb]) parent[pa]=pb;\\n            else if(rank[pa]>rank[pb]) parent[pb]=pa;\\n            else{ parent[pb]=pa; rank[pa]++; }\\n        }\\n    }\\n}",
            c: "#include <stdio.h>\\nint parent[100],rankArr[100];\\nint find(int x){ if(parent[x]!=x) parent[x]=find(parent[x]); return parent[x]; }\\nvoid unite(int a,int b){ int pa=find(a),pb=find(b);\\n    if(pa!=pb){\\n        if(rankArr[pa]<rankArr[pb]) parent[pa]=pb;\\n        else if(rankArr[pa]>rankArr[pb]) parent[pb]=pa;\\n        else{ parent[pb]=pa; rankArr[pa]++; }\\n    }\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nclass DSU{\\n    vector<int> parent,rank;\\npublic:\\n    DSU(int n){ parent.resize(n); rank.resize(n,0); for(int i=0;i<n;i++) parent[i]=i; }\\n    int find(int x){ return parent[x]==x?x:parent[x]=find(parent[x]); }\\n    void unite(int a,int b){ int pa=find(a),pb=find(b);\\n        if(pa!=pb){\\n            if(rank[pa]<rank[pb]) parent[pa]=pb;\\n            else if(rank[pa]>rank[pb]) parent[pb]=pa;\\n            else{ parent[pb]=pa; rank[pa]++; }\\n        }\\n    }\\n};"
        }
    },
    {
        id: "fibonacci-dp",
        title: "Fibonacci (Dynamic Programming)",
        category: "Dynamic Programming",
        difficulty: "Beginner",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        shortDescription: "Computes Fibonacci numbers efficiently using memoization or tabulation.",
        description: "The Fibonacci sequence is a classic example used to demonstrate dynamic programming. Instead of recomputing overlapping subproblems recursively, DP stores results.\n\nTwo main approaches:\n1. Memoization (top-down)\n2. Tabulation (bottom-up)\n\nThis reduces time complexity from exponential O(2^n) to linear O(n).",
        pseudocode: "dp[0]=0, dp[1]=1\\nfor i from 2 to n:\\n    dp[i]=dp[i-1]+dp[i-2]\\nreturn dp[n]",
        implementations: {
            python: "def fib(n):\\n    if n<=1: return n\\n    dp=[0]*(n+1)\\n    dp[1]=1\\n    for i in range(2,n+1):\\n        dp[i]=dp[i-1]+dp[i-2]\\n    return dp[n]",
            javascript: "function fib(n){\\n    if(n<=1) return n;\\n    let dp=new Array(n+1).fill(0);\\n    dp[1]=1;\\n    for(let i=2;i<=n;i++) dp[i]=dp[i-1]+dp[i-2];\\n    return dp[n];\\n}",
            java: "int fib(int n){\\n    if(n<=1) return n;\\n    int[] dp=new int[n+1];\\n    dp[1]=1;\\n    for(int i=2;i<=n;i++) dp[i]=dp[i-1]+dp[i-2];\\n    return dp[n];\\n}",
            c: "#include <stdio.h>\\nint fib(int n){\\n    if(n<=1) return n;\\n    int dp[n+1]; dp[0]=0; dp[1]=1;\\n    for(int i=2;i<=n;i++) dp[i]=dp[i-1]+dp[i-2];\\n    return dp[n];\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nint fib(int n){\\n    if(n<=1) return n;\\n    vector<int> dp(n+1);\\n    dp[1]=1;\\n    for(int i=2;i<=n;i++) dp[i]=dp[i-1]+dp[i-2];\\n    return dp[n];\\n}"
        }
    },

    {
        id: "zero-one-knapsack",
        title: "0/1 Knapsack",
        category: "Dynamic Programming",
        difficulty: "Intermediate",
        timeComplexity: "O(nW)",
        spaceComplexity: "O(nW)",
        shortDescription: "Selects items to maximize value without exceeding weight capacity.",
        description: "The 0/1 Knapsack problem determines the maximum value achievable by selecting items without exceeding capacity.\n\nEach item can either be taken or not taken (0/1). It is solved using dynamic programming by building a table of optimal solutions for subproblems.",
        pseudocode: "for i from 0 to n:\\n    for w from 0 to W:\\n        if i==0 or w==0: dp[i][w]=0\\n        else if weight[i-1]<=w:\\n            dp[i][w]=max(value[i-1]+dp[i-1][w-weight[i-1]], dp[i-1][w])\\n        else:\\n            dp[i][w]=dp[i-1][w]",
        implementations: {
            python: "def knapsack(W, wt, val, n):\\n    dp=[[0]*(W+1) for _ in range(n+1)]\\n    for i in range(1,n+1):\\n        for w in range(1,W+1):\\n            if wt[i-1]<=w:\\n                dp[i][w]=max(val[i-1]+dp[i-1][w-wt[i-1]], dp[i-1][w])\\n            else:\\n                dp[i][w]=dp[i-1][w]\\n    return dp[n][W]",
            javascript: "function knapsack(W, wt, val, n){\\n    let dp=Array.from({length:n+1},()=>Array(W+1).fill(0));\\n    for(let i=1;i<=n;i++){\\n        for(let w=1;w<=W;w++){\\n            if(wt[i-1]<=w)\\n                dp[i][w]=Math.max(val[i-1]+dp[i-1][w-wt[i-1]], dp[i-1][w]);\\n            else dp[i][w]=dp[i-1][w];\\n        }\\n    }\\n    return dp[n][W];\\n}",
            java: "int knapsack(int W,int wt[],int val[],int n){\\n    int[][] dp=new int[n+1][W+1];\\n    for(int i=1;i<=n;i++){\\n        for(int w=1;w<=W;w++){\\n            if(wt[i-1]<=w)\\n                dp[i][w]=Math.max(val[i-1]+dp[i-1][w-wt[i-1]], dp[i-1][w]);\\n            else dp[i][w]=dp[i-1][w];\\n        }\\n    }\\n    return dp[n][W];\\n}",
            c: "#include <stdio.h>\\nint max(int a,int b){return a>b?a:b;}\\nint knapsack(int W,int wt[],int val[],int n){\\n    int dp[n+1][W+1];\\n    for(int i=0;i<=n;i++){\\n        for(int w=0;w<=W;w++){\\n            if(i==0||w==0) dp[i][w]=0;\\n            else if(wt[i-1]<=w)\\n                dp[i][w]=max(val[i-1]+dp[i-1][w-wt[i-1]], dp[i-1][w]);\\n            else dp[i][w]=dp[i-1][w];\\n        }\\n    }\\n    return dp[n][W];\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nint knapsack(int W,vector<int>& wt,vector<int>& val,int n){\\n    vector<vector<int>> dp(n+1,vector<int>(W+1,0));\\n    for(int i=1;i<=n;i++){\\n        for(int w=1;w<=W;w++){\\n            if(wt[i-1]<=w)\\n                dp[i][w]=max(val[i-1]+dp[i-1][w-wt[i-1]], dp[i-1][w]);\\n            else dp[i][w]=dp[i-1][w];\\n        }\\n    }\\n    return dp[n][W];\\n}"
        }
    },
    {
        id: "longest-common-subsequence",
        title: "Longest Common Subsequence (LCS)",
        category: "Dynamic Programming",
        difficulty: "Intermediate",
        timeComplexity: "O(n * m)",
        spaceComplexity: "O(n * m)",
        shortDescription: "Finds the longest subsequence common to two strings.",
        description: "LCS finds the longest sequence present in both strings without changing order.\n\nIt is widely used in diff tools, DNA sequence matching, and version control systems.",
        pseudocode: "for i from 1..n:\\n for j from 1..m:\\n  if s1[i-1]==s2[j-1]: dp[i][j]=1+dp[i-1][j-1]\\n  else dp[i][j]=max(dp[i-1][j],dp[i][j-1])",
        implementations: {
            python: "def lcs(s1,s2):\\n    n,m=len(s1),len(s2)\\n    dp=[[0]*(m+1) for _ in range(n+1)]\\n    for i in range(1,n+1):\\n        for j in range(1,m+1):\\n            if s1[i-1]==s2[j-1]: dp[i][j]=1+dp[i-1][j-1]\\n            else: dp[i][j]=max(dp[i-1][j],dp[i][j-1])\\n    return dp[n][m]",
            javascript: "function lcs(s1,s2){\\n    let n=s1.length,m=s2.length;\\n    let dp=Array.from({length:n+1},()=>Array(m+1).fill(0));\\n    for(let i=1;i<=n;i++){\\n        for(let j=1;j<=m;j++){\\n            if(s1[i-1]===s2[j-1]) dp[i][j]=1+dp[i-1][j-1];\\n            else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);\\n        }\\n    }\\n    return dp[n][m];\\n}",
            java: "int lcs(String s1,String s2){\\n    int n=s1.length(),m=s2.length();\\n    int[][] dp=new int[n+1][m+1];\\n    for(int i=1;i<=n;i++)\\n        for(int j=1;j<=m;j++)\\n            if(s1.charAt(i-1)==s2.charAt(j-1)) dp[i][j]=1+dp[i-1][j-1];\\n            else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);\\n    return dp[n][m];\\n}",
            c: "#include <string.h>\\nint max(int a,int b){return a>b?a:b;}\\nint lcs(char* s1,char* s2){\\n    int n=strlen(s1),m=strlen(s2);\\n    int dp[n+1][m+1];\\n    for(int i=0;i<=n;i++)\\n        for(int j=0;j<=m;j++)\\n            if(i==0||j==0) dp[i][j]=0;\\n            else if(s1[i-1]==s2[j-1]) dp[i][j]=1+dp[i-1][j-1];\\n            else dp[i][j]=max(dp[i-1][j],dp[i][j-1]);\\n    return dp[n][m];\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nint lcs(string s1,string s2){\\n    int n=s1.size(),m=s2.size();\\n    vector<vector<int>> dp(n+1,vector<int>(m+1,0));\\n    for(int i=1;i<=n;i++)\\n        for(int j=1;j<=m;j++)\\n            if(s1[i-1]==s2[j-1]) dp[i][j]=1+dp[i-1][j-1];\\n            else dp[i][j]=max(dp[i-1][j],dp[i][j-1]);\\n    return dp[n][m];\\n}"
        }
    },

    {
        id: "longest-increasing-subsequence",
        title: "Longest Increasing Subsequence (LIS)",
        category: "Dynamic Programming",
        difficulty: "Intermediate",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(n)",
        shortDescription: "Finds the longest strictly increasing subsequence.",
        description: "LIS determines the longest subsequence where elements are in increasing order.\n\nIt is used in optimization, scheduling, and sequence analysis problems.",
        pseudocode: "dp[i]=1\\nfor i from 1..n:\\n for j from 0..i-1:\\n  if arr[j]<arr[i]: dp[i]=max(dp[i],dp[j]+1)",
        implementations: {
            python: "def lis(arr):\\n    n=len(arr)\\n    dp=[1]*n\\n    for i in range(n):\\n        for j in range(i):\\n            if arr[j]<arr[i]: dp[i]=max(dp[i],dp[j]+1)\\n    return max(dp)",
            javascript: "function lis(arr){\\n    let n=arr.length,dp=new Array(n).fill(1);\\n    for(let i=0;i<n;i++)\\n        for(let j=0;j<i;j++)\\n            if(arr[j]<arr[i]) dp[i]=Math.max(dp[i],dp[j]+1);\\n    return Math.max(...dp);\\n}",
            java: "int lis(int[] arr){\\n    int n=arr.length;\\n    int[] dp=new int[n];\\n    Arrays.fill(dp,1);\\n    for(int i=0;i<n;i++)\\n        for(int j=0;j<i;j++)\\n            if(arr[j]<arr[i]) dp[i]=Math.max(dp[i],dp[j]+1);\\n    int res=0; for(int x:dp) res=Math.max(res,x);\\n    return res;\\n}",
            c: "#include <stdio.h>\\nint max(int a,int b){return a>b?a:b;}\\nint lis(int arr[],int n){\\n    int dp[n];\\n    for(int i=0;i<n;i++) dp[i]=1;\\n    for(int i=0;i<n;i++)\\n        for(int j=0;j<i;j++)\\n            if(arr[j]<arr[i]) dp[i]=max(dp[i],dp[j]+1);\\n    int res=0;\\n    for(int i=0;i<n;i++) if(dp[i]>res) res=dp[i];\\n    return res;\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nint lis(vector<int>& arr){\\n    int n=arr.size();\\n    vector<int> dp(n,1);\\n    for(int i=0;i<n;i++)\\n        for(int j=0;j<i;j++)\\n            if(arr[j]<arr[i]) dp[i]=max(dp[i],dp[j]+1);\\n    return *max_element(dp.begin(),dp.end());\\n}"
        }
    },

    {
        id: "coin-change",
        title: "Coin Change (Minimum Coins)",
        category: "Dynamic Programming",
        difficulty: "Intermediate",
        timeComplexity: "O(n * amount)",
        spaceComplexity: "O(amount)",
        shortDescription: "Finds minimum number of coins needed to make a given amount.",
        description: "The Coin Change problem finds the minimum number of coins required to make a target amount.\n\nIt uses dynamic programming to build solutions for smaller amounts and reuse them for larger ones.",
        pseudocode: "dp[0]=0\\nfor i from 1..amount:\\n dp[i]=INF\\n for each coin:\\n  if coin<=i:\\n    dp[i]=min(dp[i],dp[i-coin]+1)",
        implementations: {
            python: "def coin_change(coins, amount):\\n    dp=[float('inf')]*(amount+1)\\n    dp[0]=0\\n    for i in range(1,amount+1):\\n        for c in coins:\\n            if c<=i:\\n                dp[i]=min(dp[i],dp[i-c]+1)\\n    return dp[amount] if dp[amount]!=float('inf') else -1",
            javascript: "function coinChange(coins,amount){\\n    let dp=new Array(amount+1).fill(Infinity);\\n    dp[0]=0;\\n    for(let i=1;i<=amount;i++)\\n        for(let c of coins)\\n            if(c<=i) dp[i]=Math.min(dp[i],dp[i-c]+1);\\n    return dp[amount]===Infinity?-1:dp[amount];\\n}",
            java: "int coinChange(int[] coins,int amount){\\n    int[] dp=new int[amount+1];\\n    Arrays.fill(dp,amount+1);\\n    dp[0]=0;\\n    for(int i=1;i<=amount;i++)\\n        for(int c:coins)\\n            if(c<=i) dp[i]=Math.min(dp[i],dp[i-c]+1);\\n    return dp[amount]>amount?-1:dp[amount];\\n}",
            c: "#include <stdio.h>\\nint min(int a,int b){return a<b?a:b;}\\nint coinChange(int coins[],int n,int amount){\\n    int dp[amount+1];\\n    for(int i=0;i<=amount;i++) dp[i]=amount+1;\\n    dp[0]=0;\\n    for(int i=1;i<=amount;i++)\\n        for(int j=0;j<n;j++)\\n            if(coins[j]<=i) dp[i]=min(dp[i],dp[i-coins[j]]+1);\\n    return dp[amount]>amount?-1:dp[amount];\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nint coinChange(vector<int>& coins,int amount){\\n    vector<int> dp(amount+1,amount+1);\\n    dp[0]=0;\\n    for(int i=1;i<=amount;i++)\\n        for(int c:coins)\\n            if(c<=i) dp[i]=min(dp[i],dp[i-c]+1);\\n    return dp[amount]>amount?-1:dp[amount];\\n}"
        }
    },
    {
        id: "gcd-euclidean",
        title: "GCD (Euclidean Algorithm)",
        category: "Math",
        difficulty: "Beginner",
        timeComplexity: "O(log min(a, b))",
        spaceComplexity: "O(1)",
        shortDescription: "Efficiently computes the greatest common divisor using division.",
        description: "The Euclidean Algorithm finds the Greatest Common Divisor (GCD) of two numbers by repeatedly applying the relation gcd(a, b) = gcd(b, a % b).\n\nIt is highly efficient and widely used in number theory, cryptography, and simplifying fractions.",
        pseudocode: "while b != 0:\\n    temp = b\\n    b = a % b\\n    a = temp\\nreturn a",
        implementations: {
            python: "def gcd(a, b):\\n    while b != 0:\\n        a, b = b, a % b\\n    return a",
            javascript: "function gcd(a, b){\\n    while(b!==0){\\n        let temp=b;\\n        b=a%b;\\n        a=temp;\\n    }\\n    return a;\\n}",
            java: "int gcd(int a,int b){\\n    while(b!=0){\\n        int temp=b;\\n        b=a%b;\\n        a=temp;\\n    }\\n    return a;\\n}",
            c: "#include <stdio.h>\\nint gcd(int a,int b){\\n    while(b!=0){\\n        int t=b; b=a%b; a=t;\\n    }\\n    return a;\\n}",
            cpp: "#include <iostream>\\nusing namespace std;\\nint gcd(int a,int b){\\n    while(b){\\n        int t=b; b=a%b; a=t;\\n    }\\n    return a;\\n}"
        }
    },

    {
        id: "sieve-of-eratosthenes",
        title: "Sieve of Eratosthenes",
        category: "Math",
        difficulty: "Intermediate",
        timeComplexity: "O(n log log n)",
        spaceComplexity: "O(n)",
        shortDescription: "Generates all prime numbers up to n efficiently.",
        description: "The Sieve of Eratosthenes is an efficient algorithm for finding all prime numbers up to a given limit n.\n\nIt works by iteratively marking multiples of each prime starting from 2. Remaining unmarked numbers are primes.",
        pseudocode: "create array isPrime[0..n] = true\\nset 0,1 false\\nfor i from 2 to sqrt(n):\\n    if isPrime[i]:\\n        for j from i*i to n step i:\\n            mark j false",
        implementations: {
            python: "def sieve(n):\\n    prime=[True]*(n+1)\\n    prime[0]=prime[1]=False\\n    for i in range(2,int(n**0.5)+1):\\n        if prime[i]:\\n            for j in range(i*i,n+1,i):\\n                prime[j]=False\\n    return [i for i in range(n+1) if prime[i]]",
            javascript: "function sieve(n){\\n    let prime=new Array(n+1).fill(true);\\n    prime[0]=prime[1]=false;\\n    for(let i=2;i*i<=n;i++){\\n        if(prime[i])\\n            for(let j=i*i;j<=n;j+=i) prime[j]=false;\\n    }\\n    let res=[];\\n    for(let i=2;i<=n;i++) if(prime[i]) res.push(i);\\n    return res;\\n}",
            java: "import java.util.*;\\nList<Integer> sieve(int n){\\n    boolean[] prime=new boolean[n+1];\\n    Arrays.fill(prime,true);\\n    prime[0]=prime[1]=false;\\n    for(int i=2;i*i<=n;i++)\\n        if(prime[i])\\n            for(int j=i*i;j<=n;j+=i) prime[j]=false;\\n    List<Integer> res=new ArrayList<>();\\n    for(int i=2;i<=n;i++) if(prime[i]) res.add(i);\\n    return res;\\n}",
            c: "#include <stdio.h>\\nvoid sieve(int n){\\n    int prime[n+1];\\n    for(int i=0;i<=n;i++) prime[i]=1;\\n    prime[0]=prime[1]=0;\\n    for(int i=2;i*i<=n;i++)\\n        if(prime[i])\\n            for(int j=i*i;j<=n;j+=i) prime[j]=0;\\n    for(int i=2;i<=n;i++) if(prime[i]) printf(\"%d \",i);\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvector<int> sieve(int n){\\n    vector<bool> prime(n+1,true);\\n    prime[0]=prime[1]=false;\\n    for(int i=2;i*i<=n;i++)\\n        if(prime[i])\\n            for(int j=i*i;j<=n;j+=i) prime[j]=false;\\n    vector<int> res;\\n    for(int i=2;i<=n;i++) if(prime[i]) res.push_back(i);\\n    return res;\\n}"
        }
    },

    {
        id: "fast-exponentiation",
        title: "Fast Exponentiation (Binary Exponentiation)",
        category: "Math",
        difficulty: "Intermediate",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        shortDescription: "Computes powers efficiently using exponent halving.",
        description: "Fast Exponentiation computes a^b in logarithmic time by repeatedly squaring the base and reducing the exponent.\n\nIt is essential in modular arithmetic, cryptography, and competitive programming.",
        pseudocode: "result = 1\\nwhile b > 0:\\n    if b % 2 == 1:\\n        result *= a\\n    a *= a\\n    b //= 2\\nreturn result",
        implementations: {
            python: "def power(a, b):\\n    result = 1\\n    while b > 0:\\n        if b % 2 == 1:\\n            result *= a\\n        a *= a\\n        b //= 2\\n    return result",
            javascript: "function power(a, b){\\n    let result = 1;\\n    while(b>0){\\n        if(b%2===1) result*=a;\\n        a*=a;\\n        b=Math.floor(b/2);\\n    }\\n    return result;\\n}",
            java: "long power(long a,long b){\\n    long result=1;\\n    while(b>0){\\n        if(b%2==1) result*=a;\\n        a*=a;\\n        b/=2;\\n    }\\n    return result;\\n}",
            c: "#include <stdio.h>\\nlong power(long a,long b){\\n    long res=1;\\n    while(b>0){\\n        if(b%2) res*=a;\\n        a*=a;\\n        b/=2;\\n    }\\n    return res;\\n}",
            cpp: "#include <iostream>\\nusing namespace std;\\nlong long power(long long a,long long b){\\n    long long res=1;\\n    while(b){\\n        if(b&1) res*=a;\\n        a*=a;\\n        b>>=1;\\n    }\\n    return res;\\n}"
        }
    },
    {
        id: "modular-exponentiation",
        title: "Modular Exponentiation",
        category: "Math",
        difficulty: "Intermediate",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        shortDescription: "Computes (a^b) % m efficiently using binary exponentiation.",
        description: "Modular Exponentiation computes powers under modulo efficiently using repeated squaring.\n\nIt avoids overflow and is heavily used in cryptography, competitive programming, and hashing.",
        pseudocode: "result = 1\\na = a % m\\nwhile b > 0:\\n    if b % 2 == 1:\\n        result = (result * a) % m\\n    a = (a * a) % m\\n    b //= 2\\nreturn result",
        implementations: {
            python: "def mod_pow(a, b, m):\\n    result = 1\\n    a %= m\\n    while b > 0:\\n        if b % 2 == 1:\\n            result = (result * a) % m\\n        a = (a * a) % m\\n        b //= 2\\n    return result",
            javascript: "function modPow(a,b,m){\\n    let result=1;\\n    a%=m;\\n    while(b>0){\\n        if(b%2===1) result=(result*a)%m;\\n        a=(a*a)%m;\\n        b=Math.floor(b/2);\\n    }\\n    return result;\\n}",
            java: "long modPow(long a,long b,long m){\\n    long res=1;\\n    a%=m;\\n    while(b>0){\\n        if(b%2==1) res=(res*a)%m;\\n        a=(a*a)%m;\\n        b/=2;\\n    }\\n    return res;\\n}",
            c: "#include <stdio.h>\\nlong modPow(long a,long b,long m){\\n    long res=1;\\n    a%=m;\\n    while(b>0){\\n        if(b%2) res=(res*a)%m;\\n        a=(a*a)%m;\\n        b/=2;\\n    }\\n    return res;\\n}",
            cpp: "#include <iostream>\\nusing namespace std;\\nlong long modPow(long long a,long long b,long long m){\\n    long long res=1;\\n    a%=m;\\n    while(b){\\n        if(b&1) res=(res*a)%m;\\n        a=(a*a)%m;\\n        b>>=1;\\n    }\\n    return res;\\n}"
        }
    },

    {
        id: "lcm",
        title: "LCM (Least Common Multiple)",
        category: "Math",
        difficulty: "Beginner",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        shortDescription: "Finds least common multiple using GCD.",
        description: "LCM of two numbers is the smallest number divisible by both.\n\nIt is efficiently computed using the relation: LCM(a, b) = (a * b) / GCD(a, b). Widely used in fractions, scheduling, and number theory.",
        pseudocode: "lcm(a, b):\\n    return (a * b) / gcd(a, b)",
        implementations: {
            python: "def gcd(a,b):\\n    while b: a,b=b,a%b\\n    return a\\ndef lcm(a,b):\\n    return (a*b)//gcd(a,b)",
            javascript: "function gcd(a,b){ while(b!==0){ let t=b; b=a%b; a=t; } return a; }\\nfunction lcm(a,b){ return (a*b)/gcd(a,b); }",
            java: "int gcd(int a,int b){ while(b!=0){ int t=b; b=a%b; a=t; } return a; }\\nint lcm(int a,int b){ return (a*b)/gcd(a,b); }",
            c: "#include <stdio.h>\\nint gcd(int a,int b){ while(b){ int t=b; b=a%b; a=t; } return a; }\\nint lcm(int a,int b){ return (a*b)/gcd(a,b); }",
            cpp: "#include <iostream>\\nusing namespace std;\\nint gcd(int a,int b){ while(b){ int t=b; b=a%b; a=t; } return a; }\\nint lcm(int a,int b){ return (a*b)/gcd(a,b); }"
        }
    },

    {
        id: "prime-factorization",
        title: "Prime Factorization",
        category: "Math",
        difficulty: "Intermediate",
        timeComplexity: "O(sqrt(n))",
        spaceComplexity: "O(1)",
        shortDescription: "Breaks a number into its prime factors.",
        description: "Prime Factorization expresses a number as a product of prime numbers.\n\nIt is useful in number theory, cryptography, and optimization problems. The basic approach checks divisibility up to sqrt(n).",
        pseudocode: "for i from 2 to sqrt(n):\\n    while n % i == 0:\\n        print i\\n        n = n / i\\nif n > 1:\\n    print n",
        implementations: {
            python: "def prime_factors(n):\\n    i=2\\n    res=[]\\n    while i*i<=n:\\n        while n%i==0:\\n            res.append(i)\\n            n//=i\\n        i+=1\\n    if n>1: res.append(n)\\n    return res",
            javascript: "function primeFactors(n){\\n    let res=[];\\n    for(let i=2;i*i<=n;i++){\\n        while(n%i===0){ res.push(i); n/=i; }\\n    }\\n    if(n>1) res.push(n);\\n    return res;\\n}",
            java: "import java.util.*;\\nList<Integer> primeFactors(int n){\\n    List<Integer> res=new ArrayList<>();\\n    for(int i=2;i*i<=n;i++){\\n        while(n%i==0){ res.add(i); n/=i; }\\n    }\\n    if(n>1) res.add(n);\\n    return res;\\n}",
            c: "#include <stdio.h>\\nvoid primeFactors(int n){\\n    for(int i=2;i*i<=n;i++){\\n        while(n%i==0){ printf(\"%d \",i); n/=i; }\\n    }\\n    if(n>1) printf(\"%d\",n);\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvector<int> primeFactors(int n){\\n    vector<int> res;\\n    for(int i=2;i*i<=n;i++){\\n        while(n%i==0){ res.push_back(i); n/=i; }\\n    }\\n    if(n>1) res.push_back(n);\\n    return res;\\n}"
        }
    },
    {
        id: "segment-tree",
        title: "Segment Tree",
        category: "Trees",
        difficulty: "Advanced",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(n)",
        shortDescription: "Efficient range query and update data structure.",
        description: "Segment Tree is a binary tree used for range queries like sum, min, max.\n\nIt divides the array into segments and stores results in a tree structure, enabling O(log n) queries and updates.",
        pseudocode: "build(node, start, end):\\n    if start == end:\\n        tree[node] = arr[start]\\n    else:\\n        mid = (start+end)/2\\n        build(left)\\n        build(right)\\n        tree[node] = combine(left, right)",
        implementations: {
            python: "class SegmentTree:\\n    def __init__(self, arr):\\n        self.n = len(arr)\\n        self.tree = [0] * (4*self.n)\\n        self.build(arr, 0, 0, self.n-1)\\n\\n    def build(self, arr, node, l, r):\\n        if l == r:\\n            self.tree[node] = arr[l]\\n        else:\\n            m = (l+r)//2\\n            self.build(arr, 2*node+1, l, m)\\n            self.build(arr, 2*node+2, m+1, r)\\n            self.tree[node] = self.tree[2*node+1] + self.tree[2*node+2]",
            javascript: "class SegmentTree{\\n    constructor(arr){\\n        this.n=arr.length;\\n        this.tree=new Array(4*this.n).fill(0);\\n        this.build(arr,0,0,this.n-1);\\n    }\\n    build(arr,node,l,r){\\n        if(l===r) this.tree[node]=arr[l];\\n        else{\\n            let m=Math.floor((l+r)/2);\\n            this.build(arr,2*node+1,l,m);\\n            this.build(arr,2*node+2,m+1,r);\\n            this.tree[node]=this.tree[2*node+1]+this.tree[2*node+2];\\n        }\\n    }\\n}",
            java: "class SegmentTree{\\n    int[] tree; int n;\\n    SegmentTree(int[] arr){\\n        n=arr.length; tree=new int[4*n]; build(arr,0,0,n-1);\\n    }\\n    void build(int[] arr,int node,int l,int r){\\n        if(l==r) tree[node]=arr[l];\\n        else{\\n            int m=(l+r)/2;\\n            build(arr,2*node+1,l,m);\\n            build(arr,2*node+2,m+1,r);\\n            tree[node]=tree[2*node+1]+tree[2*node+2];\\n        }\\n    }\\n}",
            c: "#include <stdio.h>\\nint tree[400];\\nvoid build(int arr[],int node,int l,int r){\\n    if(l==r) tree[node]=arr[l];\\n    else{\\n        int m=(l+r)/2;\\n        build(arr,2*node+1,l,m);\\n        build(arr,2*node+2,m+1,r);\\n        tree[node]=tree[2*node+1]+tree[2*node+2];\\n    }\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nclass SegmentTree{\\n    vector<int> tree; int n;\\npublic:\\n    SegmentTree(vector<int>& arr){\\n        n=arr.size(); tree.resize(4*n); build(arr,0,0,n-1);\\n    }\\n    void build(vector<int>& arr,int node,int l,int r){\\n        if(l==r) tree[node]=arr[l];\\n        else{\\n            int m=(l+r)/2;\\n            build(arr,2*node+1,l,m);\\n            build(arr,2*node+2,m+1,r);\\n            tree[node]=tree[2*node+1]+tree[2*node+2];\\n        }\\n    }\\n};"
        }
    },

    {
        id: "kmp-algorithm",
        title: "KMP String Matching",
        category: "String",
        difficulty: "Advanced",
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(m)",
        shortDescription: "Efficient substring search using prefix function.",
        description: "KMP avoids redundant comparisons by preprocessing the pattern into an LPS (Longest Prefix Suffix) array.\n\nIt is widely used in pattern matching and text searching.",
        pseudocode: "build LPS array\\nmatch characters\\non mismatch jump using LPS",
        implementations: {
            python: "def kmp(text, pat):\\n    def lps(p):\\n        l=[0]*len(p); j=0\\n        for i in range(1,len(p)):\\n            while j>0 and p[i]!=p[j]: j=l[j-1]\\n            if p[i]==p[j]: j+=1\\n            l[i]=j\\n        return l\\n    l=lps(pat); j=0\\n    for i in range(len(text)):\\n        while j>0 and text[i]!=pat[j]: j=l[j-1]\\n        if text[i]==pat[j]: j+=1\\n        if j==len(pat): return i-j+1\\n    return -1",
            javascript: "function kmp(text,pat){\\n    function lps(p){\\n        let l=new Array(p.length).fill(0),j=0;\\n        for(let i=1;i<p.length;i++){\\n            while(j>0 && p[i]!==p[j]) j=l[j-1];\\n            if(p[i]===p[j]) j++;\\n            l[i]=j;\\n        }\\n        return l;\\n    }\\n    let l=lps(pat),j=0;\\n    for(let i=0;i<text.length;i++){\\n        while(j>0 && text[i]!==pat[j]) j=l[j-1];\\n        if(text[i]===pat[j]) j++;\\n        if(j===pat.length) return i-j+1;\\n    }\\n    return -1;\\n}",
            java: "int kmp(String t,String p){\\n    int[] l=new int[p.length()];\\n    for(int i=1,j=0;i<p.length();i++){\\n        while(j>0 && p.charAt(i)!=p.charAt(j)) j=l[j-1];\\n        if(p.charAt(i)==p.charAt(j)) j++;\\n        l[i]=j;\\n    }\\n    for(int i=0,j=0;i<t.length();i++){\\n        while(j>0 && t.charAt(i)!=p.charAt(j)) j=l[j-1];\\n        if(t.charAt(i)==p.charAt(j)) j++;\\n        if(j==p.length()) return i-j+1;\\n    }\\n    return -1;\\n}",
            c: "#include <string.h>\\nint kmp(char* t,char* p){\\n    int n=strlen(t),m=strlen(p),l[m];\\n    for(int i=1,j=0;i<m;i++){\\n        while(j>0 && p[i]!=p[j]) j=l[j-1];\\n        if(p[i]==p[j]) j++;\\n        l[i]=j;\\n    }\\n    for(int i=0,j=0;i<n;i++){\\n        while(j>0 && t[i]!=p[j]) j=l[j-1];\\n        if(t[i]==p[j]) j++;\\n        if(j==m) return i-j+1;\\n    }\\n    return -1;\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nint kmp(string t,string p){\\n    vector<int> l(p.size());\\n    for(int i=1,j=0;i<p.size();i++){\\n        while(j>0 && p[i]!=p[j]) j=l[j-1];\\n        if(p[i]==p[j]) j++;\\n        l[i]=j;\\n    }\\n    for(int i=0,j=0;i<t.size();i++){\\n        while(j>0 && t[i]!=p[j]) j=l[j-1];\\n        if(t[i]==p[j]) j++;\\n        if(j==p.size()) return i-j+1;\\n    }\\n    return -1;\\n}"
        }
    },

    {
        id: "rabin-karp",
        title: "Rabin-Karp Algorithm",
        category: "String",
        difficulty: "Intermediate",
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(1)",
        shortDescription: "Uses hashing for fast substring search.",
        description: "Rabin-Karp uses rolling hash to compare substrings efficiently.\n\nIt is useful when searching multiple patterns or large text datasets.",
        pseudocode: "compute hash of pattern\\nslide window\\ncompare hashes\\nverify on match",
        implementations: {
            python: "def rabin_karp(t,p):\\n    d=256;q=101\\n    m=len(p);n=len(t)\\n    h=pow(d,m-1)%q\\n    ph=th=0\\n    for i in range(m):\\n        ph=(d*ph+ord(p[i]))%q\\n        th=(d*th+ord(t[i]))%q\\n    for i in range(n-m+1):\\n        if ph==th and t[i:i+m]==p: return i\\n        if i<n-m:\\n            th=(d*(th-ord(t[i])*h)+ord(t[i+m]))%q\\n    return -1",
            javascript: "function rabinKarp(t,p){\\n    let d=256,q=101,m=p.length,n=t.length,h=1,ph=0,th=0;\\n    for(let i=0;i<m-1;i++) h=(h*d)%q;\\n    for(let i=0;i<m;i++){ ph=(d*ph+p.charCodeAt(i))%q; th=(d*th+t.charCodeAt(i))%q; }\\n    for(let i=0;i<=n-m;i++){\\n        if(ph===th && t.substr(i,m)===p) return i;\\n        if(i<n-m) th=(d*(th-t.charCodeAt(i)*h)+t.charCodeAt(i+m))%q;\\n    }\\n    return -1;\\n}",
            java: "int rabinKarp(String t,String p){\\n    int d=256,q=101,m=p.length(),n=t.length(),h=1,ph=0,th=0;\\n    for(int i=0;i<m-1;i++) h=(h*d)%q;\\n    for(int i=0;i<m;i++){ ph=(d*ph+p.charAt(i))%q; th=(d*th+t.charAt(i))%q; }\\n    for(int i=0;i<=n-m;i++){\\n        if(ph==th && t.substring(i,i+m).equals(p)) return i;\\n        if(i<n-m) th=(d*(th-t.charAt(i)*h)+t.charAt(i+m))%q;\\n    }\\n    return -1;\\n}",
            c: "#include <string.h>\\nint rabinKarp(char* t,char* p){\\n    int d=256,q=101,m=strlen(p),n=strlen(t),h=1,ph=0,th=0;\\n    for(int i=0;i<m-1;i++) h=(h*d)%q;\\n    for(int i=0;i<m;i++){ ph=(d*ph+p[i])%q; th=(d*th+t[i])%q; }\\n    for(int i=0;i<=n-m;i++){\\n        if(ph==th && strncmp(&t[i],p,m)==0) return i;\\n        if(i<n-m) th=(d*(th-t[i]*h)+t[i+m])%q;\\n    }\\n    return -1;\\n}",
            cpp: "#include <string>\\nusing namespace std;\\nint rabinKarp(string t,string p){\\n    int d=256,q=101,m=p.size(),n=t.size(),h=1,ph=0,th=0;\\n    for(int i=0;i<m-1;i++) h=(h*d)%q;\\n    for(int i=0;i<m;i++){ ph=(d*ph+p[i])%q; th=(d*th+t[i])%q; }\\n    for(int i=0;i<=n-m;i++){\\n        if(ph==th && t.substr(i,m)==p) return i;\\n        if(i<n-m) th=(d*(th-t[i]*h)+t[i+m])%q;\\n    }\\n    return -1;\\n}"
        }
    },

    {
        id: "floyd-warshall",
        title: "Floyd-Warshall Algorithm",
        category: "Graphs",
        difficulty: "Advanced",
        timeComplexity: "O(V^3)",
        spaceComplexity: "O(V^2)",
        shortDescription: "Computes shortest paths between all pairs of nodes.",
        description: "Floyd-Warshall computes shortest paths between every pair of vertices.\n\nIt uses dynamic programming and is ideal for dense graphs or when all-pairs distances are required.",
        pseudocode: "for k in V:\\n for i in V:\\n  for j in V:\\n    dist[i][j]=min(dist[i][j],dist[i][k]+dist[k][j])",
        implementations: {
            python: "def floyd_warshall(dist):\\n    n=len(dist)\\n    for k in range(n):\\n        for i in range(n):\\n            for j in range(n):\\n                dist[i][j]=min(dist[i][j],dist[i][k]+dist[k][j])\\n    return dist",
            javascript: "function floydWarshall(dist){\\n    let n=dist.length;\\n    for(let k=0;k<n;k++)\\n        for(let i=0;i<n;i++)\\n            for(let j=0;j<n;j++)\\n                dist[i][j]=Math.min(dist[i][j],dist[i][k]+dist[k][j]);\\n    return dist;\\n}",
            java: "void floyd(int[][] dist){\\n    int n=dist.length;\\n    for(int k=0;k<n;k++)\\n        for(int i=0;i<n;i++)\\n            for(int j=0;j<n;j++)\\n                dist[i][j]=Math.min(dist[i][j],dist[i][k]+dist[k][j]);\\n}",
            c: "#include <stdio.h>\\nvoid floyd(int n,int dist[][100]){\\n    for(int k=0;k<n;k++)\\n        for(int i=0;i<n;i++)\\n            for(int j=0;j<n;j++)\\n                if(dist[i][j]>dist[i][k]+dist[k][j])\\n                    dist[i][j]=dist[i][k]+dist[k][j];\\n}",
            cpp: "#include <vector>\\nusing namespace std;\\nvoid floyd(vector<vector<int>>& dist){\\n    int n=dist.size();\\n    for(int k=0;k<n;k++)\\n        for(int i=0;i<n;i++)\\n            for(int j=0;j<n;j++)\\n                dist[i][j]=min(dist[i][j],dist[i][k]+dist[k][j]);\\n}"
        }
    }
];