import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ChevronDown } from 'lucide-react'
import type { Task, TaskPriority, PromptTemplate } from '../types'
import { useApp } from '../store/AppContext'
import { fillTemplate } from '../services/storage'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  editingTask?: Task | null
}

export function TaskForm({ isOpen, onClose, editingTask }: TaskFormProps) {
  const { state, addTask, updateTask } = useApp()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [projectId, setProjectId] = useState<string>('default')
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})

  // Reset form when opening/closing or editing different task
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title)
        setDescription(editingTask.description || '')
        setPrompt(editingTask.prompt || '')
        setPriority(editingTask.priority)
        setProjectId(editingTask.projectId || 'default')
      } else {
        setTitle('')
        setDescription('')
        setPrompt('')
        setPriority('medium')
        setProjectId(state.settings.activeProjectId || 'default')
      }
      setSelectedTemplate(null)
      setTemplateVariables({})
    }
  }, [isOpen, editingTask, state.settings.activeProjectId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      prompt: prompt.trim() || undefined,
      priority,
      projectId,
      status: editingTask?.status || ('pending' as const),
      order: editingTask?.order || state.tasks.length
    }

    if (editingTask) {
      updateTask(editingTask.id, taskData)
    } else {
      addTask(taskData)
    }

    onClose()
  }

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    setShowTemplates(false)
    // Initialize variables
    const vars: Record<string, string> = {}
    template.variables.forEach(v => (vars[v] = ''))
    setTemplateVariables(vars)
  }

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      const filledPrompt = fillTemplate(selectedTemplate.content, templateVariables)
      setPrompt(filledPrompt)
      setSelectedTemplate(null)
      setTemplateVariables({})
    }
  }

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'low', label: '低', color: 'var(--color-text-tertiary)' },
    { value: 'medium', label: '中', color: 'var(--color-warning)' },
    { value: 'high', label: '高', color: 'var(--color-danger)' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="bg-[var(--color-bg-primary)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--color-border-light)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-light)]">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {editingTask ? '编辑任务' : '新建任务'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                    任务名称 <span className="text-[var(--color-danger)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="输入任务名称"
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)]
                      bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                      placeholder:text-[var(--color-text-tertiary)]
                      focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
                      transition-all duration-[var(--transition-fast)]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                    描述
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="添加任务描述（可选）"
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)]
                      bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                      placeholder:text-[var(--color-text-tertiary)]
                      focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
                      transition-all duration-[var(--transition-fast)] resize-none"
                  />
                </div>

                {/* Priority & Project */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                      优先级
                    </label>
                    <div className="flex gap-2">
                      {priorityOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPriority(option.value)}
                          className={`
                            flex-1 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium
                            border transition-all duration-[var(--transition-fast)]
                            ${priority === option.value
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border)]'
                            }
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                      项目
                    </label>
                    <select
                      value={projectId}
                      onChange={e => setProjectId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)]
                        bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
                        transition-all duration-[var(--transition-fast)]"
                    >
                      {state.projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                      <Sparkles className="w-4 h-4" />
                      Prompt
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md
                          text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10
                          transition-colors duration-[var(--transition-fast)]"
                      >
                        使用模板
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Template dropdown */}
                      <AnimatePresence>
                        {showTemplates && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-1 w-48 py-1 bg-[var(--color-bg-primary)] rounded-[var(--radius-sm)] shadow-[var(--shadow-lg)] border border-[var(--color-border-light)] z-10"
                          >
                            {state.templates.map(template => (
                              <button
                                key={template.id}
                                type="button"
                                onClick={() => handleTemplateSelect(template)}
                                className="w-full px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                              >
                                {template.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Template variables input */}
                  {selectedTemplate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 p-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)]"
                    >
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                        填写模板变量：{selectedTemplate.name}
                      </p>
                      <div className="space-y-2">
                        {selectedTemplate.variables.map(variable => (
                          <input
                            key={variable}
                            type="text"
                            value={templateVariables[variable] || ''}
                            onChange={e => setTemplateVariables({ ...templateVariables, [variable]: e.target.value })}
                            placeholder={`{{${variable}}}`}
                            className="w-full px-3 py-1.5 text-sm rounded border border-[var(--color-border)]
                              bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                              focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/20"
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyTemplate}
                        className="mt-2 px-3 py-1.5 text-xs font-medium rounded bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                      >
                        应用模板
                      </button>
                    </motion.div>
                  )}

                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="输入给AI的Prompt（可稍后添加）"
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)]
                      bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                      placeholder:text-[var(--color-text-tertiary)]
                      focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
                      transition-all duration-[var(--transition-fast)] resize-none font-mono text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium
                      border border-[var(--color-border)] text-[var(--color-text-primary)]
                      hover:bg-[var(--color-bg-secondary)] transition-colors duration-[var(--transition-fast)]"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim()}
                    className="flex-1 px-4 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium
                      bg-[var(--color-primary)] text-white
                      hover:bg-[var(--color-primary-hover)]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-[var(--transition-fast)]"
                  >
                    {editingTask ? '保存' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
