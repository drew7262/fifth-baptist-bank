
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBankData } from '../context/BankDataContext';
import { Account, Transaction, User, AccountType, PendingTransaction, UserAlert, ScheduledPayment, UserEvent, UserEventType } from '../types';
import { formatCurrency, generateId, generateAccountNumber } from '../utils/helpers';
import { DollarSignIcon, CreditCardIcon, CheckCircleIcon, AlertTriangleIcon, HomeIcon, EditIcon, MortgageIcon, BellIcon, BuildingBankIcon, CalendarIcon, FileTextIcon, ArrowRightIcon } from '../components/icons';
import Modal from '../components/Modal';
import ChatWidget from '../components/ChatWidget';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- Reusable Components for Dashboard ---

const AccountCard: React.FC<{ account: Account; onViewDetails: () => void; }> = ({ account, onViewDetails }) => {
    const isPending = account.status === 'pending_review';

    const getAccountDetails = () => {
        switch(account.type) {
            case AccountType.CREDIT_CARD:
                const used = Math.abs(account.balance);
                const limit = account.creditLimit || 0;
                return <p className="text-xs text-gray-400 mt-2">{formatCurrency(used)} / {formatCurrency(limit)} used</p>
            case AccountType.MORTGAGE:
                const remaining = Math.abs(account.balance);
                const total = account.loanAmount || 0;
                 return <p className="text-xs text-gray-400 mt-2">{formatCurrency(remaining)} of {formatCurrency(total)} remaining</p>
            default:
                return null;
        }
    }
    
    const displayBalance = account.type === AccountType.CREDIT_CARD ? Math.abs(account.balance) : account.balance;

    return (
    <div 
        onClick={!isPending ? onViewDetails : undefined}
        className={`relative p-6 rounded-xl border bg-slate-800/50  transition-all duration-300 ${isPending ? 'border-yellow-500/30 opacity-60 cursor-not-allowed' : 'border-slate-700 hover:border-slate-600 cursor-pointer'}`}
    >
        {isPending && <div className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full font-semibold">Pending Review</div>}
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-gray-400 pr-8">{account.nickname || account.type}</p>
                 <p className="text-xs text-gray-500">...{account.accountNumber.slice(-4)}</p>
                <p className="text-2xl font-bold text-white mt-2">{formatCurrency(displayBalance)}</p>
            </div>
            {account.type === AccountType.CHECKING && <DollarSignIcon className="w-8 h-8 text-cyan-400 flex-shrink-0" />}
            {account.type === AccountType.SAVINGS && <HomeIcon className="w-8 h-8 text-green-400 flex-shrink-0" />}
            {account.type === AccountType.CREDIT_CARD && <CreditCardIcon className="w-8 h-8 text-purple-400 flex-shrink-0" />}
            {account.type === AccountType.MORTGAGE && <MortgageIcon className="w-8 h-8 text-orange-400 flex-shrink-0" />}
        </div>
        {getAccountDetails()}
    </div>
)};

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
    <tr className="border-b border-slate-800 last:border-b-0">
        <td className="py-3 px-4 text-sm text-gray-300">{transaction.date}</td>
        <td className="py-3 px-4 text-white">{transaction.description}</td>
        <td className={`py-3 px-4 text-right font-medium ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(transaction.amount)}
        </td>
        <td className="py-3 px-4 text-right text-gray-400">{formatCurrency(transaction.balance)}</td>
    </tr>
);

const PendingTransactionRow: React.FC<{ transaction: PendingTransaction }> = ({ transaction }) => (
    <tr className="border-b border-slate-800">
        <td className="py-3 px-4 text-sm text-gray-300">{transaction.date}</td>
        <td className="py-3 px-4 text-white">{transaction.description}</td>
        <td className="py-3 px-4 text-right font-medium text-green-400">{formatCurrency(transaction.amount)}</td>
        <td className="py-3 px-4 text-right text-yellow-400">{transaction.status}</td>
    </tr>
);


const TransferFunds: React.FC<{ user: User }> = ({ user }) => {
    const { dispatch } = useBankData();
    
    // Define source and destination accounts separately for clarity
    const transferSourceAccounts = user.accounts.filter(a => a.type === AccountType.CHECKING || a.type === AccountType.SAVINGS);
    const transferDestinationAccounts = user.accounts.filter(a => a.type !== AccountType.MORTGAGE && a.status !== 'pending_review');

    const [fromAccount, setFromAccount] = useState(transferSourceAccounts[0]?.id || '');
    const [toAccount, setToAccount] = useState(transferDestinationAccounts.find(a => a.id !== fromAccount)?.id || '');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setStatus('loading');
        
        const transferAmount = parseFloat(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            setError('Please enter a valid amount.');
            setStatus('error');
            return;
        }

        if (fromAccount === toAccount) {
             setError('Cannot transfer to the same account.');
            setStatus('error');
            return;
        }

        const sourceAccount = user.accounts.find(acc => acc.id === fromAccount);
        if (!sourceAccount || sourceAccount.balance < transferAmount) {
            setError('Insufficient funds for this transfer.');
            setStatus('error');
            return;
        }

        setTimeout(() => {
            dispatch({
                type: 'TRANSFER_FUNDS',
                payload: { fromAccountId: fromAccount, toAccountId: toAccount, amount: transferAmount, userId: user.id }
            });
            setStatus('success');
            setAmount('');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Transfer Funds</h3>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="fromAccount" className="text-sm font-medium text-gray-400">From</label>
                        <select id="fromAccount" value={fromAccount} onChange={e => setFromAccount(e.target.value)} className="mt-1 w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                           {transferSourceAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.type} (...{acc.accountNumber.slice(-4)})</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="toAccount" className="text-sm font-medium text-gray-400">To</label>
                        <select id="toAccount" value={toAccount} onChange={e => setToAccount(e.target.value)} className="mt-1 w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                           {transferDestinationAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.type} (...{acc.accountNumber.slice(-4)})</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="amount" className="text-sm font-medium text-gray-400">Amount</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-400">$</span>
                            </div>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 pl-7 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>
                </div>
                 <div className="mt-6">
                    <button type="submit" disabled={status === 'loading'} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-lg transition-all disabled:bg-slate-600 disabled:cursor-not-allowed">
                        {status === 'loading' ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mx-auto"></div> : 'Confirm Transfer'}
                    </button>
                </div>
                {status === 'success' && <div className="mt-4 text-green-400 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Transfer successful!</div>}
                {status === 'error' && <div className="mt-4 text-red-400 flex items-center gap-2"><AlertTriangleIcon className="w-5 h-5"/> {error}</div>}
            </form>
        </div>
    )
};

const QuickActions: React.FC<{onAction: (action: string) => void}> = ({ onAction }) => (
     <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onAction('Pay Bills')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                <CalendarIcon className="w-6 h-6 text-cyan-400" />
                <span className="text-sm text-white">Pay Bills</span>
            </button>
             <button onClick={() => onAction('Deposit Check')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                <CreditCardIcon className="w-6 h-6 text-green-400" />
                <span className="text-sm text-white">Deposit Check</span>
            </button>
             <button onClick={() => onAction('View Statements')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                <BuildingBankIcon className="w-6 h-6 text-purple-400" />
                <span className="text-sm text-white">Statements</span>
            </button>
             <button onClick={() => onAction('Contact Support')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                <HomeIcon className="w-6 h-6 text-orange-400" />
                <span className="text-sm text-white">Support</span>
            </button>
        </div>
    </div>
);


const AccountDetailsModal: React.FC<{ account: Account; user: User; onClose: () => void; onEditNickname: () => void; }> = ({ account, user, onClose, onEditNickname }) => {
    
    const generateStatementPDF = () => {
        const doc = new jsPDF();
        const today = new Date();
        const statementPeriod = `${new Date(today.setMonth(today.getMonth() - 1)).toLocaleDateString()} - ${new Date().toLocaleDateString()}`;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 150, 200);
        doc.text("Fifth Baptist Bank", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("123 Banking Way, Anytown, USA", 14, 30);
        
        // User Info
        doc.setFontSize(12);
        doc.text("Account Statement", 14, 45);
        doc.setFontSize(10);
        doc.text(user.name, 14, 52);
        doc.text(user.address, 14, 57);

        // Account Summary
        const lastMonthTransactions = account.transactions.filter(tx => new Date(tx.date) > new Date(new Date().setMonth(new Date().getMonth() - 1)));
        const deposits = lastMonthTransactions.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0);
        const withdrawals = lastMonthTransactions.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + tx.amount, 0);
        const startBalance = account.balance - (deposits + withdrawals);

        (doc as any).autoTable({
            startY: 65,
            head: [['Account Summary']],
            body: [
                ['Account Type', `${account.nickname || account.type} (...${account.accountNumber.slice(-4)})`],
                ['Statement Period', statementPeriod],
                ['Beginning Balance', formatCurrency(startBalance)],
                ['Total Deposits', formatCurrency(deposits)],
                ['Total Withdrawals', formatCurrency(withdrawals)],
                ['Ending Balance', { content: formatCurrency(account.balance), styles: { fontStyle: 'bold' } }],
            ],
            theme: 'striped',
            headStyles: { fillColor: [40, 150, 200] }
        });

        // Transaction Details
        (doc as any).autoTable({
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Date', 'Description', 'Amount', 'Balance']],
            body: account.transactions.map(tx => [tx.date, tx.description, formatCurrency(tx.amount), formatCurrency(tx.balance)]),
            theme: 'grid',
            headStyles: { fillColor: [40, 150, 200] }
        });

        doc.save(`${(account.nickname || account.type).replace(' ', '-')}-statement-${new Date().toISOString().split('T')[0]}.pdf`);
    };
    
    const displayBalance = account.type === AccountType.CREDIT_CARD ? Math.abs(account.balance) : account.balance;

    return (
        <Modal isOpen={!!account} onClose={onClose} title={account.nickname || account.type} maxWidth="max-w-3xl">
            <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">Current Balance</p>
                        <button onClick={onEditNickname} className="text-xs flex items-center gap-1 text-cyan-400 hover:underline"><EditIcon className="w-3 h-3"/> Edit Nickname</button>
                    </div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(displayBalance)}</p>
                </div>
                
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                        <p className="text-gray-400 text-xs">Account Number</p>
                        <p className="text-white font-mono">{account.accountNumber}</p>
                    </div>
                    {account.routingNumber && <div className="bg-slate-900/50 p-3 rounded-lg">
                        <p className="text-gray-400 text-xs">Routing Number</p>
                        <p className="text-white font-mono">{account.routingNumber}</p>
                    </div>}
                </div>

                {account.type === AccountType.CREDIT_CARD && <div className="grid grid-cols-3 gap-4 text-sm text-center">
                    <div className="bg-slate-900/50 p-3 rounded-lg"><p className="text-gray-400 text-xs">Credit Limit</p><p className="text-white">{formatCurrency(account.creditLimit || 0)}</p></div>
                    <div className="bg-slate-900/50 p-3 rounded-lg"><p className="text-gray-400 text-xs">Available</p><p className="text-white">{formatCurrency((account.creditLimit || 0) + account.balance)}</p></div>
                    <div className="bg-slate-900/50 p-3 rounded-lg"><p className="text-gray-400 text-xs">APR</p><p className="text-white">{account.interestRate}%</p></div>
                </div>}
                
                {account.type === AccountType.MORTGAGE && <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-slate-900/50 p-3 rounded-lg"><p className="text-gray-400 text-xs">Original Loan</p><p className="text-white">{formatCurrency(account.loanAmount || 0)}</p></div>
                     <div className="bg-slate-900/50 p-3 rounded-lg"><p className="text-gray-400 text-xs">Interest Rate</p><p className="text-white">{account.interestRate}%</p></div>
                     <div className="bg-slate-900/50 p-3 rounded-lg"><p className="text-gray-400 text-xs">Loan Start Date</p><p className="text-white">{account.loanStartDate}</p></div>
                     <div className="bg-slate-900/50 p-3 rounded-lg"><p className="text-gray-400 text-xs">Est. Payoff</p><p className="text-white">{account.estimatedPayoffDate}</p></div>
                </div>}

                <div>
                    <h4 className="text-lg font-bold text-white mb-2">Transaction History</h4>
                    <div className="max-h-96 overflow-y-auto border border-slate-700 rounded-lg">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-slate-800/95 backdrop-blur-sm">
                                <tr>
                                    <th className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                                    <th className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                                    <th className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {account.transactions && account.transactions.length > 0 ? (
                                    account.transactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)
                                ) : (
                                    <tr><td colSpan={4} className="text-center p-8 text-gray-400">No transactions found for this account.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 mt-4">
                     <button onClick={generateStatementPDF} className="flex items-center gap-2 text-sm bg-purple-600/80 hover:bg-purple-500/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        <FileTextIcon className="w-4 h-4" />
                        Generate Statement
                    </button>
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

const NotificationsDropdown: React.FC<{alerts: UserAlert[]}> = ({ alerts }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = alerts.filter(a => !a.read).length;

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-400 hover:text-white">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                    <div className="p-3 font-bold text-white border-b border-slate-700">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                        {alerts.map(alert => (
                            <div key={alert.id} className={`p-3 border-b border-slate-700/50 ${!alert.read ? 'bg-cyan-500/10' : ''}`}>
                                <p className="text-sm text-gray-300">{alert.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{alert.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const BillPayModal: React.FC<{user: User, onClose: () => void}> = ({ user, onClose }) => {
    const { dispatch } = useBankData();
    const [fromAccount, setFromAccount] = useState(user.accounts.find(a => a.type !== AccountType.MORTGAGE)?.id || '');
    const [payee, setPayee] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState<'idle' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payment: ScheduledPayment = {
            id: generateId(),
            payee,
            amount: parseFloat(amount),
            date,
            fromAccountId: fromAccount
        };
        dispatch({ type: 'SCHEDULE_BILL_PAYMENT', payload: { userId: user.id, payment }});
        setStatus('success');
        setTimeout(() => {
            onClose();
        }, 2000);
    }

    if (status === 'success') {
        return (
            <div className="text-center py-8">
                <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Payment Scheduled!</h3>
                <p className="text-gray-400">Your payment of {formatCurrency(parseFloat(amount))} to {payee} has been scheduled for {date}.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="fromAccount" className="text-sm font-medium text-gray-400">Pay From</label>
                <select id="fromAccount" value={fromAccount} onChange={e => setFromAccount(e.target.value)} className="mt-1 w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    {user.accounts.filter(a => a.type !== AccountType.MORTGAGE).map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.type} (...{acc.accountNumber.slice(-4)}) - {formatCurrency(acc.balance)}</option>)}
                </select>
            </div>
            <input value={payee} onChange={e => setPayee(e.target.value)} placeholder="Payee Name (e.g., City Power)" className="w-full bg-slate-700 p-2 rounded text-white" required />
            <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="w-full bg-slate-700 p-2 rounded text-white" required />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-700 p-2 rounded text-white" required />
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded">Schedule Payment</button>
            </div>
        </form>
    )
}

const CreditApplicationModal: React.FC<{ user: User, onClose: () => void }> = ({ user, onClose }) => {
    const { dispatch } = useBankData();
    const [formData, setFormData] = useState({
        fullName: user.name,
        dob: '',
        maritalStatus: '',
        ssn: '',
        monthlyHousing: '',
        yearlyIncome: '',
        requestedLimit: '',
    });
    const [status, setStatus] = useState<'form' | 'processing' | 'approved' | 'denied'>('form');
    const [approvedLimit, setApprovedLimit] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('processing');
        
        // Log submission event first
        const submissionEvent: UserEvent = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            type: UserEventType.CREDIT_APP_SUBMITTED,
            details: { ...formData }
        };
        dispatch({ type: 'LOG_USER_EVENT', payload: { userId: user.id, event: submissionEvent }});


        const income = parseFloat(formData.yearlyIncome);
        const requestedLimit = parseFloat(formData.requestedLimit);
        
        const totalBalance = user.accounts
            .filter(acc => acc.type === AccountType.CHECKING || acc.type === AccountType.SAVINGS)
            .reduce((sum, acc) => sum + acc.balance, 0);

        setTimeout(() => {
            if (totalBalance < 2000) {
                const denialEvent: UserEvent = { id: generateId(), timestamp: new Date().toISOString(), type: UserEventType.CREDIT_APP_DENIED, details: { reason: "Insufficient balance." } };
                dispatch({ type: 'PROCESS_CREDIT_APPLICATION', payload: { userId: user.id, event: denialEvent, newAccount: null } });
                setStatus('denied');
                return;
            }

            const maxApprovableLimit = Math.min(50000, Math.floor(income * 0.2));
            const finalLimit = Math.min(requestedLimit, maxApprovableLimit);

            if (finalLimit < 100) { // Minimum possible limit is $100
                const denialEvent: UserEvent = { id: generateId(), timestamp: new Date().toISOString(), type: UserEventType.CREDIT_APP_DENIED, details: { reason: "Approved limit below minimum threshold.", calculatedLimit: finalLimit } };
                dispatch({ type: 'PROCESS_CREDIT_APPLICATION', payload: { userId: user.id, event: denialEvent, newAccount: null } });
                setStatus('denied');
                return;
            }

            const newCreditAccount: Account = {
                id: generateId(),
                type: AccountType.CREDIT_CARD,
                nickname: "Platinum Rewards",
                accountNumber: `4401${generateAccountNumber().slice(4)}`,
                balance: 0,
                creditLimit: finalLimit,
                interestRate: 19.99,
                transactions: [],
                status: 'pending_review',
            };
            
            const approvalEvent: UserEvent = { id: generateId(), timestamp: new Date().toISOString(), type: UserEventType.CREDIT_APP_APPROVED, details: { approvedLimit: finalLimit } };
            dispatch({
                type: 'PROCESS_CREDIT_APPLICATION',
                payload: { userId: user.id, event: approvalEvent, newAccount: newCreditAccount }
            });
            
            setApprovedLimit(finalLimit);
            setStatus('approved');
        }, 7000); // 7-second wait time
    };
    
    if (status === 'processing') {
        return (
             <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-white">Processing Application...</h3>
                <p className="text-gray-400">We're reviewing your information. This will only take a moment.</p>
            </div>
        );
    }
    
    if (status === 'approved') {
        return (
            <div className="text-center py-8">
                <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">Application Approved!</h3>
                <p className="text-gray-300 mt-2">Your new credit card application with a limit of <span className="font-bold text-cyan-400">{formatCurrency(approvedLimit)}</span> is now pending final review.</p>
                <p className="text-gray-400 text-sm">You will see the new account on your dashboard, and it will be activated within 24-48 hours.</p>
                <button onClick={onClose} className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-6 rounded">Return to Dashboard</button>
            </div>
        );
    }
    
    if (status === 'denied') {
        return (
            <div className="text-center py-8">
                <AlertTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">Application Under Review</h3>
                <p className="text-gray-300 mt-2">After careful consideration, we are unable to approve your application for a new line of credit at this time.</p>
                <p className="text-gray-400 text-sm mt-4">We appreciate your interest in Fifth Baptist Bank.</p>
                <button onClick={onClose} className="mt-6 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded">Close</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <p className="text-sm text-gray-400 mb-4">Please confirm your information and complete the fields below to apply.</p>
            
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-400">Full Name</label>
                    <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 w-full bg-slate-700 p-2 rounded text-white" required />
                </div>
                <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-400">Date of Birth</label>
                    <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} className="mt-1 w-full bg-slate-700 p-2 rounded text-white" required />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-400">Marital Status</label>
                    <select name="maritalStatus" id="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="mt-1 w-full bg-slate-700 p-2 rounded text-white" required>
                        <option value="">Select...</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="ssn" className="block text-sm font-medium text-gray-400">Social Security Number</label>
                    <input type="text" name="ssn" id="ssn" value={formData.ssn} onChange={handleChange} placeholder="XXX-XX-XXXX" className="mt-1 w-full bg-slate-700 p-2 rounded text-white" required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="monthlyHousing" className="block text-sm font-medium text-gray-400">Monthly Housing Payment</label>
                    <input type="number" name="monthlyHousing" id="monthlyHousing" value={formData.monthlyHousing} onChange={handleChange} placeholder="e.g., 1500" className="mt-1 w-full bg-slate-700 p-2 rounded text-white" required />
                </div>
                 <div>
                    <label htmlFor="yearlyIncome" className="block text-sm font-medium text-gray-400">Total Annual Income</label>
                    <input type="number" name="yearlyIncome" id="yearlyIncome" value={formData.yearlyIncome} onChange={handleChange} placeholder="e.g., 75000" className="mt-1 w-full bg-slate-700 p-2 rounded text-white" required />
                </div>
            </div>

            <div>
                <label htmlFor="requestedLimit" className="block text-sm font-medium text-gray-400">Requested Credit Limit</label>
                <input type="number" name="requestedLimit" id="requestedLimit" value={formData.requestedLimit} onChange={handleChange} placeholder="e.g., 10000" className="mt-1 w-full bg-slate-700 p-2 rounded text-white" required />
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded">Submit Application</button>
            </div>
        </form>
    )
}

const CardServices: React.FC<{ user: User }> = ({ user }) => {
    const { dispatch } = useBankData();
    const [orderStatus, setOrderStatus] = useState<'idle'|'success'>('idle');

    const handleLockToggle = () => {
        const newLockState = !user.isDebitCardLocked;
        const event: UserEvent = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            type: newLockState ? UserEventType.DEBIT_CARD_LOCKED : UserEventType.DEBIT_CARD_UNLOCKED,
            details: {}
        };
        dispatch({ type: 'TOGGLE_DEBIT_CARD_LOCK', payload: { userId: user.id, isLocked: newLockState, event } });
    };

    const handleOrderCard = () => {
        if (window.confirm("Are you sure you want to order a new debit card? Your current card will be deactivated.")) {
            const event: UserEvent = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                type: UserEventType.DEBIT_CARD_ORDERED,
                details: { shippingAddress: user.address }
            };
            dispatch({ type: 'ORDER_NEW_CARD', payload: { userId: user.id, event } });
            setOrderStatus('success');
            setTimeout(() => setOrderStatus('idle'), 4000);
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Card Services</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                    <div>
                        <p className="font-medium text-white">Debit Card ...{user.accounts.find(a => a.type === AccountType.CHECKING)?.accountNumber.slice(-4)}</p>
                        <p className={`text-sm ${user.isDebitCardLocked ? 'text-yellow-400' : 'text-green-400'}`}>
                            {user.isDebitCardLocked ? 'Locked' : 'Active'}
                        </p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={user.isDebitCardLocked} onChange={handleLockToggle} className="sr-only peer"/>
                        <div className="relative w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                </div>
                <div>
                     {orderStatus === 'success' ? (
                        <div className="text-green-400 text-center text-sm p-3 bg-green-500/10 rounded-lg">
                            New card ordered successfully.
                        </div>
                    ) : (
                        <button onClick={handleOrderCard} className="w-full text-sm bg-purple-600/80 hover:bg-purple-500/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            Order a New Card
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Dashboard Page Component ---

const CustomerDashboardPage: React.FC = () => {
    const { user: authUser } = useAuth();
    const { database, dispatch } = useBankData();
    
    const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
    const [isBillPayModalOpen, setIsBillPayModalOpen] = useState(false);
    const [isApplyCreditModalOpen, setIsApplyCreditModalOpen] = useState(false);


    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [newNickname, setNewNickname] = useState('');

    const currentUser = useMemo(() => 
        database.users.find(u => u.customerId === authUser?.customerId),
        [database.users, authUser]
    );
    
    const allPendingTransactions = useMemo(() => {
        if (!currentUser) return [];
        return currentUser.accounts.flatMap(acc => acc.pendingTransactions || []);
    }, [currentUser]);

    const handleOpenNicknameModal = () => {
        if (!selectedAccount) return;
        setNewNickname(selectedAccount.nickname || '');
        setIsNicknameModalOpen(true);
    };

    const handleSaveNickname = () => {
        if (!selectedAccount || !currentUser) return;
        dispatch({
            type: 'UPDATE_ACCOUNT_NICKNAME',
            payload: { userId: currentUser.id, accountId: selectedAccount.id, nickname: newNickname.trim() }
        });
        setSelectedAccount(prev => prev ? { ...prev, nickname: newNickname.trim() } : null);
        setIsNicknameModalOpen(false);
    };

    const handleQuickAction = (action: string) => {
        if (action === 'Pay Bills') {
            setIsBillPayModalOpen(true);
        } else {
            setIsFeatureModalOpen(true);
        }
    }
    
    if (!currentUser) {
        return <div className="text-center py-20 text-xl">Loading customer data...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {currentUser.name}</h1>
                    <p className="text-gray-400">Here's a summary of your accounts.</p>
                </div>
                <NotificationsDropdown alerts={currentUser.alerts || []} />
            </div>
            
            {currentUser.canApplyForCredit && (
                 <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-xl mb-8 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-white text-xl">You're pre-approved for our Platinum Rewards credit card!</h3>
                        <p className="text-blue-100 text-sm">Get an instant decision with no impact on your credit score.</p>
                    </div>
                    <button onClick={() => setIsApplyCreditModalOpen(true)} className="group flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-slate-900 font-bold py-2 px-4 rounded-lg transition-transform duration-300 hover:scale-105">
                        Apply Now
                        <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentUser.accounts.map(acc => (
                    <AccountCard 
                        key={acc.id} 
                        account={acc} 
                        onViewDetails={() => setSelectedAccount(acc)}
                    />
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {allPendingTransactions.length > 0 && <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl">
                        <div className="p-6 border-b border-slate-700"><h3 className="text-xl font-bold text-white">Pending Transactions</h3></div>
                        <div className="overflow-x-auto"><table className="w-full text-left"><tbody>{allPendingTransactions.map(tx => <PendingTransactionRow key={tx.id} transaction={tx} />)}</tbody></table></div>
                    </div>}

                    {(currentUser.scheduledPayments && currentUser.scheduledPayments.length > 0) && <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl">
                        <div className="p-6 border-b border-slate-700"><h3 className="text-xl font-bold text-white">Scheduled Payments</h3></div>
                        <div className="overflow-x-auto"><table className="w-full text-left">
                            <tbody>{currentUser.scheduledPayments.map(p => {
                                const fromAcc = currentUser.accounts.find(a => a.id === p.fromAccountId);
                                return (<tr key={p.id} className="border-b border-slate-800"><td className="py-3 px-4 text-sm text-gray-300">{p.date}</td><td className="py-3 px-4 text-white">{p.payee}</td><td className="py-3 px-4 text-right font-medium text-red-400">{formatCurrency(-p.amount)}</td><td className="py-3 px-4 text-right text-gray-400">from ...{fromAcc?.accountNumber.slice(-4)}</td></tr>);
                            })}</tbody>
                        </table></div>
                    </div>}
                </div>
                 <div className="space-y-8">
                    <TransferFunds user={currentUser} />
                    <CardServices user={currentUser} />
                    <QuickActions onAction={handleQuickAction} />
                </div>
            </div>
            
            {/* Modals */}
            {selectedAccount && !isNicknameModalOpen && <AccountDetailsModal 
                account={selectedAccount} 
                user={currentUser}
                onClose={() => setSelectedAccount(null)}
                onEditNickname={handleOpenNicknameModal}
            />}

            <Modal isOpen={isNicknameModalOpen} onClose={() => setIsNicknameModalOpen(false)} title="Edit Account Nickname">
                 <div>
                    <label htmlFor="nickname" className="block text-gray-300 text-sm font-bold mb-2">Nickname for ...{selectedAccount?.accountNumber.slice(-4)}</label>
                    <input id="nickname" type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} placeholder="e.g., Vacation Fund"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"/>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsNicknameModalOpen(false)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="button" onClick={handleSaveNickname} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded">Save</button>
                    </div>
                </div>
            </Modal>
            
             <Modal isOpen={isBillPayModalOpen} onClose={() => setIsBillPayModalOpen(false)} title="Schedule a Bill Payment">
                <BillPayModal user={currentUser} onClose={() => setIsBillPayModalOpen(false)} />
             </Modal>

            <Modal isOpen={isApplyCreditModalOpen} onClose={() => setIsApplyCreditModalOpen(false)} title="New Credit Application">
                <CreditApplicationModal user={currentUser} onClose={() => setIsApplyCreditModalOpen(false)} />
            </Modal>

             <Modal isOpen={isFeatureModalOpen} onClose={() => setIsFeatureModalOpen(false)} title="Feature Not Available">
                <p className="text-gray-300">This feature is currently under development and will be available soon. Thank you for your patience.</p>
                 <div className="mt-6 flex justify-end">
                    <button type="button" onClick={() => setIsFeatureModalOpen(false)} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded">OK</button>
                </div>
            </Modal>
            
            <ChatWidget user={currentUser} />
        </div>
    );
};

export default CustomerDashboardPage;
