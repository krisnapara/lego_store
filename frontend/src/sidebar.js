import React, { useState } from 'react';
import './sidebar.css';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <span className="logo">
          </span>
          <h2 className="logo-text">Lego Store</h2>
        </div>
        {/* Tombol untuk menyembunyikan/menampilkan sidebar */}
        <button onClick={toggleSidebar} className="toggle-btn">
          {isCollapsed ? '>' : '<'}
        </button>
      </div>
      <ul className="sidebar-menu">
        <li>
          <a href="#section-products">
            <span className="icon">📊</span>
            <span className="link-text">Statiska</span>
          </a>
        </li>
        <li>
          <a href="#section-orders">
            <span className="icon">📦</span>
            <span className="link-text">Orders</span>
          </a>
        </li>
        <li>
          <a href="#section-products">
            <span className="icon">🧱</span>
            <span className="link-text">Products</span>
          </a>
        </li>
        <li>
          <a href="#section-customers">
            <span className="icon">👥</span>
            <span className="link-text">Customers</span>
          </a>
        </li>
        <li>
          <a href="#section-messages">
            <span className="icon">✉️</span>
            <span className="link-text">Messages</span>
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;