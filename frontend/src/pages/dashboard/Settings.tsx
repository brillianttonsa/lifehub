import { useState } from 'react'
import { DashboardModulePage } from '../../components/dashboard/settings/DashboardModulePage'
import { useAuth } from '../../context/authcontext/useAuth'
import { useTheme } from '../../context/themecontext/useTheme'
import { changePassword } from '../../api/authApi'
import { getApiErrorMessage } from '../../lib/apiClient'
import {
  User,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Monitor,
  Lock,
} from 'lucide-react'

type SettingsTab = 'profile' | 'appearance' | 'security'

interface ProfileState {
  fullName: string
  email: string
}

const TABS: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Sliders },
  { id: 'security', label: 'Security', icon: Shield },
]

export default function Settings() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  // Settings states
  const [profile, setProfile] = useState<ProfileState>({
    fullName: user?.fullName || 'User',
    email: user?.email || '',
  })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API persistence
    setTimeout(() => {
      setIsSaving(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }, 600)
  }

  const handlePasswordUpdate = async () => {
    setPasswordError('')
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    setIsSaving(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      setPasswordError(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
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
                  Profile Settings
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage your account information and personal settings.
                </p>
              </div>

              {/* Avatar / User Initials */}
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white">
                  {profile.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Profile Picture</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">JPG, GIF or PNG. Max 2MB.</p>
                  <button className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                    Upload New
                  </button>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Full Name
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Appearance & Theme
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Customize how LifeHub looks and feels for you.
                </p>
              </div>

              {/* Theme Selection */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Theme</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Light Theme */}
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition ${
                      theme === 'light'
                        ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                    <Sun size={28} className="text-amber-500" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Light</span>
                    {theme === 'light' && <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400" />}
                  </button>

                  {/* Dark Theme */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition ${
                      theme === 'dark'
                        ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                    <Moon size={28} className="text-indigo-500" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Dark</span>
                    {theme === 'dark' && <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400" />}
                  </button>

                  {/* System Theme */}
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition ${
                      theme === 'system'
                        ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                    <Monitor size={28} className="text-slate-500" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">System</span>
                    {theme === 'system' && <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400" />}
                  </button>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Workspace Settings */}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Workspace Settings</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">Default Start Route</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Where to go when you open LifeHub</p>
                    </div>
                    <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      <option>Dashboard</option>
                      <option>Plans</option>
                      <option>Discipline</option>
                      <option>Pocket</option>
                      <option>Projects</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Security & Authentication
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage your account security and password settings.
                </p>
              </div>

              {/* Password Update */}
              <div className="space-y-4 rounded-2xl border border-slate-100 p-6 dark:border-slate-800/60">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Update Password</p>

                {passwordError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                    {passwordError}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePasswordUpdate}
                  disabled={isSaving}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardModulePage>
  )
}
