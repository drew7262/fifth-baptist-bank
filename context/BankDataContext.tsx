
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState, useRef } from 'react';
import { User, Account, Transaction, AccountType, ScheduledPayment, BankDatabase, GlobalBanner, ChatMessage, UserEvent, UserEventType, AdminUser, UserAlert } from '../types';
import { generateId } from '../utils/helpers';

type BankAction =
  | { type: 'TRANSFER_FUNDS'; payload: { fromAccountId: string; toAccountId: string; amount: number; userId: string; } }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'UPDATE_ACCOUNT_NICKNAME'; payload: { userId: string; accountId: string; nickname: string } }
  | { type: 'ADD_TRANSACTION_TO_ACCOUNT', payload: { userId: string, accountId: string, transaction: Omit<Transaction, 'id' | 'balance'> } }
  | { type: 'GENERATE_TRANSACTION_HISTORY', payload: { userId: string, accountId: string, newTransactions: Transaction[] }}
  | { type: 'SCHEDULE_BILL_PAYMENT', payload: { userId: string, payment: ScheduledPayment }}
  | { type: 'SET_DATABASE', payload: BankDatabase }
  | { type: 'SET_BANNER', payload: GlobalBanner }
  | { type: 'SEND_CHAT_MESSAGE', payload: { userId: string, message: ChatMessage } }
  | { type: 'LOCK_USER'; payload: { userId: string, reason: string } }
  | { type: 'UNLOCK_USER'; payload: { userId: string } }
  | { type: 'TOGGLE_CREDIT_APPLICATION'; payload: { userId: string; canApply: boolean } }
  | { type: 'PROCESS_CREDIT_APPLICATION'; payload: { userId: string; event: UserEvent, newAccount: Account | null } }
  | { type: 'LOG_USER_EVENT', payload: { userId: string, event: UserEvent } }
  | { type: 'TOGGLE_DEBIT_CARD_LOCK', payload: { userId: string, isLocked: boolean, event: UserEvent }}
  | { type: 'ORDER_NEW_CARD', payload: { userId: string, event: UserEvent }}
  | { type: 'APPROVE_ACCOUNT', payload: { userId: string, accountId: string }}
  | { type: 'DENY_ACCOUNT', payload: { userId: string, accountId: string }}
  | { type: 'ADD_ADMIN'; payload: AdminUser }
  | { type: 'UPDATE_ADMIN'; payload: AdminUser }
  | { type: 'DELETE_ADMIN'; payload: string };


interface BankDataContextType {
  database: BankDatabase;
  dispatch: React.Dispatch<BankAction>;
  loading: boolean;
}

const BankDataContext = createContext<BankDataContextType | undefined>(undefined);

