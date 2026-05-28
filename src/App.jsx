import React, { useState } from 'react';
import Board from './components/Board/Board';
import Settings from './components/Settings/Settings';
import TaskDetailModal from './components/Modal/TaskDetailModal';
import Auth from './components/Auth/Auth';
import { useTaskContext } from './context/TaskContext';
import { LayoutDashboard, Settings as SettingsIcon, Bell, Search, Menu, X, ChevronLeft, ChevronRight, Calendar, AlertCircle, CheckCircle2, LogOut, User } from 'lucide-react';

function App() {
  const { currentUser, setCurrentUser, data } = useTaskContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('board');
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  if (!currentUser) {
    return <Auth />;
  }

  // Helper to determine the number of days until the deadline
  const getProximityDays = (endDateStr) => {
    if (!endDateStr) return Infinity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to format days proximity nicely in Spanish
  const formatProximityText = (days) => {
    if (days === Infinity) return 'Sin fecha';
    if (days < 0) return `Retrasada por ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}`;
    if (days === 0) return 'Vence hoy ⚠️';
    if (days === 1) return 'Vence mañana';
    return `Vence en ${days} días`;
  };

  // Profile and role validation
  const loggedWorker = data.workers?.find((w) => w.name === currentUser);
  const isUserResponsible = loggedWorker?.role === 'responsable';

  // Get active tasks (not in Done / column-4) assigned to current user
  const allTasks = Object.values(data.tasks || {});
  const assignedTasks = allTasks.filter(task => 
    task.assignedUser === currentUser && 
    task.status !== 'column-4'
  );

  // Sort assigned tasks by proximity
  const sortedAssignedTasks = [...assignedTasks].sort((a, b) => {
    const aDays = getProximityDays(a.endDate);
    const bDays = getProximityDays(b.endDate);
    return aDays - bDays;
  });

  // Get tasks pending user approval
  const approvalTasks = isUserResponsible 
    ? allTasks.filter(task => 
        task.responsible === currentUser && 
        task.status === 'column-3' && 
        !task.isApproved
      )
    : [];

  const pendingCount = sortedAssignedTasks.length + approvalTasks.length;

  const toggleSidebarCollapse = () => {
    const nextCollapsed = !isCollapsed;
    setIsCollapsed(nextCollapsed);
    localStorage.setItem('sidebar-collapsed', String(nextCollapsed));
  };

  return (
    <div className="app-container">
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        
        {/* Toggle Collapse Button for Desktop */}
        <button 
          className="sidebar-toggle-btn"
          onClick={toggleSidebarCollapse}
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

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
            <a 
              href="#board" 
              className={`nav-link ${activeTab === 'board' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('board'); setSidebarOpen(false); }}
              title={isCollapsed ? "Tablero" : undefined}
            >
              <LayoutDashboard size={20} />
              <span>Tablero</span>
            </a>
            <a 
              href="#settings" 
              className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('settings'); setSidebarOpen(false); }}
              title={isCollapsed ? "Ajustes" : undefined}
            >
              <SettingsIcon size={20} />
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
            {activeTab === 'board' && (
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
            )}
          </div>

          <div className="header-right">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                className="btn-icon" 
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notificaciones"
                aria-label="Notificaciones"
                style={{ position: 'relative' }}
              >
                <Bell size={20} />
                {pendingCount > 0 && (
                  <span className="notification-badge">{pendingCount}</span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div 
                    className="notifications-backdrop" 
                    onClick={() => setShowNotifications(false)}
                  />
                  
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h3 className="notifications-title">Notificaciones</h3>
                      <span className="column-count">{pendingCount}</span>
                    </div>

                    <div className="notifications-list">
                      {pendingCount === 0 ? (
                        <div className="notifications-empty">
                          <Bell size={32} style={{ opacity: 0.5 }} />
                          <p>No tienes notificaciones pendientes. ¡Buen trabajo!</p>
                        </div>
                      ) : (
                        <>
                          {/* SECTION: Tareas por aprobar */}
                          {approvalTasks.length > 0 && (
                            <>
                              <div className="notifications-section-header">
                                Por Aprobar ({approvalTasks.length})
                              </div>
                              {approvalTasks.map(task => (
                                <button
                                  key={task.id}
                                  className="notification-item to-approve"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowNotifications(false);
                                  }}
                                >
                                  <div className="notification-item-header">
                                    <span className="notification-item-title">{task.title}</span>
                                    <span className="badge badge-yellow" style={{ fontSize: '0.625rem', height: 18, padding: '0 6px' }}>
                                      Review
                                    </span>
                                  </div>
                                  {task.description && (
                                    <p className="notification-item-desc">{task.description}</p>
                                  )}
                                  <div className="notification-item-meta">
                                    <span style={{ fontSize: '0.7rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                      Asignado: {task.assignedUser || 'Sin asignar'}
                                    </span>
                                    <span className="notification-item-date normal">
                                      <CheckCircle2 size={12} style={{ color: 'var(--badge-yellow-color)' }} /> Aprobar
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </>
                          )}

                          {/* SECTION: Tareas encomendadas */}
                          {sortedAssignedTasks.length > 0 && (
                            <>
                              <div className="notifications-section-header">
                                Mis Tareas ({sortedAssignedTasks.length})
                              </div>
                              {sortedAssignedTasks.map(task => {
                                const days = getProximityDays(task.endDate);
                                const isLate = days < 0;
                                const dateClass = isLate ? 'late' : 'normal';

                                // Find column title dynamically
                                const colTitle = data.columns[task.status]?.title || 'Tarea';

                                return (
                                  <button
                                    key={task.id}
                                    className="notification-item assigned"
                                    onClick={() => {
                                      setSelectedTask(task);
                                      setShowNotifications(false);
                                    }}
                                  >
                                    <div className="notification-item-header">
                                      <span className="notification-item-title">{task.title}</span>
                                      <span className="badge badge-blue" style={{ fontSize: '0.625rem', height: 18, padding: '0 6px' }}>
                                        {colTitle}
                                      </span>
                                    </div>
                                    {task.description && (
                                      <p className="notification-item-desc">{task.description}</p>
                                    )}
                                    <div className="notification-item-meta">
                                      <span style={{ fontSize: '0.7rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                        Resp: {task.responsible}
                                      </span>
                                      <span className={`notification-item-date ${dateClass}`}>
                                        {isLate ? (
                                          <AlertCircle size={12} />
                                        ) : (
                                          <Calendar size={12} />
                                        )}
                                        {formatProximityText(days)}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="divider"></div>
            
            {/* User Profile Dropdown Menu */}
            <div className="profile-menu-container">
              <button 
                type="button"
                className="profile-avatar-btn" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                title="Menú de perfil"
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: '1px solid var(--border-color)'
                }}>
                  {currentUser.slice(0, 2).toUpperCase()}
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div 
                    className="notifications-backdrop" 
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="profile-menu-dropdown">
                    <div className="profile-menu-info" style={{ paddingBottom: 8, borderBottom: 'none' }}>
                      <span className="profile-menu-name">{currentUser}</span>
                      <span className="profile-menu-email">
                        {data.workers?.find(w => w.name === currentUser)?.email || `${currentUser.toLowerCase()}@kanbanpro.com`}
                      </span>
                      <span className="badge badge-purple profile-menu-role" style={{ fontSize: '0.625rem', height: 18, padding: '0 6px' }}>
                        {data.workers?.find(w => w.name === currentUser)?.role === 'responsable' ? 'Responsable' : 'Trabajador'}
                      </span>
                    </div>
                    <button 
                      type="button"
                      className="profile-menu-btn"
                      style={{ color: 'var(--md-sys-color-primary)', borderBottom: '1px solid var(--border-color)', borderRadius: 0, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}
                      onClick={() => {
                        setActiveTab('settings');
                        setProfileDropdownOpen(false);
                      }}
                    >
                      <User size={16} />
                      <span>Ajustes de Perfil</span>
                    </button>
                    <button 
                      type="button"
                      className="profile-menu-btn"
                      style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}
                      onClick={() => {
                        setCurrentUser('');
                        setProfileDropdownOpen(false);
                      }}
                    >
                      <LogOut size={16} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Board or Settings Area */}
        {activeTab === 'board' ? (
          <Board searchTerm={searchTerm} />
        ) : (
          <Settings key={currentUser} />
        )}

      </main>

      {/* Detail Modal opened from Notifications */}
      {selectedTask && data.tasks[selectedTask.id] && (
        <TaskDetailModal 
          task={data.tasks[selectedTask.id]} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}

export default App;
