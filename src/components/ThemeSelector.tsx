import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react'
import { useApp } from '../store/AppContext'
import type { ThemeMode, ColorTheme } from '../types'

const THEME_MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor }
]

const COLOR_THEMES: { value: ColorTheme; label: string; color: string }[] = [
  { value: 'blue', label: '蓝色', color: '#007AFF' },
  { value: 'purple', label: '紫色', color: '#AF52DE' },
  { value: 'green', label: '绿色', color: '#34C759' },
  { value: 'orange', label: '橙色', color: '#FF9500' },
  { value: 'pink', label: '粉色', color: '#FF2D55' },
  { value: 'teal', label: '青色', color: '#00C7BE' }
]

export function ThemeSelector() {
  const { state, setThemeMode, setColorTheme } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  const currentColorTheme = COLOR_THEMES.find(t => t.value === state.settings.colorTheme)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius-sm)]
          text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]
          transition-colors duration-[var(--transition-fast)]"
      >
        <Palette className="w-5 h-5" />
        <span className="flex-1 text-left text-sm font-medium">主题设置</span>
        <div
          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: currentColorTheme?.color }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 bottom-full mb-2 w-64 p-4 bg-[var(--color-bg-primary)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] border border-[var(--color-border-light)] z-50"
            >
              {/* Theme Mode */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                  外观模式
                </h4>
                <div className="flex gap-1 p-1 rounded-[var(--radius-sm)] bg-[var(--color-bg-secondary)]">
                  {THEME_MODES.map(mode => {
                    const Icon = mode.icon
                    const isActive = state.settings.themeMode === mode.value
                    return (
                      <button
                        key={mode.value}
                        onClick={() => setThemeMode(mode.value)}
                        className={`
                          flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium
                          transition-all duration-[var(--transition-fast)]
                          ${isActive
                            ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                          }
                        `}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {mode.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                  主题色
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_THEMES.map(theme => {
                    const isActive = state.settings.colorTheme === theme.value
                    return (
                      <button
                        key={theme.value}
                        onClick={() => setColorTheme(theme.value)}
                        className={`
                          relative flex flex-col items-center gap-1.5 p-2 rounded-[var(--radius-sm)]
                          transition-all duration-[var(--transition-fast)]
                          ${isActive
                            ? 'bg-[var(--color-bg-secondary)]'
                            : 'hover:bg-[var(--color-bg-secondary)]'
                          }
                        `}
                      >
                        <div
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center
                            transition-transform duration-[var(--transition-fast)]
                            ${isActive ? 'scale-110' : ''}
                          `}
                          style={{ backgroundColor: theme.color }}
                        >
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            >
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                        <span className={`
                          text-xs
                          ${isActive ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}
                        `}>
                          {theme.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