const bankReducer = (state: BankDatabase, action: BankAction): BankDatabase => {
  switch (action.type) {
    case 'TRANSFER_FUNDS': {
        const { fromAccountId, toAccountId, amount, userId } = action.payload;
        const newUsers = state.users.map(user => {
            if (user.id === userId) {
                const fromAcc = user.accounts.find(a => a.id === fromAccountId);
                const toAcc = user.accounts.find(a => a.id === toAccountId);
                
                if (!fromAcc || !toAcc) return user;

                const newAccounts = user.accounts.map(acc => {
                    if (acc.id === fromAccountId) {
                        const newBalance = acc.balance - amount;
                        const description = `Transfer to ${toAcc.nickname || toAcc.type} (...${toAcc.accountNumber.slice(-4)})`;
                        const newTransaction: Transaction = {
                            id: generateId(),
                            date: new Date().toISOString().split('T')[0],
                            description: description,
                            amount: -amount,
                            type: 'debit',
                            balance: newBalance,
                        };
                        return { ...acc, balance: newBalance, transactions: [newTransaction, ...acc.transactions] };
                    }
                    if (acc.id === toAccountId) {
                        const newBalance = acc.balance + amount;
                         const description = acc.type === AccountType.CREDIT_CARD
                            ? `Payment from ${fromAcc.nickname || fromAcc.type} (...${fromAcc.accountNumber.slice(-4)})`
                            : `Transfer from ${fromAcc.nickname || fromAcc.type} (...${fromAcc.accountNumber.slice(-4)})`;

                        const newTransaction: Transaction = {
                            id: generateId(),
                            date: new Date().toISOString().split('T')[0],
                            description: description,
                            amount: amount,
                            type: 'credit',
                            balance: newBalance,
                        };
                        return { ...acc, balance: newBalance, transactions: [newTransaction, ...acc.transactions] };
                    }
                    return acc;
                });
                return { ...user, accounts: newAccounts };
            }
            return user;
        });
        return { ...state, users: newUsers };
    }
    case 'ADD_USER':
        return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
        const updatedUsers = state.users.map(user => user.id === action.payload.id ? action.payload : user);
        return { ...state, users: updatedUsers };
    case 'DELETE_USER':
        const filteredUsers = state.users.filter(user => user.id !== action.payload);
        return { ...state, users: filteredUsers };
    case 'UPDATE_ACCOUNT_NICKNAME': {
        const { userId, accountId, nickname } = action.payload;
        const newUsers = state.users.map(user => {
            if (user.id === userId) {
                const updatedAccounts = user.accounts.map(account => {
                    if (account.id === accountId) {
                        return { ...account, nickname };
                    }
                    return account;
                });
                return { ...user, accounts: updatedAccounts };
            }
            return user;
        });
        return { ...state, users: newUsers };
    }
    case 'ADD_TRANSACTION_TO_ACCOUNT': {
        const { userId, accountId, transaction } = action.payload;
        const newUsers = state.users.map(user => {
            if (user.id === userId) {
                const newAccounts = user.accounts.map(acc => {
                    if (acc.id === accountId) {
                        const amount = transaction.type === 'credit' ? transaction.amount : -transaction.amount;
                        const newBalance = acc.balance + amount;
                        const newTransaction: Transaction = {
                            ...transaction,
                            id: generateId(),
                            amount: amount,
                            balance: newBalance,
                        };
                        return { ...acc, balance: newBalance, transactions: [newTransaction, ...acc.transactions] };
                    }
                    return acc;
                });
                return { ...user, accounts: newAccounts };
            }
            return user;
        });
        return { ...state, users: newUsers };
    }
    case 'GENERATE_TRANSACTION_HISTORY': {
        const { userId, accountId, newTransactions } = action.payload;
        const newUsers = state.users.map(user => {
            if (user.id === userId) {
                const newAccounts = user.accounts.map(acc => {
                    if (acc.id === accountId) {
                        const allTransactions = [...newTransactions, ...acc.transactions]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        return { ...acc, transactions: allTransactions };
                    }
                    return acc;
                });
                return { ...user, accounts: newAccounts };
            }
            return user;
        });
        return { ...state, users: newUsers };
    }
     case 'SCHEDULE_BILL_PAYMENT': {
        const { userId, payment } = action.payload;
        const newUsers = state.users.map(user => {
            if (user.id === userId) {
                const scheduledPayments = [...(user.scheduledPayments || []), payment];
                return { ...user, scheduledPayments };
            }
            return user;
        });
        return { ...state, users: newUsers };
    }
     case 'SEND_CHAT_MESSAGE': {
        const { userId, message } = action.payload;
        const newUsers = state.users.map(user => {
            if (user.id === userId) {
                const newChat = {
                    messages: [...(user.chat?.messages || []), message]
                };
                return { ...user, chat: newChat };
            }
            return user;
        });
        return { ...state, users: newUsers };
    }
    case 'LOCK_USER': {
        const { userId, reason } = action.payload;
        const newUsers = state.users.map(user => 
            user.id === userId ? { ...user, isLocked: true, lockoutReason: reason } : user
        );
        return { ...state, users: newUsers };
    }
    case 'UNLOCK_USER': {
        const { userId } = action.payload;
        const newUsers = state.users.map(user => 
            user.id === userId ? { ...user, isLocked: false, lockoutReason: '' } : user
        );
        return { ...state, users: newUsers };
    }
    case 'TOGGLE_CREDIT_APPLICATION': {
        const { userId, canApply } = action.payload;
        const newUsers = state.users.map(user =>
            user.id === userId ? { ...user, canApplyForCredit: canApply } : user
        );
        return { ...state, users: newUsers };
    }
    case 'PROCESS_CREDIT_APPLICATION': {
        const { userId, event, newAccount } = action.payload;
        const newUsers = state.users.map(user => {
            if (user.id === userId) {
                const updatedUser = { ...user, canApplyForCredit: false };
                updatedUser.history = [...updatedUser.history, event];
                if (newAccount) {
                    updatedUser.accounts = [...updatedUser.accounts, newAccount];
                }
                return updatedUser;
            }
            return user;
        });
        return { ...state, users: newUsers };
    }
    case 'LOG_USER_EVENT': {
        const { userId, event } = action.payload;
        const newUsers = state.users.map(user => 
            user.id === userId ? { ...user, history: [...user.history, event] } : user
        );
        return { ...state, users: newUsers };
    }
    case 'TOGGLE_DEBIT_CARD_LOCK': {
        const { userId, isLocked, event } = action.payload;
        const newUsers = state.users.map(user =>
            user.id === userId ? { ...user, isDebitCardLocked: isLocked, history: [...user.history, event] } : user
        );
        return { ...state, users: newUsers };
    }
    case 'ORDER_NEW_CARD': {
        const { userId, event } = action.payload;
        const newUsers = state.users.map(user =>
            user.id === userId ? { ...user, history: [...user.history, event] } : user
        );
        return { ...state, users: newUsers };
    }
    case 'APPROVE_ACCOUNT': {
        const { userId, accountId } = action.payload;
        const newUsers = state.users.map(user => {
            if (user.id === userId) {
                let approvedAccount: Account | undefined;
                const updatedAccounts = user.accounts.map(account => {
                    if (account.id === accountId) {
                        approvedAccount = { ...account, status: 'active' as 'active' };
                        return approvedAccount;
                    }
                    return account;
                });

                if (!approvedAccount) return user;

                const approvalEvent: UserEvent = {
                    id: generateId(),
                    timestamp: new Date().toISOString(),
                    type: UserEventType.ACCOUNT_REVIEWED_APPROVED,
                    details: { accountId, approvedBy: 'admin' }
                };

                let message = '';
                if (approvedAccount.type === AccountType.CREDIT_CARD) {
                    message = `Congratulations! Your new ${approvedAccount.type} has been approved with an interest rate of ${approvedAccount.interestRate}%. Your card will arrive in 7-10 business days.`;
                } else {
                    message = `Congratulations! Your new ${approvedAccount.type} account (...${approvedAccount.accountNumber.slice(-4)}) has been approved and is now active.`;
                }

                const notification: UserAlert = {
                    id: generateId(),
                    date: new Date().toLocaleDateString(),
                    message: message,
                    read: false
                };
                
                const updatedAlerts = [...(user.alerts || []), notification];

                return { ...user, accounts: updatedAccounts, history: [...user.history, approvalEvent], alerts: updatedAlerts };
            }
            return user;
        });
        return { ...state, users: newUsers };
    }
    case 'DENY_ACCOUNT': {
        const { userId, accountId } = action.payload;
        const newUsers = state.users.map(user => {
            if (user.id === userId) {
                const updatedAccounts = user.accounts.filter(account => account.id !== accountId);

                const denialEvent: UserEvent = {
                    id: generateId(),
                    timestamp: new Date().toISOString(),
                    type: UserEventType.ACCOUNT_REVIEWED_DENIED,
                    details: { accountId, deniedBy: 'admin' }
                };

                return { ...user, accounts: updatedAccounts, history: [...user.history, denialEvent] };
            }
            return user;
        });
        return { ...state, users: newUsers };
    }
    case 'ADD_ADMIN':
        return { ...state, admins: [...state.admins, action.payload] };
    case 'UPDATE_ADMIN':
        return { ...state, admins: state.admins.map(admin => admin.id === action.payload.id ? action.payload : admin) };
    case 'DELETE_ADMIN':
        return { ...state, admins: state.admins.filter(admin => admin.id !== action.payload) };
    case 'SET_BANNER':
        return { ...state, globalBanner: action.payload };
    case 'SET_DATABASE':
        return action.payload;
    default:
      return state;
  }
};

