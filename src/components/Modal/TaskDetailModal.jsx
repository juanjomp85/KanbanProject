import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import CommentSection from '../Comments/CommentSection';
import { X, Save, CheckCircle2, ShieldAlert, Trash2, Link } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Inline SVG icons for official brand looks
const GoogleDriveLogo = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" style={{ display: 'block' }}>
    <path d="M8.2 2H15.8L22 13H14.4L8.2 2Z" fill="#FFD043"/>
    <path d="M15.8 13H2.8L1 10H14L15.8 13Z" fill="#1A73E8"/>
    <path d="M8.2 2L1 14.7L3.5 19H10.7L8.2 2Z" fill="#188038"/>
  </svg>
);

const OneDriveLogo = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'none', display: 'block' }}>
    <path d="M19.4 11.2c-.3 0-.6 0-.8.1C18 9.3 16.1 8 14 8c-.6 0-1.2.1-1.8.3C11.5 6.7 9.8 5.7 8 5.7c-2.9 0-5.3 2.2-5.7 5.1C1 11.2 0 12.6 0 14.2c0 2.1 1.7 3.8 3.8 3.8h15.6c2.5 0 4.6-2 4.6-4.5s-2.1-4.3-4.6-4.3z" fill="#0078D4" />
  </svg>
);

const DropboxLogo = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'none', display: 'block' }}>
    <path d="M6 2L1 5.3l5 3.3 5-3.3zM18 2l-5 3.3 5 3.3 5-3.3zM1 12l5 3.3 5-3.3-5-3.3zM13 12l5 3.3 5-3.3-5-3.3zM6 18.7l5 3.3 5-3.3-5-3.3z" fill="#0061FF" />
  </svg>
);

const getServiceLogo = (service) => {
  switch (service) {
    case 'drive':
      return <GoogleDriveLogo />;
    case 'onedrive':
      return <OneDriveLogo />;
    case 'dropbox':
      return <DropboxLogo />;
    default:
      return <Link size={16} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />;
  }
};

