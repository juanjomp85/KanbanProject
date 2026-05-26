import React, { useState } from 'react';
import Board from './components/Board/Board';
import { useTaskContext } from './context/TaskContext';
import { LayoutDashboard, Settings, Bell, Search, UserCircle2, Menu, X } from 'lucide-react';

function App() {
  const { currentUser, setCurrentUser } = useTaskContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="app-container">
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="logo-icon">K</div>
              <span>KanbanPro</span>
            </div>
            <button className="menu-btn btn-icon" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <a href="#" className="nav-link active">
              <LayoutDashboard size={20} />
              <span>Tablero</span>
            </a>
            <a href="#" className="nav-link">
              <Settings size={20} />
              <span>Ajustes</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button className="menu-btn btn-icon" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Buscar tareas..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="header-right">
            <button className="btn-icon" style={{position: 'relative'}}>
              <Bell size={20} />
              <span style={{position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: 'var(--md-sys-color-error)', borderRadius: '50%'}}></span>
            </button>
            
            <div className="divider"></div>
            
            <div className="login-box">
              <div className="login-label">Login:</div>
              <select 
                value={currentUser} 
                onChange={(e) => setCurrentUser(e.target.value)}
                className="login-select"
              >
                <option value="Admin">Admin</option>
                <option value="Juan">Juan</option>
                <option value="Maria">Maria</option>
                <option value="Carlos">Carlos</option>
              </select>
              <UserCircle2 size={32} style={{color: 'var(--md-sys-color-primary)'}} />
            </div>
          </div>
        </header>

        {/* Board Area */}
        <Board searchTerm={searchTerm} />

      </main>
    </div>
  );
}

export default App;
