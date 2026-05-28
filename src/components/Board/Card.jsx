import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useTaskContext } from '../../context/TaskContext';
import { format } from 'date-fns';
import { Calendar, User, MessageSquare, Paperclip, CheckCircle2 } from 'lucide-react';

const Card = ({ task, index, onOpenDetail, isSearchActive, viewType = 'normal' }) => {
  const { data } = useTaskContext();
  
  // Find the tag dynamically in context data
  const userTag = data.tags?.find(t => t.name === task.tag);
  const badgeClass = userTag ? `badge-${userTag.color}` : 'badge-gray';
  
  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={isSearchActive || task.status === 'column-4'}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`kanban-card ${viewType === 'compact' ? 'compact' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
          onClick={() => onOpenDetail(task)}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {/* COMPACT VIEW */}
          {viewType === 'compact' ? (
            <>
              <div className="card-header" style={{ marginBottom: 4 }}>
                <span className={`badge ${badgeClass}`} style={{ fontSize: '0.625rem', height: 18, padding: '0 6px' }}>
                  {task.tag || 'Sin etiqueta'}
                </span>
                {task.isApproved && (
                  <CheckCircle2 size={14} style={{color: 'var(--badge-green-color)'}} />
                )}
              </div>
              <h4 className="card-title" style={{ fontSize: '0.875rem', marginBottom: 0 }}>{task.title}</h4>
            </>
          ) : (
            /* NORMAL & DETAILED VIEWS */
            <>
              <div className="card-header">
                <span className={`badge ${badgeClass}`}>
                  {task.tag || 'Sin etiqueta'}
                </span>
                {task.isApproved && (
                  <CheckCircle2 size={16} style={{color: 'var(--badge-green-color)'}} />
                )}
              </div>
              
              <h4 className="card-title" style={{ marginBottom: viewType === 'detailed' && task.description ? 8 : 12 }}>
                {task.title}
              </h4>
              
              {/* Detailed View Description */}
              {viewType === 'detailed' && task.description && (
                <p className="card-description">
                  {task.description}
                </p>
              )}
              
              <div className="card-footer" style={{ marginTop: viewType === 'detailed' ? 12 : 16 }}>
                {task.isApproved && task.approvalDate ? (
                  <div className="card-footer-item" style={{ color: task.isLate ? 'var(--badge-red-color)' : 'var(--badge-green-color)', fontWeight: 500 }}>
                    <Calendar size={14} />
                    <span title={task.isLate ? 'Entregado fuera de plazo' : 'Entregado en plazo'}>
                      {format(new Date(task.approvalDate), 'MMM d')}
                      {task.isLate ? ' ⚠' : ' ✓'}
                    </span>
                  </div>
                ) : task.endDate ? (
                  <div className="card-footer-item">
                    <Calendar size={14} />
                    <span>{format(new Date(task.endDate), 'MMM d')}</span>
                  </div>
                ) : null}
                
                <div className="card-footer-item">
                  <User size={14} />
                  <span>{task.assignedUser || 'Sin asignar'}</span>
                </div>

                {/* Detailed View Responsible Badge */}
                {viewType === 'detailed' && task.responsible && (
                  <div className="card-footer-item" title={`Responsable: ${task.responsible}`}>
                    <span style={{ 
                      fontSize: '0.625rem', 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      backgroundColor: 'var(--md-sys-color-surface-container-high)', 
                      border: '1px solid var(--border-color)', 
                      fontWeight: 500,
                      color: 'var(--md-sys-color-primary)'
                    }}>
                      Resp: {task.responsible}
                    </span>
                  </div>
                )}
                
                <div className="card-footer-right">
                  {task.comments?.length > 0 && (
                    <div className="card-footer-item">
                      <MessageSquare size={14} />
                      <span>{task.comments.length}</span>
                    </div>
                  )}
                  {task.attachments?.length > 0 && (
                    <div className="card-footer-item">
                      <Paperclip size={14} />
                      <span>{task.attachments.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Card;
