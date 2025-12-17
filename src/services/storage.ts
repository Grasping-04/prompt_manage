import type { StorageData, Task, Project, PromptTemplate } from '../types'

const STORAGE_KEY = 'prompt_manager_data'
const CURRENT_VERSION = 1

// 默认数据
const defaultData: StorageData = {
  tasks: [],
  projects: [
    {
      id: 'default',
      name: '默认项目',
      color: '#007AFF',
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  templates: [
    {
      id: 'template-1',
      name: '代码审查',
      content: '请帮我审查以下代码，关注：\n1. 代码质量和可读性\n2. 潜在的bug和安全问题\n3. 性能优化建议\n\n代码：\n{{code}}',
      category: '开发',
      variables: ['code'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'template-2',
      name: '文案润色',
      content: '请帮我润色以下文案，要求：\n1. 保持原意不变\n2. 语言更加流畅自然\n3. {{style}}\n\n原文：\n{{content}}',
      category: '写作',
      variables: ['style', 'content'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'template-3',
      name: '翻译助手',
      content: '请将以下{{source_lang}}文本翻译成{{target_lang}}，要求：\n1. 翻译准确\n2. 符合目标语言的表达习惯\n\n原文：\n{{text}}',
      category: '翻译',
      variables: ['source_lang', 'target_lang', 'text'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  settings: {
    themeMode: 'system',
    colorTheme: 'blue',
    activeProjectId: 'default'
  },
  version: CURRENT_VERSION
}

// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// 加载数据
export function loadData(): StorageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return defaultData
    }

    const data = JSON.parse(stored) as StorageData

    // 版本迁移（预留）
    if (data.version < CURRENT_VERSION) {
      return migrateData(data)
    }

    return data
  } catch (error) {
    console.error('Failed to load data from localStorage:', error)
    return defaultData
  }
}

// 保存数据
export function saveData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save data to localStorage:', error)
  }
}

// 数据迁移（预留）
function migrateData(data: StorageData): StorageData {
  // 未来版本升级时在此添加迁移逻辑
  return { ...data, version: CURRENT_VERSION }
}

// 导出数据为JSON
export function exportData(): string {
  const data = loadData()
  return JSON.stringify(data, null, 2)
}

// 导入数据
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as StorageData

    // 基本验证
    if (!data.tasks || !data.projects || !data.settings) {
      throw new Error('Invalid data format')
    }

    saveData({ ...data, version: CURRENT_VERSION })
    return true
  } catch (error) {
    console.error('Failed to import data:', error)
    return false
  }
}

// 清除所有数据
export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// === 任务相关操作 ===

export function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const now = Date.now()
  return {
    ...task,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  }
}

export function updateTask(data: StorageData, taskId: string, updates: Partial<Task>): StorageData {
  return {
    ...data,
    tasks: data.tasks.map(task =>
      task.id === taskId
        ? { ...task, ...updates, updatedAt: Date.now() }
        : task
    )
  }
}

export function deleteTask(data: StorageData, taskId: string): StorageData {
  return {
    ...data,
    tasks: data.tasks.filter(task => task.id !== taskId && task.parentId !== taskId)
  }
}

// === 项目相关操作 ===

export function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const now = Date.now()
  return {
    ...project,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  }
}

export function updateProject(data: StorageData, projectId: string, updates: Partial<Project>): StorageData {
  return {
    ...data,
    projects: data.projects.map(project =>
      project.id === projectId
        ? { ...project, ...updates, updatedAt: Date.now() }
        : project
    )
  }
}

export function deleteProject(data: StorageData, projectId: string): StorageData {
  // 删除项目时，将该项目下的任务移到第一个剩余项目，如果没有则设为 undefined
  const remainingProjects = data.projects.filter(project => project.id !== projectId)
  const fallbackProjectId = remainingProjects.length > 0 ? remainingProjects[0].id : undefined

  return {
    ...data,
    projects: remainingProjects,
    tasks: data.tasks.map(task =>
      task.projectId === projectId
        ? { ...task, projectId: fallbackProjectId, updatedAt: Date.now() }
        : task
    )
  }
}

// === 模板相关操作 ===

export function createTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): PromptTemplate {
  const now = Date.now()
  return {
    ...template,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  }
}

export function updateTemplate(data: StorageData, templateId: string, updates: Partial<PromptTemplate>): StorageData {
  return {
    ...data,
    templates: data.templates.map(template =>
      template.id === templateId
        ? { ...template, ...updates, updatedAt: Date.now() }
        : template
    )
  }
}

export function deleteTemplate(data: StorageData, templateId: string): StorageData {
  return {
    ...data,
    templates: data.templates.filter(template => template.id !== templateId)
  }
}

// === 解析Prompt模板变量 ===

export function parseTemplateVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const variables: string[] = []
  let match

  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}

export function fillTemplate(content: string, variables: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`)
}
