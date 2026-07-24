import { useEffect, useState } from 'react'
import { useAuth } from '../../context/authcontext/useAuth'
import { DashboardModulePage } from '../../components/dashboard/settings/DashboardModulePage'
import { listPlanningCycles } from '../../api/planApi'
import { listCycles as listDisciplineCycles, getGrid } from '../../api/disciplineApi'
import { getPocketOverview, listWallets } from '../../api/pocketApi'
import { listProjects } from '../../api/projectApi'
import { Goal } from '../../types/plan'
import { DisciplineGrid } from '../../types/discipline'
import { PocketOverview, Wallet } from '../../types/pocket'
import { Project } from '../../types/project'
import GreetingBanner from '../../components/dashboard/GreetingBanner'
import QuickStats from '../../components/dashboard/QuickStats'
import QuickActionBar from '../../components/dashboard/QuickActionBar'
import TodaysPriorities from '../../components/dashboard/TodaysPriorities'
import HabitTracker from '../../components/dashboard/HabitTracker'
import PocketOverviewCard from '../../components/dashboard/PocketOverviewCard'
import ActiveProjects from '../../components/dashboard/ActiveProjects'

export default function Dashboard() {
  const { user } = useAuth()
  const [disciplineData, setDisciplineData] = useState<DisciplineGrid | null>(null)
  const [pocketData, setPocketData] = useState<PocketOverview | null>(null)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [cycles, pocketOverview, pocketWallets, projectList] = await Promise.all([
          listPlanningCycles({ status: 'Active', pageSize: 100 }),
          getPocketOverview(),
          listWallets(),
          listProjects(),
        ])

        setGoals(cycles.cycles.flatMap((cycle) => cycle.goals ?? []))
        setPocketData(pocketOverview)
        setWallets(pocketWallets)
        setProjects(projectList)

        // Try to get discipline data
        try {
          const cycles = await listDisciplineCycles()
          if (cycles.length > 0) {
            const grid = await getGrid(cycles[0].id)
            setDisciplineData(grid)
          }
        } catch (err) {
          console.log('Discipline data not available yet')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance || '0'), 0)

  // Calculate discipline streak
  const calculateDisciplineStreak = () => {
    if (!disciplineData) return 0
    
    let streak = 0
    let currentDate = new Date()
    currentDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      let dateCompleted = false
      
      // Check if all tasks are done for this date
      for (const task of disciplineData.tasks) {
        const taskLogs = disciplineData.logs[task.id] || {}
        if (taskLogs[dateStr]) {
          dateCompleted = true
          break
        }
      }
      
      if (dateCompleted) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  return (
    <DashboardModulePage title="Dashboard" eyebrow="Overview" description="Your command center for planning, discipline, pockets, and projects.">
      <div className="space-y-6">
        {/* Greeting Banner */}
        <GreetingBanner userName={user?.fullName} />

        {/* Quick Stats Row */}
        <QuickStats
          isLoading={isLoading}
          stats={{
            tasksToday: goals.filter((goal) => goal.status !== 'Completed').length,
            disciplineStreak: calculateDisciplineStreak(),
            monthlySpend: parseFloat(pocketData?.expense?.toString() || '0'),
            activeProjects: projects.length,
          }}
        />

        {/* Quick Action Bar */}
        <QuickActionBar />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <TodaysPriorities goals={goals} isLoading={isLoading} />
            <HabitTracker disciplineData={disciplineData} isLoading={isLoading} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PocketOverviewCard pocketData={pocketData} totalBalance={totalBalance} isLoading={isLoading} />
            <ActiveProjects isLoading={isLoading} projects={projects} />
          </div>
        </div>
      </div>
    </DashboardModulePage>
  )
}
