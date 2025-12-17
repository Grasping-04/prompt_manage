import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Download, Upload } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { TaskItem } from './TaskItem'
import { TaskForm } from './TaskForm'
import type { Task, FilterOptions } from '../types'
import { exportData, importData } from '../services/storage'

export function TaskList() {
  const { state, getFilteredTasks, importData: importAppData } = useApp()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<FilterOptions>({
    status: 'all',
    projectId: undefined,
    searchQuery: ''
  })

  // Update filter when active project changes
  const filterOptions: FilterOptions = {
    ...filter,
    projectId: state.settings.activeProjectId ?? undefined
  }

  const tasks = getFilteredTasks(filterOptions)

  const activeProject = state.settings.activeProjectId
    ? state.projects.find(p => p.id === state.settings.activeProjectId)
    : null

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-manager-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        const success = importData(text)
        if (success) {
          // Reload data
          window.location.reload()
        } else {
          alert('导入失败，请检查文件格式')
        }
      }
    }
    input.click()
  }

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const totalCount = tasks.length

  return (
    <main className="flex-1 h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-8 py-6 border-b border-[var(--color-border-light)] bg-[var(--color-bg-primary)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              {activeProject ? activeProject.name : '全部任务'}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {completedCount}/{totalCount} 已完成
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-sm
                text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]
                transition-colors duration-[var(--transition-fast)]"
              title="导出数据"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-sm
                text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]
                transition-colors duration-[var(--transition-fast)]"
              title="导入数据"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium
                bg-[var(--color-primary)] text-white
                hover:bg-[var(--color-primary-hover)]
                transition-colors duration-[var(--transition-fast)]"
            >
              <Plus className="w-4 h-4" />
              新建任务
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={e => setFilter({ ...filter, searchQuery: e.target.value })}
              placeholder="搜索任务..."
              className="w-full pl-10 pr-4 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]
                bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                placeholder:text-[var(--color-text-tertiary)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
                transition-all duration-[var(--transition-fast)]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-[var(--radius-sm)] bg-[var(--color-bg-secondary)]">
            {[
              { value: 'all', label: '全部' },
              { value: 'pending', label: '待办' },
              { value: 'in_progress', label: '进行中' },
              { value: 'completed', label: '已完成' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilter({ ...filter, status: option.value as FilterOptions['status'] })}
                className={`
                  px-3 py-1.5 rounded text-sm font-medium transition-all duration-[var(--transition-fast)]
                  ${filter.status === option.value
                    ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-8">
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center">
              <Plus className="w-8 h-8 text-[var(--color-text-tertiary)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
              暂无任务
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              点击右上角"新建任务"开始添加
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium
                bg-[var(--color-primary)] text-white
                hover:bg-[var(--color-primary-hover)]
                transition-colors duration-[var(--transition-fast)]"
            >
              创建第一个任务
            </button>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            <AnimatePresence mode="popLayout">
              {tasks.map(task => (
                <TaskItem key={task.id} task={task} onEdit={handleEdit} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingTask={editingTask}
      />
    </main>
  )
}
