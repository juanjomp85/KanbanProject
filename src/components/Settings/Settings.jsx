import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Columns, Tag, Users, Trash2, Plus, Edit2, Check, Sun, Moon, User } from 'lucide-react';

const Settings = ({ defaultSection = 'profile' }) => {
  const { data, addTag, addWorker, theme, setTheme, currentUser, setCurrentUser, updateWorker } = useTaskContext();
  const [activeSection, setActiveSection] = useState(defaultSection);

  // New Tag State
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');

  // New Worker State
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('trabajador');

  // User Profile State
  const loggedWorker = data.workers?.find(w => w.name === currentUser) || {
    name: currentUser,
    email: `${currentUser.toLowerCase()}@kanbanpro.com`,
    password: 'password',
    role: 'trabajador'
  };

  const [profileName, setProfileName] = useState(loggedWorker.name || '');
  const [profileEmail, setProfileEmail] = useState(loggedWorker.email || '');
  const [profilePassword, setProfilePassword] = useState(loggedWorker.password || '');
  const [profileRole, setProfileRole] = useState(loggedWorker.role || 'trabajador');
  const [profileTheme, setProfileTheme] = useState(loggedWorker.theme || theme);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (loggedWorker && loggedWorker.theme) {
      setProfileTheme(loggedWorker.theme);
    }
  }, [loggedWorker.theme]);



  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (profileName.trim() === '') return alert('El nombre no puede estar vacío');
    if (profileEmail.trim() === '') return alert('El correo electrónico no puede estar vacío');
    if (profilePassword.trim() === '') return alert('La contraseña no puede estar vacía');

    const nameTaken = data.workers?.some(w => w.id !== loggedWorker.id && w.name.toLowerCase() === profileName.trim().toLowerCase());
    const emailTaken = data.workers?.some(w => w.id !== loggedWorker.id && w.email?.toLowerCase() === profileEmail.trim().toLowerCase());

    if (nameTaken) return alert('Este nombre de usuario ya está en uso por otro miembro');
    if (emailTaken) return alert('Este correo electrónico ya está en uso por otro miembro');

    // Update worker profile
    updateWorker(loggedWorker.id, {
      name: profileName.trim(),
      email: profileEmail.trim(),
      password: profilePassword.trim(),
      role: profileRole,
      theme: profileTheme
    });

    // Update active session name
    setCurrentUser(profileName.trim());

    // Apply the visual theme
    setTheme(profileTheme);

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleCreateTag = (e) => {
    e.preventDefault();
    if (newTagName.trim() === '') return alert('El nombre de la etiqueta no puede estar vacío');
    if (data.tags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      return alert('Ya existe una etiqueta con este nombre');
    }
    addTag({ name: newTagName.trim(), color: newTagColor });
    setNewTagName('');
  };

  const handleCreateWorker = (e) => {
    e.preventDefault();
    if (newWorkerName.trim() === '') return alert('El nombre del trabajador no puede estar vacío');
    if (data.workers.some(w => w.name.toLowerCase() === newWorkerName.trim().toLowerCase())) {
      return alert('Ya existe un miembro en el equipo con este nombre');
    }
    addWorker(newWorkerName.trim(), newWorkerRole);
    setNewWorkerName('');
  };



  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2 className="settings-title">Ajustes del Proyecto</h2>
        <p className="settings-subtitle">Personaliza columnas, etiquetas, equipo de trabajo y las preferencias de interfaz.</p>
      </div>

      <div className="settings-layout">
        {/* Sub-navigation Menu */}
        <aside className="settings-nav">
          <button 
            className={`settings-nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={20} />
            <span>Mi Perfil</span>
          </button>

          <button 
            className={`settings-nav-btn ${activeSection === 'columns' ? 'active' : ''}`}
            onClick={() => setActiveSection('columns')}
          >
            <Columns size={20} />
            <span>Columnas</span>
          </button>
          
          <button 
            className={`settings-nav-btn ${activeSection === 'tags' ? 'active' : ''}`}
            onClick={() => setActiveSection('tags')}
          >
            <Tag size={20} />
            <span>Etiquetas</span>
          </button>

          <button 
            className={`settings-nav-btn ${activeSection === 'workers' ? 'active' : ''}`}
            onClick={() => setActiveSection('workers')}
          >
            <Users size={20} />
            <span>Equipo y Roles</span>
          </button>


        </aside>

        {/* Content Area */}
        <main className="settings-main-content">
          
          {/* 0. SECTION MY PROFILE */}
          {activeSection === 'profile' && (
            <div className="settings-panel" style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <h3 className="panel-title">Mi Perfil</h3>
              <p className="panel-description">Actualiza tu información personal, contraseña y preferencias del proyecto.</p>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    border: '2px solid var(--border-color)',
                    boxShadow: 'var(--elevation-1)'
                  }}>
                    {profileName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>{profileName}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>Sesión activa en KanbanPro</p>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ paddingLeft: 4 }}>Nombre Completo</label>
                  <input
                    type="text"
                    className="input-field"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ paddingLeft: 4 }}>Correo Electrónico</label>
                  <input
                    type="email"
                    className="input-field"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ paddingLeft: 4 }}>Contraseña</label>
                  <input
                    type="password"
                    className="input-field"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ paddingLeft: 4 }}>Rol en el Proyecto</label>
                  <div className="role-selector-group">
                    <div
                      className={`role-card-btn ${profileRole === 'trabajador' ? 'active' : ''}`}
                      onClick={() => setProfileRole('trabajador')}
                      style={{ padding: 12 }}
                    >
                      <span className="role-card-title">Trabajador</span>
                      <span className="role-card-desc">Crea y ejecuta tareas</span>
                    </div>
                    <div
                      className={`role-card-btn ${profileRole === 'responsable' ? 'active' : ''}`}
                      onClick={() => setProfileRole('responsable')}
                      style={{ padding: 12 }}
                    >
                      <span className="role-card-title">Responsable</span>
                      <span className="role-card-desc">Supervisa y aprueba tareas</span>
                    </div>
                  </div>
                          <div className="input-group" style={{ marginTop: 8 }}>
                  <label className="input-label" style={{ paddingLeft: 4 }}>Preferencia de Tema</label>
                  <div className="theme-options-grid">
                    <div 
                      className={`theme-card ${profileTheme === 'dark' ? 'active' : ''}`}
                      onClick={() => setProfileTheme('dark')}
                      style={{ padding: '16px 20px', maxWidth: 'none' }}
                    >
                      <div className="theme-card-icon dark-bg" style={{ width: 44, height: 44, marginBottom: 8 }}>
                        <Moon size={20} />
                      </div>
                      <div className="theme-card-title" style={{ fontSize: '0.8125rem' }}>Tema Oscuro</div>
                    </div>

                    <div 
                      className={`theme-card ${profileTheme === 'light' ? 'active' : ''}`}
                      onClick={() => setProfileTheme('light')}
                      style={{ padding: '16px 20px', maxWidth: 'none' }}
                    >
                      <div className="theme-card-icon light-bg" style={{ width: 44, height: 44, marginBottom: 8 }}>
                        <Sun size={20} />
                      </div>
                      <div className="theme-card-title" style={{ fontSize: '0.8125rem' }}>Tema Claro</div>
                    </div>         </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn ${profileSaved ? 'btn-success' : 'btn-primary'}`}
                  style={{ height: 44, borderRadius: 8, marginTop: 16, width: '100%', fontSize: '0.9375rem', fontWeight: 600 }}
                >
                  <Check size={18} />
                  <span>{profileSaved ? 'Cambios Guardados' : 'Guardar Cambios'}</span>
                </button>
              </form>
            </div>
          )}

          {/* 1. SECTION COLUMNS */}
          {activeSection === 'columns' && (
            <div className="settings-panel">
              <h3 className="panel-title">Nombres de Columnas</h3>
              <p className="panel-description">Modifica el título visual de las columnas del tablero Kanban.</p>
              
              <div className="settings-list flex-col">
                {data.columnOrder.map(columnId => (
                  <ColumnRow key={columnId} column={data.columns[columnId]} />
                ))}
              </div>
            </div>
          )}

          {/* 2. SECTION TAGS */}
          {activeSection === 'tags' && (
            <div className="settings-panel">
              <h3 className="panel-title">Gestión de Etiquetas</h3>
              <p className="panel-description">Crea, edita o elimina las etiquetas que clasifican tus tareas.</p>

              {/* Form to create new tag */}
              <form onSubmit={handleCreateTag} className="settings-add-form">
                <div className="form-title">Añadir Nueva Etiqueta</div>
                <div className="form-fields">
                  <div className="input-group">
                    <label className="input-label">Nombre</label>
                    <input 
                      type="text" 
                      placeholder="Ej. QA, Bugfix, Marketing" 
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Color</label>
                    <select 
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="input-field"
                    >
                      <option value="blue">Azul</option>
                      <option value="green">Verde</option>
                      <option value="yellow">Amarillo</option>
                      <option value="red">Rojo</option>
                      <option value="purple">Morado</option>
                      <option value="gray">Gris</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <Plus size={18} /> <span>Añadir</span>
                  </button>
                </div>
              </form>

              {/* Tags List */}
              <div className="settings-list mt-24">
                <div className="list-title">Etiquetas Existentes</div>
                {data.tags.map(tag => (
                  <TagRow key={tag.id} tag={tag} />
                ))}
              </div>
            </div>
          )}

          {/* 3. SECTION WORKERS */}
          {activeSection === 'workers' && (
            <div className="settings-panel">
              <h3 className="panel-title">Equipo y Roles</h3>
              <p className="panel-description">Administra el personal del proyecto y define quiénes tienen rol de Aprobador/Responsable.</p>

              {/* Form to create new worker */}
              <form onSubmit={handleCreateWorker} className="settings-add-form">
                <div className="form-title">Invitar Nuevo Miembro</div>
                <div className="form-fields">
                  <div className="input-group">
                    <label className="input-label">Nombre</label>
                    <input 
                      type="text" 
                      placeholder="Nombre del trabajador..." 
                      value={newWorkerName}
                      onChange={(e) => setNewWorkerName(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Rol del Proyecto</label>
                    <select 
                      value={newWorkerRole}
                      onChange={(e) => setNewWorkerRole(e.target.value)}
                      className="input-field"
                    >
                      <option value="trabajador">Trabajador (Ejecuta tareas)</option>
                      <option value="responsable">Responsable (Autoriza y aprueba)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <Plus size={18} /> <span>Añadir</span>
                  </button>
                </div>
              </form>

              {/* Workers List */}
              <div className="settings-list mt-24">
                <div className="list-title">Miembros del Equipo</div>
                {data.workers.map(worker => (
                  <WorkerRow key={worker.id} worker={worker} />
                ))}
              </div>
            </div>
          )}



        </main>
      </div>
    </div>
  );
};

