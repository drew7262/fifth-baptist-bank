
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBankData } from '../context/BankDataContext';
import { User, AccountType } from '../types';
import { generateId, generateAccountNumber } from '../utils/helpers';
import { CheckCircleIcon } from '../components/icons';

const RegistrationPage: React.FC = () => {
    const { dispatch } = useBankData();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        password: '',
        confirmPassword: '',
        dob: '',
        maritalStatus: '',
        ssn: '',
        monthlyHousing: '',
        yearlyIncome: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setIsLoading(true);

        setTimeout(() => {
            const newUser: User = {
                id: generateId(),
                customerId: Math.floor(10000000 + Math.random() * 90000000).toString(),
                password: formData.password,
                name: formData.name,
                email: formData.email,
                address: formData.address,
                accounts: [
                    {
                        id: generateId(),
                        type: AccountType.CHECKING,
                        accountNumber: generateAccountNumber(),
                        routingNumber: '021000021',
                        balance: 0,
                        transactions: []
                    }
                ],
                isLocked: false,
                lockoutReason: '',
                canApplyForCredit: false,
                isDebitCardLocked: false,
                history: [],
            };

            dispatch({ type: 'ADD_USER', payload: newUser });
            setIsLoading(false);
            setIsSuccess(true);

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl p-8 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">Registration Successful!</h1>
                    <p className="text-gray-300 mt-2">Your account has been created. Redirecting you to the login page...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center py-12">
            <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl p-8">
                <h1 className="text-3xl font-bold text-center text-white mb-2">Open a New Account</h1>
                <p className="text-center text-gray-400 mb-8">Join Fifth Baptist Bank today.</p>

                {error && <p className="text-red-400 text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" onChange={handleChange} placeholder="Full Name" required className="bg-slate-700 p-3 rounded text-white" />
                        <input name="email" type="email" onChange={handleChange} placeholder="Email Address" required className="bg-slate-700 p-3 rounded text-white" />
                    </div>
                    <input name="address" onChange={handleChange} placeholder="Full Address" required className="w-full bg-slate-700 p-3 rounded text-white" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="password" type="password" onChange={handleChange} placeholder="Password" required className="bg-slate-700 p-3 rounded text-white" />
                        <input name="confirmPassword" type="password" onChange={handleChange} placeholder="Confirm Password" required className="bg-slate-700 p-3 rounded text-white" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="dob" type="date" onChange={handleChange} placeholder="Date of Birth" required className="bg-slate-700 p-3 rounded text-white" />
                         <select name="maritalStatus" onChange={handleChange} required className="bg-slate-700 p-3 rounded text-white">
                            <option value="">Marital Status...</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="ssn" onChange={handleChange} placeholder="Social Security Number" required className="bg-slate-700 p-3 rounded text-white" />
                        <input name="monthlyHousing" type="number" onChange={handleChange} placeholder="Monthly Housing Payment" required className="bg-slate-700 p-3 rounded text-white" />
                    </div>
                     <input name="yearlyIncome" type="number" onChange={handleChange} placeholder="Yearly Income" required className="w-full bg-slate-700 p-3 rounded text-white" />

                    <div className="pt-4">
                        <button type="submit" disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-4 rounded-lg transition-all disabled:bg-slate-600">
                             {isLoading ? 'Processing...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;
