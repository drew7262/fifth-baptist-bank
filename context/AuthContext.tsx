
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedUser, User, UserEvent, UserEventType } from '../types';
import { useBankData } from './BankDataContext';
import { generateId } from '../utils/helpers';

interface AuthContextType {
  user: AuthenticatedUser | null;
  login: (customerId: string, password: string) => Promise<{ success: boolean; reason?: string }>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { database, dispatch } = useBankData();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('FBB_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('FBB_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (customerId: string, password: string): Promise<{ success: boolean; reason?: string }> => {
    const customer = database.users.find((u: User) => u.customerId === customerId && u.password === password);
    if (customer) {
        if (customer.isLocked) {
            return { success: false, reason: `Account Locked: ${customer.lockoutReason}` };
        }
      const authUser: AuthenticatedUser = {
        id: customer.id,
        name: customer.name,
        role: 'customer',
        customerId: customer.customerId
      };
      localStorage.setItem('FBB_user', JSON.stringify(authUser));
      setUser(authUser);
      
      // Log the successful login event
      const loginEvent: UserEvent = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: UserEventType.LOGIN_SUCCESS,
        details: { ipAddress: '127.0.0.1' } // Example detail
      };
      dispatch({ type: 'LOG_USER_EVENT', payload: { userId: customer.id, event: loginEvent }});

      navigate('/dashboard');
      return { success: true };
    }
    return { success: false, reason: 'Invalid Customer ID or Password.' };
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    const adminUser = database.admins.find(admin => admin.username === username && admin.password === password);
    if (adminUser) {
      const authUser: AuthenticatedUser = {
        id: adminUser.id,
        name: adminUser.username,
        role: 'admin',
      };
      localStorage.setItem('FBB_user', JSON.stringify(authUser));
      setUser(authUser);
      navigate('/admin/dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    const role = user?.role;
    setUser(null);
    localStorage.removeItem('FBB_user');
    if(role === 'admin') {
      navigate('/admin/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};