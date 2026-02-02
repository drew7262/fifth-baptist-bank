// index.tsx
import React11 from "react";
import ReactDOM from "react-dom/client";

// App.tsx
import { HashRouter, Routes, Route } from "react-router-dom";

// context/AuthContext.tsx
import { createContext as createContext2, useState as useState2, useContext as useContext2, useEffect as useEffect2 } from "react";
import { useNavigate } from "react-router-dom";

// context/BankDataContext.tsx
import { createContext, useContext, useReducer, useEffect, useState, useRef } from "react";

// utils/helpers.ts
var formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
};
var generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};
var generateAccountNumber = () => {
  return Math.floor(1e9 + Math.random() * 9e9).toString();
};
var merchants = {
  bigBox: ["Walmart", "Target", "Costco", "Home Depot"],
  grocery: ["Kroger", "Safeway", "Whole Foods", "Trader Joe's", "Local Grocer"],
  online: ["Amazon.com", "eBay", "Etsy Marketplace", "Netflix", "Spotify"],
  food: ["Starbucks", "McDonald's", "Chipotle", "The Grand Bistro", "Local Cafe"],
  gas: ["Shell", "Chevron", "BP Gas", "Speedway"],
  utilities: ["City Power & Light", "Anytown Water Dept.", "Comcast"]
};
var getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
var generateTransactionHistory = (currentAccount, years) => {
  const newTransactions = [];
  const startDate = currentAccount.transactions.length > 0 ? new Date(currentAccount.transactions[currentAccount.transactions.length - 1].date) : /* @__PURE__ */ new Date();
  let runningBalance = currentAccount.transactions.length > 0 ? currentAccount.transactions[currentAccount.transactions.length - 1].balance : currentAccount.balance;
  if (currentAccount.transactions.length > 0) {
    const lastTx = currentAccount.transactions[currentAccount.transactions.length - 1];
    runningBalance = runningBalance - lastTx.amount;
  }
  for (let i = 0; i < years * 12; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() - (i + 1));
    const payrollAmount = 3500 + (Math.random() * 500 - 250);
    runningBalance -= payrollAmount;
    newTransactions.unshift({
      id: generateId(),
      date: new Date(date.getFullYear(), date.getMonth(), 15).toISOString().split("T")[0],
      description: "Payroll Deposit - Acme Corp",
      amount: payrollAmount,
      type: "credit",
      balance: runningBalance + payrollAmount
    });
    const numTransactions = Math.floor(Math.random() * 11) + 5;
    for (let j = 0; j < numTransactions; j++) {
      const dayOfMonth = Math.floor(Math.random() * 28) + 1;
      const transactionDate = new Date(date.getFullYear(), date.getMonth(), dayOfMonth);
      const merchantCategory = getRandomElement(Object.keys(merchants));
      const description = getRandomElement(merchants[merchantCategory]);
      let amount;
      if (merchantCategory === "bigBox" || merchantCategory === "online") {
        amount = -(Math.random() * 200 + 20);
      } else if (merchantCategory === "utilities") {
        amount = -(Math.random() * 100 + 50);
      } else {
        amount = -(Math.random() * 75 + 5);
      }
      amount = parseFloat(amount.toFixed(2));
      runningBalance -= amount;
      newTransactions.unshift({
        id: generateId(),
        date: transactionDate.toISOString().split("T")[0],
        description: `Purchase - ${description}`,
        amount,
        type: "debit",
        balance: runningBalance + amount
      });
    }
  }
  return newTransactions;
};

// context/BankDataContext.tsx
import { jsx } from "react/jsx-runtime";
var BankDataContext = createContext(void 0);
var bankReducer = (state, action) => {
  switch (action.type) {
    case "TRANSFER_FUNDS": {
      const { fromAccountId, toAccountId, amount, userId } = action.payload;
      const newUsers = state.users.map((user) => {
        if (user.id === userId) {
          const fromAcc = user.accounts.find((a) => a.id === fromAccountId);
          const toAcc = user.accounts.find((a) => a.id === toAccountId);
          if (!fromAcc || !toAcc)
            return user;
          const newAccounts = user.accounts.map((acc) => {
            if (acc.id === fromAccountId) {
              const newBalance = acc.balance - amount;
              const description = `Transfer to ${toAcc.nickname || toAcc.type} (...${toAcc.accountNumber.slice(-4)})`;
              const newTransaction = {
                id: generateId(),
                date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                description,
                amount: -amount,
                type: "debit",
                balance: newBalance
              };
              return { ...acc, balance: newBalance, transactions: [newTransaction, ...acc.transactions] };
            }
            if (acc.id === toAccountId) {
              const newBalance = acc.balance + amount;
              const description = acc.type === "Credit Card" /* CREDIT_CARD */ ? `Payment from ${fromAcc.nickname || fromAcc.type} (...${fromAcc.accountNumber.slice(-4)})` : `Transfer from ${fromAcc.nickname || fromAcc.type} (...${fromAcc.accountNumber.slice(-4)})`;
              const newTransaction = {
                id: generateId(),
                date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                description,
                amount,
                type: "credit",
                balance: newBalance
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
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };
    case "UPDATE_USER":
      const updatedUsers = state.users.map((user) => user.id === action.payload.id ? action.payload : user);
      return { ...state, users: updatedUsers };
    case "DELETE_USER":
      const filteredUsers = state.users.filter((user) => user.id !== action.payload);
      return { ...state, users: filteredUsers };
    case "UPDATE_ACCOUNT_NICKNAME": {
      const { userId, accountId, nickname } = action.payload;
      const newUsers = state.users.map((user) => {
        if (user.id === userId) {
          const updatedAccounts = user.accounts.map((account) => {
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
    case "ADD_TRANSACTION_TO_ACCOUNT": {
      const { userId, accountId, transaction } = action.payload;
      const newUsers = state.users.map((user) => {
        if (user.id === userId) {
          const newAccounts = user.accounts.map((acc) => {
            if (acc.id === accountId) {
              const amount = transaction.type === "credit" ? transaction.amount : -transaction.amount;
              const newBalance = acc.balance + amount;
              const newTransaction = {
                ...transaction,
                id: generateId(),
                amount,
                balance: newBalance
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
    case "GENERATE_TRANSACTION_HISTORY": {
      const { userId, accountId, newTransactions } = action.payload;
      const newUsers = state.users.map((user) => {
        if (user.id === userId) {
          const newAccounts = user.accounts.map((acc) => {
            if (acc.id === accountId) {
              const allTransactions = [...newTransactions, ...acc.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    case "SCHEDULE_BILL_PAYMENT": {
      const { userId, payment } = action.payload;
      const newUsers = state.users.map((user) => {
        if (user.id === userId) {
          const scheduledPayments = [...user.scheduledPayments || [], payment];
          return { ...user, scheduledPayments };
        }
        return user;
      });
      return { ...state, users: newUsers };
    }
    case "SEND_CHAT_MESSAGE": {
      const { userId, message } = action.payload;
      const newUsers = state.users.map((user) => {
        if (user.id === userId) {
          const newChat = {
            messages: [...user.chat?.messages || [], message]
          };
          return { ...user, chat: newChat };
        }
        return user;
      });
      return { ...state, users: newUsers };
    }
    case "LOCK_USER": {
      const { userId, reason } = action.payload;
      const newUsers = state.users.map(
        (user) => user.id === userId ? { ...user, isLocked: true, lockoutReason: reason } : user
      );
      return { ...state, users: newUsers };
    }
    case "UNLOCK_USER": {
      const { userId } = action.payload;
      const newUsers = state.users.map(
        (user) => user.id === userId ? { ...user, isLocked: false, lockoutReason: "" } : user
      );
      return { ...state, users: newUsers };
    }
    case "TOGGLE_CREDIT_APPLICATION": {
      const { userId, canApply } = action.payload;
      const newUsers = state.users.map(
        (user) => user.id === userId ? { ...user, canApplyForCredit: canApply } : user
      );
      return { ...state, users: newUsers };
    }
    case "PROCESS_CREDIT_APPLICATION": {
      const { userId, event, newAccount } = action.payload;
      const newUsers = state.users.map((user) => {
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
    case "LOG_USER_EVENT": {
      const { userId, event } = action.payload;
      const newUsers = state.users.map(
        (user) => user.id === userId ? { ...user, history: [...user.history, event] } : user
      );
      return { ...state, users: newUsers };
    }
    case "TOGGLE_DEBIT_CARD_LOCK": {
      const { userId, isLocked, event } = action.payload;
      const newUsers = state.users.map(
        (user) => user.id === userId ? { ...user, isDebitCardLocked: isLocked, history: [...user.history, event] } : user
      );
      return { ...state, users: newUsers };
    }
    case "ORDER_NEW_CARD": {
      const { userId, event } = action.payload;
      const newUsers = state.users.map(
        (user) => user.id === userId ? { ...user, history: [...user.history, event] } : user
      );
      return { ...state, users: newUsers };
    }
    case "APPROVE_ACCOUNT": {
      const { userId, accountId } = action.payload;
      const newUsers = state.users.map((user) => {
        if (user.id === userId) {
          let approvedAccount;
          const updatedAccounts = user.accounts.map((account) => {
            if (account.id === accountId) {
              approvedAccount = { ...account, status: "active" };
              return approvedAccount;
            }
            return account;
          });
          if (!approvedAccount)
            return user;
          const approvalEvent = {
            id: generateId(),
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            type: "Account Manually Approved" /* ACCOUNT_REVIEWED_APPROVED */,
            details: { accountId, approvedBy: "admin" }
          };
          let message = "";
          if (approvedAccount.type === "Credit Card" /* CREDIT_CARD */) {
            message = `Congratulations! Your new ${approvedAccount.type} has been approved with an interest rate of ${approvedAccount.interestRate}%. Your card will arrive in 7-10 business days.`;
          } else {
            message = `Congratulations! Your new ${approvedAccount.type} account (...${approvedAccount.accountNumber.slice(-4)}) has been approved and is now active.`;
          }
          const notification = {
            id: generateId(),
            date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
            message,
            read: false
          };
          const updatedAlerts = [...user.alerts || [], notification];
          return { ...user, accounts: updatedAccounts, history: [...user.history, approvalEvent], alerts: updatedAlerts };
        }
        return user;
      });
      return { ...state, users: newUsers };
    }
    case "DENY_ACCOUNT": {
      const { userId, accountId } = action.payload;
      const newUsers = state.users.map((user) => {
        if (user.id === userId) {
          const updatedAccounts = user.accounts.filter((account) => account.id !== accountId);
          const denialEvent = {
            id: generateId(),
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            type: "Account Manually Denied" /* ACCOUNT_REVIEWED_DENIED */,
            details: { accountId, deniedBy: "admin" }
          };
          return { ...user, accounts: updatedAccounts, history: [...user.history, denialEvent] };
        }
        return user;
      });
      return { ...state, users: newUsers };
    }
    case "ADD_ADMIN":
      return { ...state, admins: [...state.admins, action.payload] };
    case "UPDATE_ADMIN":
      return { ...state, admins: state.admins.map((admin) => admin.id === action.payload.id ? action.payload : admin) };
    case "DELETE_ADMIN":
      return { ...state, admins: state.admins.filter((admin) => admin.id !== action.payload) };
    case "SET_BANNER":
      return { ...state, globalBanner: action.payload };
    case "SET_DATABASE":
      return action.payload;
    default:
      return state;
  }
};
var BankDataProvider = ({ children }) => {
  const [database, dispatch] = useReducer(bankReducer, { users: [], admins: [], globalBanner: { message: "", isVisible: false } });
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);
  const databaseRef = useRef(database);
  useEffect(() => {
    databaseRef.current = database;
  }, [database]);
  useEffect(() => {
    const fetchDatabase = async () => {
      try {
        const response = await fetch("/api/database");
        if (!response.ok)
          throw new Error("Network response was not ok");
        const data = await response.json();
        dispatch({ type: "SET_DATABASE", payload: data });
      } catch (error) {
        console.error("Failed to fetch database:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatabase();
  }, []);
  useEffect(() => {
    if (loading || isInitialMount.current || database.users.length === 0 && database.admins.length === 0) {
      isInitialMount.current = false;
      return;
    }
    const saveDatabase = async () => {
      try {
        await fetch("/api/database", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(database)
        });
      } catch (error) {
        console.error("Failed to save database:", error);
      }
    };
    const timeoutId = setTimeout(saveDatabase, 500);
    return () => clearTimeout(timeoutId);
  }, [database, loading]);
  useEffect(() => {
    if (loading)
      return;
    const POLL_INTERVAL = 3e3;
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch("/api/database");
        if (!response.ok) {
          if (response.status === 503)
            return;
          throw new Error(`Poll failed with status: ${response.status}`);
        }
        const text = await response.text();
        if (!text) {
          return;
        }
        const data = JSON.parse(text);
        if (JSON.stringify(data) !== JSON.stringify(databaseRef.current)) {
          dispatch({ type: "SET_DATABASE", payload: data });
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [loading]);
  return /* @__PURE__ */ jsx(BankDataContext.Provider, { value: { database, dispatch, loading }, children });
};
var useBankData = () => {
  const context = useContext(BankDataContext);
  if (context === void 0) {
    throw new Error("useBankData must be used within a BankDataProvider");
  }
  return context;
};

// context/AuthContext.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
var AuthContext = createContext2(void 0);
var AuthProvider = ({ children }) => {
  const [user, setUser] = useState2(null);
  const [loading, setLoading] = useState2(true);
  const { database, dispatch } = useBankData();
  const navigate = useNavigate();
  useEffect2(() => {
    try {
      const storedUser = localStorage.getItem("FBB_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("FBB_user");
    } finally {
      setLoading(false);
    }
  }, []);
  const login = async (customerId, password) => {
    const customer = database.users.find((u) => u.customerId === customerId && u.password === password);
    if (customer) {
      if (customer.isLocked) {
        return { success: false, reason: `Account Locked: ${customer.lockoutReason}` };
      }
      const authUser = {
        id: customer.id,
        name: customer.name,
        role: "customer",
        customerId: customer.customerId
      };
      localStorage.setItem("FBB_user", JSON.stringify(authUser));
      setUser(authUser);
      const loginEvent = {
        id: generateId(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        type: "Successful Login" /* LOGIN_SUCCESS */,
        details: { ipAddress: "127.0.0.1" }
        // Example detail
      };
      dispatch({ type: "LOG_USER_EVENT", payload: { userId: customer.id, event: loginEvent } });
      navigate("/dashboard");
      return { success: true };
    }
    return { success: false, reason: "Invalid Customer ID or Password." };
  };
  const adminLogin = async (username, password) => {
    const adminUser = database.admins.find((admin) => admin.username === username && admin.password === password);
    if (adminUser) {
      const authUser = {
        id: adminUser.id,
        name: adminUser.username,
        role: "admin"
      };
      localStorage.setItem("FBB_user", JSON.stringify(authUser));
      setUser(authUser);
      navigate("/admin/dashboard");
      return true;
    }
    return false;
  };
  const logout = () => {
    const role = user?.role;
    setUser(null);
    localStorage.removeItem("FBB_user");
    if (role === "admin") {
      navigate("/admin/login");
    } else {
      navigate("/login");
    }
  };
  return /* @__PURE__ */ jsx2(AuthContext.Provider, { value: { user, login, adminLogin, logout, loading }, children: !loading && children });
};
var useAuth = () => {
  const context = useContext2(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// pages/HomePage.tsx
import { useNavigate as useNavigate2 } from "react-router-dom";

// components/icons.tsx
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var LogoIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx3("path", { d: "M12 2L2 7V9H22V7L12 2Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx3("path", { d: "M4 10V20H6V10H4Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx3("path", { d: "M10 10V20H14V10H10Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx3("path", { d: "M18 10V20H20V10H18Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx3("path", { d: "M2 21H22V23H2V21Z", fill: "currentColor" })
] });
var ArrowRightIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("line", { x1: "5", y1: "12", x2: "19", y2: "12" }),
  /* @__PURE__ */ jsx3("polyline", { points: "12 5 19 12 12 19" })
] });
var MenuIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
  /* @__PURE__ */ jsx3("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
  /* @__PURE__ */ jsx3("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
] });
var XIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ jsx3("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
var EyeIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }),
  /* @__PURE__ */ jsx3("circle", { cx: "12", cy: "12", r: "3" })
] });
var EditIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }),
  /* @__PURE__ */ jsx3("path", { d: "m15 5 4 4" })
] });
var TrashIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "M3 6h18" }),
  /* @__PURE__ */ jsx3("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
  /* @__PURE__ */ jsx3("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }),
  /* @__PURE__ */ jsx3("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
  /* @__PURE__ */ jsx3("line", { x1: "14", y1: "11", x2: "14", y2: "17" })
] });
var UserPlusIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
  /* @__PURE__ */ jsx3("circle", { cx: "9", cy: "7", r: "4" }),
  /* @__PURE__ */ jsx3("line", { x1: "19", y1: "8", x2: "19", y2: "14" }),
  /* @__PURE__ */ jsx3("line", { x1: "22", y1: "11", x2: "16", y2: "11" })
] });
var LogOutIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
  /* @__PURE__ */ jsx3("polyline", { points: "16 17 21 12 16 7" }),
  /* @__PURE__ */ jsx3("line", { x1: "21", y1: "12", x2: "9", y2: "12" })
] });
var DollarSignIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("line", { x1: "12", y1: "2", x2: "12", y2: "22" }),
  /* @__PURE__ */ jsx3("path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" })
] });
var CreditCardIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("rect", { width: "20", height: "14", x: "2", y: "5", rx: "2" }),
  /* @__PURE__ */ jsx3("line", { x1: "2", y1: "10", x2: "22", y2: "10" })
] });
var HomeIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
  /* @__PURE__ */ jsx3("polyline", { points: "9 22 9 12 15 12 15 22" })
] });
var MortgageIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
  /* @__PURE__ */ jsx3("path", { d: "M12 13.5a2.5 2.5 0 0 1-3.16 2.4 2.5 2.5 0 0 1-1.84-2.4c0-2 2-3 4-3s4 1 4 3a2.5 2.5 0 0 1-2 2.4" }),
  /* @__PURE__ */ jsx3("path", { d: "M12 9v1.5" })
] });
var CheckCircleIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
  /* @__PURE__ */ jsx3("path", { d: "m9 11 3 3L22 4" })
] });
var AlertTriangleIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }),
  /* @__PURE__ */ jsx3("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
  /* @__PURE__ */ jsx3("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
] });
var PlusCircleIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ jsx3("line", { x1: "12", y1: "8", x2: "12", y2: "16" }),
  /* @__PURE__ */ jsx3("line", { x1: "8", y1: "12", x2: "16", y2: "12" })
] });
var PlusIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
  /* @__PURE__ */ jsx3("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
] });
var MinusIcon = ({ className }) => /* @__PURE__ */ jsx3("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx3("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) });
var BellIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
  /* @__PURE__ */ jsx3("path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" })
] });
var BuildingBankIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "m8 18 4-4 4 4" }),
  /* @__PURE__ */ jsx3("path", { d: "M12 18V2" }),
  /* @__PURE__ */ jsx3("path", { d: "M4 22h16" }),
  /* @__PURE__ */ jsx3("path", { d: "M18 6H6l-4 4v10h20V10l-4-4Z" })
] });
var HistoryIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }),
  /* @__PURE__ */ jsx3("path", { d: "M3 3v5h5" }),
  /* @__PURE__ */ jsx3("path", { d: "M12 7v5l4 2" })
] });
var CalendarIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsx3("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
  /* @__PURE__ */ jsx3("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
  /* @__PURE__ */ jsx3("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
] });
var FileTextIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }),
  /* @__PURE__ */ jsx3("path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }),
  /* @__PURE__ */ jsx3("path", { d: "M16 13H8" }),
  /* @__PURE__ */ jsx3("path", { d: "M16 17H8" }),
  /* @__PURE__ */ jsx3("path", { d: "M10 9H8" })
] });
var MessageSquareIcon = ({ className }) => /* @__PURE__ */ jsx3("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx3("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) });
var LockIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsx3("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
] });
var UnlockIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsx3("path", { d: "M7 11V7a5 5 0 0 1 9.9-1" })
] });
var VolumeXIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ jsx3("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
  /* @__PURE__ */ jsx3("line", { x1: "22", y1: "9", x2: "16", y2: "15" }),
  /* @__PURE__ */ jsx3("line", { x1: "16", y1: "9", x2: "22", y2: "15" })
] });

