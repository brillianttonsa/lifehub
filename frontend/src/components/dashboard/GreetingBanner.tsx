import { useEffect, useState } from 'react'

interface GreetingBannerProps {
  userName?: string
}

export default function GreetingBanner({ userName = 'there' }: GreetingBannerProps) {
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const hour = new Date().getHours()

    if (hour < 12) {
      setGreeting('Good morning')
    } else if (hour < 18) {
      setGreeting('Good afternoon')
    } else {
      setGreeting('Good evening')
    }
  }, [])

  const firstName = userName?.split(' ')[0] || 'there'

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 px-8 py-12 text-white shadow-lg dark:from-indigo-900 dark:via-indigo-800 dark:to-indigo-900">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">Welcome Back</p>
        <h2 className="mt-2 text-4xl font-bold tracking-tight">{greeting}, {firstName}!</h2>
        <p className="mt-4 text-indigo-100">Here's a summary of your day. Stay focused and make it productive.</p>
      </div>
    </div>
  )
}
