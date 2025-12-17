import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { StorageData, Task, Project, PromptTemplate, FilterOptions } from '../types'
import {
  loadData,
  saveData,
  createTask as createTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  createProject as createProjectService,
  updateProject as updateProjectService,
  deleteProject as deleteProjectService,
  createTemplate as createTemplateService,
  updateTemplate as updateTemplateService,
  deleteTemplate as deleteTemplateService
} from '../services/storage'

// Action Types
type Action =
  | { type: 'INIT'; payload: StorageData }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'REORDER_TASKS'; payload: Task[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_TEMPLATE'; payload: PromptTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: { id: string; updates: Partial<PromptTemplate> } }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'SET_ACTIVE_PROJECT'; payload: string | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'IMPORT_DATA'; payload: StorageData }

// Reducer
function reducer(state: StorageData, action: Action): StorageData {
  switch (action.type) {
    case 'INIT':
    case 'IMPORT_DATA':
      return action.payload

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }

    case 'UPDATE_TASK':
      return updateTaskService(state, action.payload.id, action.payload.updates)

    case 'DELETE_TASK':
      return deleteTaskService(state, action.payload)

    case 'REORDER_TASKS':
      return { ...state, tasks: action.payload }

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] }

    case 'UPDATE_PROJECT':
      return updateProjectService(state, action.payload.id, action.payload.updates)

    case 'DELETE_PROJECT':
      return deleteProjectService(state, action.payload)

    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.payload] }

    case 'UPDATE_TEMPLATE':
      return updateTemplateService(state, action.payload.id, action.payload.updates)

    case 'DELETE_TEMPLATE':
      return deleteTemplateService(state, action.payload)

    case 'SET_ACTIVE_PROJECT':
      return { ...state, settings: { ...state.settings, activeProjectId: action.payload } }

    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.payload } }

    default:
      return state
  }
}

// Context Types
interface AppContextType {
  state: StorageData
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  reorderTasks: (tasks: Task[]) => void
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string | null) => void
  // Template actions
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void
  deleteTemplate: (id: string) => void
  // Settings
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  // Data operations
  importData: (data: StorageData) => void
  // Computed
  getFilteredTasks: (options: FilterOptions) => Task[]
  getTasksByProject: (projectId: string | null) => Task[]
  getSubTasks: (parentId: string) => Task[]
}

const AppContext = createContext<AppContextType | null>(null)

// Initial state
const initialState: StorageData = {
  tasks: [],
  projects: [],
  templates: [],
  settings: { theme: 'system', activeProjectId: null },
  version: 1
}

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load data on mount
  useEffect(() => {
    const data = loadData()
    dispatch({ type: 'INIT', payload: data })
  }, [])

  // Save data on state change
  useEffect(() => {
    if (state.tasks.length > 0 || state.projects.length > 0) {
      saveData(state)
    }
  }, [state])

  // Task actions
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = createTaskService(task)
    dispatch({ type: 'ADD_TASK', payload: newTask })
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
  }

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id })
  }

  const completeTask = (id: string) => {
    const task = state.tasks.find(t => t.id === id)
    if (task) {
      updateTask(id, {
        status: task.status === 'completed' ? 'pending' : 'completed',
        completedAt: task.status === 'completed' ? undefined : Date.now()
      })
    }
  }

  const reorderTasks = (tasks: Task[]) => {
    dispatch({ type: 'REORDER_TASKS', payload: tasks })
  }

  // Project actions
  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject = createProjectService(project)
    dispatch({ type: 'ADD_PROJECT', payload: newProject })
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } })
  }

  const deleteProject = (id: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id })
  }

  const setActiveProject = (id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: id })
  }

  // Template actions
  const addTemplate = (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate = createTemplateService(template)
    dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate })
  }

  const updateTemplate = (id: string, updates: Partial<PromptTemplate>) => {
    dispatch({ type: 'UPDATE_TEMPLATE', payload: { id, updates } })
  }

  const deleteTemplate = (id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: id })
  }

  // Settings
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme })
  }

  // Data operations
  const importData = (data: StorageData) => {
    dispatch({ type: 'IMPORT_DATA', payload: data })
  }

  // Computed
  const getFilteredTasks = (options: FilterOptions): Task[] => {
    let filtered = state.tasks.filter(task => !task.parentId) // Only root tasks

    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(task => task.status === options.status)
    }

    if (options.projectId !== undefined) {
      filtered = filtered.filter(task => task.projectId === options.projectId)
    }

    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.prompt?.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => a.order - b.order)
  }

  const getTasksByProject = (projectId: string | null): Task[] => {
    return state.tasks
      .filter(task => !task.parentId && task.projectId === projectId)
      .sort((a, b) => a.order - b.order)
  }

  const getSubTasks = (parentId: string): Task[] => {
    return state.tasks
      .filter(task => task.parentId === parentId)
      .sort((a, b) => a.order - b.order)
  }

  const value: AppContextType = {
    state,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    reorderTasks,
    addProject,
    updateProject,
    deleteProject,
    setActiveProject,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setTheme,
    importData,
    getFilteredTasks,
    getTasksByProject,
    getSubTasks
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
