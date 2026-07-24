import { useState } from 'react'
import { DashboardModulePage } from '../../components/dashboard/settings/DashboardModulePage'
import {
  User,
  Bell,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
} from 'lucide-react'

type SettingsTab = 'profile' | 'notifications' | 'modules' | 'security'

interface ProfileState {
  fullName: string
  email: string
  title: string
  bio: string
}

interface NotificationState {
  emailAlerts: boolean
  pushNotifications: boolean
  weeklyDigest: boolean
  projectUpdates: boolean
}

interface ModulePreferencesState {
  disciplineModule: boolean
  projectModule: boolean
  analyticsModule: boolean
  compactView: boolean
}

const TABS: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'modules', label: 'Modules', icon: Sliders },
  { id: 'security', label: 'Security', icon: Shield },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Settings states
  const [profile, setProfile] = useState<ProfileState>({
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    title: 'Senior Software Engineer',
    bio: 'Building systems, tracking habits, and refining workflows.',
  })

  const [notifications, setNotifications] = useState<NotificationState>({
    emailAlerts: true,
    pushNotifications: false,
    weeklyDigest: true,
    projectUpdates: true,
  })

  const [modules, setModules] = useState<ModulePreferencesState>({
    disciplineModule: true,
    projectModule: true,
    analyticsModule: false,
    compactView: false,
  })

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API persistence
    setTimeout(() => {
      setIsSaving(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }, 600)
  }

  return (
    <DashboardModulePage
      title="Settings"
      eyebrow="Preferences"
      description="Manage your profile, notifications, and LifeHub modules."
    >
      {/* Top Save Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div />

        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} /> Changes saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-500 disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Navigation Sidebar */}
        <nav className="flex space-x-2 overflow-x-auto lg:flex-col lg:space-x-0 lg:space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white font-semibold text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Tab Panels */}
        <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Profile details
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Update your public profile information and account handle.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Professional Title
                </label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Notification preferences
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Control how and when you receive alerts from LifeHub.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800/60">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Email Alerts
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Receive daily reminders and critical activity summaries.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={(e) =>
                      setNotifications({ ...notifications, emailAlerts: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800/60">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Project Updates
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Get notified when comments or entries are added to projects.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.projectUpdates}
                    onChange={(e) =>
                      setNotifications({ ...notifications, projectUpdates: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800/60">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Weekly Digest
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Receive a performance breakdown of discipline cycles every Monday.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyDigest}
                    onChange={(e) =>
                      setNotifications({ ...notifications, weeklyDigest: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MODULE PREFERENCES TAB */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Module configuration
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enable or disable platform features according to your daily workflow.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800/60">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Discipline Tracking
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enables discipline cycle grids, task tracking, and scoring.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={modules.disciplineModule}
                    onChange={(e) =>
                      setModules({ ...modules, disciplineModule: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800/60">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Project Management
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enables team workspaces, entries, comments, and member clearance.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={modules.projectModule}
                    onChange={(e) =>
                      setModules({ ...modules, projectModule: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Security & Credentials
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Update password and audit account authorization parameters.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardModulePage>
  )
}