const TaskDetailModal = ({ task, onClose }) => {
  const { addTask, updateTask, approveTask, currentUser, data, deleteTask } = useTaskContext();
  const isNew = !task;

  const [formData, setFormData] = useState(
    task || {
      title: '',
      description: '',
      tag: 'Feature',
      assignedUser: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      responsible: currentUser,
      team: '',
      attachments: [],
    }
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttachment, setNewAttachment] = useState({
    title: '',
    url: '',
    service: 'drive'
  });

  const handleAddAttachment = () => {
    if (!newAttachment.url) {
      alert('La dirección URL es obligatoria');
      return;
    }
    
    let formattedUrl = newAttachment.url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const title = newAttachment.title.trim() || 'Documento sin título';
    
    const attachmentItem = {
      id: uuidv4(),
      title,
      url: formattedUrl,
      service: newAttachment.service
    };

    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), attachmentItem]
    }));

    setNewAttachment({
      title: '',
      url: '',
      service: 'drive'
    });
    setShowAddForm(false);
  };

  const handleDeleteAttachment = (attachmentId) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(att => att.id !== attachmentId)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (isNew) {
      if (!formData.title) return alert('El título es obligatorio');
      addTask(formData);
    } else {
      const { title, description, tag, assignedUser, startDate, endDate, responsible, team, attachments } = formData;
      updateTask(task.id, { title, description, tag, assignedUser, startDate, endDate, responsible, team, attachments });
    }
    onClose();
  };

  const handleApprove = () => {
    if (currentUser !== formData.responsible) {
      alert('Solo el responsable puede aprobar esta tarea.');
      return;
    }
    approveTask(task.id);
    onClose();
  };

  const loggedWorker = data.workers?.find((w) => w.name === currentUser);
  const canDelete = loggedWorker?.role === 'responsable';

  const handleDelete = () => {
    if (!task) return;
    if (confirm(`¿Estás seguro de que deseas eliminar la tarea "${task.title}"? Esta acción es irreversible.`)) {
      deleteTask(task.id);
      onClose();
    }
  };

  const isResponsible = currentUser === formData.responsible;
  const isInReview = formData.status === 'column-3';
  const canApprove = isResponsible && isInReview;

  let approveTitle = 'Aprobar tarea';
  if (!isInReview) {
    approveTitle = 'La tarea debe estar en la columna Review para ser aprobada';
  } else if (!isResponsible) {
    approveTitle = `Solo el responsable (${formData.responsible}) puede aprobarla`;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Mobile Pull Indicator */}
        <div style={{ width: 48, height: 6, backgroundColor: 'var(--md-sys-color-outline-variant)', borderRadius: 9999, margin: '12px auto 4px', display: 'none' }} className="mobile-pull"></div>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">
              {isNew ? 'Nueva Tarea' : task.id}
            </h2>
            {!isNew && task.isApproved && (
              <span className="badge badge-green">
                <CheckCircle2 size={16} /> Aprobada
              </span>
            )}
          </div>
          <div className="modal-header-right">
            {!isNew && (
              <button 
                onClick={handleDelete}
                disabled={!canDelete}
                className="btn btn-secondary"
                style={{
                  color: 'var(--md-sys-color-error)',
                  borderColor: canDelete ? 'rgba(242, 184, 181, 0.3)' : 'transparent',
                  opacity: canDelete ? 1 : 0.5,
                  cursor: canDelete ? 'pointer' : 'not-allowed',
                  marginRight: 8,
                  gap: 6
                }}
                title={canDelete ? "Eliminar tarea" : "Solo los usuarios con rol de Responsable pueden eliminar tareas"}
              >
                <Trash2 size={16} /> <span>Eliminar</span>
              </button>
            )}
            {!isNew && !task.isApproved && (
              <button 
                onClick={handleApprove}
                disabled={!canApprove}
                className={`btn ${canApprove ? 'btn-success' : 'btn-secondary'}`}
                style={{
                  opacity: canApprove ? 1 : 0.6,
                  cursor: canApprove ? 'pointer' : 'not-allowed'
                }}
                title={approveTitle}
              >
                <CheckCircle2 size={18} /> <span>Aprobar</span>
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={18} /> <span>Guardar</span>
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Main Column */}
          <div className="modal-main">
            <div className="input-group">
              <label className="input-label">Título</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                style={{fontSize: '1.125rem', fontWeight: 500}}
                placeholder="Resumen de la tarea..."
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                style={{minHeight: 150}}
                placeholder="Añade una descripción más detallada..."
              />
            </div>

            {!isNew && <CommentSection task={task} />}
          </div>

          {/* Sidebar Column */}
          <div className="modal-sidebar">
            <div className="modal-panel">
              <div className="input-group">
                <label className="input-label">Estado</label>
                <select disabled className="input-field" style={{opacity: 0.7, cursor: 'not-allowed'}}>
                  <option>{data.columns[formData.status]?.title || formData.status || 'To Do'}</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Etiqueta</label>
                 <select name="tag" value={formData.tag} onChange={handleChange} className="input-field">
                  <option value="">Sin etiqueta</option>
                  {data.tags?.map(tag => (
                    <option key={tag.id} value={tag.name}>{tag.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-panel">
              <div className="input-group">
                <label className="input-label">Asignado a</label>
                 <select name="assignedUser" value={formData.assignedUser} onChange={handleChange} className="input-field">
                  <option value="">Sin asignar</option>
                  {data.workers?.map(worker => (
                    <option key={worker.id} value={worker.name}>{worker.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">
                  <ShieldAlert size={14} style={{color: 'var(--md-sys-color-error)'}} /> Responsable (Aprobador)
                </label>
                <select name="responsible" value={formData.responsible} onChange={handleChange} className="input-field">
                  <option value="">Sin responsable</option>
                  {data.workers?.filter(w => w.role === 'responsable').map(worker => (
                    <option key={worker.id} value={worker.name}>{worker.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Equipo</label>
                <input
                  type="text"
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej. Frontend, Backend..."
                />
              </div>
            </div>

            <div className="modal-panel">
              <div className="input-group">
                <label className="input-label">Fecha Inicio</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Fecha Fin Planificada</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="input-field"
                  disabled={formData.isApproved}
                  style={formData.isApproved ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                />
              </div>

              {formData.isApproved && formData.approvalDate && (
                <div className="input-group">
                  <label className="input-label">Fecha de Aprobación</label>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: `2px solid ${formData.isLate ? 'var(--badge-red-color)' : 'var(--badge-green-color)'}`,
                    backgroundColor: formData.isLate
                      ? 'var(--badge-red-bg)'
                      : 'var(--badge-green-bg)',
                    color: formData.isLate ? 'var(--badge-red-color)' : 'var(--badge-green-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{formData.isLate ? '⚠️' : '✅'}</span>
                    <div>
                      <div>{formData.approvalDate}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: 2, opacity: 0.85 }}>
                        {formData.isLate
                          ? `Fuera de plazo (planificado: ${formData.endDate})`
                          : formData.endDate && formData.endDate !== formData.approvalDate
                            ? `En plazo (planificado: ${formData.endDate})`
                            : 'Entregado en la fecha planificada'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-panel">
                <label className="input-label" style={{marginBottom: 8}}>Archivos Adjuntos</label>
                
                {/* LIST OF ATTACHMENTS */}
                {formData.attachments && formData.attachments.length > 0 ? (
                  <div className="attachments-list">
                    {formData.attachments.map(att => (
                      <div key={att.id || att.url} className="attachment-item">
                        <div className="attachment-info">
                          <div className="attachment-logo">
                            {getServiceLogo(att.service)}
                          </div>
                          <a 
                            href={att.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="attachment-link"
                            title={att.title}
                          >
                            {att.title}
                          </a>
                        </div>
                        <button 
                          type="button"
                          className="btn-delete-attachment"
                          onClick={() => handleDeleteAttachment(att.id)}
                          title="Eliminar enlace"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 16}}>
                    No hay documentos vinculados a esta tarea.
                  </div>
                )}

                {/* ADD ATTACHMENT FORM INLINE */}
                {showAddForm ? (
                  <div className="add-attachment-form">
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', marginBottom: 4 }}>
                      Vincular servicio en la nube
                    </div>
                    
                    {/* Brand Service Selector */}
                    <div className="service-selector">
                      <button
                        type="button"
                        className={`service-card ${newAttachment.service === 'drive' ? 'active drive' : ''}`}
                        onClick={() => setNewAttachment(prev => ({ ...prev, service: 'drive' }))}
                      >
                        <GoogleDriveLogo />
                        <span className="service-card-label">Drive</span>
                      </button>
                      <button
                        type="button"
                        className={`service-card ${newAttachment.service === 'onedrive' ? 'active onedrive' : ''}`}
                        onClick={() => setNewAttachment(prev => ({ ...prev, service: 'onedrive' }))}
                      >
                        <OneDriveLogo />
                        <span className="service-card-label">OneDrive</span>
                      </button>
                      <button
                        type="button"
                        className={`service-card ${newAttachment.service === 'dropbox' ? 'active dropbox' : ''}`}
                        onClick={() => setNewAttachment(prev => ({ ...prev, service: 'dropbox' }))}
                      >
                        <DropboxLogo />
                        <span className="service-card-label">Dropbox</span>
                      </button>
                      <button
                        type="button"
                        className={`service-card ${newAttachment.service === 'link' ? 'active link' : ''}`}
                        onClick={() => setNewAttachment(prev => ({ ...prev, service: 'link' }))}
                      >
                        <Link size={16} style={{ color: 'var(--md-sys-color-primary)' }} />
                        <span className="service-card-label">Enlace</span>
                      </button>
                    </div>

                    <div className="input-group" style={{ marginBottom: 8 }}>
                      <label className="input-label" style={{ paddingLeft: 4 }}>Nombre del documento</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Plan de diseño" 
                        className="input-field"
                        style={{ padding: '8px 12px', fontSize: '0.875rem' }}
                        value={newAttachment.title}
                        onChange={(e) => setNewAttachment(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="input-group" style={{ marginBottom: 8 }}>
                      <label className="input-label" style={{ paddingLeft: 4 }}>Enlace URL</label>
                      <input 
                        type="text" 
                        placeholder="Ej. drive.google.com/..." 
                        className="input-field"
                        style={{ padding: '8px 12px', fontSize: '0.875rem' }}
                        value={newAttachment.url}
                        onChange={(e) => setNewAttachment(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>

                    <div className="add-attachment-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ height: 32, padding: '0 12px', borderRadius: 6, fontSize: '0.75rem' }}
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        style={{ height: 32, padding: '0 12px', borderRadius: 6, fontSize: '0.75rem' }}
                        onClick={handleAddAttachment}
                      >
                        Guardar Enlace
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{width: '100%'}}
                    onClick={() => setShowAddForm(true)}
                  >
                    + Añadir enlace
                  </button>
                )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
