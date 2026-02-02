
import { Account, Transaction } from "../types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const generateAccountNumber = (): string => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// --- Transaction History Generation Logic ---

const merchants = {
    bigBox: ["Walmart", "Target", "Costco", "Home Depot"],
    grocery: ["Kroger", "Safeway", "Whole Foods", "Trader Joe's", "Local Grocer"],
    online: ["Amazon.com", "eBay", "Etsy Marketplace", "Netflix", "Spotify"],
    food: ["Starbucks", "McDonald's", "Chipotle", "The Grand Bistro", "Local Cafe"],
    gas: ["Shell", "Chevron", "BP Gas", "Speedway"],
    utilities: ["City Power & Light", "Anytown Water Dept.", "Comcast"],
};

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateTransactionHistory = (currentAccount: Account, years: number): Transaction[] => {
    const newTransactions: Transaction[] = [];
    const startDate = currentAccount.transactions.length > 0
        ? new Date(currentAccount.transactions[currentAccount.transactions.length - 1].date)
        : new Date();

    let runningBalance = currentAccount.transactions.length > 0 
        ? currentAccount.transactions[currentAccount.transactions.length - 1].balance
        : currentAccount.balance;
    
    // Reverse logic: we need the balance BEFORE the last transaction
    if (currentAccount.transactions.length > 0) {
      const lastTx = currentAccount.transactions[currentAccount.transactions.length - 1];
      runningBalance = runningBalance - lastTx.amount;
    }


    for (let i = 0; i < years * 12; i++) { // Loop through months
        const date = new Date(startDate);
        date.setMonth(date.getMonth() - (i + 1));

        // Add one payroll deposit per month
        const payrollAmount = 3500 + (Math.random() * 500 - 250); // a little variation
        runningBalance -= payrollAmount;
        newTransactions.unshift({
            id: generateId(),
            date: new Date(date.getFullYear(), date.getMonth(), 15).toISOString().split('T')[0],
            description: "Payroll Deposit - Acme Corp",
            amount: payrollAmount,
            type: 'credit',
            balance: runningBalance + payrollAmount,
        });

        // Add 5-15 random debit transactions
        const numTransactions = Math.floor(Math.random() * 11) + 5;
        for (let j = 0; j < numTransactions; j++) {
            const dayOfMonth = Math.floor(Math.random() * 28) + 1;
            const transactionDate = new Date(date.getFullYear(), date.getMonth(), dayOfMonth);

            const merchantCategory = getRandomElement(Object.keys(merchants)) as keyof typeof merchants;
            const description = getRandomElement(merchants[merchantCategory]);
            
            let amount;
            if (merchantCategory === 'bigBox' || merchantCategory === 'online') {
                amount = -(Math.random() * 200 + 20);
            } else if (merchantCategory === 'utilities') {
                 amount = -(Math.random() * 100 + 50);
            } else {
                amount = -(Math.random() * 75 + 5);
            }
            amount = parseFloat(amount.toFixed(2));
            
            runningBalance -= amount; // Amount is negative, so this adds to balance

            newTransactions.unshift({
                id: generateId(),
                date: transactionDate.toISOString().split('T')[0],
                description: `Purchase - ${description}`,
                amount: amount,
                type: 'debit',
                balance: runningBalance + amount
            });
        }
    }

    return newTransactions;
};