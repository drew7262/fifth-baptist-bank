
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useBankData } from '../context/BankDataContext';
import { User, Account, AccountType, Transaction, ChatMessage, UserEvent, UserEventType, AdminUser } from '../types';
import Modal from '../components/Modal';
import { EditIcon, TrashIcon, UserPlusIcon, PlusCircleIcon, PlusIcon, MinusIcon, HistoryIcon, CheckCircleIcon, MessageSquareIcon, LockIcon, UnlockIcon, EyeIcon, FileTextIcon, VolumeXIcon, BellIcon } from '../components/icons';
import { generateId, generateAccountNumber, generateTransactionHistory } from '../utils/helpers';
import { formatCurrency } from '../utils/helpers';

const UserForm: React.FC<{ user?: User; onSave: (user: User) => void; onCancel: () => void }> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState<User>(user || {
        id: generateId(),
        customerId: Math.floor(10000000 + Math.random() * 90000000).toString(),
        password: '',
        name: '',
        email: '',
        address: '',
        accounts: [{
            id: generateId(),
            type: AccountType.CHECKING,
            accountNumber: generateAccountNumber(),
            balance: 0,
            transactions: [],
            status: 'active',
        }],
        chat: { messages: [] },
        isLocked: false,
        lockoutReason: '',
        canApplyForCredit: false,
        isDebitCardLocked: false,
        history: [],
    });
    
    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAccountChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newAccounts = [...formData.accounts];
        const field = e.target.name as keyof Account;
        let value: string | number | AccountType = e.target.value;

        if (['balance', 'creditLimit', 'loanAmount', 'interestRate'].includes(field)) {
            value = parseFloat(e.target.value) || 0;
        }

        (newAccounts[index] as any)[field] = value;
        setFormData({ ...formData, accounts: newAccounts });
    };
    
    const addAccount = () => {
        const newAccount: Account = {
            id: generateId(),
            type: AccountType.CHECKING,
            accountNumber: generateAccountNumber(),
            balance: 0,
            transactions: [],
            status: 'active',
        };
        setFormData({ ...formData, accounts: [...formData.accounts, newAccount] });
    };

    const removeAccount = (idToRemove: string) => {
        const newAccounts = formData.accounts.filter((acc) => acc.id !== idToRemove);
        setFormData({ ...formData, accounts: newAccounts });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <h3 className="font-bold text-lg mb-2 text-white">User Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={formData.name} onChange={handleUserChange} placeholder="Full Name" className="bg-slate-700 p-2 rounded text-white w-full" required/>
                    <input name="email" type="email" value={formData.email} onChange={handleUserChange} placeholder="Email Address" className="bg-slate-700 p-2 rounded text-white w-full" required/>
                    <input name="customerId" value={formData.customerId} onChange={handleUserChange} placeholder="Customer ID" className="bg-slate-700 p-2 rounded text-white w-full" required/>
                    <input name="password" value={formData.password} onChange={handleUserChange} placeholder="Password" className="bg-slate-700 p-2 rounded text-white w-full" required/>
                </div>
                <input name="address" value={formData.address} onChange={handleUserChange} placeholder="Address" className="w-full bg-slate-700 p-2 rounded mt-4 text-white" />
            </div>

            <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-white">Accounts</h3>
                    <button type="button" onClick={addAccount} className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
                        <PlusIcon className="w-4 h-4" /> Add Account
                    </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {formData.accounts.map((acc, index) => (
                        <div key={acc.id} className="bg-slate-900/50 p-3 rounded space-y-2">
                            <div className="flex items-center gap-2">
                                <select name="type" value={acc.type} onChange={(e) => handleAccountChange(index, e)} className="bg-slate-700 p-2 rounded text-white w-full">
                                    <option value={AccountType.CHECKING}>Checking</option>
                                    <option value={AccountType.SAVINGS}>Savings</option>
                                    <option value={AccountType.CREDIT_CARD}>Credit Card</option>
                                    <option value={AccountType.MORTGAGE}>Mortgage</option>
                                </select>
                                {formData.accounts.length > 1 && (
                                    <button type="button" onClick={() => removeAccount(acc.id)} className="text-red-500 hover:text-red-400 p-2"><MinusIcon className="w-5 h-5"/></button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input name="accountNumber" value={acc.accountNumber} disabled placeholder="Account Number" className="w-full bg-slate-800 p-2 rounded text-gray-400 cursor-not-allowed" />
                                { (acc.type === AccountType.CHECKING || acc.type === AccountType.SAVINGS || acc.type === AccountType.CREDIT_CARD) &&
                                    <input type="number" step="0.01" name="balance" value={acc.balance} onChange={(e) => handleAccountChange(index, e)} placeholder="Balance" className="w-full bg-slate-700 p-2 rounded text-white" />
                                }
                                { acc.type === AccountType.CREDIT_CARD &&
                                    <input type="number" step="0.01" name="creditLimit" value={acc.creditLimit || ''} onChange={(e) => handleAccountChange(index, e)} placeholder="Credit Limit" className="w-full bg-slate-700 p-2 rounded text-white" />
                                }
                                { (acc.type === AccountType.MORTGAGE || acc.type === AccountType.CREDIT_CARD) &&
                                    <input type="number" step="0.01" name="interestRate" value={acc.interestRate || ''} onChange={(e) => handleAccountChange(index, e)} placeholder="Interest Rate %" className="w-full bg-slate-700 p-2 rounded text-white" />
                                }
                                { acc.type === AccountType.MORTGAGE &&
                                    <input type="number" step="0.01" name="loanAmount" value={acc.loanAmount || ''} onChange={(e) => handleAccountChange(index, e)} placeholder="Original Loan" className="w-full bg-slate-700 p-2 rounded text-white" />
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-700 pt-4">
                <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded">Save User</button>
            </div>
        </form>
    );
};

const TransactionForm: React.FC<{ user: User; onSave: () => void; onCancel: () => void }> = ({ user, onSave, onCancel }) => {
    const { dispatch } = useBankData();
    const [accountId, setAccountId] = useState(user.accounts[0]?.id || '');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'credit' | 'debit'>('credit');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const transactionPayload: Omit<Transaction, 'id' | 'balance'> = {
            date: date,
            description,
            amount: parseFloat(amount),
            type,
        };
        dispatch({
            type: 'ADD_TRANSACTION_TO_ACCOUNT',
            payload: { userId: user.id, accountId, transaction: transactionPayload }
        });
        onSave();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Account</label>
                <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-slate-700 p-2 rounded text-white">
                    {user.accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.nickname || acc.type} (...{acc.accountNumber.slice(-4)})</option>
                    ))}
                </select>
            </div>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full bg-slate-700 p-2 rounded text-white" required />
            <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="w-full bg-slate-700 p-2 rounded text-white" required />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-700 p-2 rounded text-white" required />
            </div>
             <div className="grid grid-cols-1">
                 <select value={type} onChange={e => setType(e.target.value as 'credit' | 'debit')} className="w-full bg-slate-700 p-2 rounded text-white">
                    <option value="credit">Credit (Deposit)</option>
                    <option value="debit">Debit (Withdrawal)</option>
                </select>
            </div>
             <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded">Add Transaction</button>
            </div>
        </form>
    );
};

const GenerateHistoryForm: React.FC<{ user: User; onSave: () => void; onCancel: () => void }> = ({ user, onSave, onCancel }) => {
    const { dispatch } = useBankData();
    const [accountId, setAccountId] = useState(user.accounts[0]?.id || '');
    const [years, setYears] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setIsSuccess(false);

        const targetAccount = user.accounts.find(acc => acc.id === accountId);
        if (!targetAccount) return;

        setTimeout(() => {
            const newTransactions = generateTransactionHistory(targetAccount, parseInt(years, 10));
            dispatch({
                type: 'GENERATE_TRANSACTION_HISTORY',
                payload: { userId: user.id, accountId, newTransactions }
            });
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => onSave(), 1500);
        }, 100);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Account</label>
                <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-slate-700 p-2 rounded text-white">
                    {user.accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.nickname || acc.type} (...{acc.accountNumber.slice(-4)})</option>
                    ))}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Years of History to Generate</label>
                <input type="number" min="1" max="10" value={years} onChange={e => setYears(e.target.value)} className="w-full bg-slate-700 p-2 rounded text-white" required />
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded" disabled={isLoading}>Cancel</button>
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded w-36" disabled={isLoading || isSuccess}>
                    {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mx-auto"></div>
                     : isSuccess ? <CheckCircleIcon className="w-6 h-6 mx-auto text-slate-900"/>
                     : 'Generate'
                    }
                </button>
            </div>
            {isSuccess && <p className="text-green-400 text-center mt-2">Successfully generated {years} year(s) of history!</p>}
        </form>
    );
};

