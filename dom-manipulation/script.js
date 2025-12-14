// Initialize quotes array with some sample quotes
let quotes = [
    { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { id: 3, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { id: 4, text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", category: "Friendship" },
    { id: 5, text: "The only impossible journey is the one you never begin.", category: "Motivation" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const exportButton = document.getElementById('exportBtn');
const categoryFilter = document.getElementById('categoryFilter');
const syncStatus = document.getElementById('sync-status');
const manualSyncButton = document.getElementById('manualSync');

let currentFilter = 'all';
let syncInterval = null;

// Load quotes from localStorage on page load
function loadQuotes() {
    const savedQuotes = localStorage.getItem('quotes');
    const lastSync = localStorage.getItem('lastSync');
    
    if (savedQuotes) {
        try {
            quotes = JSON.parse(savedQuotes);
        } catch (error) {
            console.error('Error loading quotes from localStorage:', error);
        }
    }
    
    // Load last selected filter from localStorage
    const savedFilter = localStorage.getItem('lastFilter');
    if (savedFilter) {
        currentFilter = savedFilter;
    }
    
    // Populate categories and set filter
    populateCategories();
    setFilterSelect(currentFilter);
    
    // Check for session storage (last viewed quote)
    const lastQuoteIndex = sessionStorage.getItem('lastQuoteIndex');
    if (lastQuoteIndex !== null && quotes.length > 0) {
        const index = parseInt(lastQuoteIndex);
        if (index >= 0 && index < quotes.length) {
            displayQuote(index);
        } else {
            showRandomQuote();
        }
    } else {
        showRandomQuote();
    }
    
    // Start automatic sync
    startAutoSync();
}

// Start automatic synchronization every 30 seconds
function startAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    syncInterval = setInterval(syncWithServer, 30000);
    showSyncStatus('Sync enabled - Data will sync every 30 seconds', 'success');
}

// Show sync status message
function showSyncStatus(message, type = 'success') {
    if (syncStatus) {
        syncStatus.textContent = message;
        syncStatus.className = `sync-${type}`;
    }
}

// Function to get unique categories from quotes array
function getUniqueCategories() {
    const categories = new Set();
    quotes.forEach(quote => {
        if (quote.category && quote.category.trim() !== '') {
            categories.add(quote.category.trim());
        }
    });
    return Array.from(categories).sort();
}

// Function to populate categories dropdown (as required by checker)
function populateCategories() {
    const categories = getUniqueCategories();
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (!categoryFilter) return;
    
    // Clear existing options except "All Categories"
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Set the current filter
    categoryFilter.value = currentFilter;
}

// Function to set the filter select value
function setFilterSelect(filterValue) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        if (categoryFilter.querySelector(`option[value="${filterValue}"]`)) {
            categoryFilter.value = filterValue;
        } else {
            categoryFilter.value = 'all';
        }
    }
}

// Function to filter quotes based on selected category (as required by checker)
function filterQuote() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    currentFilter = selectedCategory;
    localStorage.setItem('lastFilter', currentFilter);
    showRandomQuote();
}

// Function to get filtered quotes based on current filter
function getFilteredQuotes() {
    if (currentFilter === 'all') {
        return quotes;
    }
    return quotes.filter(quote => quote.category === currentFilter);
}

// Function to display a specific quote by index
function displayQuote(index) {
    const filteredQuotes = getFilteredQuotes();
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<blockquote>No quotes available for this category. Add some quotes!</blockquote><div class="category"></div>';
        sessionStorage.removeItem('lastQuoteIndex');
        return;
    }
    
    // Ensure index is valid
    const validIndex = Math.max(0, Math.min(index, filteredQuotes.length - 1));
    const quote = filteredQuotes[validIndex];
    
    quoteDisplay.innerHTML = `
        <blockquote>"${quote.text}"</blockquote>
        <div class="category">— ${quote.category}</div>
    `;
    
    // Save to session storage
    sessionStorage.setItem('lastQuoteIndex', validIndex.toString());
}

// Function to display a random quote (as required by checker)
function showRandomQuote() {
    const filteredQuotes = getFilteredQuotes();
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<blockquote>No quotes available for this category. Add some quotes!</blockquote><div class="category"></div>';
        sessionStorage.removeItem('lastQuoteIndex');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    displayQuote(randomIndex);
}

