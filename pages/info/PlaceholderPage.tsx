
import React from 'react';
import Footer from '../../components/Footer';

interface PlaceholderPageProps {
  title: string;
  children: React.ReactNode;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, children }) => {
  return (
    <>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">{title}</h1>
        <div className="prose prose-invert lg:prose-xl text-gray-300 prose-p:leading-relaxed prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PlaceholderPage;