// components/Footer.tsx
import { Link } from "react-router-dom";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var Footer = () => {
  return /* @__PURE__ */ jsx4("footer", { className: "bg-slate-900/50 border-t border-slate-700/50 mt-16 pb-8 pt-12", children: /* @__PURE__ */ jsxs2("div", { className: "container mx-auto px-4", children: [
    /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8", children: [
      /* @__PURE__ */ jsxs2("div", { className: "col-span-2 md:col-span-1 mb-8 md:mb-0", children: [
        /* @__PURE__ */ jsxs2("div", { className: "flex items-center space-x-2 text-white", children: [
          /* @__PURE__ */ jsx4(LogoIcon, { className: "h-8 w-8 text-cyan-400" }),
          /* @__PURE__ */ jsx4("span", { className: "text-xl font-bold", children: "Fifth Baptist Bank" })
        ] }),
        /* @__PURE__ */ jsx4("p", { className: "text-sm text-gray-400 mt-4", children: "Your trusted financial partner, committed to your success." })
      ] }),
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsx4("h3", { className: "font-semibold text-gray-200", children: "Services" }),
        /* @__PURE__ */ jsxs2("ul", { className: "mt-4 space-y-2 text-sm text-gray-400", children: [
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/services/checking", className: "hover:text-white", children: "Checking" }) }),
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/services/savings", className: "hover:text-white", children: "Savings" }) }),
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/services/loans", className: "hover:text-white", children: "Loans" }) }),
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/services/credit-cards", className: "hover:text-white", children: "Credit Cards" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsx4("h3", { className: "font-semibold text-gray-200", children: "About" }),
        /* @__PURE__ */ jsxs2("ul", { className: "mt-4 space-y-2 text-sm text-gray-400", children: [
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/about", className: "hover:text-white", children: "Our Story" }) }),
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/about/careers", className: "hover:text-white", children: "Careers" }) }),
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/about/press", className: "hover:text-white", children: "Press" }) }),
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/about/investors", className: "hover:text-white", children: "Investor Relations" }) }),
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/admin/login", className: "hover:text-white", children: "Employee Access" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsx4("h3", { className: "font-semibold text-gray-200", children: "Legal" }),
        /* @__PURE__ */ jsxs2("ul", { className: "mt-4 space-y-2 text-sm text-gray-400", children: [
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/legal/privacy", className: "hover:text-white", children: "Privacy Policy" }) }),
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/legal/terms", className: "hover:text-white", children: "Terms of Service" }) }),
          /* @__PURE__ */ jsx4("li", { children: /* @__PURE__ */ jsx4(Link, { to: "/legal/disclosures", className: "hover:text-white", children: "Disclosures" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "mt-12 border-t border-slate-800 pt-8 text-center text-sm text-gray-500", children: [
      /* @__PURE__ */ jsxs2("p", { children: [
        "\xA9 ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Fifth Baptist Bank. All Rights Reserved. Member FDIC."
      ] }),
      /* @__PURE__ */ jsx4("p", { className: "mt-2", children: "This is a fictional bank for entertainment and educational purposes." })
    ] })
  ] }) });
};
var Footer_default = Footer;

// pages/HomePage.tsx
import { Fragment, jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var FeatureCard = ({ icon, title, description }) => /* @__PURE__ */ jsxs3("div", { className: "bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 transition-all duration-300 hover:border-cyan-400/50 hover:-translate-y-1", children: [
  /* @__PURE__ */ jsx5("div", { className: "text-cyan-400 mb-4", children: icon }),
  /* @__PURE__ */ jsx5("h3", { className: "font-bold text-xl text-white mb-2", children: title }),
  /* @__PURE__ */ jsx5("p", { className: "text-gray-400 text-sm", children: description })
] });
var HomePage = () => {
  const navigate = useNavigate2();
  return /* @__PURE__ */ jsxs3(Fragment, { children: [
    /* @__PURE__ */ jsxs3("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxs3("div", { className: "py-20 md:py-32", children: [
        /* @__PURE__ */ jsxs3("h1", { className: "text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tighter", children: [
          "Banking that's built for ",
          /* @__PURE__ */ jsx5("br", {}),
          /* @__PURE__ */ jsx5("span", { className: "text-cyan-400", children: "your future." })
        ] }),
        /* @__PURE__ */ jsx5("p", { className: "mt-6 max-w-2xl mx-auto text-lg text-gray-300", children: "Experience seamless online banking with Fifth Baptist Bank. Secure, intuitive, and designed to help you achieve your financial goals." }),
        /* @__PURE__ */ jsxs3("div", { className: "mt-10 flex justify-center items-center gap-4", children: [
          /* @__PURE__ */ jsxs3(
            "button",
            {
              onClick: () => navigate("/register"),
              className: "group flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-6 rounded-lg transition-transform duration-300 hover:scale-105",
              children: [
                "Open an Account",
                /* @__PURE__ */ jsx5(ArrowRightIcon, { className: "w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" })
              ]
            }
          ),
          /* @__PURE__ */ jsx5("button", { className: "font-medium text-gray-300 hover:text-white py-3 px-6 rounded-lg transition-colors", children: "Learn More" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "py-16 md:py-24", children: [
        /* @__PURE__ */ jsx5("h2", { className: "text-3xl md:text-4xl font-bold text-white mb-12", children: "All Your Financial Needs, One Place" }),
        /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto", children: [
          /* @__PURE__ */ jsx5(
            FeatureCard,
            {
              icon: /* @__PURE__ */ jsx5(DollarSignIcon, { className: "w-10 h-10" }),
              title: "Smart Savings",
              description: "Grow your money faster with our high-yield savings accounts and automated saving tools."
            }
          ),
          /* @__PURE__ */ jsx5(
            FeatureCard,
            {
              icon: /* @__PURE__ */ jsx5(CreditCardIcon, { className: "w-10 h-10" }),
              title: "Flexible Credit",
              description: "Get the credit you deserve with our range of credit cards offering great rewards and low interest rates."
            }
          ),
          /* @__PURE__ */ jsx5(
            FeatureCard,
            {
              icon: /* @__PURE__ */ jsx5(HomeIcon, { className: "w-10 h-10" }),
              title: "Easy Mortgages",
              description: "Secure your dream home with our simple and transparent mortgage application process."
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx5("div", { className: "bg-slate-800/30 backdrop-blur-lg rounded-xl max-w-6xl mx-auto py-16 px-8 my-20 border border-slate-700/50", children: /* @__PURE__ */ jsxs3("div", { className: "grid md:grid-cols-2 gap-8 items-center", children: [
        /* @__PURE__ */ jsxs3("div", { className: "text-left", children: [
          /* @__PURE__ */ jsx5("h2", { className: "text-3xl font-bold text-white", children: "Security You Can Trust" }),
          /* @__PURE__ */ jsx5("p", { className: "mt-4 text-gray-300", children: "Your peace of mind is our top priority. We use state-of-the-art encryption and multi-factor authentication to protect your account from unauthorized access. Bank with confidence, knowing your finances are secure." })
        ] }),
        /* @__PURE__ */ jsx5("div", { children: /* @__PURE__ */ jsx5("img", { src: "https://picsum.photos/seed/security/600/400", alt: "Bank security", className: "rounded-lg shadow-xl" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx5(Footer_default, {})
  ] });
};
var HomePage_default = HomePage;

// pages/CustomerLoginPage.tsx
import { useState as useState3 } from "react";
import { useNavigate as useNavigate3 } from "react-router-dom";
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var CustomerLoginPage = () => {
  const [customerId, setCustomerId] = useState3("");
  const [password, setPassword] = useState3("");
  const [error, setError] = useState3("");
  const [isLoading, setIsLoading] = useState3(false);
  const { login } = useAuth();
  const navigate = useNavigate3();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1e3));
    const result = await login(customerId, password);
    if (!result.success) {
      setError(result.reason || "Invalid Customer ID or Password. Please try again.");
    }
    setIsLoading(false);
  };
  return /* @__PURE__ */ jsx6("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsxs4("div", { className: "w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl p-8", children: [
    /* @__PURE__ */ jsx6("h1", { className: "text-3xl font-bold text-center text-white mb-2", children: "Customer Sign In" }),
    /* @__PURE__ */ jsx6("p", { className: "text-center text-gray-400 mb-8", children: "Access your Fifth Baptist Bank accounts." }),
    error && /* @__PURE__ */ jsxs4("div", { className: "bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-start gap-3", role: "alert", children: [
      /* @__PURE__ */ jsx6(AlertTriangleIcon, { className: "w-5 h-5 flex-shrink-0 mt-1" }),
      /* @__PURE__ */ jsx6("span", { className: "block sm:inline text-sm", children: error })
    ] }),
    /* @__PURE__ */ jsxs4("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs4("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx6("label", { className: "block text-gray-300 text-sm font-bold mb-2", htmlFor: "customer-id", children: "Customer ID" }),
        /* @__PURE__ */ jsx6(
          "input",
          {
            id: "customer-id",
            type: "text",
            value: customerId,
            onChange: (e) => setCustomerId(e.target.value),
            placeholder: "e.g., 11223344",
            className: "w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx6("label", { className: "block text-gray-300 text-sm font-bold mb-2", htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsx6(
          "input",
          {
            id: "password",
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
            className: "w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx6("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx6(
        "button",
        {
          type: "submit",
          disabled: isLoading,
          className: "w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed",
          children: isLoading ? /* @__PURE__ */ jsx6("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mx-auto" }) : "Sign In"
        }
      ) }),
      /* @__PURE__ */ jsxs4("p", { className: "text-center text-sm text-gray-500 mt-6", children: [
        "Forgot your ID or Password? ",
        /* @__PURE__ */ jsx6("a", { href: "#", className: "text-cyan-400 hover:underline", children: "Get Help" })
      ] })
    ] })
  ] }) });
};
var CustomerLoginPage_default = CustomerLoginPage;

// pages/CustomerDashboardPage.tsx
import { useState as useState5, useMemo } from "react";

// components/Modal.tsx
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
var Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen)
    return null;
  return /* @__PURE__ */ jsx7(
    "div",
    {
      className: "fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs5(
        "div",
        {
          className: `bg-slate-800/80 border border-slate-700 rounded-xl shadow-2xl w-full ${maxWidth} relative p-6 md:p-8`,
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs5("div", { className: "flex justify-between items-center mb-6", children: [
              /* @__PURE__ */ jsx7("h2", { className: "text-2xl font-bold text-white", children: title }),
              /* @__PURE__ */ jsx7("button", { onClick: onClose, className: "text-gray-400 hover:text-white", children: /* @__PURE__ */ jsx7(XIcon, { className: "w-6 h-6" }) })
            ] }),
            /* @__PURE__ */ jsx7("div", { children })
          ]
        }
      )
    }
  );
};
var Modal_default = Modal;

// components/ChatWidget.tsx
import { useState as useState4, useRef as useRef2, useEffect as useEffect3 } from "react";
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
var ChatWidget = ({ user }) => {
  const { dispatch } = useBankData();
  const [isOpen, setIsOpen] = useState4(false);
  const [newMessage, setNewMessage] = useState4("");
  const messagesEndRef = useRef2(null);
  const lastSeenAdminMessageId = useRef2(null);
  const chatMessages = user.chat?.messages || [];
  useEffect3(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isOpen]);
  useEffect3(() => {
    const lastMessage = chatMessages[chatMessages.length - 1];
    if (!isOpen && lastMessage && lastMessage.sender === "admin" && lastMessage.id !== lastSeenAdminMessageId.current) {
      setIsOpen(true);
    }
    if (lastMessage && lastMessage.sender === "admin") {
      lastSeenAdminMessageId.current = lastMessage.id;
    }
  }, [chatMessages, isOpen]);
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "")
      return;
    const message = {
      id: generateId(),
      sender: "customer",
      text: newMessage.trim(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      read: false
    };
    dispatch({
      type: "SEND_CHAT_MESSAGE",
      payload: { userId: user.id, message }
    });
    setNewMessage("");
  };
  if (!isOpen) {
    return /* @__PURE__ */ jsx8(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "fixed bottom-5 right-5 bg-cyan-500 text-white p-4 rounded-full shadow-lg hover:bg-cyan-400 transition-colors z-50",
        "aria-label": "Open chat",
        children: /* @__PURE__ */ jsx8(MessageSquareIcon, { className: "w-6 h-6" })
      }
    );
  }
  return /* @__PURE__ */ jsxs6("div", { className: "fixed bottom-5 right-5 w-full max-w-sm h-[28rem] bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50", children: [
    /* @__PURE__ */ jsxs6("div", { className: "p-3 flex justify-between items-center border-b border-slate-700 flex-shrink-0", children: [
      /* @__PURE__ */ jsx8("h3", { className: "font-bold text-white", children: "Live Chat Support" }),
      /* @__PURE__ */ jsx8("button", { onClick: () => setIsOpen(false), className: "text-gray-400 hover:text-white", "aria-label": "Close chat", children: /* @__PURE__ */ jsx8(XIcon, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs6("div", { className: "flex-1 p-3 overflow-y-auto", children: [
      chatMessages.map((msg) => /* @__PURE__ */ jsx8("div", { className: `flex mb-2 ${msg.sender === "customer" ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsx8("div", { className: `rounded-lg py-1 px-3 max-w-[80%] ${msg.sender === "customer" ? "bg-cyan-600 text-white" : "bg-slate-700 text-gray-300"}`, children: /* @__PURE__ */ jsx8("p", { className: "text-sm", children: msg.text }) }) }, msg.id)),
      /* @__PURE__ */ jsx8("div", { ref: messagesEndRef })
    ] }),
    /* @__PURE__ */ jsx8("div", { className: "p-2 border-t border-slate-700 flex-shrink-0", children: /* @__PURE__ */ jsxs6("form", { onSubmit: handleSendMessage, className: "flex gap-2", children: [
      /* @__PURE__ */ jsx8(
        "input",
        {
          type: "text",
          value: newMessage,
          onChange: (e) => setNewMessage(e.target.value),
          placeholder: "Type a message...",
          className: "flex-1 bg-slate-700 border border-slate-600 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        }
      ),
      /* @__PURE__ */ jsx8("button", { type: "submit", className: "bg-cyan-500 p-2 rounded-lg text-white font-semibold", children: "Send" })
    ] }) })
  ] });
};
var ChatWidget_default = ChatWidget;

// pages/CustomerDashboardPage.tsx
import jsPDF from "jspdf";
import "jspdf-autotable";
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
var AccountCard = ({ account, onViewDetails }) => {
  const isPending = account.status === "pending_review";
  const getAccountDetails = () => {
    switch (account.type) {
      case "Credit Card" /* CREDIT_CARD */:
        const used = Math.abs(account.balance);
        const limit = account.creditLimit || 0;
        return /* @__PURE__ */ jsxs7("p", { className: "text-xs text-gray-400 mt-2", children: [
          formatCurrency(used),
          " / ",
          formatCurrency(limit),
          " used"
        ] });
      case "Mortgage" /* MORTGAGE */:
        const remaining = Math.abs(account.balance);
        const total = account.loanAmount || 0;
        return /* @__PURE__ */ jsxs7("p", { className: "text-xs text-gray-400 mt-2", children: [
          formatCurrency(remaining),
          " of ",
          formatCurrency(total),
          " remaining"
        ] });
      default:
        return null;
    }
  };
  const displayBalance = account.type === "Credit Card" /* CREDIT_CARD */ ? Math.abs(account.balance) : account.balance;
  return /* @__PURE__ */ jsxs7(
    "div",
    {
      onClick: !isPending ? onViewDetails : void 0,
      className: `relative p-6 rounded-xl border bg-slate-800/50  transition-all duration-300 ${isPending ? "border-yellow-500/30 opacity-60 cursor-not-allowed" : "border-slate-700 hover:border-slate-600 cursor-pointer"}`,
      children: [
        isPending && /* @__PURE__ */ jsx9("div", { className: "absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full font-semibold", children: "Pending Review" }),
        /* @__PURE__ */ jsxs7("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxs7("div", { children: [
            /* @__PURE__ */ jsx9("p", { className: "text-sm text-gray-400 pr-8", children: account.nickname || account.type }),
            /* @__PURE__ */ jsxs7("p", { className: "text-xs text-gray-500", children: [
              "...",
              account.accountNumber.slice(-4)
            ] }),
            /* @__PURE__ */ jsx9("p", { className: "text-2xl font-bold text-white mt-2", children: formatCurrency(displayBalance) })
          ] }),
          account.type === "Checking" /* CHECKING */ && /* @__PURE__ */ jsx9(DollarSignIcon, { className: "w-8 h-8 text-cyan-400 flex-shrink-0" }),
          account.type === "Savings" /* SAVINGS */ && /* @__PURE__ */ jsx9(HomeIcon, { className: "w-8 h-8 text-green-400 flex-shrink-0" }),
          account.type === "Credit Card" /* CREDIT_CARD */ && /* @__PURE__ */ jsx9(CreditCardIcon, { className: "w-8 h-8 text-purple-400 flex-shrink-0" }),
          account.type === "Mortgage" /* MORTGAGE */ && /* @__PURE__ */ jsx9(MortgageIcon, { className: "w-8 h-8 text-orange-400 flex-shrink-0" })
        ] }),
        getAccountDetails()
      ]
    }
  );
};
var TransactionRow = ({ transaction }) => /* @__PURE__ */ jsxs7("tr", { className: "border-b border-slate-800 last:border-b-0", children: [
  /* @__PURE__ */ jsx9("td", { className: "py-3 px-4 text-sm text-gray-300", children: transaction.date }),
  /* @__PURE__ */ jsx9("td", { className: "py-3 px-4 text-white", children: transaction.description }),
  /* @__PURE__ */ jsx9("td", { className: `py-3 px-4 text-right font-medium ${transaction.amount >= 0 ? "text-green-400" : "text-red-400"}`, children: formatCurrency(transaction.amount) }),
  /* @__PURE__ */ jsx9("td", { className: "py-3 px-4 text-right text-gray-400", children: formatCurrency(transaction.balance) })
] });
var PendingTransactionRow = ({ transaction }) => /* @__PURE__ */ jsxs7("tr", { className: "border-b border-slate-800", children: [
  /* @__PURE__ */ jsx9("td", { className: "py-3 px-4 text-sm text-gray-300", children: transaction.date }),
  /* @__PURE__ */ jsx9("td", { className: "py-3 px-4 text-white", children: transaction.description }),
  /* @__PURE__ */ jsx9("td", { className: "py-3 px-4 text-right font-medium text-green-400", children: formatCurrency(transaction.amount) }),
  /* @__PURE__ */ jsx9("td", { className: "py-3 px-4 text-right text-yellow-400", children: transaction.status })
] });
var TransferFunds = ({ user }) => {
  const { dispatch } = useBankData();
  const transferSourceAccounts = user.accounts.filter((a) => a.type === "Checking" /* CHECKING */ || a.type === "Savings" /* SAVINGS */);
  const transferDestinationAccounts = user.accounts.filter((a) => a.type !== "Mortgage" /* MORTGAGE */ && a.status !== "pending_review");
  const [fromAccount, setFromAccount] = useState5(transferSourceAccounts[0]?.id || "");
  const [toAccount, setToAccount] = useState5(transferDestinationAccounts.find((a) => a.id !== fromAccount)?.id || "");
  const [amount, setAmount] = useState5("");
  const [status, setStatus] = useState5("idle");
  const [error, setError] = useState5("");
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Please enter a valid amount.");
      setStatus("error");
      return;
    }
    if (fromAccount === toAccount) {
      setError("Cannot transfer to the same account.");
      setStatus("error");
      return;
    }
    const sourceAccount = user.accounts.find((acc) => acc.id === fromAccount);
    if (!sourceAccount || sourceAccount.balance < transferAmount) {
      setError("Insufficient funds for this transfer.");
      setStatus("error");
      return;
    }
    setTimeout(() => {
      dispatch({
        type: "TRANSFER_FUNDS",
        payload: { fromAccountId: fromAccount, toAccountId: toAccount, amount: transferAmount, userId: user.id }
      });
      setStatus("success");
      setAmount("");
      setTimeout(() => setStatus("idle"), 3e3);
    }, 1500);
  };
  return /* @__PURE__ */ jsxs7("div", { className: "bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6", children: [
    /* @__PURE__ */ jsx9("h3", { className: "text-xl font-bold mb-4 text-white", children: "Transfer Funds" }),
    /* @__PURE__ */ jsxs7("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs7("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs7("div", { children: [
          /* @__PURE__ */ jsx9("label", { htmlFor: "fromAccount", className: "text-sm font-medium text-gray-400", children: "From" }),
          /* @__PURE__ */ jsx9("select", { id: "fromAccount", value: fromAccount, onChange: (e) => setFromAccount(e.target.value), className: "mt-1 w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500", children: transferSourceAccounts.map((acc) => /* @__PURE__ */ jsxs7("option", { value: acc.id, children: [
            acc.nickname || acc.type,
            " (...",
            acc.accountNumber.slice(-4),
            ")"
          ] }, acc.id)) })
        ] }),
        /* @__PURE__ */ jsxs7("div", { children: [
          /* @__PURE__ */ jsx9("label", { htmlFor: "toAccount", className: "text-sm font-medium text-gray-400", children: "To" }),
          /* @__PURE__ */ jsx9("select", { id: "toAccount", value: toAccount, onChange: (e) => setToAccount(e.target.value), className: "mt-1 w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500", children: transferDestinationAccounts.map((acc) => /* @__PURE__ */ jsxs7("option", { value: acc.id, children: [
            acc.nickname || acc.type,
            " (...",
            acc.accountNumber.slice(-4),
            ")"
          ] }, acc.id)) })
        ] }),
        /* @__PURE__ */ jsxs7("div", { children: [
          /* @__PURE__ */ jsx9("label", { htmlFor: "amount", className: "text-sm font-medium text-gray-400", children: "Amount" }),
          /* @__PURE__ */ jsxs7("div", { className: "relative mt-1", children: [
            /* @__PURE__ */ jsx9("div", { className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3", children: /* @__PURE__ */ jsx9("span", { className: "text-gray-400", children: "$" }) }),
            /* @__PURE__ */ jsx9("input", { type: "number", id: "amount", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "0.00", className: "w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 pl-7 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx9("div", { className: "mt-6", children: /* @__PURE__ */ jsx9("button", { type: "submit", disabled: status === "loading", className: "w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-lg transition-all disabled:bg-slate-600 disabled:cursor-not-allowed", children: status === "loading" ? /* @__PURE__ */ jsx9("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mx-auto" }) : "Confirm Transfer" }) }),
      status === "success" && /* @__PURE__ */ jsxs7("div", { className: "mt-4 text-green-400 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx9(CheckCircleIcon, { className: "w-5 h-5" }),
        " Transfer successful!"
      ] }),
      status === "error" && /* @__PURE__ */ jsxs7("div", { className: "mt-4 text-red-400 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx9(AlertTriangleIcon, { className: "w-5 h-5" }),
        " ",
        error
      ] })
    ] })
  ] });
};
var QuickActions = ({ onAction }) => /* @__PURE__ */ jsxs7("div", { className: "bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6", children: [
  /* @__PURE__ */ jsx9("h3", { className: "text-xl font-bold mb-4 text-white", children: "Quick Actions" }),
  /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-4", children: [
    /* @__PURE__ */ jsxs7("button", { onClick: () => onAction("Pay Bills"), className: "flex flex-col items-center justify-center gap-2 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors", children: [
      /* @__PURE__ */ jsx9(CalendarIcon, { className: "w-6 h-6 text-cyan-400" }),
      /* @__PURE__ */ jsx9("span", { className: "text-sm text-white", children: "Pay Bills" })
    ] }),
    /* @__PURE__ */ jsxs7("button", { onClick: () => onAction("Deposit Check"), className: "flex flex-col items-center justify-center gap-2 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors", children: [
      /* @__PURE__ */ jsx9(CreditCardIcon, { className: "w-6 h-6 text-green-400" }),
      /* @__PURE__ */ jsx9("span", { className: "text-sm text-white", children: "Deposit Check" })
    ] }),
    /* @__PURE__ */ jsxs7("button", { onClick: () => onAction("View Statements"), className: "flex flex-col items-center justify-center gap-2 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors", children: [
      /* @__PURE__ */ jsx9(BuildingBankIcon, { className: "w-6 h-6 text-purple-400" }),
      /* @__PURE__ */ jsx9("span", { className: "text-sm text-white", children: "Statements" })
    ] }),
    /* @__PURE__ */ jsxs7("button", { onClick: () => onAction("Contact Support"), className: "flex flex-col items-center justify-center gap-2 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors", children: [
      /* @__PURE__ */ jsx9(HomeIcon, { className: "w-6 h-6 text-orange-400" }),
      /* @__PURE__ */ jsx9("span", { className: "text-sm text-white", children: "Support" })
    ] })
  ] })
] });
var AccountDetailsModal = ({ account, user, onClose, onEditNickname }) => {
  const generateStatementPDF = () => {
    const doc = new jsPDF();
    const today = /* @__PURE__ */ new Date();
    const statementPeriod = `${new Date(today.setMonth(today.getMonth() - 1)).toLocaleDateString()} - ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`;
    doc.setFontSize(22);
    doc.setTextColor(40, 150, 200);
    doc.text("Fifth Baptist Bank", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("123 Banking Way, Anytown, USA", 14, 30);
    doc.setFontSize(12);
    doc.text("Account Statement", 14, 45);
    doc.setFontSize(10);
    doc.text(user.name, 14, 52);
    doc.text(user.address, 14, 57);
    const lastMonthTransactions = account.transactions.filter((tx) => new Date(tx.date) > new Date((/* @__PURE__ */ new Date()).setMonth((/* @__PURE__ */ new Date()).getMonth() - 1)));
    const deposits = lastMonthTransactions.filter((tx) => tx.type === "credit").reduce((sum, tx) => sum + tx.amount, 0);
    const withdrawals = lastMonthTransactions.filter((tx) => tx.type === "debit").reduce((sum, tx) => sum + tx.amount, 0);
    const startBalance = account.balance - (deposits + withdrawals);
    doc.autoTable({
      startY: 65,
      head: [["Account Summary"]],
      body: [
        ["Account Type", `${account.nickname || account.type} (...${account.accountNumber.slice(-4)})`],
        ["Statement Period", statementPeriod],
        ["Beginning Balance", formatCurrency(startBalance)],
        ["Total Deposits", formatCurrency(deposits)],
        ["Total Withdrawals", formatCurrency(withdrawals)],
        ["Ending Balance", { content: formatCurrency(account.balance), styles: { fontStyle: "bold" } }]
      ],
      theme: "striped",
      headStyles: { fillColor: [40, 150, 200] }
    });
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Date", "Description", "Amount", "Balance"]],
      body: account.transactions.map((tx) => [tx.date, tx.description, formatCurrency(tx.amount), formatCurrency(tx.balance)]),
      theme: "grid",
      headStyles: { fillColor: [40, 150, 200] }
    });
    doc.save(`${(account.nickname || account.type).replace(" ", "-")}-statement-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf`);
  };
  const displayBalance = account.type === "Credit Card" /* CREDIT_CARD */ ? Math.abs(account.balance) : account.balance;
  return /* @__PURE__ */ jsx9(Modal_default, { isOpen: !!account, onClose, title: account.nickname || account.type, maxWidth: "max-w-3xl", children: /* @__PURE__ */ jsxs7("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs7("div", { className: "bg-slate-900/50 p-4 rounded-lg", children: [
      /* @__PURE__ */ jsxs7("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx9("p", { className: "text-sm text-gray-400", children: "Current Balance" }),
        /* @__PURE__ */ jsxs7("button", { onClick: onEditNickname, className: "text-xs flex items-center gap-1 text-cyan-400 hover:underline", children: [
          /* @__PURE__ */ jsx9(EditIcon, { className: "w-3 h-3" }),
          " Edit Nickname"
        ] })
      ] }),
      /* @__PURE__ */ jsx9("p", { className: "text-3xl font-bold text-white", children: formatCurrency(displayBalance) })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
      /* @__PURE__ */ jsxs7("div", { className: "bg-slate-900/50 p-3 rounded-lg", children: [
        /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-xs", children: "Account Number" }),
        /* @__PURE__ */ jsx9("p", { className: "text-white font-mono", children: account.accountNumber })
      ] }),
      account.routingNumber && /* @__PURE__ */ jsxs7("div", { className: "bg-slate-900/50 p-3 rounded-lg", children: [
        /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-xs", children: "Routing Number" }),
        /* @__PURE__ */ jsx9("p", { className: "text-white font-mono", children: account.routingNumber })
      ] })
    ] }),
    account.type === "Credit Card" /* CREDIT_CARD */ && /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-3 gap-4 text-sm text-center", children: [
      /* @__PURE__ */ jsxs7("div", { className: "bg-slate-900/50 p-3 rounded-lg", children: [
        /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-xs", children: "Credit Limit" }),
        /* @__PURE__ */ jsx9("p", { className: "text-white", children: formatCurrency(account.creditLimit || 0) })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "bg-slate-900/50 p-3 rounded-lg", children: [
        /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-xs", children: "Available" }),
        /* @__PURE__ */ jsx9("p", { className: "text-white", children: formatCurrency((account.creditLimit || 0) + account.balance) })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "bg-slate-900/50 p-3 rounded-lg", children: [
        /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-xs", children: "APR" }),
        /* @__PURE__ */ jsxs7("p", { className: "text-white", children: [
          account.interestRate,
          "%"
        ] })
      ] })
    ] }),
    account.type === "Mortgage" /* MORTGAGE */ && /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
      /* @__PURE__ */ jsxs7("div", { className: "bg-slate-900/50 p-3 rounded-lg", children: [
        /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-xs", children: "Original Loan" }),
        /* @__PURE__ */ jsx9("p", { className: "text-white", children: formatCurrency(account.loanAmount || 0) })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "bg-slate-900/50 p-3 rounded-lg", children: [
        /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-xs", children: "Interest Rate" }),
        /* @__PURE__ */ jsxs7("p", { className: "text-white", children: [
          account.interestRate,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "bg-slate-900/50 p-3 rounded-lg", children: [
        /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-xs", children: "Loan Start Date" }),
        /* @__PURE__ */ jsx9("p", { className: "text-white", children: account.loanStartDate })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "bg-slate-900/50 p-3 rounded-lg", children: [
        /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-xs", children: "Est. Payoff" }),
        /* @__PURE__ */ jsx9("p", { className: "text-white", children: account.estimatedPayoffDate })
      ] })
    ] }),
    /* @__PURE__ */ jsxs7("div", { children: [
      /* @__PURE__ */ jsx9("h4", { className: "text-lg font-bold text-white mb-2", children: "Transaction History" }),
      /* @__PURE__ */ jsx9("div", { className: "max-h-96 overflow-y-auto border border-slate-700 rounded-lg", children: /* @__PURE__ */ jsxs7("table", { className: "w-full text-left", children: [
        /* @__PURE__ */ jsx9("thead", { className: "sticky top-0 bg-slate-800/95 backdrop-blur-sm", children: /* @__PURE__ */ jsxs7("tr", { children: [
          /* @__PURE__ */ jsx9("th", { className: "py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Date" }),
          /* @__PURE__ */ jsx9("th", { className: "py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Description" }),
          /* @__PURE__ */ jsx9("th", { className: "py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right", children: "Amount" }),
          /* @__PURE__ */ jsx9("th", { className: "py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right", children: "Balance" })
        ] }) }),
        /* @__PURE__ */ jsx9("tbody", { children: account.transactions && account.transactions.length > 0 ? account.transactions.map((tx) => /* @__PURE__ */ jsx9(TransactionRow, { transaction: tx }, tx.id)) : /* @__PURE__ */ jsx9("tr", { children: /* @__PURE__ */ jsx9("td", { colSpan: 4, className: "text-center p-8 text-gray-400", children: "No transactions found for this account." }) }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "flex justify-between items-center pt-4 border-t border-slate-700/50 mt-4", children: [
      /* @__PURE__ */ jsxs7("button", { onClick: generateStatementPDF, className: "flex items-center gap-2 text-sm bg-purple-600/80 hover:bg-purple-500/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors", children: [
        /* @__PURE__ */ jsx9(FileTextIcon, { className: "w-4 h-4" }),
        "Generate Statement"
      ] }),
      /* @__PURE__ */ jsx9("button", { onClick: onClose, className: "bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded", children: "Close" })
    ] })
  ] }) });
};
var NotificationsDropdown = ({ alerts }) => {
  const [isOpen, setIsOpen] = useState5(false);
  const unreadCount = alerts.filter((a) => !a.read).length;
  return /* @__PURE__ */ jsxs7("div", { className: "relative", children: [
    /* @__PURE__ */ jsxs7("button", { onClick: () => setIsOpen(!isOpen), className: "relative text-gray-400 hover:text-white", children: [
      /* @__PURE__ */ jsx9(BellIcon, { className: "w-6 h-6" }),
      unreadCount > 0 && /* @__PURE__ */ jsx9("span", { className: "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white", children: unreadCount })
    ] }),
    isOpen && /* @__PURE__ */ jsxs7("div", { className: "absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50", children: [
      /* @__PURE__ */ jsx9("div", { className: "p-3 font-bold text-white border-b border-slate-700", children: "Notifications" }),
      /* @__PURE__ */ jsx9("div", { className: "max-h-96 overflow-y-auto", children: alerts.map((alert) => /* @__PURE__ */ jsxs7("div", { className: `p-3 border-b border-slate-700/50 ${!alert.read ? "bg-cyan-500/10" : ""}`, children: [
        /* @__PURE__ */ jsx9("p", { className: "text-sm text-gray-300", children: alert.message }),
        /* @__PURE__ */ jsx9("p", { className: "text-xs text-gray-500 mt-1", children: alert.date })
      ] }, alert.id)) })
    ] })
  ] });
};
var BillPayModal = ({ user, onClose }) => {
  const { dispatch } = useBankData();
  const [fromAccount, setFromAccount] = useState5(user.accounts.find((a) => a.type !== "Mortgage" /* MORTGAGE */)?.id || "");
  const [payee, setPayee] = useState5("");
  const [amount, setAmount] = useState5("");
  const [date, setDate] = useState5((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [status, setStatus] = useState5("idle");
  const handleSubmit = (e) => {
    e.preventDefault();
    const payment = {
      id: generateId(),
      payee,
      amount: parseFloat(amount),
      date,
      fromAccountId: fromAccount
    };
    dispatch({ type: "SCHEDULE_BILL_PAYMENT", payload: { userId: user.id, payment } });
    setStatus("success");
    setTimeout(() => {
      onClose();
    }, 2e3);
  };
  if (status === "success") {
    return /* @__PURE__ */ jsxs7("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx9(CheckCircleIcon, { className: "w-16 h-16 text-green-400 mx-auto mb-4" }),
      /* @__PURE__ */ jsx9("h3", { className: "text-xl font-bold text-white", children: "Payment Scheduled!" }),
      /* @__PURE__ */ jsxs7("p", { className: "text-gray-400", children: [
        "Your payment of ",
        formatCurrency(parseFloat(amount)),
        " to ",
        payee,
        " has been scheduled for ",
        date,
        "."
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs7("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs7("div", { children: [
      /* @__PURE__ */ jsx9("label", { htmlFor: "fromAccount", className: "text-sm font-medium text-gray-400", children: "Pay From" }),
      /* @__PURE__ */ jsx9("select", { id: "fromAccount", value: fromAccount, onChange: (e) => setFromAccount(e.target.value), className: "mt-1 w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500", children: user.accounts.filter((a) => a.type !== "Mortgage" /* MORTGAGE */).map((acc) => /* @__PURE__ */ jsxs7("option", { value: acc.id, children: [
        acc.nickname || acc.type,
        " (...",
        acc.accountNumber.slice(-4),
        ") - ",
        formatCurrency(acc.balance)
      ] }, acc.id)) })
    ] }),
    /* @__PURE__ */ jsx9("input", { value: payee, onChange: (e) => setPayee(e.target.value), placeholder: "Payee Name (e.g., City Power)", className: "w-full bg-slate-700 p-2 rounded text-white", required: true }),
    /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsx9("input", { type: "number", step: "0.01", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "Amount", className: "w-full bg-slate-700 p-2 rounded text-white", required: true }),
      /* @__PURE__ */ jsx9("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "w-full bg-slate-700 p-2 rounded text-white", required: true })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "mt-6 flex justify-end gap-3", children: [
      /* @__PURE__ */ jsx9("button", { type: "button", onClick: onClose, className: "bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded", children: "Cancel" }),
      /* @__PURE__ */ jsx9("button", { type: "submit", className: "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded", children: "Schedule Payment" })
    ] })
  ] });
};
var CreditApplicationModal = ({ user, onClose }) => {
  const { dispatch } = useBankData();
  const [formData, setFormData] = useState5({
    fullName: user.name,
    dob: "",
    maritalStatus: "",
    ssn: "",
    monthlyHousing: "",
    yearlyIncome: "",
    requestedLimit: ""
  });
  const [status, setStatus] = useState5("form");
  const [approvedLimit, setApprovedLimit] = useState5(0);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("processing");
    const submissionEvent = {
      id: generateId(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      type: "Credit Application Submitted" /* CREDIT_APP_SUBMITTED */,
      details: { ...formData }
    };
    dispatch({ type: "LOG_USER_EVENT", payload: { userId: user.id, event: submissionEvent } });
    const income = parseFloat(formData.yearlyIncome);
    const requestedLimit = parseFloat(formData.requestedLimit);
    const totalBalance = user.accounts.filter((acc) => acc.type === "Checking" /* CHECKING */ || acc.type === "Savings" /* SAVINGS */).reduce((sum, acc) => sum + acc.balance, 0);
    setTimeout(() => {
      if (totalBalance < 2e3) {
        const denialEvent = { id: generateId(), timestamp: (/* @__PURE__ */ new Date()).toISOString(), type: "Credit Application Denied" /* CREDIT_APP_DENIED */, details: { reason: "Insufficient balance." } };
        dispatch({ type: "PROCESS_CREDIT_APPLICATION", payload: { userId: user.id, event: denialEvent, newAccount: null } });
        setStatus("denied");
        return;
      }
      const maxApprovableLimit = Math.min(5e4, Math.floor(income * 0.2));
      const finalLimit = Math.min(requestedLimit, maxApprovableLimit);
      if (finalLimit < 100) {
        const denialEvent = { id: generateId(), timestamp: (/* @__PURE__ */ new Date()).toISOString(), type: "Credit Application Denied" /* CREDIT_APP_DENIED */, details: { reason: "Approved limit below minimum threshold.", calculatedLimit: finalLimit } };
        dispatch({ type: "PROCESS_CREDIT_APPLICATION", payload: { userId: user.id, event: denialEvent, newAccount: null } });
        setStatus("denied");
        return;
      }
      const newCreditAccount = {
        id: generateId(),
        type: "Credit Card" /* CREDIT_CARD */,
        nickname: "Platinum Rewards",
        accountNumber: `4401${generateAccountNumber().slice(4)}`,
        balance: 0,
        creditLimit: finalLimit,
        interestRate: 19.99,
        transactions: [],
        status: "pending_review"
      };
      const approvalEvent = { id: generateId(), timestamp: (/* @__PURE__ */ new Date()).toISOString(), type: "Credit Application Approved" /* CREDIT_APP_APPROVED */, details: { approvedLimit: finalLimit } };
      dispatch({
        type: "PROCESS_CREDIT_APPLICATION",
        payload: { userId: user.id, event: approvalEvent, newAccount: newCreditAccount }
      });
      setApprovedLimit(finalLimit);
      setStatus("approved");
    }, 7e3);
  };
  if (status === "processing") {
    return /* @__PURE__ */ jsxs7("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx9("div", { className: "animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsx9("h3", { className: "text-xl font-bold text-white", children: "Processing Application..." }),
      /* @__PURE__ */ jsx9("p", { className: "text-gray-400", children: "We're reviewing your information. This will only take a moment." })
    ] });
  }
  if (status === "approved") {
    return /* @__PURE__ */ jsxs7("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx9(CheckCircleIcon, { className: "w-16 h-16 text-green-400 mx-auto mb-4" }),
      /* @__PURE__ */ jsx9("h3", { className: "text-2xl font-bold text-white", children: "Application Approved!" }),
      /* @__PURE__ */ jsxs7("p", { className: "text-gray-300 mt-2", children: [
        "Your new credit card application with a limit of ",
        /* @__PURE__ */ jsx9("span", { className: "font-bold text-cyan-400", children: formatCurrency(approvedLimit) }),
        " is now pending final review."
      ] }),
      /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-sm", children: "You will see the new account on your dashboard, and it will be activated within 24-48 hours." }),
      /* @__PURE__ */ jsx9("button", { onClick: onClose, className: "mt-6 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-6 rounded", children: "Return to Dashboard" })
    ] });
  }
  if (status === "denied") {
    return /* @__PURE__ */ jsxs7("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx9(AlertTriangleIcon, { className: "w-16 h-16 text-yellow-400 mx-auto mb-4" }),
      /* @__PURE__ */ jsx9("h3", { className: "text-2xl font-bold text-white", children: "Application Under Review" }),
      /* @__PURE__ */ jsx9("p", { className: "text-gray-300 mt-2", children: "After careful consideration, we are unable to approve your application for a new line of credit at this time." }),
      /* @__PURE__ */ jsx9("p", { className: "text-gray-400 text-sm mt-4", children: "We appreciate your interest in Fifth Baptist Bank." }),
      /* @__PURE__ */ jsx9("button", { onClick: onClose, className: "mt-6 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded", children: "Close" })
    ] });
  }
  return /* @__PURE__ */ jsxs7("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsx9("p", { className: "text-sm text-gray-400 mb-4", children: "Please confirm your information and complete the fields below to apply." }),
    /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsx9("label", { htmlFor: "fullName", className: "block text-sm font-medium text-gray-400", children: "Full Name" }),
        /* @__PURE__ */ jsx9("input", { type: "text", name: "fullName", id: "fullName", value: formData.fullName, onChange: handleChange, className: "mt-1 w-full bg-slate-700 p-2 rounded text-white", required: true })
      ] }),
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsx9("label", { htmlFor: "dob", className: "block text-sm font-medium text-gray-400", children: "Date of Birth" }),
        /* @__PURE__ */ jsx9("input", { type: "date", name: "dob", id: "dob", value: formData.dob, onChange: handleChange, className: "mt-1 w-full bg-slate-700 p-2 rounded text-white", required: true })
      ] })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsx9("label", { htmlFor: "maritalStatus", className: "block text-sm font-medium text-gray-400", children: "Marital Status" }),
        /* @__PURE__ */ jsxs7("select", { name: "maritalStatus", id: "maritalStatus", value: formData.maritalStatus, onChange: handleChange, className: "mt-1 w-full bg-slate-700 p-2 rounded text-white", required: true, children: [
          /* @__PURE__ */ jsx9("option", { value: "", children: "Select..." }),
          /* @__PURE__ */ jsx9("option", { value: "single", children: "Single" }),
          /* @__PURE__ */ jsx9("option", { value: "married", children: "Married" }),
          /* @__PURE__ */ jsx9("option", { value: "divorced", children: "Divorced" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsx9("label", { htmlFor: "ssn", className: "block text-sm font-medium text-gray-400", children: "Social Security Number" }),
        /* @__PURE__ */ jsx9("input", { type: "text", name: "ssn", id: "ssn", value: formData.ssn, onChange: handleChange, placeholder: "XXX-XX-XXXX", className: "mt-1 w-full bg-slate-700 p-2 rounded text-white", required: true })
      ] })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsx9("label", { htmlFor: "monthlyHousing", className: "block text-sm font-medium text-gray-400", children: "Monthly Housing Payment" }),
        /* @__PURE__ */ jsx9("input", { type: "number", name: "monthlyHousing", id: "monthlyHousing", value: formData.monthlyHousing, onChange: handleChange, placeholder: "e.g., 1500", className: "mt-1 w-full bg-slate-700 p-2 rounded text-white", required: true })
      ] }),
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsx9("label", { htmlFor: "yearlyIncome", className: "block text-sm font-medium text-gray-400", children: "Total Annual Income" }),
        /* @__PURE__ */ jsx9("input", { type: "number", name: "yearlyIncome", id: "yearlyIncome", value: formData.yearlyIncome, onChange: handleChange, placeholder: "e.g., 75000", className: "mt-1 w-full bg-slate-700 p-2 rounded text-white", required: true })
      ] })
    ] }),
    /* @__PURE__ */ jsxs7("div", { children: [
      /* @__PURE__ */ jsx9("label", { htmlFor: "requestedLimit", className: "block text-sm font-medium text-gray-400", children: "Requested Credit Limit" }),
      /* @__PURE__ */ jsx9("input", { type: "number", name: "requestedLimit", id: "requestedLimit", value: formData.requestedLimit, onChange: handleChange, placeholder: "e.g., 10000", className: "mt-1 w-full bg-slate-700 p-2 rounded text-white", required: true })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "mt-6 flex justify-end gap-3 pt-4 border-t border-slate-700", children: [
      /* @__PURE__ */ jsx9("button", { type: "button", onClick: onClose, className: "bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded", children: "Cancel" }),
      /* @__PURE__ */ jsx9("button", { type: "submit", className: "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded", children: "Submit Application" })
    ] })
  ] });
};
var CardServices = ({ user }) => {
  const { dispatch } = useBankData();
  const [orderStatus, setOrderStatus] = useState5("idle");
  const handleLockToggle = () => {
    const newLockState = !user.isDebitCardLocked;
    const event = {
      id: generateId(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      type: newLockState ? "Debit Card Locked" /* DEBIT_CARD_LOCKED */ : "Debit Card Unlocked" /* DEBIT_CARD_UNLOCKED */,
      details: {}
    };
    dispatch({ type: "TOGGLE_DEBIT_CARD_LOCK", payload: { userId: user.id, isLocked: newLockState, event } });
  };
  const handleOrderCard = () => {
    if (window.confirm("Are you sure you want to order a new debit card? Your current card will be deactivated.")) {
      const event = {
        id: generateId(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        type: "New Debit Card Ordered" /* DEBIT_CARD_ORDERED */,
        details: { shippingAddress: user.address }
      };
      dispatch({ type: "ORDER_NEW_CARD", payload: { userId: user.id, event } });
      setOrderStatus("success");
      setTimeout(() => setOrderStatus("idle"), 4e3);
    }
  };
  return /* @__PURE__ */ jsxs7("div", { className: "bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6", children: [
    /* @__PURE__ */ jsx9("h3", { className: "text-xl font-bold mb-4 text-white", children: "Card Services" }),
    /* @__PURE__ */ jsxs7("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between bg-slate-900/50 p-3 rounded-lg", children: [
        /* @__PURE__ */ jsxs7("div", { children: [
          /* @__PURE__ */ jsxs7("p", { className: "font-medium text-white", children: [
            "Debit Card ...",
            user.accounts.find((a) => a.type === "Checking" /* CHECKING */)?.accountNumber.slice(-4)
          ] }),
          /* @__PURE__ */ jsx9("p", { className: `text-sm ${user.isDebitCardLocked ? "text-yellow-400" : "text-green-400"}`, children: user.isDebitCardLocked ? "Locked" : "Active" })
        ] }),
        /* @__PURE__ */ jsxs7("label", { className: "flex items-center cursor-pointer", children: [
          /* @__PURE__ */ jsx9("input", { type: "checkbox", checked: user.isDebitCardLocked, onChange: handleLockToggle, className: "sr-only peer" }),
          /* @__PURE__ */ jsx9("div", { className: "relative w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" })
        ] })
      ] }),
      /* @__PURE__ */ jsx9("div", { children: orderStatus === "success" ? /* @__PURE__ */ jsx9("div", { className: "text-green-400 text-center text-sm p-3 bg-green-500/10 rounded-lg", children: "New card ordered successfully." }) : /* @__PURE__ */ jsx9("button", { onClick: handleOrderCard, className: "w-full text-sm bg-purple-600/80 hover:bg-purple-500/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors", children: "Order a New Card" }) })
    ] })
  ] });
};
var CustomerDashboardPage = () => {
  const { user: authUser } = useAuth();
  const { database, dispatch } = useBankData();
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState5(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState5(false);
  const [isBillPayModalOpen, setIsBillPayModalOpen] = useState5(false);
  const [isApplyCreditModalOpen, setIsApplyCreditModalOpen] = useState5(false);
  const [selectedAccount, setSelectedAccount] = useState5(null);
  const [newNickname, setNewNickname] = useState5("");
  const currentUser = useMemo(
    () => database.users.find((u) => u.customerId === authUser?.customerId),
    [database.users, authUser]
  );
  const allPendingTransactions = useMemo(() => {
    if (!currentUser)
      return [];
    return currentUser.accounts.flatMap((acc) => acc.pendingTransactions || []);
  }, [currentUser]);
  const handleOpenNicknameModal = () => {
    if (!selectedAccount)
      return;
    setNewNickname(selectedAccount.nickname || "");
    setIsNicknameModalOpen(true);
  };
  const handleSaveNickname = () => {
    if (!selectedAccount || !currentUser)
      return;
    dispatch({
      type: "UPDATE_ACCOUNT_NICKNAME",
      payload: { userId: currentUser.id, accountId: selectedAccount.id, nickname: newNickname.trim() }
    });
    setSelectedAccount((prev) => prev ? { ...prev, nickname: newNickname.trim() } : null);
    setIsNicknameModalOpen(false);
  };
  const handleQuickAction = (action) => {
    if (action === "Pay Bills") {
      setIsBillPayModalOpen(true);
    } else {
      setIsFeatureModalOpen(true);
    }
  };
  if (!currentUser) {
    return /* @__PURE__ */ jsx9("div", { className: "text-center py-20 text-xl", children: "Loading customer data..." });
  }
  return /* @__PURE__ */ jsxs7("div", { children: [
    /* @__PURE__ */ jsxs7("div", { className: "flex justify-between items-center mb-8", children: [
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsxs7("h1", { className: "text-3xl font-bold text-white mb-2", children: [
          "Welcome back, ",
          currentUser.name
        ] }),
        /* @__PURE__ */ jsx9("p", { className: "text-gray-400", children: "Here's a summary of your accounts." })
      ] }),
      /* @__PURE__ */ jsx9(NotificationsDropdown, { alerts: currentUser.alerts || [] })
    ] }),
    currentUser.canApplyForCredit && /* @__PURE__ */ jsxs7("div", { className: "bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-xl mb-8 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsx9("h3", { className: "font-bold text-white text-xl", children: "You're pre-approved for our Platinum Rewards credit card!" }),
        /* @__PURE__ */ jsx9("p", { className: "text-blue-100 text-sm", children: "Get an instant decision with no impact on your credit score." })
      ] }),
      /* @__PURE__ */ jsxs7("button", { onClick: () => setIsApplyCreditModalOpen(true), className: "group flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-slate-900 font-bold py-2 px-4 rounded-lg transition-transform duration-300 hover:scale-105", children: [
        "Apply Now",
        /* @__PURE__ */ jsx9(ArrowRightIcon, { className: "w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" })
      ] })
    ] }),
    /* @__PURE__ */ jsx9("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8", children: currentUser.accounts.map((acc) => /* @__PURE__ */ jsx9(
      AccountCard,
      {
        account: acc,
        onViewDetails: () => setSelectedAccount(acc)
      },
      acc.id
    )) }),
    /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs7("div", { className: "lg:col-span-2 space-y-8", children: [
        allPendingTransactions.length > 0 && /* @__PURE__ */ jsxs7("div", { className: "bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl", children: [
          /* @__PURE__ */ jsx9("div", { className: "p-6 border-b border-slate-700", children: /* @__PURE__ */ jsx9("h3", { className: "text-xl font-bold text-white", children: "Pending Transactions" }) }),
          /* @__PURE__ */ jsx9("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsx9("table", { className: "w-full text-left", children: /* @__PURE__ */ jsx9("tbody", { children: allPendingTransactions.map((tx) => /* @__PURE__ */ jsx9(PendingTransactionRow, { transaction: tx }, tx.id)) }) }) })
        ] }),
        currentUser.scheduledPayments && currentUser.scheduledPayments.length > 0 && /* @__PURE__ */ jsxs7("div", { className: "bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl", children: [
          /* @__PURE__ */ jsx9("div", { className: "p-6 border-b border-slate-700", children: /* @__PURE__ */ jsx9("h3", { className: "text-xl font-bold text-white", children: "Scheduled Payments" }) }),
          /* @__PURE__ */ jsx9("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsx9("table", { className: "w-full text-left", children: /* @__PURE__ */ jsx9("tbody", { children: currentUser.scheduledPayments.map((p) => {
            const fromAcc = currentUser.accounts.find((a) => a.id === p.fromAccountId);
            return /* @__PURE__ */ jsxs7("tr", { className: "border-b border-slate-800", children: [
              /* @__PURE__ */ jsx9("td", { className: "py-3 px-4 text-sm text-gray-300", children: p.date }),
              /* @__PURE__ */ jsx9("td", { className: "py-3 px-4 text-white", children: p.payee }),
              /* @__PURE__ */ jsx9("td", { className: "py-3 px-4 text-right font-medium text-red-400", children: formatCurrency(-p.amount) }),
              /* @__PURE__ */ jsxs7("td", { className: "py-3 px-4 text-right text-gray-400", children: [
                "from ...",
                fromAcc?.accountNumber.slice(-4)
              ] })
            ] }, p.id);
          }) }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsx9(TransferFunds, { user: currentUser }),
        /* @__PURE__ */ jsx9(CardServices, { user: currentUser }),
        /* @__PURE__ */ jsx9(QuickActions, { onAction: handleQuickAction })
      ] })
    ] }),
    selectedAccount && !isNicknameModalOpen && /* @__PURE__ */ jsx9(
      AccountDetailsModal,
      {
        account: selectedAccount,
        user: currentUser,
        onClose: () => setSelectedAccount(null),
        onEditNickname: handleOpenNicknameModal
      }
    ),
    /* @__PURE__ */ jsx9(Modal_default, { isOpen: isNicknameModalOpen, onClose: () => setIsNicknameModalOpen(false), title: "Edit Account Nickname", children: /* @__PURE__ */ jsxs7("div", { children: [
      /* @__PURE__ */ jsxs7("label", { htmlFor: "nickname", className: "block text-gray-300 text-sm font-bold mb-2", children: [
        "Nickname for ...",
        selectedAccount?.accountNumber.slice(-4)
      ] }),
      /* @__PURE__ */ jsx9(
        "input",
        {
          id: "nickname",
          type: "text",
          value: newNickname,
          onChange: (e) => setNewNickname(e.target.value),
          placeholder: "e.g., Vacation Fund",
          className: "w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
        }
      ),
      /* @__PURE__ */ jsxs7("div", { className: "mt-6 flex justify-end gap-3", children: [
        /* @__PURE__ */ jsx9("button", { type: "button", onClick: () => setIsNicknameModalOpen(false), className: "bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded", children: "Cancel" }),
        /* @__PURE__ */ jsx9("button", { type: "button", onClick: handleSaveNickname, className: "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded", children: "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx9(Modal_default, { isOpen: isBillPayModalOpen, onClose: () => setIsBillPayModalOpen(false), title: "Schedule a Bill Payment", children: /* @__PURE__ */ jsx9(BillPayModal, { user: currentUser, onClose: () => setIsBillPayModalOpen(false) }) }),
    /* @__PURE__ */ jsx9(Modal_default, { isOpen: isApplyCreditModalOpen, onClose: () => setIsApplyCreditModalOpen(false), title: "New Credit Application", children: /* @__PURE__ */ jsx9(CreditApplicationModal, { user: currentUser, onClose: () => setIsApplyCreditModalOpen(false) }) }),
    /* @__PURE__ */ jsxs7(Modal_default, { isOpen: isFeatureModalOpen, onClose: () => setIsFeatureModalOpen(false), title: "Feature Not Available", children: [
      /* @__PURE__ */ jsx9("p", { className: "text-gray-300", children: "This feature is currently under development and will be available soon. Thank you for your patience." }),
      /* @__PURE__ */ jsx9("div", { className: "mt-6 flex justify-end", children: /* @__PURE__ */ jsx9("button", { type: "button", onClick: () => setIsFeatureModalOpen(false), className: "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded", children: "OK" }) })
    ] }),
    /* @__PURE__ */ jsx9(ChatWidget_default, { user: currentUser })
  ] });
};
var CustomerDashboardPage_default = CustomerDashboardPage;

// pages/AdminLoginPage.tsx
import { useState as useState6 } from "react";
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
var AdminLoginPage = () => {
  const [username, setUsername] = useState6("");
  const [password, setPassword] = useState6("");
  const [error, setError] = useState6("");
  const [isLoading, setIsLoading] = useState6(false);
  const { adminLogin } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1e3));
    const success = await adminLogin(username, password);
    if (!success) {
      setError("Invalid admin credentials.");
    }
    setIsLoading(false);
  };
  return /* @__PURE__ */ jsx10("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsxs8("div", { className: "w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl p-8", children: [
    /* @__PURE__ */ jsx10("h1", { className: "text-3xl font-bold text-center text-white mb-2", children: "Admin Portal" }),
    /* @__PURE__ */ jsx10("p", { className: "text-center text-gray-400 mb-8", children: "Secure administrator access." }),
    error && /* @__PURE__ */ jsxs8("div", { className: "bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-3", role: "alert", children: [
      /* @__PURE__ */ jsx10(AlertTriangleIcon, { className: "w-5 h-5" }),
      /* @__PURE__ */ jsx10("span", { className: "block sm:inline text-sm", children: error })
    ] }),
    /* @__PURE__ */ jsxs8("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs8("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx10("label", { className: "block text-gray-300 text-sm font-bold mb-2", htmlFor: "username", children: "Username" }),
        /* @__PURE__ */ jsx10(
          "input",
          {
            id: "username",
            type: "text",
            value: username,
            onChange: (e) => setUsername(e.target.value),
            className: "w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs8("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx10("label", { className: "block text-gray-300 text-sm font-bold mb-2", htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsx10(
          "input",
          {
            id: "password",
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            className: "w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx10("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx10(
        "button",
        {
          type: "submit",
          disabled: isLoading,
          className: "w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed",
          children: isLoading ? /* @__PURE__ */ jsx10("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mx-auto" }) : "Sign In"
        }
      ) })
    ] })
  ] }) });
};
var AdminLoginPage_default = AdminLoginPage;

// pages/AdminDashboardPage.tsx
import { useState as useState7, useEffect as useEffect4, useRef as useRef3, useMemo as useMemo2 } from "react";
import { Fragment as Fragment2, jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
var UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState7(user || {
    id: generateId(),
    customerId: Math.floor(1e7 + Math.random() * 9e7).toString(),
    password: "",
    name: "",
    email: "",
    address: "",
    accounts: [{
      id: generateId(),
      type: "Checking" /* CHECKING */,
      accountNumber: generateAccountNumber(),
      balance: 0,
      transactions: [],
      status: "active"
    }],
    chat: { messages: [] },
    isLocked: false,
    lockoutReason: "",
    canApplyForCredit: false,
    isDebitCardLocked: false,
    history: []
  });
  const handleUserChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleAccountChange = (index, e) => {
    const newAccounts = [...formData.accounts];
    const field = e.target.name;
    let value = e.target.value;
    if (["balance", "creditLimit", "loanAmount", "interestRate"].includes(field)) {
      value = parseFloat(e.target.value) || 0;
    }
    newAccounts[index][field] = value;
    setFormData({ ...formData, accounts: newAccounts });
  };
  const addAccount = () => {
    const newAccount = {
      id: generateId(),
      type: "Checking" /* CHECKING */,
      accountNumber: generateAccountNumber(),
      balance: 0,
      transactions: [],
      status: "active"
    };
    setFormData({ ...formData, accounts: [...formData.accounts, newAccount] });
  };
  const removeAccount = (idToRemove) => {
    const newAccounts = formData.accounts.filter((acc) => acc.id !== idToRemove);
    setFormData({ ...formData, accounts: newAccounts });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  return /* @__PURE__ */ jsxs9("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs9("div", { children: [
      /* @__PURE__ */ jsx11("h3", { className: "font-bold text-lg mb-2 text-white", children: "User Details" }),
      /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx11("input", { name: "name", value: formData.name, onChange: handleUserChange, placeholder: "Full Name", className: "bg-slate-700 p-2 rounded text-white w-full", required: true }),
        /* @__PURE__ */ jsx11("input", { name: "email", type: "email", value: formData.email, onChange: handleUserChange, placeholder: "Email Address", className: "bg-slate-700 p-2 rounded text-white w-full", required: true }),
        /* @__PURE__ */ jsx11("input", { name: "customerId", value: formData.customerId, onChange: handleUserChange, placeholder: "Customer ID", className: "bg-slate-700 p-2 rounded text-white w-full", required: true }),
        /* @__PURE__ */ jsx11("input", { name: "password", value: formData.password, onChange: handleUserChange, placeholder: "Password", className: "bg-slate-700 p-2 rounded text-white w-full", required: true })
      ] }),
      /* @__PURE__ */ jsx11("input", { name: "address", value: formData.address, onChange: handleUserChange, placeholder: "Address", className: "w-full bg-slate-700 p-2 rounded mt-4 text-white" })
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "border-t border-slate-700 pt-4", children: [
      /* @__PURE__ */ jsxs9("div", { className: "flex justify-between items-center mb-2", children: [
        /* @__PURE__ */ jsx11("h3", { className: "font-bold text-lg text-white", children: "Accounts" }),
        /* @__PURE__ */ jsxs9("button", { type: "button", onClick: addAccount, className: "flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300", children: [
          /* @__PURE__ */ jsx11(PlusIcon, { className: "w-4 h-4" }),
          " Add Account"
        ] })
      ] }),
      /* @__PURE__ */ jsx11("div", { className: "space-y-3 max-h-64 overflow-y-auto pr-2", children: formData.accounts.map((acc, index) => /* @__PURE__ */ jsxs9("div", { className: "bg-slate-900/50 p-3 rounded space-y-2", children: [
        /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs9("select", { name: "type", value: acc.type, onChange: (e) => handleAccountChange(index, e), className: "bg-slate-700 p-2 rounded text-white w-full", children: [
            /* @__PURE__ */ jsx11("option", { value: "Checking" /* CHECKING */, children: "Checking" }),
            /* @__PURE__ */ jsx11("option", { value: "Savings" /* SAVINGS */, children: "Savings" }),
            /* @__PURE__ */ jsx11("option", { value: "Credit Card" /* CREDIT_CARD */, children: "Credit Card" }),
            /* @__PURE__ */ jsx11("option", { value: "Mortgage" /* MORTGAGE */, children: "Mortgage" })
          ] }),
          formData.accounts.length > 1 && /* @__PURE__ */ jsx11("button", { type: "button", onClick: () => removeAccount(acc.id), className: "text-red-500 hover:text-red-400 p-2", children: /* @__PURE__ */ jsx11(MinusIcon, { className: "w-5 h-5" }) })
        ] }),
        /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx11("input", { name: "accountNumber", value: acc.accountNumber, disabled: true, placeholder: "Account Number", className: "w-full bg-slate-800 p-2 rounded text-gray-400 cursor-not-allowed" }),
          (acc.type === "Checking" /* CHECKING */ || acc.type === "Savings" /* SAVINGS */ || acc.type === "Credit Card" /* CREDIT_CARD */) && /* @__PURE__ */ jsx11("input", { type: "number", step: "0.01", name: "balance", value: acc.balance, onChange: (e) => handleAccountChange(index, e), placeholder: "Balance", className: "w-full bg-slate-700 p-2 rounded text-white" }),
          acc.type === "Credit Card" /* CREDIT_CARD */ && /* @__PURE__ */ jsx11("input", { type: "number", step: "0.01", name: "creditLimit", value: acc.creditLimit || "", onChange: (e) => handleAccountChange(index, e), placeholder: "Credit Limit", className: "w-full bg-slate-700 p-2 rounded text-white" }),
          (acc.type === "Mortgage" /* MORTGAGE */ || acc.type === "Credit Card" /* CREDIT_CARD */) && /* @__PURE__ */ jsx11("input", { type: "number", step: "0.01", name: "interestRate", value: acc.interestRate || "", onChange: (e) => handleAccountChange(index, e), placeholder: "Interest Rate %", className: "w-full bg-slate-700 p-2 rounded text-white" }),
          acc.type === "Mortgage" /* MORTGAGE */ && /* @__PURE__ */ jsx11("input", { type: "number", step: "0.01", name: "loanAmount", value: acc.loanAmount || "", onChange: (e) => handleAccountChange(index, e), placeholder: "Original Loan", className: "w-full bg-slate-700 p-2 rounded text-white" })
        ] })
      ] }, acc.id)) })
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "mt-6 flex justify-end gap-3 border-t border-slate-700 pt-4", children: [
      /* @__PURE__ */ jsx11("button", { type: "button", onClick: onCancel, className: "bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded", children: "Cancel" }),
      /* @__PURE__ */ jsx11("button", { type: "submit", className: "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded", children: "Save User" })
    ] })
  ] });
};
var TransactionForm = ({ user, onSave, onCancel }) => {
  const { dispatch } = useBankData();
  const [accountId, setAccountId] = useState7(user.accounts[0]?.id || "");
  const [description, setDescription] = useState7("");
  const [amount, setAmount] = useState7("");
  const [type, setType] = useState7("credit");
  const [date, setDate] = useState7((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const transactionPayload = {
      date,
      description,
      amount: parseFloat(amount),
      type
    };
    dispatch({
      type: "ADD_TRANSACTION_TO_ACCOUNT",
      payload: { userId: user.id, accountId, transaction: transactionPayload }
    });
    onSave();
  };
  return /* @__PURE__ */ jsxs9("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs9("div", { children: [
      /* @__PURE__ */ jsx11("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Account" }),
      /* @__PURE__ */ jsx11("select", { value: accountId, onChange: (e) => setAccountId(e.target.value), className: "w-full bg-slate-700 p-2 rounded text-white", children: user.accounts.map((acc) => /* @__PURE__ */ jsxs9("option", { value: acc.id, children: [
        acc.nickname || acc.type,
        " (...",
        acc.accountNumber.slice(-4),
        ")"
      ] }, acc.id)) })
    ] }),
    /* @__PURE__ */ jsx11("input", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Description", className: "w-full bg-slate-700 p-2 rounded text-white", required: true }),
    /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsx11("input", { type: "number", step: "0.01", value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "Amount", className: "w-full bg-slate-700 p-2 rounded text-white", required: true }),
      /* @__PURE__ */ jsx11("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "w-full bg-slate-700 p-2 rounded text-white", required: true })
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "grid grid-cols-1", children: /* @__PURE__ */ jsxs9("select", { value: type, onChange: (e) => setType(e.target.value), className: "w-full bg-slate-700 p-2 rounded text-white", children: [
      /* @__PURE__ */ jsx11("option", { value: "credit", children: "Credit (Deposit)" }),
      /* @__PURE__ */ jsx11("option", { value: "debit", children: "Debit (Withdrawal)" })
    ] }) }),
    /* @__PURE__ */ jsxs9("div", { className: "mt-6 flex justify-end gap-3", children: [
      /* @__PURE__ */ jsx11("button", { type: "button", onClick: onCancel, className: "bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded", children: "Cancel" }),
      /* @__PURE__ */ jsx11("button", { type: "submit", className: "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded", children: "Add Transaction" })
    ] })
  ] });
};
var GenerateHistoryForm = ({ user, onSave, onCancel }) => {
  const { dispatch } = useBankData();
  const [accountId, setAccountId] = useState7(user.accounts[0]?.id || "");
  const [years, setYears] = useState7("1");
  const [isLoading, setIsLoading] = useState7(false);
  const [isSuccess, setIsSuccess] = useState7(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    const targetAccount = user.accounts.find((acc) => acc.id === accountId);
    if (!targetAccount)
      return;
    setTimeout(() => {
      const newTransactions = generateTransactionHistory(targetAccount, parseInt(years, 10));
      dispatch({
        type: "GENERATE_TRANSACTION_HISTORY",
        payload: { userId: user.id, accountId, newTransactions }
      });
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => onSave(), 1500);
    }, 100);
  };
  return /* @__PURE__ */ jsxs9("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs9("div", { children: [
      /* @__PURE__ */ jsx11("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Account" }),
      /* @__PURE__ */ jsx11("select", { value: accountId, onChange: (e) => setAccountId(e.target.value), className: "w-full bg-slate-700 p-2 rounded text-white", children: user.accounts.map((acc) => /* @__PURE__ */ jsxs9("option", { value: acc.id, children: [
        acc.nickname || acc.type,
        " (...",
        acc.accountNumber.slice(-4),
        ")"
      ] }, acc.id)) })
    ] }),
    /* @__PURE__ */ jsxs9("div", { children: [
      /* @__PURE__ */ jsx11("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Years of History to Generate" }),
      /* @__PURE__ */ jsx11("input", { type: "number", min: "1", max: "10", value: years, onChange: (e) => setYears(e.target.value), className: "w-full bg-slate-700 p-2 rounded text-white", required: true })
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "mt-6 flex justify-end gap-3", children: [
      /* @__PURE__ */ jsx11("button", { type: "button", onClick: onCancel, className: "bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded", disabled: isLoading, children: "Cancel" }),
      /* @__PURE__ */ jsx11("button", { type: "submit", className: "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded w-36", disabled: isLoading || isSuccess, children: isLoading ? /* @__PURE__ */ jsx11("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mx-auto" }) : isSuccess ? /* @__PURE__ */ jsx11(CheckCircleIcon, { className: "w-6 h-6 mx-auto text-slate-900" }) : "Generate" })
    ] }),
    isSuccess && /* @__PURE__ */ jsxs9("p", { className: "text-green-400 text-center mt-2", children: [
      "Successfully generated ",
      years,
      " year(s) of history!"
    ] })
  ] });
};
var AdminChatModal = ({ user, onClose, isOpen }) => {
  const { dispatch } = useBankData();
  const [newMessage, setNewMessage] = useState7("");
  const messagesEndRef = useRef3(null);
  const chatMessages = user.chat?.messages || [];
  useEffect4(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "")
      return;
    const message = {
      id: generateId(),
      sender: "admin",
      text: newMessage.trim(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      read: false
    };
    dispatch({
      type: "SEND_CHAT_MESSAGE",
      payload: { userId: user.id, message }
    });
    setNewMessage("");
  };
  return /* @__PURE__ */ jsx11(Modal_default, { isOpen, onClose, title: `Chat with ${user.name}`, maxWidth: "max-w-lg", children: /* @__PURE__ */ jsxs9("div", { className: "flex flex-col h-96", children: [
    /* @__PURE__ */ jsxs9("div", { className: "flex-1 p-3 overflow-y-auto bg-slate-900/50 rounded-t-lg", children: [
      chatMessages.map((msg) => /* @__PURE__ */ jsx11("div", { className: `flex mb-2 ${msg.sender === "admin" ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsx11("div", { className: `rounded-lg py-1 px-3 max-w-[80%] ${msg.sender === "admin" ? "bg-cyan-600 text-white" : "bg-slate-700 text-gray-300"}`, children: /* @__PURE__ */ jsx11("p", { className: "text-sm", children: msg.text }) }) }, msg.id)),
      /* @__PURE__ */ jsx11("div", { ref: messagesEndRef })
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "p-2 border-t border-slate-700", children: /* @__PURE__ */ jsxs9("form", { onSubmit: handleSendMessage, className: "flex gap-2", children: [
      /* @__PURE__ */ jsx11(
        "input",
        {
          type: "text",
          value: newMessage,
          onChange: (e) => setNewMessage(e.target.value),
          placeholder: "Type a message...",
          className: "flex-1 bg-slate-700 border border-slate-600 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        }
      ),
      /* @__PURE__ */ jsx11("button", { type: "submit", className: "bg-cyan-500 p-2 rounded-lg text-white font-semibold", children: "Send" })
    ] }) })
  ] }) });
};
var UserHistoryModal = ({ user, onClose, isOpen }) => {
  const renderDetails = (event) => {
    return Object.entries(event.details).map(([key, value]) => /* @__PURE__ */ jsxs9("div", { className: "text-xs", children: [
      /* @__PURE__ */ jsxs9("span", { className: "font-semibold text-gray-400 capitalize", children: [
        key.replace(/([A-Z])/g, " $1"),
        ": "
      ] }),
      /* @__PURE__ */ jsx11("span", { className: "text-gray-300", children: value.toString() })
    ] }, key));
  };
  const sortedHistory = [...user.history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return /* @__PURE__ */ jsx11(Modal_default, { isOpen, onClose, title: `History for ${user.name}`, maxWidth: "max-w-2xl", children: /* @__PURE__ */ jsx11("div", { className: "max-h-[60vh] overflow-y-auto pr-2", children: sortedHistory.length > 0 ? /* @__PURE__ */ jsx11("div", { className: "space-y-4", children: sortedHistory.map((event) => /* @__PURE__ */ jsxs9("div", { className: "bg-slate-900/50 p-3 rounded-lg", children: [
    /* @__PURE__ */ jsxs9("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx11("p", { className: "font-bold text-cyan-400 text-sm", children: event.type }),
      /* @__PURE__ */ jsx11("p", { className: "text-xs text-gray-500", children: new Date(event.timestamp).toLocaleString() })
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "mt-2 pl-2 border-l-2 border-slate-700", children: renderDetails(event) })
  ] }, event.id)) }) : /* @__PURE__ */ jsx11("p", { className: "text-gray-400 text-center py-8", children: "No history found for this user." }) }) });
};
var AccountReviewQueue = ({ pendingItems, isAlarmPlaying, onSilence }) => {
  const { dispatch } = useBankData();
  const handleApprove = (userId, accountId) => {
    if (window.confirm("Are you sure you want to approve this account? It will become active and a notification will be sent to the customer.")) {
      dispatch({ type: "APPROVE_ACCOUNT", payload: { userId, accountId } });
    }
  };
  const handleDeny = (userId, accountId) => {
    if (window.confirm("Are you sure you want to deny this application? The pending account will be removed.")) {
      dispatch({ type: "DENY_ACCOUNT", payload: { userId, accountId } });
    }
  };
  if (pendingItems.length === 0)
    return null;
  return /* @__PURE__ */ jsxs9("div", { className: "bg-slate-800/50 backdrop-blur-lg border border-yellow-500/50 rounded-xl p-6 mb-8", children: [
    /* @__PURE__ */ jsxs9("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx11(BellIcon, { className: `w-6 h-6 ${isAlarmPlaying ? "text-yellow-400 animate-pulse" : "text-gray-500"}` }),
        /* @__PURE__ */ jsxs9("h2", { className: "text-xl font-bold text-white", children: [
          "Account Review Queue (",
          pendingItems.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs9(
        "button",
        {
          onClick: onSilence,
          disabled: !isAlarmPlaying,
          className: "flex items-center gap-2 text-sm bg-yellow-600/80 hover:bg-yellow-500/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed",
          children: [
            /* @__PURE__ */ jsx11(VolumeXIcon, { className: "w-5 h-5" }),
            "Silence Alarm"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "space-y-4 max-h-96 overflow-y-auto pr-2", children: pendingItems.map(({ user, account, event }) => /* @__PURE__ */ jsxs9("div", { className: "bg-slate-900/50 p-4 rounded-lg", children: [
      /* @__PURE__ */ jsxs9("div", { className: "flex justify-between items-start", children: [
        /* @__PURE__ */ jsxs9("div", { children: [
          /* @__PURE__ */ jsxs9("p", { className: "font-bold text-cyan-400", children: [
            user.name,
            " - ",
            user.customerId
          ] }),
          /* @__PURE__ */ jsxs9("p", { className: "text-sm text-gray-300", children: [
            "New ",
            account.type,
            " approved with limit of ",
            /* @__PURE__ */ jsx11("span", { className: "font-semibold text-white", children: formatCurrency(account.creditLimit || 0) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx11("button", { onClick: () => handleDeny(user.id, account.id), className: "bg-red-600/80 hover:bg-red-500/80 text-white font-bold py-2 px-4 rounded-lg", children: "Deny" }),
          /* @__PURE__ */ jsx11("button", { onClick: () => handleApprove(user.id, account.id), className: "bg-green-600/80 hover:bg-green-500/80 text-white font-bold py-2 px-4 rounded-lg", children: "Approve" })
        ] })
      ] }),
      event && /* @__PURE__ */ jsx11("div", { className: "mt-3 pt-3 border-t border-slate-700/50 text-xs text-gray-400 grid grid-cols-2 md:grid-cols-4 gap-2", children: Object.entries(event.details).map(([key, value]) => /* @__PURE__ */ jsxs9("div", { children: [
        /* @__PURE__ */ jsxs9("span", { className: "font-semibold capitalize", children: [
          key.replace(/([A-Z])/g, " $1"),
          ": "
        ] }),
        /* @__PURE__ */ jsx11("span", { className: "text-gray-300", children: value })
      ] }, key)) })
    ] }, account.id)) })
  ] });
};
var AdminManagement = () => {
  const { database, dispatch } = useBankData();
  const { admins } = database;
  const [isModalOpen, setIsModalOpen] = useState7(false);
  const [selectedAdmin, setSelectedAdmin] = useState7(void 0);
  const handleAdd = () => {
    setSelectedAdmin(void 0);
    setIsModalOpen(true);
  };
  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };
  const handleDelete = (adminId) => {
    if (window.confirm("Are you sure you want to delete this administrator? This action cannot be undone.")) {
      dispatch({ type: "DELETE_ADMIN", payload: adminId });
    }
  };
  const handleSave = (admin) => {
    if (admins.some((a) => a.id === admin.id)) {
      dispatch({ type: "UPDATE_ADMIN", payload: admin });
    } else {
      dispatch({ type: "ADD_ADMIN", payload: admin });
    }
    setIsModalOpen(false);
  };
  return /* @__PURE__ */ jsxs9("div", { className: "bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 mb-8", children: [
    /* @__PURE__ */ jsxs9("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsx11("h2", { className: "text-xl font-bold text-white", children: "Administrator Management" }),
      /* @__PURE__ */ jsxs9("button", { onClick: handleAdd, className: "flex items-center gap-2 text-sm bg-purple-600/80 hover:bg-purple-500/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors", children: [
        /* @__PURE__ */ jsx11(UserPlusIcon, { className: "w-4 h-4" }),
        "Add Admin"
      ] })
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs9("table", { className: "w-full text-left", children: [
      /* @__PURE__ */ jsx11("thead", { className: "border-b border-slate-700 bg-slate-900/30", children: /* @__PURE__ */ jsxs9("tr", { children: [
        /* @__PURE__ */ jsx11("th", { className: "p-3 text-sm font-semibold text-gray-300", children: "Username" }),
        /* @__PURE__ */ jsx11("th", { className: "p-3 text-sm font-semibold text-gray-300 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx11("tbody", { children: admins.map((admin) => /* @__PURE__ */ jsxs9("tr", { className: "border-b border-slate-800 last:border-b-0", children: [
        /* @__PURE__ */ jsx11("td", { className: "p-3 text-white", children: admin.username }),
        /* @__PURE__ */ jsx11("td", { className: "p-3 text-right", children: /* @__PURE__ */ jsxs9("div", { className: "flex gap-4 items-center justify-end", children: [
          /* @__PURE__ */ jsx11("button", { onClick: () => handleEdit(admin), title: "Edit Admin", className: "text-cyan-400 hover:text-cyan-300", children: /* @__PURE__ */ jsx11(EditIcon, { className: "w-5 h-5" }) }),
          admins.length > 1 && /* @__PURE__ */ jsx11("button", { onClick: () => handleDelete(admin.id), title: "Delete Admin", className: "text-red-500 hover:text-red-400", children: /* @__PURE__ */ jsx11(TrashIcon, { className: "w-5 h-5" }) })
        ] }) })
      ] }, admin.id)) })
    ] }) }),
    /* @__PURE__ */ jsx11(Modal_default, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: selectedAdmin ? "Edit Admin" : "Add New Admin", children: /* @__PURE__ */ jsx11(AdminUserForm, { admin: selectedAdmin, onSave: handleSave, onCancel: () => setIsModalOpen(false) }) })
  ] });
};
var AdminUserForm = ({ admin, onSave, onCancel }) => {
  const [formData, setFormData] = useState7(admin || { id: generateId(), username: "", password: "" });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  return /* @__PURE__ */ jsxs9("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsx11("input", { name: "username", value: formData.username, onChange: handleChange, placeholder: "Username", className: "w-full bg-slate-700 p-2 rounded text-white", required: true }),
    /* @__PURE__ */ jsx11("input", { name: "password", value: formData.password, onChange: handleChange, placeholder: "Password", className: "w-full bg-slate-700 p-2 rounded text-white", required: true }),
    /* @__PURE__ */ jsxs9("div", { className: "mt-6 flex justify-end gap-3", children: [
      /* @__PURE__ */ jsx11("button", { type: "button", onClick: onCancel, className: "bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded", children: "Cancel" }),
      /* @__PURE__ */ jsx11("button", { type: "submit", className: "bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded", children: "Save" })
    ] })
  ] });
};
var AdminDashboardPage = () => {
  const { database, dispatch } = useBankData();
  const { users, globalBanner } = database;
  const [isUserModalOpen, setIsUserModalOpen] = useState7(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState7(false);
  const [isGenerateHistoryModalOpen, setIsGenerateHistoryModalOpen] = useState7(false);
  const [isActionHistoryModalOpen, setIsActionHistoryModalOpen] = useState7(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState7(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState7(false);
  const [selectedUser, setSelectedUser] = useState7(void 0);
  const [lockoutReason, setLockoutReason] = useState7("");
  const [bannerMessage, setBannerMessage] = useState7(globalBanner.message);
  const [bannerIsVisible, setBannerIsVisible] = useState7(globalBanner.isVisible);
  const [bannerStatus, setBannerStatus] = useState7("idle");
  const [isAlarmPlaying, setIsAlarmPlaying] = useState7(false);
  const alarmAudioPlayerRef = useRef3(null);
  const chatAudioPlayerRef = useRef3(null);
  const chatMessageCountsRef = useRef3(/* @__PURE__ */ new Map());
  const isInitialMount = useRef3(true);
  const prevPendingCount = useRef3(0);
  const pendingReviewItems = useMemo2(() => {
    const items = [];
    users.forEach((user) => {
      user.accounts.forEach((account) => {
        if (account.status === "pending_review") {
          const event = user.history.find((h) => h.type === "Credit Application Submitted" /* CREDIT_APP_SUBMITTED */);
          items.push({ user, account, event });
        }
      });
    });
    return items;
  }, [users]);
  useEffect4(() => {
    if (pendingReviewItems.length > prevPendingCount.current) {
      setIsAlarmPlaying(true);
    }
    prevPendingCount.current = pendingReviewItems.length;
  }, [pendingReviewItems.length]);
  useEffect4(() => {
    const audioEl = alarmAudioPlayerRef.current;
    if (audioEl) {
      if (isAlarmPlaying) {
        audioEl.play().catch((e) => console.error("Alarm audio playback failed.", e));
      } else {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    }
  }, [isAlarmPlaying]);
  useEffect4(() => {
    if (isInitialMount.current) {
      users.forEach((user) => {
        chatMessageCountsRef.current.set(user.id, user.chat?.messages?.length || 0);
      });
      isInitialMount.current = false;
      return;
    }
    let newCustomerMessageReceived = false;
    users.forEach((user) => {
      const currentMessageCount = user.chat?.messages?.length || 0;
      const prevMessageCount = chatMessageCountsRef.current.get(user.id) || 0;
      if (currentMessageCount > prevMessageCount) {
        const lastMessage = user.chat.messages[currentMessageCount - 1];
        if (lastMessage.sender === "customer") {
          newCustomerMessageReceived = true;
        }
      }
      chatMessageCountsRef.current.set(user.id, currentMessageCount);
    });
    if (newCustomerMessageReceived) {
      chatAudioPlayerRef.current?.play().catch((e) => console.error("Chat audio playback failed", e));
    }
  }, [users]);
  const handleAddUser = () => {
    setSelectedUser(void 0);
    setIsUserModalOpen(true);
  };
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };
  const handleOpenTransactionModal = (user) => {
    setSelectedUser(user);
    setIsTransactionModalOpen(true);
  };
  const handleOpenGenerateHistoryModal = (user) => {
    setSelectedUser(user);
    setIsGenerateHistoryModalOpen(true);
  };
  const handleOpenActionHistoryModal = (user) => {
    setSelectedUser(user);
    setIsActionHistoryModalOpen(true);
  };
  const handleOpenChatModal = (user) => {
    setSelectedUser(user);
    setIsChatModalOpen(true);
  };
  const handleOpenLockModal = (user) => {
    setSelectedUser(user);
    setLockoutReason("");
    setIsLockModalOpen(true);
  };
  const handleUnlockUser = (userId) => {
    if (window.confirm("Are you sure you want to unlock this account?")) {
      dispatch({ type: "UNLOCK_USER", payload: { userId } });
    }
  };
  const handleToggleCreditApplication = (user) => {
    const canApply = !user.canApplyForCredit;
    const action = canApply ? "enable" : "disable";
    if (window.confirm(`Are you sure you want to ${action} the credit application for ${user.name}?`)) {
      dispatch({ type: "TOGGLE_CREDIT_APPLICATION", payload: { userId: user.id, canApply } });
    }
  };
  const handleConfirmLockout = () => {
    if (!selectedUser || !lockoutReason.trim())
      return;
    dispatch({ type: "LOCK_USER", payload: { userId: selectedUser.id, reason: lockoutReason.trim() } });
    setIsLockModalOpen(false);
    setSelectedUser(void 0);
  };
  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch({ type: "DELETE_USER", payload: userId });
    }
  };
  const handleSaveUser = (user) => {
    if (selectedUser && users.some((u) => u.id === user.id)) {
      dispatch({ type: "UPDATE_USER", payload: user });
    } else {
      dispatch({ type: "ADD_USER", payload: user });
    }
    setIsUserModalOpen(false);
    setSelectedUser(void 0);
  };
  const handleSaveBanner = () => {
    dispatch({ type: "SET_BANNER", payload: { message: bannerMessage, isVisible: bannerIsVisible } });
    setBannerStatus("saved");
    setTimeout(() => setBannerStatus("idle"), 2e3);
  };
  return /* @__PURE__ */ jsxs9("div", { children: [
    /* @__PURE__ */ jsx11("audio", { ref: alarmAudioPlayerRef, src: "/assets/alert.mp3", loop: true }),
    /* @__PURE__ */ jsx11("audio", { ref: chatAudioPlayerRef, src: "/assets/alert.mp3" }),
    /* @__PURE__ */ jsxs9("div", { className: "flex flex-wrap justify-between items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsx11("h1", { className: "text-3xl font-bold text-white", children: "Admin Dashboard" }),
      /* @__PURE__ */ jsxs9("button", { onClick: handleAddUser, className: "flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-all", children: [
        /* @__PURE__ */ jsx11(UserPlusIcon, { className: "w-5 h-5" }),
        "Add New Customer"
      ] })
    ] }),
    /* @__PURE__ */ jsx11(
      AccountReviewQueue,
      {
        pendingItems: pendingReviewItems,
        isAlarmPlaying,
        onSilence: () => setIsAlarmPlaying(false)
      }
    ),
    /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8", children: [
      /* @__PURE__ */ jsxs9("div", { className: "bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx11("h2", { className: "text-xl font-bold text-white mb-4", children: "Site Banner Management" }),
        /* @__PURE__ */ jsxs9("div", { className: "grid md:grid-cols-3 gap-4 items-center", children: [
          /* @__PURE__ */ jsx11("input", { type: "text", value: bannerMessage, onChange: (e) => setBannerMessage(e.target.value), placeholder: "Banner message...", className: "md:col-span-2 w-full bg-slate-700 p-2 rounded text-white" }),
          /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs9("label", { className: "flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx11("input", { type: "checkbox", checked: bannerIsVisible, onChange: () => setBannerIsVisible(!bannerIsVisible), className: "sr-only peer" }),
              /* @__PURE__ */ jsx11("div", { className: "relative w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" }),
              /* @__PURE__ */ jsx11("span", { className: "ms-3 text-sm font-medium text-gray-300", children: "Visible" })
            ] }),
            /* @__PURE__ */ jsx11("button", { onClick: handleSaveBanner, className: "bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg w-28", children: bannerStatus === "saved" ? /* @__PURE__ */ jsx11(CheckCircleIcon, { className: "w-6 h-6 mx-auto" }) : "Save" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx11(AdminManagement, {})
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl overflow-hidden", children: [
      /* @__PURE__ */ jsx11("div", { className: "p-6 border-b border-slate-700", children: /* @__PURE__ */ jsx11("h2", { className: "text-xl font-bold text-white", children: "Customer Management" }) }),
      /* @__PURE__ */ jsx11("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs9("table", { className: "w-full text-left", children: [
        /* @__PURE__ */ jsx11("thead", { className: "border-b border-slate-700 bg-slate-900/30", children: /* @__PURE__ */ jsxs9("tr", { children: [
          /* @__PURE__ */ jsx11("th", { className: "p-4 text-sm font-semibold text-gray-300", children: "Name" }),
          /* @__PURE__ */ jsx11("th", { className: "p-4 text-sm font-semibold text-gray-300", children: "Customer ID" }),
          /* @__PURE__ */ jsx11("th", { className: "p-4 text-sm font-semibold text-gray-300", children: "Email" }),
          /* @__PURE__ */ jsx11("th", { className: "p-4 text-sm font-semibold text-gray-300", children: "Total Balance" }),
          /* @__PURE__ */ jsx11("th", { className: "p-4 text-sm font-semibold text-gray-300", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx11("tbody", { children: users.map((user) => /* @__PURE__ */ jsxs9("tr", { className: `border-b border-slate-800 transition-colors ${user.isLocked ? "bg-red-900/30 hover:bg-red-900/40" : "hover:bg-slate-800/40"}`, children: [
          /* @__PURE__ */ jsx11("td", { className: "p-4 text-white font-medium", children: user.name }),
          /* @__PURE__ */ jsx11("td", { className: "p-4 text-gray-400", children: user.customerId }),
          /* @__PURE__ */ jsx11("td", { className: "p-4 text-gray-400", children: user.email }),
          /* @__PURE__ */ jsx11("td", { className: "p-4 text-white", children: formatCurrency(user.accounts.reduce((sum, acc) => sum + acc.balance, 0)) }),
          /* @__PURE__ */ jsx11("td", { className: "p-4", children: /* @__PURE__ */ jsxs9("div", { className: "flex gap-4 items-center", children: [
            user.isLocked ? /* @__PURE__ */ jsx11("button", { onClick: () => handleUnlockUser(user.id), title: "Unlock Account", className: "text-green-400 hover:text-green-300", children: /* @__PURE__ */ jsx11(UnlockIcon, { className: "w-5 h-5" }) }) : /* @__PURE__ */ jsx11("button", { onClick: () => handleOpenLockModal(user), title: "Lock Account", className: "text-yellow-400 hover:text-yellow-300", children: /* @__PURE__ */ jsx11(LockIcon, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx11("button", { onClick: () => handleToggleCreditApplication(user), title: user.canApplyForCredit ? "Disable Credit Application" : "Enable Credit Application", className: user.canApplyForCredit ? "text-cyan-400 hover:text-cyan-300" : "text-gray-500 hover:text-gray-400", children: /* @__PURE__ */ jsx11(EyeIcon, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx11("button", { onClick: () => handleOpenChatModal(user), title: "Chat with user", className: "text-blue-400 hover:text-blue-300", children: /* @__PURE__ */ jsx11(MessageSquareIcon, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx11("button", { onClick: () => handleOpenActionHistoryModal(user), title: "View User History", className: "text-purple-400 hover:text-purple-300", children: /* @__PURE__ */ jsx11(HistoryIcon, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx11("button", { onClick: () => handleOpenGenerateHistoryModal(user), title: "Generate Transaction History", className: "text-indigo-400 hover:text-indigo-300", children: /* @__PURE__ */ jsx11(FileTextIcon, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx11("button", { onClick: () => handleOpenTransactionModal(user), title: "Add Transaction", className: "text-green-400 hover:text-green-300", children: /* @__PURE__ */ jsx11(PlusCircleIcon, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx11("button", { onClick: () => handleEditUser(user), title: "Edit User", className: "text-cyan-400 hover:text-cyan-300", children: /* @__PURE__ */ jsx11(EditIcon, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx11("button", { onClick: () => handleDeleteUser(user.id), title: "Delete User", className: "text-red-500 hover:text-red-400", children: /* @__PURE__ */ jsx11(TrashIcon, { className: "w-5 h-5" }) })
          ] }) })
        ] }, user.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx11(Modal_default, { isOpen: isUserModalOpen, onClose: () => setIsUserModalOpen(false), title: selectedUser ? "Edit Customer" : "Add New Customer", children: /* @__PURE__ */ jsx11(
      UserForm,
      {
        user: selectedUser,
        onSave: handleSaveUser,
        onCancel: () => setIsUserModalOpen(false)
      }
    ) }),
    /* @__PURE__ */ jsx11(Modal_default, { isOpen: isLockModalOpen, onClose: () => setIsLockModalOpen(false), title: `Lock Account for ${selectedUser?.name}`, children: /* @__PURE__ */ jsxs9("div", { children: [
      /* @__PURE__ */ jsx11("label", { htmlFor: "lockoutReason", className: "block text-gray-300 text-sm font-bold mb-2", children: "Reason for Lockout" }),
      /* @__PURE__ */ jsx11(
        "textarea",
        {
          id: "lockoutReason",
          value: lockoutReason,
          onChange: (e) => setLockoutReason(e.target.value),
          className: "w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition",
          placeholder: "e.g., Suspicious activity detected.",
          rows: 4
        }
      ),
      /* @__PURE__ */ jsxs9("div", { className: "mt-6 flex justify-end gap-3", children: [
        /* @__PURE__ */ jsx11("button", { type: "button", onClick: () => setIsLockModalOpen(false), className: "bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded", children: "Cancel" }),
        /* @__PURE__ */ jsx11("button", { type: "button", onClick: handleConfirmLockout, className: "bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded", children: "Confirm Lockout" })
      ] })
    ] }) }),
    selectedUser && /* @__PURE__ */ jsxs9(Fragment2, { children: [
      /* @__PURE__ */ jsx11(Modal_default, { isOpen: isTransactionModalOpen, onClose: () => setIsTransactionModalOpen(false), title: `Add Transaction for ${selectedUser.name}`, children: /* @__PURE__ */ jsx11(
        TransactionForm,
        {
          user: selectedUser,
          onSave: () => setIsTransactionModalOpen(false),
          onCancel: () => setIsTransactionModalOpen(false)
        }
      ) }),
      /* @__PURE__ */ jsx11(Modal_default, { isOpen: isGenerateHistoryModalOpen, onClose: () => setIsGenerateHistoryModalOpen(false), title: `Generate History for ${selectedUser.name}`, children: /* @__PURE__ */ jsx11(
        GenerateHistoryForm,
        {
          user: selectedUser,
          onSave: () => setIsGenerateHistoryModalOpen(false),
          onCancel: () => setIsGenerateHistoryModalOpen(false)
        }
      ) }),
      /* @__PURE__ */ jsx11(
        UserHistoryModal,
        {
          isOpen: isActionHistoryModalOpen,
          user: selectedUser,
          onClose: () => setIsActionHistoryModalOpen(false)
        }
      ),
      /* @__PURE__ */ jsx11(
        AdminChatModal,
        {
          isOpen: isChatModalOpen,
          user: selectedUser,
          onClose: () => setIsChatModalOpen(false)
        }
      )
    ] })
  ] });
};
var AdminDashboardPage_default = AdminDashboardPage;

// components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { Fragment as Fragment3, jsx as jsx12 } from "react/jsx-runtime";
var ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return /* @__PURE__ */ jsx12("div", { className: "flex justify-center items-center h-screen", children: /* @__PURE__ */ jsx12("div", { className: "animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500" }) });
  }
  if (!user) {
    const redirectPath = allowedRoles.includes("admin") ? "/admin/login" : "/login";
    return /* @__PURE__ */ jsx12(Navigate, { to: redirectPath, state: { from: location }, replace: true });
  }
  if (!allowedRoles.includes(user.role)) {
    return /* @__PURE__ */ jsx12(Navigate, { to: "/", replace: true });
  }
  return /* @__PURE__ */ jsx12(Fragment3, { children });
};
var ProtectedRoute_default = ProtectedRoute;

// components/Header.tsx
import { useState as useState8 } from "react";
import { Link as Link2, useNavigate as useNavigate4 } from "react-router-dom";
import { Fragment as Fragment4, jsx as jsx13, jsxs as jsxs10 } from "react/jsx-runtime";
var Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState8(false);
  const navigate = useNavigate4();
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };
  const handleLoginRedirect = () => {
    navigate("/login");
    setIsMenuOpen(false);
  };
  const renderAuthLinks = () => {
    if (user) {
      return /* @__PURE__ */ jsxs10("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsxs10("span", { className: "hidden sm:inline text-sm text-gray-300", children: [
          "Welcome, ",
          user.name
        ] }),
        /* @__PURE__ */ jsxs10(
          "button",
          {
            onClick: handleLogout,
            className: "flex items-center gap-2 text-sm bg-red-600/80 hover:bg-red-500/80 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300",
            children: [
              /* @__PURE__ */ jsx13(LogOutIcon, { className: "w-4 h-4" }),
              "Logout"
            ]
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsx13("div", { className: "hidden md:flex items-center space-x-2", children: /* @__PURE__ */ jsx13(
      "button",
      {
        onClick: handleLoginRedirect,
        className: "text-sm bg-cyan-500/80 hover:bg-cyan-400/80 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300",
        children: "Sign In"
      }
    ) });
  };
  const renderMobileMenu = () => /* @__PURE__ */ jsx13("div", { className: "md:hidden absolute top-full right-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-lg rounded-lg shadow-xl p-4 z-50", children: !user ? /* @__PURE__ */ jsxs10(Fragment4, { children: [
    /* @__PURE__ */ jsx13(Link2, { to: "/", className: "block py-2 text-gray-300 hover:text-white", onClick: () => setIsMenuOpen(false), children: "Home" }),
    /* @__PURE__ */ jsx13(
      "button",
      {
        onClick: handleLoginRedirect,
        className: "w-full text-left mt-2 bg-cyan-500/80 hover:bg-cyan-400/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300",
        children: "Sign In"
      }
    )
  ] }) : /* @__PURE__ */ jsxs10(
    "button",
    {
      onClick: handleLogout,
      className: "w-full flex items-center gap-2 text-left text-sm bg-red-600/80 hover:bg-red-500/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300",
      children: [
        /* @__PURE__ */ jsx13(LogOutIcon, { className: "w-4 h-4" }),
        "Logout"
      ]
    }
  ) });
  return /* @__PURE__ */ jsx13("header", { className: "sticky top-0 bg-slate-900/50 backdrop-blur-lg z-40", children: /* @__PURE__ */ jsx13("nav", { className: "container mx-auto px-4 py-4", children: /* @__PURE__ */ jsxs10("div", { className: "flex justify-between items-center", children: [
    /* @__PURE__ */ jsxs10(Link2, { to: "/", className: "flex items-center space-x-2 text-white", children: [
      /* @__PURE__ */ jsx13(LogoIcon, { className: "h-8 w-8 text-cyan-400" }),
      /* @__PURE__ */ jsx13("span", { className: "text-xl font-bold tracking-tight", children: "Fifth Baptist Bank" })
    ] }),
    /* @__PURE__ */ jsxs10("div", { className: "hidden md:flex items-center space-x-6 text-sm font-medium text-gray-300", children: [
      /* @__PURE__ */ jsx13(Link2, { to: "/", className: "hover:text-white transition-colors", children: "Personal" }),
      /* @__PURE__ */ jsx13(Link2, { to: "/business", className: "hover:text-white transition-colors", children: "Business" }),
      /* @__PURE__ */ jsx13(Link2, { to: "/about", className: "hover:text-white transition-colors", children: "About Us" }),
      /* @__PURE__ */ jsx13(Link2, { to: "/contact", className: "hover:text-white transition-colors", children: "Contact" })
    ] }),
    renderAuthLinks(),
    /* @__PURE__ */ jsxs10("div", { className: "md:hidden", children: [
      /* @__PURE__ */ jsx13("button", { onClick: () => setIsMenuOpen(!isMenuOpen), children: isMenuOpen ? /* @__PURE__ */ jsx13(XIcon, { className: "h-6 w-6" }) : /* @__PURE__ */ jsx13(MenuIcon, { className: "h-6 w-6" }) }),
      isMenuOpen && renderMobileMenu()
    ] })
  ] }) }) });
};
var Header_default = Header;

// components/GlobalBanner.tsx
import { useState as useState9 } from "react";
import { jsx as jsx14, jsxs as jsxs11 } from "react/jsx-runtime";
var GlobalBanner2 = () => {
  const { database } = useBankData();
  const { message, isVisible } = database.globalBanner;
  const [isDismissed, setIsDismissed] = useState9(false);
  if (!isVisible || isDismissed || !message) {
    return null;
  }
  return /* @__PURE__ */ jsxs11("div", { className: "bg-cyan-500/90 text-slate-900 text-sm font-semibold p-3 relative text-center z-50", children: [
    /* @__PURE__ */ jsx14("span", { children: message }),
    /* @__PURE__ */ jsx14(
      "button",
      {
        onClick: () => setIsDismissed(true),
        className: "absolute top-1/2 right-4 -translate-y-1/2 hover:bg-black/20 rounded-full p-1 transition-colors",
        "aria-label": "Dismiss banner",
        children: /* @__PURE__ */ jsx14(XIcon, { className: "w-5 h-5" })
      }
    )
  ] });
};
var GlobalBanner_default = GlobalBanner2;

// components/Layout.tsx
import { jsx as jsx15, jsxs as jsxs12 } from "react/jsx-runtime";
var Layout = ({ children }) => {
  return /* @__PURE__ */ jsxs12("div", { className: "relative min-h-screen w-full bg-slate-900 text-white overflow-x-hidden", children: [
    /* @__PURE__ */ jsx15("div", { className: "absolute top-0 left-0 w-full h-full overflow-hidden z-0", children: /* @__PURE__ */ jsxs12("div", { className: "absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-[spin_20s_linear_infinite]", children: [
      /* @__PURE__ */ jsx15("div", { className: "absolute w-1/4 h-1/4 bg-gradient-to-br from-cyan-500/50 to-blue-600/20 rounded-full blur-3xl opacity-50 top-1/4 left-1/4" }),
      /* @__PURE__ */ jsx15("div", { className: "absolute w-1/3 h-1/3 bg-gradient-to-tl from-purple-600/50 to-indigo-700/20 rounded-full blur-3xl opacity-40 bottom-1/4 right-1/4" }),
      /* @__PURE__ */ jsx15("div", { className: "absolute w-1/2 h-1/2 bg-gradient-to-tr from-sky-400/30 to-slate-800/10 rounded-full blur-3xl opacity-30 bottom-1/3 left-1/3" })
    ] }) }),
    /* @__PURE__ */ jsxs12("div", { className: "relative z-10 flex flex-col min-h-screen", children: [
      /* @__PURE__ */ jsx15(GlobalBanner_default, {}),
      /* @__PURE__ */ jsx15(Header_default, {}),
      /* @__PURE__ */ jsx15("main", { className: "flex-grow container mx-auto px-4 py-8", children })
    ] })
  ] });
};
var Layout_default = Layout;

// pages/info/PlaceholderPage.tsx
import { Fragment as Fragment5, jsx as jsx16, jsxs as jsxs13 } from "react/jsx-runtime";
var PlaceholderPage = ({ title, children }) => {
  return /* @__PURE__ */ jsxs13(Fragment5, { children: [
    /* @__PURE__ */ jsxs13("div", { className: "max-w-4xl mx-auto py-12 px-4", children: [
      /* @__PURE__ */ jsx16("h1", { className: "text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight", children: title }),
      /* @__PURE__ */ jsx16("div", { className: "prose prose-invert lg:prose-xl text-gray-300 prose-p:leading-relaxed prose-a:text-cyan-400 hover:prose-a:text-cyan-300", children })
    ] }),
    /* @__PURE__ */ jsx16(Footer_default, {})
  ] });
};
var PlaceholderPage_default = PlaceholderPage;

// pages/RegistrationPage.tsx
import { useState as useState10 } from "react";
import { useNavigate as useNavigate5 } from "react-router-dom";
import { jsx as jsx17, jsxs as jsxs14 } from "react/jsx-runtime";
var RegistrationPage = () => {
  const { dispatch } = useBankData();
  const navigate = useNavigate5();
  const [formData, setFormData] = useState10({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
    dob: "",
    maritalStatus: "",
    ssn: "",
    monthlyHousing: "",
    yearlyIncome: ""
  });
  const [error, setError] = useState10("");
  const [isLoading, setIsLoading] = useState10(false);
  const [isSuccess, setIsSuccess] = useState10(false);
  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const newUser = {
        id: generateId(),
        customerId: Math.floor(1e7 + Math.random() * 9e7).toString(),
        password: formData.password,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        accounts: [
          {
            id: generateId(),
            type: "Checking" /* CHECKING */,
            accountNumber: generateAccountNumber(),
            routingNumber: "021000021",
            balance: 0,
            transactions: []
          }
        ],
        isLocked: false,
        lockoutReason: "",
        canApplyForCredit: false,
        isDebitCardLocked: false,
        history: []
      };
      dispatch({ type: "ADD_USER", payload: newUser });
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3e3);
    }, 1500);
  };
  if (isSuccess) {
    return /* @__PURE__ */ jsx17("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsxs14("div", { className: "w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl p-8 text-center", children: [
      /* @__PURE__ */ jsx17(CheckCircleIcon, { className: "w-16 h-16 text-green-400 mx-auto mb-4" }),
      /* @__PURE__ */ jsx17("h1", { className: "text-2xl font-bold text-white", children: "Registration Successful!" }),
      /* @__PURE__ */ jsx17("p", { className: "text-gray-300 mt-2", children: "Your account has been created. Redirecting you to the login page..." })
    ] }) });
  }
  return /* @__PURE__ */ jsx17("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsxs14("div", { className: "w-full max-w-2xl bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl p-8", children: [
    /* @__PURE__ */ jsx17("h1", { className: "text-3xl font-bold text-center text-white mb-2", children: "Open a New Account" }),
    /* @__PURE__ */ jsx17("p", { className: "text-center text-gray-400 mb-8", children: "Join Fifth Baptist Bank today." }),
    error && /* @__PURE__ */ jsx17("p", { className: "text-red-400 text-center mb-4", children: error }),
    /* @__PURE__ */ jsxs14("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs14("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx17("input", { name: "name", onChange: handleChange, placeholder: "Full Name", required: true, className: "bg-slate-700 p-3 rounded text-white" }),
        /* @__PURE__ */ jsx17("input", { name: "email", type: "email", onChange: handleChange, placeholder: "Email Address", required: true, className: "bg-slate-700 p-3 rounded text-white" })
      ] }),
      /* @__PURE__ */ jsx17("input", { name: "address", onChange: handleChange, placeholder: "Full Address", required: true, className: "w-full bg-slate-700 p-3 rounded text-white" }),
      /* @__PURE__ */ jsxs14("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx17("input", { name: "password", type: "password", onChange: handleChange, placeholder: "Password", required: true, className: "bg-slate-700 p-3 rounded text-white" }),
        /* @__PURE__ */ jsx17("input", { name: "confirmPassword", type: "password", onChange: handleChange, placeholder: "Confirm Password", required: true, className: "bg-slate-700 p-3 rounded text-white" })
      ] }),
      /* @__PURE__ */ jsxs14("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx17("input", { name: "dob", type: "date", onChange: handleChange, placeholder: "Date of Birth", required: true, className: "bg-slate-700 p-3 rounded text-white" }),
        /* @__PURE__ */ jsxs14("select", { name: "maritalStatus", onChange: handleChange, required: true, className: "bg-slate-700 p-3 rounded text-white", children: [
          /* @__PURE__ */ jsx17("option", { value: "", children: "Marital Status..." }),
          /* @__PURE__ */ jsx17("option", { value: "single", children: "Single" }),
          /* @__PURE__ */ jsx17("option", { value: "married", children: "Married" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs14("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx17("input", { name: "ssn", onChange: handleChange, placeholder: "Social Security Number", required: true, className: "bg-slate-700 p-3 rounded text-white" }),
        /* @__PURE__ */ jsx17("input", { name: "monthlyHousing", type: "number", onChange: handleChange, placeholder: "Monthly Housing Payment", required: true, className: "bg-slate-700 p-3 rounded text-white" })
      ] }),
      /* @__PURE__ */ jsx17("input", { name: "yearlyIncome", type: "number", onChange: handleChange, placeholder: "Yearly Income", required: true, className: "w-full bg-slate-700 p-3 rounded text-white" }),
      /* @__PURE__ */ jsx17("div", { className: "pt-4", children: /* @__PURE__ */ jsx17("button", { type: "submit", disabled: isLoading, className: "w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-4 rounded-lg transition-all disabled:bg-slate-600", children: isLoading ? "Processing..." : "Create Account" }) })
    ] })
  ] }) });
};
var RegistrationPage_default = RegistrationPage;

// App.tsx
import { jsx as jsx18, jsxs as jsxs15 } from "react/jsx-runtime";
var AppContent = () => {
  const { loading } = useBankData();
  if (loading) {
    return /* @__PURE__ */ jsx18("div", { className: "flex justify-center items-center h-screen", children: /* @__PURE__ */ jsx18("div", { className: "animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500" }) });
  }
  return /* @__PURE__ */ jsx18(HashRouter, { children: /* @__PURE__ */ jsx18(AuthProvider, { children: /* @__PURE__ */ jsx18(Layout_default, { children: /* @__PURE__ */ jsxs15(Routes, { children: [
    /* @__PURE__ */ jsx18(Route, { path: "/", element: /* @__PURE__ */ jsx18(HomePage_default, {}) }),
    /* @__PURE__ */ jsx18(Route, { path: "/register", element: /* @__PURE__ */ jsx18(RegistrationPage_default, {}) }),
    /* @__PURE__ */ jsx18(Route, { path: "/login", element: /* @__PURE__ */ jsx18(CustomerLoginPage_default, {}) }),
    /* @__PURE__ */ jsx18(Route, { path: "/admin/login", element: /* @__PURE__ */ jsx18(AdminLoginPage_default, {}) }),
    /* @__PURE__ */ jsx18(
      Route,
      {
        path: "/dashboard",
        element: /* @__PURE__ */ jsx18(ProtectedRoute_default, { allowedRoles: ["customer"], children: /* @__PURE__ */ jsx18(CustomerDashboardPage_default, {}) })
      }
    ),
    /* @__PURE__ */ jsx18(
      Route,
      {
        path: "/admin/dashboard",
        element: /* @__PURE__ */ jsx18(ProtectedRoute_default, { allowedRoles: ["admin"], children: /* @__PURE__ */ jsx18(AdminDashboardPage_default, {}) })
      }
    ),
    /* @__PURE__ */ jsx18(Route, { path: "/business", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Business Banking", children: /* @__PURE__ */ jsx18("p", { children: "At Fifth Baptist Bank, we provide comprehensive banking solutions tailored to the unique needs of your business. From checking accounts to commercial loans, our services are designed to help your business thrive." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/about", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "About Us", children: /* @__PURE__ */ jsx18("p", { children: "Founded on principles of trust and community, Fifth Baptist Bank has been serving its customers for generations. Our mission is to provide secure and innovative financial services while fostering economic growth." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/contact", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Contact Us", children: /* @__PURE__ */ jsx18("p", { children: "We're here to help. You can reach our customer service team 24/7 at 1-800-555-0199 or visit any of our branches during business hours." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/services/checking", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Checking Accounts", children: /* @__PURE__ */ jsx18("p", { children: "Our checking accounts offer flexibility and convenience, with features like online banking, mobile deposit, and no monthly fees with qualifying direct deposits." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/services/savings", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Savings Accounts", children: /* @__PURE__ */ jsx18("p", { children: "Grow your wealth with our high-yield savings accounts. Benefit from competitive interest rates and watch your savings build towards your financial goals." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/services/loans", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Personal & Auto Loans", children: /* @__PURE__ */ jsx18("p", { children: "Whether it's for a new car, home improvement, or consolidating debt, our flexible loan options come with competitive rates and manageable terms." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/services/credit-cards", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Credit Cards", children: /* @__PURE__ */ jsx18("p", { children: "Choose from a variety of credit cards that offer rewards, cashback, and travel benefits. Find the card that fits your lifestyle and spending habits." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/about/careers", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Careers", children: /* @__PURE__ */ jsx18("p", { children: "Join a team that values innovation and customer satisfaction. Explore exciting career opportunities at Fifth Baptist Bank and grow with us." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/about/press", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Press Center", children: /* @__PURE__ */ jsx18("p", { children: "Find the latest news, press releases, and media contacts for Fifth Baptist Bank." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/about/investors", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Investor Relations", children: /* @__PURE__ */ jsx18("p", { children: "Access financial reports, stock information, and shareholder news in our investor relations portal." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/legal/privacy", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Privacy Policy", children: /* @__PURE__ */ jsx18("p", { children: "Your privacy is paramount. This policy outlines how we collect, use, and protect your personal and financial information." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/legal/terms", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Terms of Service", children: /* @__PURE__ */ jsx18("p", { children: "Read the terms and conditions that govern your use of Fifth Baptist Bank's online services and accounts." }) }) }),
    /* @__PURE__ */ jsx18(Route, { path: "/legal/disclosures", element: /* @__PURE__ */ jsx18(PlaceholderPage_default, { title: "Disclosures", children: /* @__PURE__ */ jsx18("p", { children: "Find important information about our products, services, fees, and regulatory disclosures." }) }) })
  ] }) }) }) });
};
var App = () => {
  return /* @__PURE__ */ jsx18(BankDataProvider, { children: /* @__PURE__ */ jsx18(AppContent, {}) });
};
var App_default = App;

// index.tsx
import { jsx as jsx19 } from "react/jsx-runtime";
var rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
var root = ReactDOM.createRoot(rootElement);
root.render(
  /* @__PURE__ */ jsx19(React11.StrictMode, { children: /* @__PURE__ */ jsx19(App_default, {}) })
);