export const BankDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [database, dispatch] = useReducer(bankReducer, { users: [], admins: [], globalBanner: { message: '', isVisible: false }});
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);
  const databaseRef = useRef(database);

  useEffect(() => {
    databaseRef.current = database;
  }, [database]);

  // Effect to fetch initial data from the server
  useEffect(() => {
    const fetchDatabase = async () => {
      try {
        const response = await fetch('/api/database');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        dispatch({ type: 'SET_DATABASE', payload: data });
      } catch (error) {
        console.error("Failed to fetch database:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatabase();
  }, []);
  
  // Effect to save data to the server on any change
  useEffect(() => {
    if (loading || isInitialMount.current || (database.users.length === 0 && database.admins.length === 0)) {
        isInitialMount.current = false;
        return;
    }

    const saveDatabase = async () => {
      try {
        await fetch('/api/database', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(database),
        });
      } catch (error) {
        console.error("Failed to save database:", error);
      }
    };
    
    const timeoutId = setTimeout(saveDatabase, 500);
    return () => clearTimeout(timeoutId);

  }, [database, loading]);

  // Effect for polling to get real-time updates
  useEffect(() => {
    if (loading) return;
    
    const POLL_INTERVAL = 3000;
    const intervalId = setInterval(async () => {
        try {
            const response = await fetch('/api/database');

            if (!response.ok) {
                // Silently ignore 503, as it's an expected status when the DB is being written to.
                if (response.status === 503) return;
                // For other errors, throw to be logged by the catch block.
                throw new Error(`Poll failed with status: ${response.status}`);
            }
            
            // Prevent SyntaxError on empty response body, which can happen during file writes.
            const text = await response.text();
            if (!text) {
                return; // Skip this polling cycle if the response is empty.
            }

            const data: BankDatabase = JSON.parse(text);

            // Only update state if the fetched data is different from the current state
            if (JSON.stringify(data) !== JSON.stringify(databaseRef.current)) {
                dispatch({ type: 'SET_DATABASE', payload: data });
            }
        } catch (error) {
            console.error("Polling error:", error);
        }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [loading]);

  return (
    <BankDataContext.Provider value={{ database, dispatch, loading }}>
      {children}
    </BankDataContext.Provider>
  );
};

export const useBankData = (): BankDataContextType => {
  const context = useContext(BankDataContext);
  if (context === undefined) {
    throw new Error('useBankData must be used within a BankDataProvider');
  }
  return context;
};