import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useTaskContext } from '../../context/TaskContext';
import Column from './Column';
import TaskDetailModal from '../Modal/TaskDetailModal';

const Board = ({ searchTerm }) => {
  const { data, onDragEnd } = useTaskContext();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (task) => {
    setSelectedTaskId(task ? task.id : null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

  const currentTask = selectedTaskId ? data.tasks[selectedTaskId] : null;
  const isSearchActive = !!searchTerm;

  return (
    <div className="board-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-layout">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds
              .map((taskId) => data.tasks[taskId])
              .filter(task => {
                if (!isSearchActive) return true;
                const lowerSearch = searchTerm.toLowerCase();
                return (
                  task.title?.toLowerCase().includes(lowerSearch) ||
                  task.description?.toLowerCase().includes(lowerSearch) ||
                  task.tag?.toLowerCase().includes(lowerSearch) ||
                  task.assignedUser?.toLowerCase().includes(lowerSearch)
                );
              });

            return <Column key={column.id} column={column} tasks={tasks} onOpenDetail={handleOpenDetail} isSearchActive={isSearchActive} />;
          })}
        </div>
      </DragDropContext>

      {isModalOpen && (
        <TaskDetailModal 
          task={currentTask} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default Board;
