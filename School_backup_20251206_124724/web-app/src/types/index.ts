export interface Module {
  id: number
  title: string
  subtitle: string
}

export interface Course {
  id: string
  title: string
  description: string
  icon: string
  modules: number
  duration: string
  level: string
  modules_data: Module[]
}

export interface Progress {
  courseId: string
  completedModules: number[]
  lastAccessedModule?: number
}

export interface Quiz {
  id: number
  questions: QuizQuestion[]
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

