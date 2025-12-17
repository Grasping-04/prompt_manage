// 任务状态
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

// 任务优先级
export type TaskPriority = 'low' | 'medium' | 'high'

// 任务接口
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  prompt?: string
  projectId?: string
  parentId?: string // 父任务ID，用于子任务
  order: number // 排序顺序
  createdAt: number
  updatedAt: number
  completedAt?: number
}

// 项目/分组接口
export interface Project {
  id: string
  name: string
  color: string
  order: number
  createdAt: number
  updatedAt: number
}

// Prompt模板接口
export interface PromptTemplate {
  id: string
  name: string
  content: string
  category: string
  variables: string[] // 变量列表，如 ['变量1', '变量2']
  createdAt: number
  updatedAt: number
}

// 应用状态接口
export interface AppState {
  tasks: Task[]
  projects: Project[]
  templates: PromptTemplate[]
  activeProjectId: string | null
  theme: 'light' | 'dark' | 'system'
}

// 存储数据接口
export interface StorageData {
  tasks: Task[]
  projects: Project[]
  templates: PromptTemplate[]
  settings: {
    theme: 'light' | 'dark' | 'system'
    activeProjectId: string | null
  }
  version: number // 数据版本，用于迁移
}

// 过滤器选项
export interface FilterOptions {
  status?: TaskStatus | 'all'
  projectId?: string | null
  searchQuery?: string
}
