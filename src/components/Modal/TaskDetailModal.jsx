import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import CommentSection from '../Comments/CommentSection';
import { X, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

const TaskDetailModal = ({ task, onClose }) => {
  const { addTask, updateTask, approveTask, currentUser } = useTaskContext();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (isNew) {
      if (!formData.title) return alert('El título es obligatorio');
      addTask(formData);
    } else {
      const { title, description, tag, assignedUser, startDate, endDate, responsible, team } = formData;
      updateTask(task.id, { title, description, tag, assignedUser, startDate, endDate, responsible, team });
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
                  <option>{formData.status || 'To Do'}</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Etiqueta</label>
                <select name="tag" value={formData.tag} onChange={handleChange} className="input-field">
                  <option value="Bug">Bug</option>
                  <option value="Feature">Feature</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Design">Design</option>
                  <option value="Documentation">Documentation</option>
                </select>
              </div>
            </div>

            <div className="modal-panel">
              <div className="input-group">
                <label className="input-label">Asignado a</label>
                <input
                  type="text"
                  name="assignedUser"
                  value={formData.assignedUser}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Usuario asignado"
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <ShieldAlert size={14} style={{color: 'var(--md-sys-color-error)'}} /> Responsable (Aprobador)
                </label>
                <input
                  type="text"
                  name="responsible"
                  value={formData.responsible}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ej. Admin, Juan..."
                />
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
                <label className="input-label">Fecha Fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="modal-panel">
                <label className="input-label" style={{marginBottom: 8}}>Archivos Adjuntos</label>
                <div style={{fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 16}}>
                  Gestión de enlaces a documentos, inventarios o esquemas.
                </div>
                <button className="btn btn-secondary" style={{width: '100%'}}>
                  + Añadir enlace
                </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
