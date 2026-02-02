
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, DollarSignIcon, CreditCardIcon, HomeIcon } from '../components/icons';
import Footer from '../components/Footer';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 transition-all duration-300 hover:border-cyan-400/50 hover:-translate-y-1">
        <div className="text-cyan-400 mb-4">{icon}</div>
        <h3 className="font-bold text-xl text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

const HomePage: React.FC = () => {
    const navigate = useNavigate();

  return (
    <>
    <div className="text-center">
      <div className="py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tighter">
          Banking that's built for <br />
          <span className="text-cyan-400">your future.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
          Experience seamless online banking with Fifth Baptist Bank. Secure, intuitive, and designed to help you achieve your financial goals.
        </p>
        <div className="mt-10 flex justify-center items-center gap-4">
          <button 
            onClick={() => navigate('/register')}
            className="group flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-6 rounded-lg transition-transform duration-300 hover:scale-105"
          >
            Open an Account
            <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button className="font-medium text-gray-300 hover:text-white py-3 px-6 rounded-lg transition-colors">
            Learn More
          </button>
        </div>
      </div>

      <div className="py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">All Your Financial Needs, One Place</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
                icon={<DollarSignIcon className="w-10 h-10" />}
                title="Smart Savings"
                description="Grow your money faster with our high-yield savings accounts and automated saving tools."
            />
            <FeatureCard 
                icon={<CreditCardIcon className="w-10 h-10" />}
                title="Flexible Credit"
                description="Get the credit you deserve with our range of credit cards offering great rewards and low interest rates."
            />
            <FeatureCard 
                icon={<HomeIcon className="w-10 h-10" />}
                title="Easy Mortgages"
                description="Secure your dream home with our simple and transparent mortgage application process."
            />
        </div>
      </div>
      
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl max-w-6xl mx-auto py-16 px-8 my-20 border border-slate-700/50">
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
                <h2 className="text-3xl font-bold text-white">Security You Can Trust</h2>
                <p className="mt-4 text-gray-300">
                    Your peace of mind is our top priority. We use state-of-the-art encryption and multi-factor authentication to protect your account from unauthorized access. Bank with confidence, knowing your finances are secure.
                </p>
            </div>
            <div>
                <img src="https://picsum.photos/seed/security/600/400" alt="Bank security" className="rounded-lg shadow-xl" />
            </div>
        </div>
      </div>

    </div>
    <Footer />
    </>
  );
};

export default HomePage;
