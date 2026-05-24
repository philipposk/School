import { Link } from 'react-router-dom'
import { courses } from '../data/courses'
import { useProgressStore } from '../store/useProgressStore'
import { BookOpen, Clock, TrendingUp, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const getProgressPercentage = useProgressStore((state) => state.getProgressPercentage)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Master Critical Thinking
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Transform your reasoning skills with our comprehensive course on clear thinking, 
          logical analysis, and evidence evaluation.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>8 Weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={16} />
            <span>8 Modules</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            <span>Master's Level</span>
          </div>
        </div>
      </section>

      {/* Course Cards */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Available Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const progress = getProgressPercentage(course.id, course.modules)
            return (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{course.icon}</div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                      {course.level}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>{course.modules} Modules</span>
                    <span>{course.duration}</span>
                  </div>
                  
                  {progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>View Course</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          What You'll Learn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Formalize Arguments</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Break down complex arguments into premises and conclusions
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Spot Fallacies</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Identify logical errors and cognitive biases instantly
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Evaluate Evidence</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Assess evidence quality like an expert
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🧮</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Probabilistic Reasoning</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Apply Bayesian thinking to uncertain situations
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Build Arguments</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Construct robust, defensible arguments
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Better Decisions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Use decision frameworks for better choices
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

