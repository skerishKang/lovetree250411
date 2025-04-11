import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Header from '../Header';
import Footer from '../Footer';
import Loading from '../Loading';

const Layout = () => {
  const { loading } = useSelector((state: RootState) => state.ui);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? <Loading /> : <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 