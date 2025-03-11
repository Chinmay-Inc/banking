// DOM Elements
const darkModeToggle = document.getElementById('dark-mode-toggle');
const navLinks = document.querySelectorAll('.nav-menu a');
const contentSections = document.querySelectorAll('.content-section');
const accountBalanceElement = document.getElementById('account-balance');
const currentDateElement = document.getElementById('current-date');
const recentTransactionsList = document.getElementById('recent-transactions-list');
const transactionHistoryList = document.getElementById('transaction-history-list');
const transactionTypeFilter = document.getElementById('transaction-type');
const depositForm = document.getElementById('deposit-form');
const withdrawForm = document.getElementById('withdraw-form');
const loanForm = document.getElementById('loan-form');
const quickDepositBtn = document.getElementById('quick-deposit');
const quickWithdrawBtn = document.getElementById('quick-withdraw');
const quickLoanBtn = document.getElementById('quick-loan');
const notificationContainer = document.getElementById('notification-container');
const confirmationModal = document.getElementById('confirmation-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm');
const modalCancelBtn = document.getElementById('modal-cancel');
const closeModalBtn = document.querySelector('.close-modal');

// State Management
let state = {
    darkMode: false,
    balance: 5000.00,
    transactions: []
};

// Initialize the app
function initApp() {
    // Load data from localStorage
    loadState();
    
    // Set current date
    setCurrentDate();
    
    // Update UI with current state
    updateBalance();
    renderRecentTransactions();
    renderTransactionHistory();
    
    // Set up event listeners
    setupEventListeners();
}

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('nknBankState');
    if (savedState) {
        state = JSON.parse(savedState);
        
        // Apply dark mode if it was enabled
        if (state.darkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
    } else {
        // Initialize with some sample transactions if no saved state
        const currentDate = new Date();
        state.transactions = [
            {
                id: 1,
                type: 'deposit',
                amount: 2000.00,
                description: 'Initial deposit',
                date: new Date(currentDate.setDate(currentDate.getDate() - 5)).toISOString(),
                balance: 2000.00
            },
            {
                id: 2,
                type: 'deposit',
                amount: 3500.00,
                description: 'Salary',
                date: new Date(currentDate.setDate(currentDate.getDate() - 2)).toISOString(),
                balance: 5500.00
            },
            {
                id: 3,
                type: 'withdrawal',
                amount: 500.00,
                description: 'Rent payment',
                date: new Date(currentDate.setDate(currentDate.getDate() - 1)).toISOString(),
                balance: 5000.00
            }
        ];
        saveState();
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('nknBankState', JSON.stringify(state));
}

// Set current date
function setCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    currentDateElement.textContent = today;
}

// Update balance display
function updateBalance() {
    accountBalanceElement.textContent = formatCurrency(state.balance);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Render recent transactions (last 5)
function renderRecentTransactions() {
    recentTransactionsList.innerHTML = '';
    
    const recentTransactions = [...state.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if (recentTransactions.length === 0) {
        recentTransactionsList.innerHTML = '<p class="no-transactions">No recent transactions</p>';
        return;
    }
    
    recentTransactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = `transaction-item ${transaction.type}`;
        
        let iconClass = '';
        if (transaction.type === 'deposit') {
            iconClass = 'fa-arrow-down';
        } else if (transaction.type === 'withdrawal') {
            iconClass = 'fa-arrow-up';
        } else if (transaction.type === 'loan') {
            iconClass = 'fa-landmark';
        }
        
        transactionItem.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description || transaction.type}</h4>
                    <p>${formatDate(transaction.date)}</p>
                </div>
            </div>
            <div class="transaction-amount">
                ${transaction.type === 'deposit' || transaction.type === 'loan' ? '+' : '-'} ${formatCurrency(transaction.amount)}
            </div>
        `;
        
        recentTransactionsList.appendChild(transactionItem);
    });
}

// Render transaction history
function renderTransactionHistory(filter = 'all') {
    transactionHistoryList.innerHTML = '';
    
    let filteredTransactions = [...state.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filter);
    }
    
    if (filteredTransactions.length === 0) {
        const noTransactionsRow = document.createElement('tr');
        noTransactionsRow.innerHTML = `
            <td colspan="5" class="no-transactions">No transactions found</td>
        `;
        transactionHistoryList.appendChild(noTransactionsRow);
        return;
    }
    
    filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.className = transaction.type;
        
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
            <td>${transaction.description || '-'}</td>
            <td class="${transaction.type === 'withdrawal' ? 'text-danger' : 'text-success'}">
                ${transaction.type === 'deposit' || transaction.type === 'loan' ? '+' : '-'} ${formatCurrency(transaction.amount)}
            </td>
            <td>${formatCurrency(transaction.balance)}</td>
        `;
        
        transactionHistoryList.appendChild(row);
    });
}

// Add a new transaction
function addTransaction(type, amount, description = '') {
    const newBalance = type === 'deposit' || type === 'loan' 
        ? state.balance + amount 
        : state.balance - amount;
    
    const newTransaction = {
        id: state.transactions.length + 1,
        type,
        amount,
        description,
        date: new Date().toISOString(),
        balance: newBalance
    };
    
    state.transactions.push(newTransaction);
    state.balance = newBalance;
    
    updateBalance();
    renderRecentTransactions();
    renderTransactionHistory(transactionTypeFilter.value);
    saveState();
    
    return newTransaction;
}

