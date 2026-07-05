import { useState } from 'react'
import { useAuth } from '../context/authcontext/useAuth'

export default function Settings() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [email] = useState(user?.email ?? '')
  const [notificationEnabled, setNotificationEnabled] = useState(true)

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-600">Settings</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Workspace preferences</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Update your profile, notification settings, and module preferences for LifeHub.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Full name</label>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Email</label>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              value={email}
              disabled
            />
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-slate-50 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <p className="mt-1 text-sm text-slate-600">Control whether LifeHub sends you activity reminders.</p>
            </div>
            <button
              onClick={() => setNotificationEnabled((prev) => !prev)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${notificationEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            >
              {notificationEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
            Save changes
          </button>
          <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Manage subscription
          </button>
        </div>
      </section>
    </div>
  )
}
