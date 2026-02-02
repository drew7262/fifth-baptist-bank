
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance: number;
}

export interface PendingTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Processing';
}

export enum AccountType {
  CHECKING = 'Checking',
  SAVINGS = 'Savings',
  CREDIT_CARD = 'Credit Card',
  MORTGAGE = 'Mortgage',
}

export interface Account {
  id: string;
  type: AccountType;
  nickname?: string;
  accountNumber: string;
  routingNumber?: string;
  balance: number;
  transactions: Transaction[];
  pendingTransactions?: PendingTransaction[];
  creditLimit?: number;
  loanAmount?: number;
  interestRate?: number;
  loanStartDate?: string;
  estimatedPayoffDate?: string;
  status?: 'active' | 'pending_review';
}

export interface UserAlert {
    id: string;
    message: string;
    date: string;
    read: boolean;
}

export interface ScheduledPayment {
    id: string;
    payee: string;
    amount: number;
    date: string;
    fromAccountId: string;
}

export interface ChatMessage {
  id: string;
  sender: 'admin' | 'customer';
  text: string;
  timestamp: string;
  read: boolean;
}

export enum UserEventType {
    LOGIN_SUCCESS = 'Successful Login',
    CREDIT_APP_SUBMITTED = 'Credit Application Submitted',
    CREDIT_APP_APPROVED = 'Credit Application Approved',
    CREDIT_APP_DENIED = 'Credit Application Denied',
    DEBIT_CARD_LOCKED = 'Debit Card Locked',
    DEBIT_CARD_UNLOCKED = 'Debit Card Unlocked',
    DEBIT_CARD_ORDERED = 'New Debit Card Ordered',
    ACCOUNT_REVIEWED_APPROVED = 'Account Manually Approved',
    ACCOUNT_REVIEWED_DENIED = 'Account Manually Denied',
}

export interface UserEvent {
    id: string;
    timestamp: string;
    type: UserEventType;
    details: Record<string, any>;
}

export interface User {
  id: string;
  customerId: string;
  password: string;
  name: string;
  email: string;
  address: string;
  accounts: Account[];
  alerts?: UserAlert[];
  scheduledPayments?: ScheduledPayment[];
  chat?: {
    messages: ChatMessage[];
  };
  isLocked: boolean;
  lockoutReason: string;
  canApplyForCredit: boolean;
  isDebitCardLocked: boolean;
  history: UserEvent[];
}

export interface AuthenticatedUser {
  id:string;
  name: string;
  role: 'customer' | 'admin';
  customerId?: string;
}

export interface GlobalBanner {
    message: string;
    isVisible: boolean;
}

export interface AdminUser {
    id: string;
    username: string;
    password: string;
}

export interface BankDatabase {
    users: User[];
    admins: AdminUser[];
    globalBanner: GlobalBanner;
}