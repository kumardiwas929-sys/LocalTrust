import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import Toast from '../components/common/Toast.jsx';
import CallModal from '../components/calling/CallModal.jsx';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-surface-50 text-slate-800">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toast />
      <CallModal />
    </div>
  );
};

export default PublicLayout;
