export const DSA_DATA: Algorithm[] = [

{
    id: "bubble-sort",
    title: "Bubble Sort",
    category: "Sorting",
    difficulty: "Beginner",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    shortDescription: "Repeatedly swaps adjacent elements to push larger values to the end.",
    description: "Bubble Sort repeatedly compares adjacent elements and swaps them if they are in the wrong order. After each pass, the largest unsorted element moves to its correct position.\n\nIt is simple but inefficient, making it useful mainly for educational purposes and very small datasets.",
    pseudocode: "for i from 0 to n-1:\\n    for j from 0 to n-i-2:\\n        if arr[j] > arr[j+1]:\\n            swap(arr[j], arr[j+1])",
    implementations: {
        python: "def bubble_sort(arr):\\n    n=len(arr)\\n    for i in range(n):\\n        for j in range(0,n-i-1):\\n            if arr[j]>arr[j+1]:\\n                arr[j],arr[j+1]=arr[j+1],arr[j]\\n    return arr",
        javascript: "function bubbleSort(arr){\\n    let n=arr.length;\\n    for(let i=0;i<n;i++){\\n        for(let j=0;j<n-i-1;j++){\\n            if(arr[j]>arr[j+1]){\\n                [arr[j],arr[j+1]]=[arr[j+1],arr[j]];\\n            }\\n        }\\n    }\\n    return arr;\\n}",
        java: "public static void bubbleSort(int[] arr){\\n    int n=arr.length;\\n    for(int i=0;i<n;i++){\\n        for(int j=0;j<n-i-1;j++){\\n            if(arr[j]>arr[j+1]){\\n                int t=arr[j];arr[j]=arr[j+1];arr[j+1]=t;\\n            }\\n        }\\n    }\\n}",
        c: "#include <stdio.h>\\nvoid bubbleSort(int arr[],int n){\\n    for(int i=0;i<n;i++)\\n        for(int j=0;j<n-i-1;j++)\\n            if(arr[j]>arr[j+1]){\\n                int t=arr[j];arr[j]=arr[j+1];arr[j+1]=t;\\n            }\\n}",
        cpp: "#include <vector>\\nusing namespace std;\\nvoid bubbleSort(vector<int>& arr){\\n    int n=arr.size();\\n    for(int i=0;i<n;i++)\\n        for(int j=0;j<n-i-1;j++)\\n            if(arr[j]>arr[j+1]) swap(arr[j],arr[j+1]);\\n}"
    }
},

{
    id: "selection-sort",
    title: "Selection Sort",
    category: "Sorting",
    difficulty: "Beginner",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    shortDescription: "Selects the smallest element and places it correctly.",
    description: "Selection Sort divides the array into sorted and unsorted parts. It repeatedly selects the smallest element from the unsorted portion and swaps it with the first unsorted element.\n\nIt minimizes swaps but still has quadratic time complexity.",
    pseudocode: "for i from 0 to n-1:\\n    min = i\\n    for j from i+1 to n-1:\\n        if arr[j] < arr[min]:\\n            min = j\\n    swap(arr[i], arr[min])",
    implementations: {
        python: "def selection_sort(arr):\\n    n=len(arr)\\n    for i in range(n):\\n        m=i\\n        for j in range(i+1,n):\\n            if arr[j]<arr[m]: m=j\\n        arr[i],arr[m]=arr[m],arr[i]\\n    return arr",
        javascript: "function selectionSort(arr){\\n    let n=arr.length;\\n    for(let i=0;i<n;i++){\\n        let m=i;\\n        for(let j=i+1;j<n;j++) if(arr[j]<arr[m]) m=j;\\n        [arr[i],arr[m]]=[arr[m],arr[i]];\\n    }\\n    return arr;\\n}",
        java: "public static void selectionSort(int[] arr){\\n    int n=arr.length;\\n    for(int i=0;i<n;i++){\\n        int m=i;\\n        for(int j=i+1;j<n;j++) if(arr[j]<arr[m]) m=j;\\n        int t=arr[i];arr[i]=arr[m];arr[m]=t;\\n    }\\n}",
        c: "#include <stdio.h>\\nvoid selectionSort(int arr[],int n){\\n    for(int i=0;i<n;i++){\\n        int m=i;\\n        for(int j=i+1;j<n;j++) if(arr[j]<arr[m]) m=j;\\n        int t=arr[i];arr[i]=arr[m];arr[m]=t;\\n    }\\n}",
        cpp: "#include <vector>\\nusing namespace std;\\nvoid selectionSort(vector<int>& arr){\\n    int n=arr.size();\\n    for(int i=0;i<n;i++){\\n        int m=i;\\n        for(int j=i+1;j<n;j++) if(arr[j]<arr[m]) m=j;\\n        swap(arr[i],arr[m]);\\n    }\\n}"
    }
},

{
    id: "insertion-sort",
    title: "Insertion Sort",
    category: "Sorting",
    difficulty: "Beginner",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    shortDescription: "Builds sorted array one element at a time.",
    description: "Insertion Sort builds the sorted array incrementally by inserting each element into its correct position.\n\nIt is efficient for small or nearly sorted datasets and is stable.",
    pseudocode: "for i from 1 to n-1:\\n    key = arr[i]\\n    j = i-1\\n    while j>=0 and arr[j]>key:\\n        arr[j+1]=arr[j]\\n        j--\\n    arr[j+1]=key",
    implementations: {
        python: "def insertion_sort(arr):\\n    for i in range(1,len(arr)):\\n        key=arr[i];j=i-1\\n        while j>=0 and arr[j]>key:\\n            arr[j+1]=arr[j];j-=1\\n        arr[j+1]=key\\n    return arr",
        javascript: "function insertionSort(arr){\\n    for(let i=1;i<arr.length;i++){\\n        let key=arr[i],j=i-1;\\n        while(j>=0 && arr[j]>key){arr[j+1]=arr[j];j--;}\\n        arr[j+1]=key;\\n    }\\n    return arr;\\n}",
        java: "public static void insertionSort(int[] arr){\\n    for(int i=1;i<arr.length;i++){\\n        int key=arr[i],j=i-1;\\n        while(j>=0 && arr[j]>key){arr[j+1]=arr[j];j--;}\\n        arr[j+1]=key;\\n    }\\n}",
        c: "#include <stdio.h>\\nvoid insertionSort(int arr[],int n){\\n    for(int i=1;i<n;i++){\\n        int key=arr[i],j=i-1;\\n        while(j>=0 && arr[j]>key){arr[j+1]=arr[j];j--;}\\n        arr[j+1]=key;\\n    }\\n}",
        cpp: "#include <vector>\\nusing namespace std;\\nvoid insertionSort(vector<int>& arr){\\n    for(int i=1;i<arr.size();i++){\\n        int key=arr[i],j=i-1;\\n        while(j>=0 && arr[j]>key){arr[j+1]=arr[j];j--;}\\n        arr[j+1]=key;\\n    }\\n}"
    }
},

{
    id: "merge-sort",
    title: "Merge Sort",
    category: "Sorting",
    difficulty: "Intermediate",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    shortDescription: "Divide and conquer sorting algorithm.",
    description: "Merge Sort recursively divides the array into halves, sorts each half, and merges them.\n\nIt guarantees O(n log n) performance and is stable but uses extra memory.",
    pseudocode: "divide array into halves\\nrecursively sort both halves\\nmerge sorted halves",
    implementations: {
        python: "def merge_sort(arr):\\n    if len(arr)<=1: return arr\\n    mid=len(arr)//2\\n    left=merge_sort(arr[:mid])\\n    right=merge_sort(arr[mid:])\\n    return merge(left,right)\\ndef merge(l,r):\\n    res=[];i=j=0\\n    while i<len(l) and j<len(r):\\n        if l[i]<r[j]:res.append(l[i]);i+=1\\n        else:res.append(r[j]);j+=1\\n    return res+l[i:]+r[j:]",
        javascript: "function mergeSort(arr){\\n    if(arr.length<=1) return arr;\\n    let mid=Math.floor(arr.length/2);\\n    let left=mergeSort(arr.slice(0,mid));\\n    let right=mergeSort(arr.slice(mid));\\n    return merge(left,right);\\n}\\nfunction merge(l,r){\\n    let res=[],i=0,j=0;\\n    while(i<l.length && j<r.length){\\n        if(l[i]<r[j]) res.push(l[i++]);\\n        else res.push(r[j++]);\\n    }\\n    return res.concat(l.slice(i)).concat(r.slice(j));\\n}",
        java: "public static int[] mergeSort(int[] arr){\\n    if(arr.length<=1) return arr;\\n    int mid=arr.length/2;\\n    int[] left=mergeSort(java.util.Arrays.copyOfRange(arr,0,mid));\\n    int[] right=mergeSort(java.util.Arrays.copyOfRange(arr,mid,arr.length));\\n    return merge(left,right);\\n}",
        c: "/* Merge sort in C omitted for brevity */",
        cpp: "/* Merge sort in C++ omitted for brevity */"
    }
},

{
    id: "quick-sort",
    title: "Quick Sort",
    category: "Sorting",
    difficulty: "Intermediate",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(log n)",
    shortDescription: "Uses pivot partitioning.",
    description: "Quick Sort selects a pivot and partitions elements into smaller and larger groups.\n\nIt is highly efficient in practice but has worst-case O(n²).",
    pseudocode: "choose pivot\\npartition array\\nrecursively sort partitions",
    implementations: {
        python: "def quick_sort(arr):\\n    if len(arr)<=1: return arr\\n    pivot=arr[len(arr)//2]\\n    left=[x for x in arr if x<pivot]\\n    mid=[x for x in arr if x==pivot]\\n    right=[x for x in arr if x>pivot]\\n    return quick_sort(left)+mid+quick_sort(right)",
        javascript: "function quickSort(arr){\\n    if(arr.length<=1) return arr;\\n    let pivot=arr[Math.floor(arr.length/2)];\\n    let left=arr.filter(x=>x<pivot);\\n    let mid=arr.filter(x=>x===pivot);\\n    let right=arr.filter(x=>x>pivot);\\n    return [...quickSort(left),...mid,...quickSort(right)];\\n}",
        java: "/* Quick sort Java omitted */",
        c: "/* Quick sort C omitted */",
        cpp: "/* Quick sort C++ omitted */"
    }
}

];