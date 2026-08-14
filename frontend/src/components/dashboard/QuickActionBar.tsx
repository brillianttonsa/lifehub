import { useNavigate } from 'react-router-dom'

export default function QuickActionBar() {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Add Plan',
      color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      onClick: () => navigate('/plans'),
    },
    {
      label: 'Log Habit',
      color: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      onClick: () => navigate('/discipline'),
    },
    {
      label: 'Add Expense',
      color: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      onClick: () => navigate('/pocket'),
    },
    {
      label: 'New Project',
      color: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      onClick: () => navigate('/project'),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`group relative overflow-hidden rounded-xl bg-gradient-to-r ${action.color} px-6 py-4 font-semibold text-white shadow-lg transition duration-200 transform hover:scale-105 active:scale-95`}
        >
          <div className="relative flex items-center justify-center gap-2">
            <span>{action.label}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