// Handle deposit submission
function handleDeposit(e) {
    e.preventDefault();
    
    const amountInput = document.getElementById('deposit-amount');
    const descriptionInput = document.getElementById('deposit-description');
    
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    
    if (isNaN(amount) || amount <= 0) {
        showNotification('Invalid amount', 'Please enter a valid amount greater than zero.', 'error');
        return;
    }
    
    const transaction = addTransaction('deposit', amount, description);
    
    showNotification('Deposit Successful', `$${amount.toFixed(2)} has been added to your account.`, 'success');
    
    // Reset form
    amountInput.value = '';
    descriptionInput.value = '';
}

// Handle withdrawal submission
function handleWithdrawal(e) {
    e.preventDefault();
    
    const amountInput = document.getElementById('withdraw-amount');
    const descriptionInput = document.getElementById('withdraw-description');
    
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    
    if (isNaN(amount) || amount <= 0) {
        showNotification('Invalid amount', 'Please enter a valid amount greater than zero.', 'error');
        return;
    }
    
    if (amount > state.balance) {
        showNotification('Insufficient Funds', 'You do not have enough funds to complete this withdrawal.', 'error');
        return;
    }
    
    // Show confirmation modal
    showConfirmationModal(
        'Confirm Withdrawal',
        `Are you sure you want to withdraw ${formatCurrency(amount)}?`,
        () => {
            const transaction = addTransaction('withdrawal', amount, description);
            showNotification('Withdrawal Successful', `${formatCurrency(amount)} has been withdrawn from your account.`, 'success');
            
            // Reset form
            amountInput.value = '';
            descriptionInput.value = '';
        }
    );
}

// Handle loan application
function handleLoanApplication(e) {
    e.preventDefault();
    
    const amountInput = document.getElementById('loan-amount');
    const purposeSelect = document.getElementById('loan-purpose');
    const durationInput = document.getElementById('loan-duration');
    const descriptionInput = document.getElementById('loan-description');
    
    const amount = parseFloat(amountInput.value);
    const purpose = purposeSelect.value;
    const duration = parseInt(durationInput.value);
    const description = descriptionInput.value.trim();
    
    if (isNaN(amount) || amount < 1000) {
        showNotification('Invalid amount', 'Please enter a valid amount of at least $1,000.', 'error');
        return;
    }
    
    if (!purpose) {
        showNotification('Missing information', 'Please select a purpose for your loan.', 'error');
        return;
    }
    
    if (isNaN(duration) || duration < 6 || duration > 60) {
        showNotification('Invalid duration', 'Loan duration must be between 6 and 60 months.', 'error');
        return;
    }
    
    // Show confirmation modal
    showConfirmationModal(
        'Confirm Loan Application',
        `Are you sure you want to apply for a ${formatCurrency(amount)} loan for ${purpose.toLowerCase()} purposes over ${duration} months?`,
        () => {
            // In a real app, this would be sent to a server for processing
            // For demo purposes, we'll just add it as a transaction
            const fullDescription = `Loan for ${purpose}${description ? ': ' + description : ''}`;
            const transaction = addTransaction('loan', amount, fullDescription);
            
            showNotification('Loan Application Submitted', 'Your loan application has been submitted successfully and funds have been added to your account.', 'success');
            
            // Reset form
            amountInput.value = '';
            purposeSelect.value = '';
            durationInput.value = '12';
            descriptionInput.value = '';
        }
    );
}

// Show notification
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') {
        iconClass = 'fa-check-circle';
    } else if (type === 'error') {
        iconClass = 'fa-exclamation-circle';
    } else if (type === 'warning') {
        iconClass = 'fa-exclamation-triangle';
    }
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="notification-message">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show confirmation modal
function showConfirmationModal(title, message, onConfirm) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Set up confirm button
    modalConfirmBtn.onclick = () => {
        onConfirm();
        hideModal();
    };
    
    // Show modal
    confirmationModal.classList.add('active');
}

// Hide modal
function hideModal() {
    confirmationModal.classList.remove('active');
}

// Set up event listeners
function setupEventListeners() {
    // Dark mode toggle
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        state.darkMode = darkModeToggle.checked;
        saveState();
    });
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the target section id from the href
            const targetId = link.getAttribute('href').substring(1);
            
            // Hide all sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the target section
            document.getElementById(targetId).classList.add('active');
            
            // Update active nav link
            navLinks.forEach(navLink => {
                navLink.parentElement.classList.remove('active');
            });
            link.parentElement.classList.add('active');
        });
    });
    
    // Quick action buttons
    quickDepositBtn.addEventListener('click', () => {
        // Navigate to deposit section
        document.querySelector('a[href="#deposit"]').click();
    });
    
    quickWithdrawBtn.addEventListener('click', () => {
        // Navigate to withdraw section
        document.querySelector('a[href="#withdraw"]').click();
    });
    
    quickLoanBtn.addEventListener('click', () => {
        // Navigate to loan section
        document.querySelector('a[href="#loan"]').click();
    });
    
    // Form submissions
    depositForm.addEventListener('submit', handleDeposit);
    withdrawForm.addEventListener('submit', handleWithdrawal);
    loanForm.addEventListener('submit', handleLoanApplication);
    
    // Transaction filter
    transactionTypeFilter.addEventListener('change', () => {
        renderTransactionHistory(transactionTypeFilter.value);
    });
    
    // Modal close buttons
    modalCancelBtn.addEventListener('click', hideModal);
    closeModalBtn.addEventListener('click', hideModal);
    
    // Close modal when clicking outside
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            hideModal();
        }
    });
    
    // Add mobile menu toggle for responsive design
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(mobileMenuToggle);
    
    mobileMenuToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 