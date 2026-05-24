import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCourseById } from '../data/courses'
import { useProgressStore } from '../store/useProgressStore'
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ModulePage() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>()
  const navigate = useNavigate()
  const course = courseId ? getCourseById(courseId) : undefined
  const moduleNumber = moduleId ? parseInt(moduleId, 10) : 0
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const markModuleComplete = useProgressStore((state) => state.markModuleComplete)
  const setLastAccessedModule = useProgressStore((state) => state.setLastAccessedModule)
  const getCourseProgress = useProgressStore((state) => state.getCourseProgress)

  useEffect(() => {
    if (!course) {
      navigate('/')
      return
    }

    if (moduleNumber < 1 || moduleNumber > course.modules) {
      navigate(`/course/${courseId}`)
      return
    }

    // Mark as last accessed
    setLastAccessedModule(course.id, moduleNumber)

    // Load module content
    const loadModule = async () => {
      setLoading(true)
      setError(null)
      try {
        // Load from the course/modules directory
        // In development, Vite serves from project root, so we use relative path
        // In production, you may need to adjust this path or use a proxy
        const modulePath = `/course/modules/module${moduleNumber.toString().padStart(2, '0')}.md`
        const response = await fetch(modulePath)
        if (!response.ok) {
          throw new Error('Module not found')
        }
        const text = await response.text()
        setContent(text)
      } catch (err) {
        setError('Failed to load module content. Please ensure the module file exists.')
        console.error('Error loading module:', err)
      } finally {
        setLoading(false)
      }
    }

    loadModule()
  }, [courseId, moduleId, course, moduleNumber, navigate, setLastAccessedModule])

  if (!course) {
    return null
  }

  const currentModule = course.modules_data.find((m) => m.id === moduleNumber)
  const progress = getCourseProgress(course.id)
  const isCompleted = progress?.completedModules.includes(moduleNumber) || false
  const hasNext = moduleNumber < course.modules
  const hasPrev = moduleNumber > 1

  const handleComplete = () => {
    if (!isCompleted) {
      markModuleComplete(course.id, moduleNumber)
    }
  }

  const handleNext = () => {
    if (hasNext) {
      navigate(`/course/${courseId}/module/${moduleNumber + 1}`)
    }
  }

  const handlePrev = () => {
    if (hasPrev) {
      navigate(`/course/${courseId}/module/${moduleNumber - 1}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/course/${courseId}`}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Course</span>
        </Link>
        <button
          onClick={handleComplete}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isCompleted
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900'
          }`}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
        </button>
      </div>

      {/* Module Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading module...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Make sure you're running the app with a server that can serve the course files.
            </p>
          </div>
        ) : (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            hasPrev
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ArrowLeft size={20} />
          <span>Previous</span>
        </button>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Module {moduleNumber} of {course.modules}
        </div>

        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            hasNext
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Next</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}

