import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Progress } from '../types'

interface ProgressState {
  progress: Record<string, Progress>
  markModuleComplete: (courseId: string, moduleId: number) => void
  setLastAccessedModule: (courseId: string, moduleId: number) => void
  getCourseProgress: (courseId: string) => Progress | undefined
  getProgressPercentage: (courseId: string, totalModules: number) => number
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      markModuleComplete: (courseId, moduleId) => {
        set((state) => {
          const courseProgress = state.progress[courseId] || {
            courseId,
            completedModules: [],
          }
          const completedModules = courseProgress.completedModules.includes(moduleId)
            ? courseProgress.completedModules
            : [...courseProgress.completedModules, moduleId]

          return {
            progress: {
              ...state.progress,
              [courseId]: {
                ...courseProgress,
                completedModules,
              },
            },
          }
        })
      },
      setLastAccessedModule: (courseId, moduleId) => {
        set((state) => {
          const courseProgress = state.progress[courseId] || {
            courseId,
            completedModules: [],
          }
          return {
            progress: {
              ...state.progress,
              [courseId]: {
                ...courseProgress,
                lastAccessedModule: moduleId,
              },
            },
          }
        })
      },
      getCourseProgress: (courseId) => {
        return get().progress[courseId]
      },
      getProgressPercentage: (courseId, totalModules) => {
        const courseProgress = get().progress[courseId]
        if (!courseProgress || totalModules === 0) return 0
        return Math.round((courseProgress.completedModules.length / totalModules) * 100)
      },
    }),
    {
      name: 'course-progress-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

