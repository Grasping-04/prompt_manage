import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Plus, MoreHorizontal, Edit3, Trash2, Check, X } from 'lucide-react'
import { useApp } from '../store/AppContext'
import type { Project } from '../types'

const PROJECT_COLORS = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30',
  '#AF52DE', '#5856D6', '#FF2D55', '#00C7BE'
]

export function Sidebar() {
  const { state, addProject, updateProject, deleteProject, setActiveProject } = useApp()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0])
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const handleCreate = () => {
    if (newName.trim()) {
      addProject({
        name: newName.trim(),
        color: newColor,
        order: state.projects.length
      })
      setNewName('')
      setNewColor(PROJECT_COLORS[0])
      setIsCreating(false)
    }
  }

  const handleUpdate = (project: Project) => {
    if (newName.trim()) {
      updateProject(project.id, { name: newName.trim(), color: newColor })
      setEditingId(null)
      setNewName('')
    }
  }

  const handleDelete = (projectId: string) => {
    if (projectId === 'default') return
    deleteProject(projectId)
    if (state.settings.activeProjectId === projectId) {
      setActiveProject('default')
    }
    setMenuOpenId(null)
  }

  const startEditing = (project: Project) => {
    setEditingId(project.id)
    setNewName(project.name)
    setNewColor(project.color)
    setMenuOpenId(null)
  }

  const getTaskCount = (projectId: string) => {
    return state.tasks.filter(t => t.projectId === projectId && !t.parentId).length
  }

  return (
    <aside className="w-64 h-screen flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-light)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[var(--color-border-light)]">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Prompt Manager
        </h1>
      </div>

      {/* Projects */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="flex items-center justify-between px-4 mb-2">
          <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
            项目
          </span>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-1 px-2">
          {/* All tasks */}
          <button
            onClick={() => setActiveProject(null)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)]
              transition-all duration-[var(--transition-fast)]
              ${state.settings.activeProjectId === null
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              }
            `}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="flex-1 text-left text-sm font-medium">全部任务</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {state.tasks.filter(t => !t.parentId).length}
            </span>
          </button>

          {/* Project list */}
          {state.projects.map(project => (
            <div key={project.id} className="relative group">
              {editingId === project.id ? (
                <div className="p-2 bg-[var(--color-bg-primary)] rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleUpdate(project)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                    className="w-full px-2 py-1 text-sm bg-transparent border-none outline-none text-[var(--color-text-primary)]"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1">
                      {PROJECT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewColor(color)}
                          className={`w-5 h-5 rounded-full transition-transform ${newColor === color ? 'scale-110 ring-2 ring-offset-1 ring-[var(--color-border)]' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdate(project)}
                        className="p-1 rounded text-[var(--color-success)] hover:bg-[var(--color-success)]/10"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActiveProject(project.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)]
                    transition-all duration-[var(--transition-fast)]
                    ${state.settings.activeProjectId === project.id
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                    }
                  `}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 text-left text-sm font-medium truncate">
                    {project.name}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {getTaskCount(project.id)}
                  </span>

                  {/* Menu button */}
                  {project.id !== 'default' && (
                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => {
                        e.stopPropagation()
                        setMenuOpenId(menuOpenId === project.id ? null : project.id)
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  )}
                </button>
              )}

              {/* Context menu */}
              <AnimatePresence>
                {menuOpenId === project.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 py-1 bg-[var(--color-bg-primary)] rounded-[var(--radius-sm)] shadow-[var(--shadow-lg)] border border-[var(--color-border-light)] z-10 min-w-[120px]"
                  >
                    <button
                      onClick={() => startEditing(project)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                    >
                      <Edit3 className="w-4 h-4" />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* New project form */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-2 bg-[var(--color-bg-primary)] rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCreate()
                      if (e.key === 'Escape') setIsCreating(false)
                    }}
                    placeholder="项目名称"
                    autoFocus
                    className="w-full px-2 py-1 text-sm bg-transparent border-none outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1">
                      {PROJECT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewColor(color)}
                          className={`w-5 h-5 rounded-full transition-transform ${newColor === color ? 'scale-110 ring-2 ring-offset-1 ring-[var(--color-border)]' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setIsCreating(false)}
                        className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCreate}
                        disabled={!newName.trim()}
                        className="p-1 rounded text-[var(--color-success)] hover:bg-[var(--color-success)]/10 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--color-border-light)]">
        <p className="text-xs text-[var(--color-text-tertiary)] text-center">
          数据自动保存在本地
        </p>
      </div>
    </aside>
  )
}
