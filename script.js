// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {

    // --- Get all our HTML elements ---
    const opSelect = document.getElementById('operationSelect');
    const runButton = document.getElementById('runButton');
    const outputArea = document.getElementById('outputArea');
    
    // List-based controls
    const listControls = document.getElementById('listAlgoControls');
    const mainInput = document.getElementById('mainInput');
    const mainInputLabel = document.getElementById('mainInputLabel');
    const targetDiv = document.getElementById('targetDiv');
    const targetInput = document.getElementById('targetInput');

    // Queue-based controls
    const queueControls = document.getElementById('queueControls');
    const queueInput = document.getElementById('queueInput');
    const enqueueButton = document.getElementById('enqueueButton');
    const dequeueButton = document.getElementById('dequeueButton');
    const queueVisualizer = document.getElementById('queueVisualizer');

    // --- State for the Queue (from queue_logic_implemented.cpp) ---
    const Q_SIZE = 5; // Your size
    let queueState = {
        arr: new Array(Q_SIZE).fill(null), // The array
        front: -1,
        rear: -1,
        n: Q_SIZE,
        count: 0 // --- This is the easiest way to track a circular queue ---
    };

    // --- Handle changing the operation ---
    opSelect.addEventListener('change', function() {
        const selected = opSelect.value;
        
        // Hide everything by default
        listControls.classList.add('hidden');
        queueControls.classList.add('hidden');
        queueVisualizer.classList.add('hidden');
        outputArea.textContent = 'Your result will appear here.'; // Reset output

        if (selected === 'binary') {
            listControls.classList.remove('hidden');
            targetDiv.classList.remove('hidden');
            mainInputLabel.textContent = "Enter SORTED list (e.g., 1, 3, 5, 7, 9)";
        } else if (selected === 'reverse') {
            listControls.classList.remove('hidden');
            targetDiv.classList.add('hidden');
            mainInputLabel.textContent = "Enter a name or text to reverse";
            mainInput.placeholder = "Alishba Ikram";
        } else if (selected === 'queue') {
            // Show queue controls
            queueControls.classList.remove('hidden');
            queueVisualizer.classList.remove('hidden');
            resetQueue(); // Start with a fresh queue
        } else {
            // Default for Bubble/Selection
            listControls.classList.remove('hidden');
            targetDiv.classList.add('hidden');
            mainInputLabel.textContent = "Enter values (e.g., 5, 2, 9, 1)";
            mainInput.placeholder = "5, 2, 9, 1";
        }
    });
    
    // --- Trigger default state for Bubble Sort ---
    opSelect.dispatchEvent(new Event('change'));

    // --- Handle clicking the "Run" button (for list algos) ---
    runButton.addEventListener('click', function() {
        const operation = opSelect.value;
        const inputText = mainInput.value;

        switch (operation) {
            case 'bubble':
                let arrBubble = parseStringToArray(inputText);
                outputArea.textContent = `Original: [${arrBubble.join(', ')}]\n`;
                let sortedBubble = bubbleSort(arrBubble);
                outputArea.textContent += `Sorted:   [${sortedBubble.join(', ')}]`;
                break;
            case 'selection':
                let arrSelection = parseStringToArray(inputText);
                outputArea.textContent = `Original: [${arrSelection.join(', ')}]\n`;
                let sortedSelection = selectionSort(arrSelection);
                outputArea.textContent += `Sorted:   [${sortedSelection.join(', ')}]`;
                break;
            case 'reverse':
                outputArea.textContent = `Original: ${inputText}\n`;
                let reversedText = reverseStringWithStack(inputText);
                outputArea.textContent += `Reversed: ${reversedText}`;
                break;
            case 'binary':
                let arrBinary = parseStringToArray(inputText);
                let target = parseInt(targetInput.value);
                if (isNaN(target)) {
                    outputArea.textContent = "Error: Target value is not a number.";
                    break;
                }
                outputArea.textContent = `Searching for ${target} in [${arrBinary.join(', ')}]...\n`;
                let index = binarySearch(arrBinary, target);
                if (index !== -1) {
                    outputArea.textContent += `Success! Found ${target} at index ${index}.`;
                } else {
                    outputArea.textContent += `Not found. ${target} is not in the list.`;
                }
                break;
        }
    });

    // --- Helper function to get numbers from the input box ---
    function parseStringToArray(text) {
        return text.split(',')
                   .map(s => parseInt(s.trim()))
                   .filter(num => !isNaN(num));
    }

    // --- ALGORITHMS (Translated from your files) ---
    // (Bubble, Selection, Reverse, Binary Search functions are unchanged)
    // 1. From Bubble_sort.cpp
    function bubbleSort(arr) {
        let n = arr.length;
        let temp;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }

    // 2. From selection_sort.cpp
    function selectionSort(arr) {
        let n = arr.length;
        let loc, temp, min;
        for (let i = 0; i < n - 1; i++) {
            min = arr[i];
            loc = i;
            for (let j = i + 1; j < n; j++) {
                if (arr[j] < min) {
                    min = arr[j];
                    loc = j;
                }
            }
            if (loc !== i) {
                temp = arr[i];
                arr[i] = arr[loc];
                arr[loc] = temp;
            }
        }
        return arr;
    }

    // 3. From Reverse_name.cpp
    function reverseStringWithStack(str) {
        let stack = [];
        for (let i = 0; i < str.length; i++) {
            stack.push(str[i]);
        }
        let reversedStr = "";
        while (stack.length > 0) {
            reversedStr += stack.pop();
        }
        return reversedStr;
    }

    // 4. From binary_search.py
    function binarySearch(arr, k) {
        let lo = 0;
        let hi = arr.length - 1;
        while (lo <= hi) {
            let mid = lo + Math.floor((hi - lo) / 2);
            if (arr[mid] === k) return mid;
            else if (arr[mid] < k) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
    
    // --- CORRECTED CIRCULAR QUEUE LOGIC ---
    
    function resetQueue() {
        queueState.arr.fill(null);
        queueState.front = -1;
        queueState.rear = -1;
        queueState.count = 0; // Reset count
        outputArea.textContent = "Queue has been reset.";
        updateQueueVisualizer();
    }
    
    function jsEnqueue(x) {
        //         // Check if full
        if (queueState.count === queueState.n) {
            outputArea.textContent = "Queue is full! Cannot enqueue.";
            return; // Don't do anything
        }
        
        // Handle first element
        if (queueState.front === -1) {
            queueState.front = 0;
            queueState.rear = 0;
        } else {
            // Increment rear with wrap-around
            queueState.rear = (queueState.rear + 1) % queueState.n;
        }
        
        // Insert element
        queueState.arr[queueState.rear] = x;
        queueState.count++; // Increment count
        outputArea.textContent = `${x} enqueued to queue.`;
        
        updateQueueVisualizer();
    }
    
    function jsDequeue() {
        //         // Check if empty
        if (queueState.count === 0) {
            outputArea.textContent = "Queue is empty! Cannot dequeue.";
            return; // Don't do anything
        }
        
        // Get value from front
        let z = queueState.arr[queueState.front];
        queueState.arr[queueState.front] = null; // Clear the dequeued value
        queueState.count--; // Decrement count
        
        outputArea.textContent = `Dequeued value is: ${z}`;
        
        // Check if that was the last element
        if (queueState.count === 0) {
            queueState.front = -1;
            queueState.rear = -1;
        } else {
            // Increment front with wrap-around
            queueState.front = (queueState.front + 1) % queueState.n;
        }
        
        updateQueueVisualizer();
    }
    
    // This function is correct from last time
    function updateQueueVisualizer() {
        let q = queueState;
        let n = q.n;
        
        let arrString = "Array: [";
        let frontPointer = "       "; // 7 spaces for "Array: "
        let rearPointer = "        "; // 8 spaces for "Array: [ "

        // --- Pass 1: Build Array String & Pointers ---
        for (let i = 0; i < n; i++) {
            let val = (q.arr[i] === null || q.arr[i] === undefined) ? "__" : q.arr[i].toString();
            let padding = (val.length === 1) ? " " : ""; // Padding for single digits
            
            arrString += ` ${val}${padding}`;
            if (i < n - 1) arrString += ",";
            
            let space = " ".repeat(val.length + padding.length + 2); // " 5, " -> 4 spaces
            
            if (i === q.front) {
                frontPointer += "F";
            } else {
                frontPointer += " ".repeat(space.length);
            }
            
            if (i === q.rear) {
                rearPointer += "R";
            } else {
                rearPointer += " ".repeat(space.length);
            }
        }
        arrString += " ]";
        
        // --- Pass 2: Combine everything ---
        let pointers = "";
        // Only show pointers if queue is not empty
        if (queueState.count > 0) {
            pointers = `\n${frontPointer}(Front)\n${rearPointer}(Rear)`;
        }
        
        queueVisualizer.textContent = arrString + pointers;
    }
    
    // --- NEW QUEUE BUTTON LISTENERS ---
    
    enqueueButton.addEventListener('click', function() {
        const val = parseInt(queueInput.value);
        if (!isNaN(val)) {
            jsEnqueue(val);
            queueInput.value = ""; // Clear input box
        } else {
            outputArea.textContent = "Please enter a valid number to enqueue.";
        }
    });
    
    dequeueButton.addEventListener('click', function() {
        jsDequeue();
    });

});