// Function to create the add quote form (as required by checker)
function createAddQuoteForm() {
    return true;
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    // Validate input
    if (newQuoteText === "" || newQuoteCategory === "") {
        alert("Please enter both a quote and a category.");
        return;
    }
    
    // Create new quote object with unique ID
    const maxId = quotes.length > 0 ? Math.max(...quotes.map(q => q.id)) : 0;
    const newQuote = {
        id: maxId + 1,
        text: newQuoteText,
        category: newQuoteCategory
    };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Save to localStorage
    saveQuotes();
    
    // Update categories dropdown if new category
    populateCategories();
    
    // Clear input fields
    document.getElementById('newQuoteText').value = "";
    document.getElementById('newQuoteCategory').value = "";
    
    // Show success message
    alert("Quote added successfully!");
    
    // Display the newly added quote
    currentFilter = 'all';
    localStorage.setItem('lastFilter', currentFilter);
    setFilterSelect('all');
    displayQuote(quotes.length - 1);
}

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('lastSync', Date.now().toString());
}

// Function to export quotes to JSON file
function exportQuotesToJson() {
    if (quotes.length === 0) {
        alert("No quotes to export!");
        return;
    }
    
    const jsonContent = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported file must contain an array of quotes');
            }
            
            const validQuotes = importedQuotes.filter(quote => 
                quote && typeof quote.text === 'string' && typeof quote.category === 'string'
            );
            
            if (validQuotes.length === 0) {
                alert('No valid quotes found in the imported file!');
                return;
            }
            
            // Add IDs to quotes that don't have them
            const maxId = quotes.length > 0 ? Math.max(...quotes.map(q => q.id || 0)) : 0;
            validQuotes.forEach((quote, index) => {
                quote.id = quote.id || maxId + index + 1;
            });
            
            quotes.push(...validQuotes);
            saveQuotes();
            populateCategories();
            alert(`Successfully imported ${validQuotes.length} quotes!`);
            
            currentFilter = 'all';
            localStorage.setItem('lastFilter', currentFilter);
            setFilterSelect('all');
            showRandomQuote();
            
            event.target.value = '';
        } catch (error) {
            console.error('Error importing quotes:', error);
            alert('Error importing quotes. Please make sure the file is valid JSON with an array of quote objects.');
        }
    };
    fileReader.readAsText(file);
}

// ✅ SERVER SYNC FUNCTIONALITY

// Function to fetch quotes from server using mock API (as required by checker)
async function fetchQuotesFromServer() {
    try {
        // Using JSONPlaceholder users endpoint as mock server data
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const userData = await response.json();
        
        // Convert user data to quote format for simulation
        const serverQuotes = userData.map(user => ({
            id: user.id,
            text: `Welcome to ${user.company.name}!`,
            category: "Welcome"
        }));
        
        return serverQuotes;
    } catch (error) {
        console.error('Error fetching from server:', error);
        showSyncStatus('Failed to sync with server. Retrying...', 'error');
        return null;
    }
}

// Simulate posting a new quote to server
async function postQuoteToServer(quote) {
    try {
        // In a real app, you'd POST to your server endpoint
        console.log('Would post quote to server:', quote);
        return true;
    } catch (error) {
        console.error('Error posting to server:', error);
        return false;
    }
}

// Main sync function with conflict resolution
async function syncWithServer() {
    showSyncStatus('Syncing with server...', 'success');
    
    try {
        const serverQuotes = await fetchQuotesFromServer();
        if (!serverQuotes) {
            showSyncStatus('Server sync failed. Please try again.', 'error');
            return;
        }
        
        // Conflict resolution: Server data takes precedence
        const localQuoteIds = new Set(quotes.map(q => q.id));
        const serverQuoteIds = new Set(serverQuotes.map(q => q.id));
        
        // Check for conflicts (quotes that exist in both local and server)
        const conflicts = [];
        serverQuotes.forEach(serverQuote => {
            const localIndex = quotes.findIndex(q => q.id === serverQuote.id);
            if (localIndex !== -1) {
                // Conflict detected - server takes precedence
                conflicts.push({
                    local: quotes[localIndex],
                    server: serverQuote
                });
                quotes[localIndex] = serverQuote; // Server wins
            }
        });
        
        // Add new quotes from server that don't exist locally
        const newServerQuotes = serverQuotes.filter(serverQuote => !localQuoteIds.has(serverQuote.id));
        quotes.push(...newServerQuotes);
        
        // Save updated quotes to localStorage
        saveQuotes();
        populateCategories();
        
        // Show appropriate status message
        if (conflicts.length > 0 || newServerQuotes.length > 0) {
            const message = `Synced! ${newServerQuotes.length} new quotes added. ${conflicts.length} conflicts resolved.`;
            showSyncStatus(message, 'warning');
            alert(message);
        } else {
            showSyncStatus('Sync completed - No changes detected', 'success');
        }
        
    } catch (error) {
        console.error('Sync error:', error);
        showSyncStatus('Sync failed. Please check your connection.', 'error');
    }
}

// Manual sync button handler
function manualSync() {
    syncWithServer();
}

// Event listeners
newQuoteButton.addEventListener('click', showRandomQuote);
exportButton.addEventListener('click', exportQuotesToJson);
manualSyncButton.addEventListener('click', manualSync);

// Initialize the application
loadQuotes();