import { Course } from '../types'

export const courses: Course[] = [
  {
    id: 'critical-thinking',
    title: 'Critical Thinking',
    description: 'Master clear reasoning and practical logic. Learn to identify, analyze, and construct arguments while avoiding common cognitive biases and logical fallacies.',
    icon: '🧠',
    modules: 8,
    duration: '8 weeks',
    level: 'Intermediate',
    modules_data: [
      { id: 1, title: 'Foundations of Critical Thinking', subtitle: 'Arguments, validity, and soundness' },
      { id: 2, title: 'Deduction: Propositional Logic & Syllogisms', subtitle: 'Formal logic and valid forms' },
      { id: 3, title: 'Induction, Evidence & Strength', subtitle: 'Evidence evaluation and analogical reasoning' },
      { id: 4, title: 'Probabilistic Thinking & Bayes', subtitle: 'Base rates and conditional probability' },
      { id: 5, title: 'Cognitive Biases & Debiasing', subtitle: 'Common biases and mitigation techniques' },
      { id: 6, title: 'Fallacies & Rhetoric', subtitle: 'Logical errors and rhetorical devices' },
      { id: 7, title: 'Constructing Strong Arguments', subtitle: 'Argument mapping and evidence integration' },
      { id: 8, title: 'Decision-Making & Final Project', subtitle: 'Expected value and real-world application' },
    ],
  },
]

export const getCourseById = (id: string): Course | undefined => {
  return courses.find((course) => course.id === id)
}

