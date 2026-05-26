import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

const initialData = {
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Diseñar arquitectura base',
      description: 'Establecer la estructura de carpetas y el estado global con Context API.',
      status: 'column-1',
      tag: 'Architecture',
      assignedUser: 'Juan',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      attachments: [],
      responsible: 'Admin',
      team: 'Frontend',
      comments: [
        { id: uuidv4(), text: 'La estructura de Context parece la mejor opción para no usar Redux.', author: 'Juan', timestamp: new Date().toISOString() }
      ],
      isApproved: false,
    },
    'task-2': {
      id: 'task-2',
      title: 'Implementar Drag and Drop',
      description: 'Integrar @hello-pangea/dnd para mover tarjetas entre columnas.',
      status: 'column-2',
      tag: 'Feature',
      assignedUser: 'Maria',
      startDate: '',
      endDate: '',
      attachments: [],
      responsible: 'Juan',
      team: 'Frontend',
      comments: [],
      isApproved: false,
    },
    'task-3': {
      id: 'task-3',
      title: 'Crear estilos Premium',
      description: 'Añadir variables CSS, colores dark mode y animaciones glassmorphism.',
      status: 'column-3',
      tag: 'Design',
      assignedUser: 'Carlos',
      startDate: '',
      endDate: '',
      attachments: [],
      responsible: 'Admin',
      team: 'Design',
      comments: [],
      isApproved: true,
    },
  },
  columns: {
    'column-1': { id: 'column-1', title: 'To Do', taskIds: ['task-1'] },
    'column-2': { id: 'column-2', title: 'In Progress', taskIds: ['task-2'] },
    'column-3': { id: 'column-3', title: 'Review', taskIds: ['task-3'] },
    'column-4': { id: 'column-4', title: 'Done', taskIds: [] },
  },
  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
};

export const TaskProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('jira-clone-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialData;
      }
    }
    return initialData;
  });

  const [currentUser, setCurrentUser] = useState('Admin'); // Simulación de usuario logueado

  useEffect(() => {
    localStorage.setItem('jira-clone-data', JSON.stringify(data));
  }, [data]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn },
      });
      return;
    }

    // Moving to another list
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, taskIds: finishTaskIds };

    // Update task status
    const updatedTask = { ...data.tasks[draggableId], status: destination.droppableId };
    
    // Regla de negocio: Si no está en "Done" (column-4), no puede estar aprobada
    if (destination.droppableId !== 'column-4') {
      updatedTask.isApproved = false;
    }

    setData({
      ...data,
      tasks: { ...data.tasks, [draggableId]: updatedTask },
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  const addTask = (taskDetails) => {
    const newTaskId = `task-${uuidv4()}`;
    const newTask = {
      id: newTaskId,
      ...taskDetails,
      status: 'column-1',
      comments: [],
      isApproved: false,
    };

    const startColumn = data.columns['column-1'];
    const newTaskIds = Array.from(startColumn.taskIds);
    newTaskIds.push(newTaskId);

    setData({
      ...data,
      tasks: { ...data.tasks, [newTaskId]: newTask },
      columns: {
        ...data.columns,
        'column-1': { ...startColumn, taskIds: newTaskIds },
      },
    });
  };

  const updateTask = (taskId, updatedFields) => {
    setData((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: { ...prev.tasks[taskId], ...updatedFields },
      },
    }));
  };

  const addComment = (taskId, text) => {
    const newComment = { id: uuidv4(), text, author: currentUser, timestamp: new Date().toISOString() };
    setData((prev) => {
      const task = prev.tasks[taskId];
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: { ...task, comments: [...task.comments, newComment] }
        }
      };
    });
  };

  const approveTask = (taskId) => {
    const task = data.tasks[taskId];
    if (currentUser !== task.responsible) {
      alert("Solo el responsable puede aprobar esta tarea.");
      return;
    }
    if (task.status !== 'column-3') {
      alert("La tarea debe estar en 'Review' para ser aprobada.");
      return;
    }
    
    const currentColumnId = task.status;
    const doneColumnId = 'column-4';

    if (currentColumnId === doneColumnId) {
      updateTask(taskId, { isApproved: true });
      return;
    }

    setData((prev) => {
      const startColumn = prev.columns[currentColumnId];
      const finishColumn = prev.columns[doneColumnId];

      const startTaskIds = startColumn.taskIds.filter(id => id !== taskId);
      const finishTaskIds = [...finishColumn.taskIds, taskId];

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: { ...prev.tasks[taskId], isApproved: true, status: doneColumnId },
        },
        columns: {
          ...prev.columns,
          [currentColumnId]: { ...startColumn, taskIds: startTaskIds },
          [doneColumnId]: { ...finishColumn, taskIds: finishTaskIds },
        },
      };
    });
  };

  return (
    <TaskContext.Provider value={{ data, onDragEnd, addTask, updateTask, addComment, approveTask, currentUser, setCurrentUser }}>
      {children}
    </TaskContext.Provider>
  );
};
