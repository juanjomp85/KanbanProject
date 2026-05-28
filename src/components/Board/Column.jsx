import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import { useTaskContext } from '../../context/TaskContext';
import { MoreHorizontal, Plus, Check } from 'lucide-react';

const Column = ({ column, tasks, onOpenDetail, isSearchActive }) => {
  const { setColumnViewType } = useTaskContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const viewType = column.viewType || 'normal';

  const handleSelectView = (type) => {
    setColumnViewType(column.id, type);
    setIsMenuOpen(false);
  };

  return (
    <div className="kanban-column">
      <div className="column-header">
        <h3 className="column-title">
          {column.title}
          <span className="column-count">
            {tasks.length}
          </span>
        </h3>
        
        {/* Dropdown Menu Container */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button 
            className="btn-icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Opciones de visualización"
          >
            <MoreHorizontal size={20} />
          </button>

          {isMenuOpen && (
            <>
              {/* Clicking outside closes the dropdown */}
              <div className="dropdown-backdrop" onClick={() => setIsMenuOpen(false)} />
              
              <div className="column-menu-dropdown">
                <div className="dropdown-header">Visualización</div>
                
                <button 
                  className={`dropdown-item ${viewType === 'compact' ? 'active' : ''}`}
                  onClick={() => handleSelectView('compact')}
                >
                  <div style={{ width: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {viewType === 'compact' && <Check size={14} />}
                  </div>
                  <span>Compacta</span>
                </button>
                
                <button 
                  className={`dropdown-item ${viewType === 'normal' ? 'active' : ''}`}
                  onClick={() => handleSelectView('normal')}
                >
                  <div style={{ width: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {viewType === 'normal' && <Check size={14} />}
                  </div>
                  <span>Normal</span>
                </button>
                
                <button 
                  className={`dropdown-item ${viewType === 'detailed' ? 'active' : ''}`}
                  onClick={() => handleSelectView('detailed')}
                >
                  <div style={{ width: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {viewType === 'detailed' && <Check size={14} />}
                  </div>
                  <span>Detallada</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <Droppable droppableId={column.id} isDropDisabled={isSearchActive || column.id === 'column-4'}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-body ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
          >
            {tasks.map((task, index) => (
              <Card 
                key={task.id} 
                task={task} 
                index={index} 
                onOpenDetail={onOpenDetail} 
                isSearchActive={isSearchActive} 
                viewType={viewType}
              />
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
