import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Copy, Trash2, Edit3, Sparkles, Circle, Play, Plus } from 'lucide-react'
import type { Task, TaskStatus } from '../types'
import { useApp } from '../store/AppContext'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  showProjectTag?: boolean // 是否显示项目标签
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待办', color: 'var(--color-text-tertiary)', bgColor: 'transparent' },
  in_progress: { label: '进行中', color: 'var(--color-warning)', bgColor: 'var(--color-warning)' },
  completed: { label: '已完成', color: 'var(--color-success)', bgColor: 'var(--color-success)' }
}

export function TaskItem({ task, onEdit, showProjectTag = false }: TaskItemProps) {
  const { state, setTaskStatus, updateTask, deleteTask, getSubTasks } = useApp()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [promptValue, setPromptValue] = useState(task.prompt || '')
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null)

  const subTasks = getSubTasks(task.id)
  const hasSubTasks = subTasks.length > 0
  const isCompleted = task.status === 'completed'
  const isInProgress = task.status === 'in_progress'

  // 获取任务所属项目
  const project = state.projects.find(p => p.id === task.projectId)

  // 同步 prompt 值
  useEffect(() => {
    setPromptValue(task.prompt || '')
  }, [task.prompt])

  // 自动调整 textarea 高度
  useEffect(() => {
    if (isEditingPrompt && promptTextareaRef.current) {
      promptTextareaRef.current.style.height = 'auto'
      promptTextareaRef.current.style.height = promptTextareaRef.current.scrollHeight + 'px'
      promptTextareaRef.current.focus()
    }
  }, [isEditingPrompt])

  const handleStatusChange = (newStatus: TaskStatus) => {
    setTaskStatus(task.id, newStatus)
    setShowStatusMenu(false)
  }

  const getNextStatus = (): TaskStatus => {
    switch (task.status) {
      case 'pending': return 'in_progress'
      case 'in_progress': return 'completed'
      case 'completed': return 'pending'
    }
  }

  const handleStatusClick = () => {
    handleStatusChange(getNextStatus())
  }

  const handleCopyPrompt = async () => {
    if (task.prompt) {
      await navigator.clipboard.writeText(task.prompt)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      deleteTask(task.id)
    }, 300)
  }

  const handlePromptSave = () => {
    updateTask(task.id, { prompt: promptValue.trim() || undefined })
    setIsEditingPrompt(false)
  }

  const handlePromptKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setPromptValue(task.prompt || '')
      setIsEditingPrompt(false)
    }
    // Ctrl+Enter 保存
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handlePromptSave()
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDeleting ? 0 : 1,
        y: isDeleting ? -20 : 0,
        scale: isDeleting ? 0.95 : 1
      }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="group"
    >
      <div
        className={`
          relative overflow-hidden rounded-[var(--radius-md)]
          bg-[var(--color-bg-primary)]
          border border-[var(--color-border-light)]
          shadow-[var(--shadow-sm)]
          transition-all duration-[var(--transition-normal)]
          hover:shadow-[var(--shadow-md)]
          hover:border-[var(--color-border)]
          ${isCompleted ? 'opacity-70' : ''}
        `}
      >
        {/* Main content */}
        <div className="flex items-start gap-3 p-4">
          {/* Status indicator */}
          <div className="relative mt-0.5">
            <button
              onClick={handleStatusClick}
              onContextMenu={(e) => {
                e.preventDefault()
                setShowStatusMenu(!showStatusMenu)
              }}
              className={`
                relative flex-shrink-0 w-6 h-6 rounded-full
                border-2 transition-all duration-[var(--transition-normal)]
                flex items-center justify-center
                ${isCompleted
                  ? 'bg-[var(--color-success)] border-[var(--color-success)]'
                  : isInProgress
                    ? 'bg-[var(--color-warning)] border-[var(--color-warning)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                }
              `}
              title="点击切换状态，右键显示菜单"
            >
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    key="completed"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.div>
                ) : isInProgress ? (
                  <motion.div
                    key="in_progress"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Play className="w-3 h-3 text-white fill-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="pending"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Circle className="w-4 h-4 text-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Celebration effect for completed */}
              <AnimatePresence>
                {isCompleted && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{
                          scale: [0, 1.5],
                          opacity: [1, 0],
                          x: Math.cos((i * 60 * Math.PI) / 180) * 30,
                          y: Math.sin((i * 60 * Math.PI) / 180) * 30
                        }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="absolute w-2 h-2 rounded-full bg-[var(--color-success)]"
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </button>

            {/* Status menu */}
            <AnimatePresence>
              {showStatusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute left-0 top-full mt-1 py-1 bg-[var(--color-bg-primary)] rounded-[var(--radius-sm)] shadow-[var(--shadow-lg)] border border-[var(--color-border-light)] z-50 min-w-[100px]"
                  >
                    {(Object.entries(STATUS_CONFIG) as [TaskStatus, typeof STATUS_CONFIG['pending']][]).map(([status, config]) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`
                          w-full flex items-center gap-2 px-3 py-2 text-sm
                          transition-colors hover:bg-[var(--color-bg-secondary)]
                          ${task.status === status ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-primary)]'}
                        `}
                      >
                        <div
                          className="w-3 h-3 rounded-full border-2"
                          style={{
                            borderColor: config.color,
                            backgroundColor: status === 'pending' ? 'transparent' : config.bgColor
                          }}
                        />
                        {config.label}
                        {task.status === status && (
                          <Check className="w-3 h-3 ml-auto" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {hasSubTasks && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-0.5 -ml-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </button>
              )}

              <h3
                className={`
                  text-base font-medium text-[var(--color-text-primary)]
                  transition-all duration-[var(--transition-normal)]
                  ${isCompleted ? 'line-through text-[var(--color-text-tertiary)]' : ''}
                `}
              >
                {task.title}
              </h3>

              {/* Project tag - 在全部任务视图中显示 */}
              {showProjectTag && project && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `${project.color}15`,
                    color: project.color
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </span>
              )}

              {/* Status badge */}
              {task.status !== 'pending' && (
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${STATUS_CONFIG[task.status].color} 15%, transparent)`,
                    color: STATUS_CONFIG[task.status].color
                  }}
                >
                  {STATUS_CONFIG[task.status].label}
                </span>
              )}
            </div>

            {task.description && (
              <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Prompt section - editable */}
            <div className="mt-3 p-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)]">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Prompt
                </span>
                <div className="flex items-center gap-1">
                  {task.prompt && (
                    <button
                      onClick={handleCopyPrompt}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md
                        text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10
                        transition-colors duration-[var(--transition-fast)]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {showCopied ? '已复制' : '复制'}
                    </button>
                  )}
                </div>
              </div>

              {isEditingPrompt ? (
                <div>
                  <textarea
                    ref={promptTextareaRef}
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    onKeyDown={handlePromptKeyDown}
                    onBlur={handlePromptSave}
                    placeholder="输入 Prompt..."
                    className="w-full min-h-[80px] p-2 text-sm rounded border border-[var(--color-border)]
                      bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]
                      placeholder:text-[var(--color-text-tertiary)]
                      focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
                      resize-none font-mono"
                  />
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Ctrl+Enter 保存，Esc 取消
                  </p>
                </div>
              ) : task.prompt ? (
                <p
                  onClick={() => setIsEditingPrompt(true)}
                  className="text-sm text-[var(--color-text-primary)] line-clamp-3 whitespace-pre-wrap cursor-text hover:bg-[var(--color-bg-tertiary)]/50 -m-1 p-1 rounded transition-colors"
                  title="点击编辑"
                >
                  {task.prompt}
                </p>
              ) : (
                <button
                  onClick={() => setIsEditingPrompt(true)}
                  className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加 Prompt
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-fast)]">
            <button
              onClick={() => onEdit(task)}
              className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              title="编辑任务"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
              title="删除任务"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub tasks */}
        <AnimatePresence>
          {isExpanded && hasSubTasks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pl-12 space-y-2">
                {subTasks.map(subTask => (
                  <TaskItem key={subTask.id} task={subTask} onEdit={onEdit} showProjectTag={showProjectTag} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion celebration overlay */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 origin-left bg-[var(--color-success)]/5 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
