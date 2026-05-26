import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useTaskContext } from '../../context/TaskContext';
import { format } from 'date-fns';
import { Calendar, User, MessageSquare, Paperclip, CheckCircle2 } from 'lucide-react';

const badgeColors = {
  'Bug': 'badge-red',
  'Feature': 'badge-blue',
  'Architecture': 'badge-purple',
  'Design': 'badge-yellow',
  'Documentation': 'badge-gray',
};

const Card = ({ task, index, onOpenDetail, isSearchActive }) => {
  const { data } = useTaskContext();
  
  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={isSearchActive}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
          onClick={() => onOpenDetail(task)}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <div className="card-header">
            <span className={`badge ${badgeColors[task.tag] || 'badge-gray'}`}>
              {task.tag}
            </span>
            {task.isApproved && (
              <CheckCircle2 size={16} style={{color: '#93dbac'}} />
            )}
          </div>
          
          <h4 className="card-title">{task.title}</h4>
          
          <div className="card-footer">
            {task.endDate && (
              <div className="card-footer-item">
                <Calendar size={14} />
                <span>{format(new Date(task.endDate), 'MMM d')}</span>
              </div>
            )}
            
            <div className="card-footer-item">
              <User size={14} />
              <span>{task.assignedUser}</span>
            </div>
            
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
        </div>
      )}
    </Draggable>
  );
};

export default Card;
