import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Header from '../Header';
import Footer from '../Footer';
import Loading from '../Loading';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { loading } = useSelector((state: RootState) => state.ui);

  return (
    <div className="layout-container min-h-screen w-full max-w-full p-2 sm:p-4 flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        {loading ? <Loading /> : children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 