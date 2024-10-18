import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../utils/Sidebar';

const Layout = () => {
  return (
    <div className="d-flex flex-column flex-lg-row vh-100">
      <Sidebar />
      <div className="flex-grow-1 p-4 overflow-auto">
        <Outlet /> {/* Render the nested routes here */}
      </div>
    </div>
  );
};

export default Layout;
