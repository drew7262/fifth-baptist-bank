
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BankDataProvider, useBankData } from './context/BankDataContext';
import HomePage from './pages/HomePage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PlaceholderPage from './pages/info/PlaceholderPage';
import RegistrationPage from './pages/RegistrationPage';

const AppContent: React.FC = () => {
  const { loading } = useBankData();

  if (loading) {
    return (
       <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
      <HashRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/login" element={<CustomerLoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Info Pages */}
              <Route path="/business" element={<PlaceholderPage title="Business Banking">
                <p>At Fifth Baptist Bank, we provide comprehensive banking solutions tailored to the unique needs of your business. From checking accounts to commercial loans, our services are designed to help your business thrive.</p>
              </PlaceholderPage>} />
              <Route path="/about" element={<PlaceholderPage title="About Us">
                <p>Founded on principles of trust and community, Fifth Baptist Bank has been serving its customers for generations. Our mission is to provide secure and innovative financial services while fostering economic growth.</p>
              </PlaceholderPage>} />
              <Route path="/contact" element={<PlaceholderPage title="Contact Us">
                <p>We're here to help. You can reach our customer service team 24/7 at 1-800-555-0199 or visit any of our branches during business hours.</p>
              </PlaceholderPage>} />
              <Route path="/services/checking" element={<PlaceholderPage title="Checking Accounts">
                <p>Our checking accounts offer flexibility and convenience, with features like online banking, mobile deposit, and no monthly fees with qualifying direct deposits.</p>
              </PlaceholderPage>} />
              <Route path="/services/savings" element={<PlaceholderPage title="Savings Accounts">
                <p>Grow your wealth with our high-yield savings accounts. Benefit from competitive interest rates and watch your savings build towards your financial goals.</p>
              </PlaceholderPage>} />
              <Route path="/services/loans" element={<PlaceholderPage title="Personal & Auto Loans">
                <p>Whether it's for a new car, home improvement, or consolidating debt, our flexible loan options come with competitive rates and manageable terms.</p>
              </PlaceholderPage>} />
              <Route path="/services/credit-cards" element={<PlaceholderPage title="Credit Cards">
                <p>Choose from a variety of credit cards that offer rewards, cashback, and travel benefits. Find the card that fits your lifestyle and spending habits.</p>
              </PlaceholderPage>} />
              <Route path="/about/careers" element={<PlaceholderPage title="Careers">
                <p>Join a team that values innovation and customer satisfaction. Explore exciting career opportunities at Fifth Baptist Bank and grow with us.</p>
              </PlaceholderPage>} />
              <Route path="/about/press" element={<PlaceholderPage title="Press Center">
                <p>Find the latest news, press releases, and media contacts for Fifth Baptist Bank.</p>
              </PlaceholderPage>} />
              <Route path="/about/investors" element={<PlaceholderPage title="Investor Relations">
                <p>Access financial reports, stock information, and shareholder news in our investor relations portal.</p>
              </PlaceholderPage>} />
              <Route path="/legal/privacy" element={<PlaceholderPage title="Privacy Policy">
                <p>Your privacy is paramount. This policy outlines how we collect, use, and protect your personal and financial information.</p>
              </PlaceholderPage>} />
              <Route path="/legal/terms" element={<PlaceholderPage title="Terms of Service">
                <p>Read the terms and conditions that govern your use of Fifth Baptist Bank's online services and accounts.</p>
              </PlaceholderPage>} />
              <Route path="/legal/disclosures" element={<PlaceholderPage title="Disclosures">
                <p>Find important information about our products, services, fees, and regulatory disclosures.</p>
              </PlaceholderPage>} />

            </Routes>
          </Layout>
        </AuthProvider>
      </HashRouter>
  );
}

const App: React.FC = () => {
  return (
    <BankDataProvider>
      <AppContent />
    </BankDataProvider>
  );
};

export default App;
