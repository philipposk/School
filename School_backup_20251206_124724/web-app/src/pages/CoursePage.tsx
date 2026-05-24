import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCourseById } from '../data/courses'
import { useProgressStore } from '../store/useProgressStore'
import { CheckCircle2, Circle, ArrowLeft, BookOpen } from 'lucide-react'
import { useEffect } from 'react'

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const course = courseId ? getCourseById(courseId) : undefined
  const getCourseProgress = useProgressStore((state) => state.getCourseProgress)
  const getProgressPercentage = useProgressStore((state) => state.getProgressPercentage)

  useEffect(() => {
    if (!course) {
      navigate('/')
    }
  }, [course, navigate])

  if (!course) {
    return null
  }

  const progress = getCourseProgress(course.id)
  const progressPercentage = getProgressPercentage(course.id, course.modules)
  const lastAccessedModule = progress?.lastAccessedModule || 1

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
        </Link>
      </div>

      {/* Course Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="flex items-start gap-6">
          <div className="text-6xl">{course.icon}</div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {course.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <BookOpen size={16} />
                {course.modules} Modules
              </span>
              <span>{course.duration}</span>
              <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold">
                {course.level}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {progressPercentage > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Course Progress
              </span>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modules List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Modules</h2>
        <div className="space-y-3">
          {course.modules_data.map((module, index) => {
            const isCompleted = progress?.completedModules.includes(module.id) || false
            const isLastAccessed = module.id === lastAccessedModule
            
            return (
              <Link
                key={module.id}
                to={`/course/${course.id}/module/${module.id}`}
                className={`block p-4 rounded-lg border-2 transition-all ${
                  isLastAccessed
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <CheckCircle2 className="text-green-500" size={24} />
                    ) : (
                      <Circle className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Module {module.id}
                      </span>
                      {isCompleted && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          Completed
                        </span>
                      )}
                      {isLastAccessed && !isCompleted && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                          Continue
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {module.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

