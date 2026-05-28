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
  tags: [
    { id: 't-1', name: 'Architecture', color: 'purple' },
    { id: 't-2', name: 'Feature', color: 'blue' },
    { id: 't-3', name: 'Design', color: 'yellow' },
    { id: 't-4', name: 'Bug', color: 'red' },
    { id: 't-5', name: 'Documentation', color: 'gray' },
  ],
  workers: [
    { id: 'w-1', name: 'Admin', email: 'admin@kanbanpro.com', password: 'admin', role: 'responsable', isVerified: true },
    { id: 'w-2', name: 'Juan', email: 'juan@kanbanpro.com', password: 'password', role: 'responsable', isVerified: true },
    { id: 'w-3', name: 'Maria', email: 'maria@kanbanpro.com', password: 'password', role: 'trabajador', isVerified: true },
    { id: 'w-4', name: 'Carlos', email: 'carlos@kanbanpro.com', password: 'password', role: 'trabajador', isVerified: true },
  ]
};

export const TaskProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('jira-clone-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure default tags exist for backwards compatibility
        if (!parsed.tags || parsed.tags.length === 0) {
          parsed.tags = initialData.tags;
        }
        // Ensure default workers exist for backwards compatibility
        if (!parsed.workers || parsed.workers.length === 0) {
          parsed.workers = initialData.workers;
        }
        // Migrate legacy workers to support email & password
        if (parsed.workers) {
          parsed.workers = parsed.workers.map(w => {
            if (!w.email) {
              const defaults = {
                'Admin': { email: 'admin@kanbanpro.com', password: 'admin', isVerified: true },
                'Juan': { email: 'juan@kanbanpro.com', password: 'password', isVerified: true },
                'Maria': { email: 'maria@kanbanpro.com', password: 'password', isVerified: true },
                'Carlos': { email: 'carlos@kanbanpro.com', password: 'password', isVerified: true }
              };
              const def = defaults[w.name] || { email: `${w.name.toLowerCase()}@kanbanpro.com`, password: 'password', isVerified: true };
              return { ...w, ...def };
            }
            return w;
          });
        }
        return parsed;
      } catch (e) {
        return initialData;
      }
    }
    return initialData;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('jira-clone-user') || '';
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jira-clone-data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('jira-clone-user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && data.workers) {
      const loggedWorker = data.workers.find(w => w.name.toLowerCase() === currentUser.toLowerCase());
      if (loggedWorker && loggedWorker.theme && loggedWorker.theme !== theme) {
        setTheme(loggedWorker.theme);
      }
    }
  }, [currentUser, data.workers]);

  const registerWorker = (name, email, password, role) => {
    const newWorker = {
      id: uuidv4(),
      name,
      email,
      password,
      role,
      isVerified: false
    };

    setData((prev) => ({
      ...prev,
      workers: [...(prev.workers || []), newWorker]
    }));
  };

  const verifyWorker = (email) => {
    setData((prev) => ({
      ...prev,
      workers: (prev.workers || []).map(w => 
        w.email === email ? { ...w, isVerified: true } : w
      )
    }));
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Regla de negocio: Nadie puede arrastrar tareas a "Done" (column-4).
    // Solo se llega a "Done" mediante aprobación desde "Review".
    if (destination.droppableId === 'column-4') return;

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
      updatedTask.approvalDate = null;
      updatedTask.isLate = false;
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

    const today = new Date().toISOString().split('T')[0];
    const resolvedEndDate = task.endDate || today;
    const isLate = task.endDate ? today > task.endDate : false;
    const approvalDate = today;

    const currentColumnId = 'column-3';
    const doneColumnId = 'column-4';

    setData((prev) => {
      const startColumn = prev.columns[currentColumnId];
      const finishColumn = prev.columns[doneColumnId];

      const startTaskIds = startColumn.taskIds.filter(id => id !== taskId);
      const finishTaskIds = [...finishColumn.taskIds, taskId];

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: {
            ...prev.tasks[taskId],
            isApproved: true,
            status: doneColumnId,
            endDate: resolvedEndDate,
            approvalDate,
            isLate,
          },
        },
        columns: {
          ...prev.columns,
          [currentColumnId]: { ...startColumn, taskIds: startTaskIds },
          [doneColumnId]: { ...finishColumn, taskIds: finishTaskIds },
        },
      };
    });
  };

  const updateColumnTitle = (columnId, newTitle) => {
    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          title: newTitle,
        },
      },
    }));
  };

  const addTag = (tag) => {
    setData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), { id: uuidv4(), ...tag }],
    }));
  };

  const updateTag = (tagId, updatedTag) => {
    setData((prev) => {
      const oldTag = prev.tags.find((t) => t.id === tagId);
      const updatedTags = prev.tags.map((t) => (t.id === tagId ? { ...t, ...updatedTag } : t));

      const updatedTasks = { ...prev.tasks };
      if (oldTag && updatedTag.name && oldTag.name !== updatedTag.name) {
        Object.keys(updatedTasks).forEach((taskId) => {
          if (updatedTasks[taskId].tag === oldTag.name) {
            updatedTasks[taskId].tag = updatedTag.name;
          }
        });
      }

      return {
        ...prev,
        tags: updatedTags,
        tasks: updatedTasks,
      };
    });
  };

  const deleteTag = (tagId) => {
    setData((prev) => {
      const oldTag = prev.tags.find((t) => t.id === tagId);
      const updatedTags = prev.tags.filter((t) => t.id !== tagId);

      const updatedTasks = { ...prev.tasks };
      if (oldTag) {
        Object.keys(updatedTasks).forEach((taskId) => {
          if (updatedTasks[taskId].tag === oldTag.name) {
            updatedTasks[taskId].tag = '';
          }
        });
      }

      return {
        ...prev,
        tags: updatedTags,
        tasks: updatedTasks,
      };
    });
  };

  const addWorker = (name, role) => {
    setData((prev) => ({
      ...prev,
      workers: [...(prev.workers || []), { id: uuidv4(), name, role }],
    }));
  };

  const updateWorker = (workerId, updatedWorker) => {
    setData((prev) => {
      const oldWorker = prev.workers.find((w) => w.id === workerId);
      const updatedWorkers = prev.workers.map((w) => (w.id === workerId ? { ...w, ...updatedWorker } : w));

      const updatedTasks = { ...prev.tasks };
      if (oldWorker && updatedWorker.name && oldWorker.name !== updatedWorker.name) {
        Object.keys(updatedTasks).forEach((taskId) => {
          if (updatedTasks[taskId].assignedUser === oldWorker.name) {
            updatedTasks[taskId].assignedUser = updatedWorker.name;
          }
          if (updatedTasks[taskId].responsible === oldWorker.name) {
            updatedTasks[taskId].responsible = updatedWorker.name;
          }
        });
      }

      return {
        ...prev,
        workers: updatedWorkers,
        tasks: updatedTasks,
      };
    });
  };

  const deleteWorker = (workerId) => {
    setData((prev) => {
      const oldWorker = prev.workers.find((w) => w.id === workerId);
      const updatedWorkers = prev.workers.filter((w) => w.id !== workerId);

      const updatedTasks = { ...prev.tasks };
      if (oldWorker) {
        Object.keys(updatedTasks).forEach((taskId) => {
          if (updatedTasks[taskId].assignedUser === oldWorker.name) {
            updatedTasks[taskId].assignedUser = '';
          }
          if (updatedTasks[taskId].responsible === oldWorker.name) {
            updatedTasks[taskId].responsible = '';
          }
        });
      }

      return {
        ...prev,
        workers: updatedWorkers,
        tasks: updatedTasks,
      };
    });
  };

  const deleteTask = (taskId) => {
    const loggedWorker = data.workers?.find((w) => w.name === currentUser);
    if (!loggedWorker || loggedWorker.role !== 'responsable') {
      alert("Solo los usuarios con el rol de Responsable pueden eliminar tareas.");
      return;
    }

    setData((prev) => {
      const updatedTasks = { ...prev.tasks };
      const columnId = updatedTasks[taskId]?.status;
      delete updatedTasks[taskId];

      const updatedColumns = { ...prev.columns };
      if (columnId && updatedColumns[columnId]) {
        updatedColumns[columnId] = {
          ...updatedColumns[columnId],
          taskIds: updatedColumns[columnId].taskIds.filter((id) => id !== taskId),
        };
      }

      return {
        ...prev,
        tasks: updatedTasks,
        columns: updatedColumns,
      };
    });
  };

  const setColumnViewType = (columnId, viewType) => {
    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          viewType: viewType,
        },
      },
    }));
  };

  return (
    <TaskContext.Provider
      value={{
        data,
        onDragEnd,
        addTask,
        updateTask,
        addComment,
        approveTask,
        currentUser,
        setCurrentUser,
        updateColumnTitle,
        addTag,
        updateTag,
        deleteTag,
        addWorker,
        updateWorker,
        deleteWorker,
        deleteTask,
        setColumnViewType,
        theme,
        setTheme,
        registerWorker,
        verifyWorker,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