/* INNER COLUMN ROW COMPONENT */
const ColumnRow = ({ column }) => {
  const [title, setTitle] = useState(column.title);
  const { updateColumnTitle } = useTaskContext();
  const [saved, setSaved] = useState(false);
  
  const handleSave = () => {
    if (title.trim() === '') return alert('El título de la columna no puede estar vacío');
    updateColumnTitle(column.id, title.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-row">
      <div className="settings-row-label">{column.id.toUpperCase()}</div>
      <div className="settings-row-input-group">
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="input-field"
        />
        <button onClick={handleSave} className={`btn ${saved ? 'btn-success' : 'btn-primary'} btn-save`}>
          <Check size={16} /> <span>{saved ? 'Guardado' : 'Guardar'}</span>
        </button>
      </div>
    </div>
  );
};

/* INNER TAG ROW COMPONENT */
const TagRow = ({ tag }) => {
  const { updateTag, deleteTag } = useTaskContext();
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (name.trim() === '') return alert('El nombre de la etiqueta no puede estar vacío');
    updateTag(tag.id, { name: name.trim(), color });
    setIsEditing(false);
  };

  return (
    <div className="settings-item-row">
      <div className="item-preview-col">
        <span className={`badge badge-${color}`}>
          {tag.name}
        </span>
      </div>
      
      {isEditing ? (
        <div className="item-edit-fields">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="input-field inline-input"
          />
          <select 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            className="input-field inline-select"
          >
            <option value="blue">Azul</option>
            <option value="green">Verde</option>
            <option value="yellow">Amarillo</option>
            <option value="red">Rojo</option>
            <option value="purple">Morado</option>
            <option value="gray">Gris</option>
          </select>
          <div className="item-edit-actions">
            <button onClick={handleSave} className="btn btn-primary btn-save-small" title="Guardar cambios">
              <Check size={16} />
            </button>
            <button onClick={() => { setName(tag.name); setColor(tag.color); setIsEditing(false); }} className="btn btn-secondary btn-cancel-small" title="Cancelar">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="item-actions">
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
            Editar
          </button>
          <button 
            onClick={() => {
              if (confirm(`¿Estás seguro de eliminar la etiqueta "${tag.name}"? Se quitará de todas las tareas correspondientes.`)) {
                deleteTag(tag.id);
              }
            }} 
            className="btn-icon btn-delete" 
            style={{color: 'var(--md-sys-color-error)'}}
            title="Eliminar Etiqueta"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

/* INNER WORKER ROW COMPONENT */
const WorkerRow = ({ worker }) => {
  const { updateWorker, deleteWorker } = useTaskContext();
  const [name, setName] = useState(worker.name);
  const [role, setRole] = useState(worker.role);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (name.trim() === '') return alert('El nombre es obligatorio');
    updateWorker(worker.id, { name: name.trim(), role });
    setIsEditing(false);
  };

  return (
    <div className="settings-item-row">
      <div className="item-preview-col flex-row gap-12">
        <div className={`comment-avatar ${worker.role === 'responsable' ? 'avatar-primary' : 'avatar-secondary'}`} style={{width: 36, height: 36, fontSize: '0.875rem'}}>
          {worker.name.charAt(0).toUpperCase()}
        </div>
        <div className="worker-details">
          <div className="worker-name-display">{worker.name}</div>
          <div className="worker-role-display">
            {worker.role === 'responsable' ? 'Responsable (Aprobador)' : 'Trabajador'}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="item-edit-fields">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="input-field inline-input"
          />
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            className="input-field inline-select"
          >
            <option value="trabajador">Trabajador</option>
            <option value="responsable">Responsable</option>
          </select>
          <div className="item-edit-actions">
            <button onClick={handleSave} className="btn btn-primary btn-save-small" title="Guardar cambios">
              <Check size={16} />
            </button>
            <button onClick={() => { setName(worker.name); setRole(worker.role); setIsEditing(false); }} className="btn btn-secondary btn-cancel-small" title="Cancelar">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="item-actions">
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
            Editar
          </button>
          <button 
            onClick={() => {
              if (worker.name === 'Admin') return alert('No se puede eliminar el administrador del sistema.');
              if (confirm(`¿Estás seguro de eliminar a "${worker.name}"? Se quitará de sus asignaciones de tareas correspondientes.`)) {
                deleteWorker(worker.id);
              }
            }} 
            className="btn-icon btn-delete" 
            style={{
              color: 'var(--md-sys-color-error)', 
              display: worker.name === 'Admin' ? 'none' : 'inline-flex'
            }}
            title="Eliminar Miembro"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;
