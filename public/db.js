let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    // Check if app is online before reading from database
    if (navigator.onLine) {
        checkDatabase();
    }
};

// If error is found
request.onerror = function(event) {
    console.log("Oh noes! " + event.target.errorCode);
};

// Save new
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
};

// Checks for pending transactions
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    // Gets all transactions with JSON
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                    .then(() => {
                        // Delete records if successful
                        const transaction = db.transaction(["pending"], "readwrite");
                        const store = transaction.objectStore("pending");
                        store.clear();
                })
        }
    }
};

// Listen for app coming back online
window.addEventListener("online", checkDatabase);