const AdminChatModal: React.FC<{ user: User; onClose: () => void; isOpen: boolean }> = ({ user, onClose, isOpen }) => {
    const { dispatch } = useBankData();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatMessages = user.chat?.messages || [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const message: ChatMessage = {
            id: generateId(),
            sender: 'admin',
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
            read: false,
        };

        dispatch({
            type: 'SEND_CHAT_MESSAGE',
            payload: { userId: user.id, message }
        });

        setNewMessage('');
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Chat with ${user.name}`} maxWidth="max-w-lg">
            <div className="flex flex-col h-96">
                <div className="flex-1 p-3 overflow-y-auto bg-slate-900/50 rounded-t-lg">
                    {chatMessages.map(msg => (
                        <div key={msg.id} className={`flex mb-2 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg py-1 px-3 max-w-[80%] ${msg.sender === 'admin' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-2 border-t border-slate-700">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button type="submit" className="bg-cyan-500 p-2 rounded-lg text-white font-semibold">Send</button>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

const UserHistoryModal: React.FC<{ user: User; onClose: () => void; isOpen: boolean }> = ({ user, onClose, isOpen }) => {
    
    const renderDetails = (event: UserEvent) => {
        return Object.entries(event.details).map(([key, value]) => (
            <div key={key} className="text-xs">
                <span className="font-semibold text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                <span className="text-gray-300">{value.toString()}</span>
            </div>
        ));
    };

    const sortedHistory = [...user.history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
         <Modal isOpen={isOpen} onClose={onClose} title={`History for ${user.name}`} maxWidth="max-w-2xl">
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {sortedHistory.length > 0 ? (
                    <div className="space-y-4">
                        {sortedHistory.map(event => (
                             <div key={event.id} className="bg-slate-900/50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-cyan-400 text-sm">{event.type}</p>
                                    <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="mt-2 pl-2 border-l-2 border-slate-700">
                                    {renderDetails(event)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No history found for this user.</p>
                )}
            </div>
         </Modal>
    );
};

const AccountReviewQueue: React.FC<{
    pendingItems: { user: User; account: Account; event: UserEvent | undefined }[];
    isAlarmPlaying: boolean;
    onSilence: () => void;
}> = ({ pendingItems, isAlarmPlaying, onSilence }) => {
    const { dispatch } = useBankData();

    const handleApprove = (userId: string, accountId: string) => {
        if (window.confirm("Are you sure you want to approve this account? It will become active and a notification will be sent to the customer.")) {
            dispatch({ type: 'APPROVE_ACCOUNT', payload: { userId, accountId } });
        }
    };

    const handleDeny = (userId: string, accountId: string) => {
        if (window.confirm("Are you sure you want to deny this application? The pending account will be removed.")) {
            dispatch({ type: 'DENY_ACCOUNT', payload: { userId, accountId } });
        }
    };
    
    if (pendingItems.length === 0) return null;

    return (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-yellow-500/50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <BellIcon className={`w-6 h-6 ${isAlarmPlaying ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} />
                    <h2 className="text-xl font-bold text-white">Account Review Queue ({pendingItems.length})</h2>
                </div>
                 <button 
                    onClick={onSilence}
                    disabled={!isAlarmPlaying}
                    className="flex items-center gap-2 text-sm bg-yellow-600/80 hover:bg-yellow-500/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    <VolumeXIcon className="w-5 h-5"/>
                    Silence Alarm
                </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {pendingItems.map(({ user, account, event }) => (
                    <div key={account.id} className="bg-slate-900/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-bold text-cyan-400">{user.name} - {user.customerId}</p>
                                <p className="text-sm text-gray-300">New {account.type} approved with limit of <span className="font-semibold text-white">{formatCurrency(account.creditLimit || 0)}</span></p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleDeny(user.id, account.id)} className="bg-red-600/80 hover:bg-red-500/80 text-white font-bold py-2 px-4 rounded-lg">
                                    Deny
                                </button>
                                <button onClick={() => handleApprove(user.id, account.id)} className="bg-green-600/80 hover:bg-green-500/80 text-white font-bold py-2 px-4 rounded-lg">
                                    Approve
                                </button>
                            </div>
                        </div>
                        {event && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-gray-400 grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(event.details).map(([key, value]) => (
                                    <div key={key}>
                                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                                        <span className="text-gray-300">{value as string}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminManagement: React.FC = () => {
    const { database, dispatch } = useBankData();
    const { admins } = database;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | undefined>(undefined);

    const handleAdd = () => {
        setSelectedAdmin(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setIsModalOpen(true);
    };
    
    const handleDelete = (adminId: string) => {
        if(window.confirm('Are you sure you want to delete this administrator? This action cannot be undone.')) {
            dispatch({ type: 'DELETE_ADMIN', payload: adminId });
        }
    };
    
    const handleSave = (admin: AdminUser) => {
        if(admins.some(a => a.id === admin.id)) {
            dispatch({ type: 'UPDATE_ADMIN', payload: admin });
        } else {
            dispatch({ type: 'ADD_ADMIN', payload: admin });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Administrator Management</h2>
                <button onClick={handleAdd} className="flex items-center gap-2 text-sm bg-purple-600/80 hover:bg-purple-500/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    <UserPlusIcon className="w-4 h-4" />
                    Add Admin
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-700 bg-slate-900/30">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-300">Username</th>
                            <th className="p-3 text-sm font-semibold text-gray-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin.id} className="border-b border-slate-800 last:border-b-0">
                                <td className="p-3 text-white">{admin.username}</td>
                                <td className="p-3 text-right">
                                    <div className="flex gap-4 items-center justify-end">
                                        <button onClick={() => handleEdit(admin)} title="Edit Admin" className="text-cyan-400 hover:text-cyan-300"><EditIcon className="w-5 h-5" /></button>
                                        {admins.length > 1 && <button onClick={() => handleDelete(admin.id)} title="Delete Admin" className="text-red-500 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAdmin ? 'Edit Admin' : 'Add New Admin'}>
                <AdminUserForm admin={selectedAdmin} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

const AdminUserForm: React.FC<{ admin?: AdminUser; onSave: (admin: AdminUser) => void; onCancel: () => void; }> = ({ admin, onSave, onCancel }) => {
    const [formData, setFormData] = useState(admin || { id: generateId(), username: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="w-full bg-slate-700 p-2 rounded text-white" required />
            <input name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full bg-slate-700 p-2 rounded text-white" required />
            <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded">Save</button>
            </div>
        </form>
    );
};


const AdminDashboardPage: React.FC = () => {
  const { database, dispatch } = useBankData();
  const { users, globalBanner } = database;
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isGenerateHistoryModalOpen, setIsGenerateHistoryModalOpen] = useState(false);
  const [isActionHistoryModalOpen, setIsActionHistoryModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [lockoutReason, setLockoutReason] = useState('');
  
  const [bannerMessage, setBannerMessage] = useState(globalBanner.message);
  const [bannerIsVisible, setBannerIsVisible] = useState(globalBanner.isVisible);
  const [bannerStatus, setBannerStatus] = useState<'idle' | 'saved'>('idle');

  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const alarmAudioPlayerRef = useRef<HTMLAudioElement>(null);
  const chatAudioPlayerRef = useRef<HTMLAudioElement>(null);
  const chatMessageCountsRef = useRef<Map<string, number>>(new Map());
  const isInitialMount = useRef(true);
  const prevPendingCount = useRef(0);

  const pendingReviewItems = useMemo(() => {
    const items: { user: User; account: Account; event: UserEvent | undefined }[] = [];
    users.forEach(user => {
        user.accounts.forEach(account => {
            if (account.status === 'pending_review') {
                const event = user.history.find(h => h.type === UserEventType.CREDIT_APP_SUBMITTED);
                items.push({ user, account, event });
            }
        });
    });
    return items;
  }, [users]);
  
   useEffect(() => {
        if (pendingReviewItems.length > prevPendingCount.current) {
            setIsAlarmPlaying(true);
        }
        prevPendingCount.current = pendingReviewItems.length;
    }, [pendingReviewItems.length]);

   useEffect(() => {
    const audioEl = alarmAudioPlayerRef.current;
    if (audioEl) {
      if (isAlarmPlaying) {
        audioEl.play().catch(e => console.error("Alarm audio playback failed.", e));
      } else {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    }
  }, [isAlarmPlaying]);
  
  useEffect(() => {
    if (isInitialMount.current) {
        users.forEach(user => {
            chatMessageCountsRef.current.set(user.id, user.chat?.messages?.length || 0);
        });
        isInitialMount.current = false;
        return;
    }

    let newCustomerMessageReceived = false;
    users.forEach(user => {
        const currentMessageCount = user.chat?.messages?.length || 0;
        const prevMessageCount = chatMessageCountsRef.current.get(user.id) || 0;

        if (currentMessageCount > prevMessageCount) {
            const lastMessage = user.chat.messages[currentMessageCount - 1];
            if (lastMessage.sender === 'customer') {
                newCustomerMessageReceived = true;
            }
        }
        chatMessageCountsRef.current.set(user.id, currentMessageCount);
    });

    if (newCustomerMessageReceived) {
        chatAudioPlayerRef.current?.play().catch(e => console.error("Chat audio playback failed", e));
    }
  }, [users]);


  const handleAddUser = () => {
    setSelectedUser(undefined);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };
  
  const handleOpenTransactionModal = (user: User) => {
    setSelectedUser(user);
    setIsTransactionModalOpen(true);
  };
  
  const handleOpenGenerateHistoryModal = (user: User) => {
    setSelectedUser(user);
    setIsGenerateHistoryModalOpen(true);
  };

  const handleOpenActionHistoryModal = (user: User) => {
    setSelectedUser(user);
    setIsActionHistoryModalOpen(true);
  };

  const handleOpenChatModal = (user: User) => {
    setSelectedUser(user);
    setIsChatModalOpen(true);
  };
  
  const handleOpenLockModal = (user: User) => {
    setSelectedUser(user);
    setLockoutReason('');
    setIsLockModalOpen(true);
  };
  
  const handleUnlockUser = (userId: string) => {
    if (window.confirm('Are you sure you want to unlock this account?')) {
        dispatch({ type: 'UNLOCK_USER', payload: { userId } });
    }
  };

  const handleToggleCreditApplication = (user: User) => {
      const canApply = !user.canApplyForCredit;
      const action = canApply ? 'enable' : 'disable';
      if (window.confirm(`Are you sure you want to ${action} the credit application for ${user.name}?`)) {
          dispatch({ type: 'TOGGLE_CREDIT_APPLICATION', payload: { userId: user.id, canApply } });
      }
  };

  const handleConfirmLockout = () => {
    if (!selectedUser || !lockoutReason.trim()) return;
    dispatch({ type: 'LOCK_USER', payload: { userId: selectedUser.id, reason: lockoutReason.trim() } });
    setIsLockModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleDeleteUser = (userId: string) => {
      if(window.confirm('Are you sure you want to delete this user?')) {
          dispatch({ type: 'DELETE_USER', payload: userId });
      }
  }

  const handleSaveUser = (user: User) => {
    if (selectedUser && users.some(u => u.id === user.id)) {
      dispatch({ type: 'UPDATE_USER', payload: user });
    } else {
      dispatch({ type: 'ADD_USER', payload: user });
    }
    setIsUserModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleSaveBanner = () => {
    dispatch({ type: 'SET_BANNER', payload: { message: bannerMessage, isVisible: bannerIsVisible }});
    setBannerStatus('saved');
    setTimeout(() => setBannerStatus('idle'), 2000);
  }

  return (
    <div>
        {/* Hidden audio players */}
        <audio ref={alarmAudioPlayerRef} src="/assets/alert.mp3" loop />
        <audio ref={chatAudioPlayerRef} src="/assets/alert.mp3" />

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <button onClick={handleAddUser} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-all">
                <UserPlusIcon className="w-5 h-5"/>
                Add New Customer
            </button>
        </div>

        <AccountReviewQueue 
            pendingItems={pendingReviewItems}
            isAlarmPlaying={isAlarmPlaying}
            onSilence={() => setIsAlarmPlaying(false)}
        />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Site Banner Management</h2>
                <div className="grid md:grid-cols-3 gap-4 items-center">
                    <input type="text" value={bannerMessage} onChange={e => setBannerMessage(e.target.value)} placeholder="Banner message..." className="md:col-span-2 w-full bg-slate-700 p-2 rounded text-white" />
                    <div className="flex items-center gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={bannerIsVisible} onChange={() => setBannerIsVisible(!bannerIsVisible)} className="sr-only peer"/>
                            <div className="relative w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                            <span className="ms-3 text-sm font-medium text-gray-300">Visible</span>
                        </label>
                        <button onClick={handleSaveBanner} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg w-28">
                        {bannerStatus === 'saved' ? <CheckCircleIcon className="w-6 h-6 mx-auto"/> : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
            <AdminManagement />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700"><h2 className="text-xl font-bold text-white">Customer Management</h2></div>
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-slate-700 bg-slate-900/30">
                <tr>
                    <th className="p-4 text-sm font-semibold text-gray-300">Name</th>
                    <th className="p-4 text-sm font-semibold text-gray-300">Customer ID</th>
                    <th className="p-4 text-sm font-semibold text-gray-300">Email</th>
                    <th className="p-4 text-sm font-semibold text-gray-300">Total Balance</th>
                    <th className="p-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id} className={`border-b border-slate-800 transition-colors ${user.isLocked ? 'bg-red-900/30 hover:bg-red-900/40' : 'hover:bg-slate-800/40'}`}>
                    <td className="p-4 text-white font-medium">{user.name}</td>
                    <td className="p-4 text-gray-400">{user.customerId}</td>
                    <td className="p-4 text-gray-400">{user.email}</td>
                    <td className="p-4 text-white">{formatCurrency(user.accounts.reduce((sum, acc) => sum + acc.balance, 0))}</td>
                    <td className="p-4">
                        <div className="flex gap-4 items-center">
                          {user.isLocked ? (
                            <button onClick={() => handleUnlockUser(user.id)} title="Unlock Account" className="text-green-400 hover:text-green-300"><UnlockIcon className="w-5 h-5"/></button>
                          ) : (
                            <button onClick={() => handleOpenLockModal(user)} title="Lock Account" className="text-yellow-400 hover:text-yellow-300"><LockIcon className="w-5 h-5"/></button>
                          )}
                          <button onClick={() => handleToggleCreditApplication(user)} title={user.canApplyForCredit ? 'Disable Credit Application' : 'Enable Credit Application'} className={user.canApplyForCredit ? 'text-cyan-400 hover:text-cyan-300' : 'text-gray-500 hover:text-gray-400'}>
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleOpenChatModal(user)} title="Chat with user" className="text-blue-400 hover:text-blue-300">
                            <MessageSquareIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleOpenActionHistoryModal(user)} title="View User History" className="text-purple-400 hover:text-purple-300">
                            <HistoryIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleOpenGenerateHistoryModal(user)} title="Generate Transaction History" className="text-indigo-400 hover:text-indigo-300">
                            <FileTextIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleOpenTransactionModal(user)} title="Add Transaction" className="text-green-400 hover:text-green-300">
                            <PlusCircleIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleEditUser(user)} title="Edit User" className="text-cyan-400 hover:text-cyan-300">
                            <EditIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} title="Delete User" className="text-red-500 hover:text-red-400">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      
        <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={selectedUser ? 'Edit Customer' : 'Add New Customer'}>
            <UserForm 
            user={selectedUser} 
            onSave={handleSaveUser} 
            onCancel={() => setIsUserModalOpen(false)} 
            />
        </Modal>

        <Modal isOpen={isLockModalOpen} onClose={() => setIsLockModalOpen(false)} title={`Lock Account for ${selectedUser?.name}`}>
            <div>
                <label htmlFor="lockoutReason" className="block text-gray-300 text-sm font-bold mb-2">Reason for Lockout</label>
                <textarea id="lockoutReason" value={lockoutReason} onChange={e => setLockoutReason(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    placeholder="e.g., Suspicious activity detected."
                    rows={4}
                />
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsLockModalOpen(false)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                    <button type="button" onClick={handleConfirmLockout} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded">Confirm Lockout</button>
                </div>
            </div>
        </Modal>

        {selectedUser && (
            <>
                <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title={`Add Transaction for ${selectedUser.name}`}>
                    <TransactionForm
                        user={selectedUser}
                        onSave={() => setIsTransactionModalOpen(false)}
                        onCancel={() => setIsTransactionModalOpen(false)}
                    />
                </Modal>
                <Modal isOpen={isGenerateHistoryModalOpen} onClose={() => setIsGenerateHistoryModalOpen(false)} title={`Generate History for ${selectedUser.name}`}>
                    <GenerateHistoryForm
                        user={selectedUser}
                        onSave={() => setIsGenerateHistoryModalOpen(false)}
                        onCancel={() => setIsGenerateHistoryModalOpen(false)}
                    />
                </Modal>
                <UserHistoryModal
                    isOpen={isActionHistoryModalOpen}
                    user={selectedUser}
                    onClose={() => setIsActionHistoryModalOpen(false)}
                />
                <AdminChatModal
                    isOpen={isChatModalOpen}
                    user={selectedUser}
                    onClose={() => setIsChatModalOpen(false)}
                />
            </>
        )}
    </div>
  );
};

export default AdminDashboardPage;