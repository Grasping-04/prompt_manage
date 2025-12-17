import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Copy, Trash2, Edit3, Sparkles } from 'lucide-react'
import type { Task } from '../types'
import { useApp } from '../store/AppContext'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { completeTask, deleteTask, getSubTasks } = useApp()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const subTasks = getSubTasks(task.id)
  const hasSubTasks = subTasks.length > 0
  const isCompleted = task.status === 'completed'

  const handleComplete = () => {
    completeTask(task.id)
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
          {/* Checkbox */}
          <button
            onClick={handleComplete}
            className={`
              relative mt-0.5 flex-shrink-0 w-6 h-6 rounded-full
              border-2 transition-all duration-[var(--transition-normal)]
              flex items-center justify-center
              ${isCompleted
                ? 'bg-[var(--color-success)] border-[var(--color-success)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
              }
            `}
          >
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 25
                  }}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Celebration effect */}
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

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
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

              {task.status === 'in_progress' && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  进行中
                </span>
              )}
            </div>

            {task.description && (
              <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Prompt preview */}
            {task.prompt && (
              <div className="mt-3 p-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Prompt
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md
                      text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10
                      transition-colors duration-[var(--transition-fast)]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {showCopied ? '已复制' : '复制'}
                  </button>
                </div>
                <p className="text-sm text-[var(--color-text-primary)] line-clamp-3 whitespace-pre-wrap">
                  {task.prompt}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-fast)]">
            <button
              onClick={() => onEdit(task)}
              className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
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
                  <TaskItem key={subTask.id} task={subTask} onEdit={onEdit} />
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
