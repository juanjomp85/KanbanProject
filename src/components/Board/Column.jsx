import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import { MoreHorizontal, Plus } from 'lucide-react';

const Column = ({ column, tasks, onOpenDetail, isSearchActive }) => {
  return (
    <div className="kanban-column">
      <div className="column-header">
        <h3 className="column-title">
          {column.title}
          <span className="column-count">
            {tasks.length}
          </span>
        </h3>
        <button className="btn-icon">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <Droppable droppableId={column.id} isDropDisabled={isSearchActive}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-body ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
          >
            {tasks.map((task, index) => (
              <Card key={task.id} task={task} index={index} onOpenDetail={onOpenDetail} isSearchActive={isSearchActive} />
            ))}
            {provided.placeholder}
            
            {column.id === 'column-1' && (
              <button 
                className="add-task-btn"
                onClick={() => onOpenDetail(null)}
              >
                <Plus size={18} /> Añadir Tarea
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
