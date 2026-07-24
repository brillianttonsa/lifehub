import { useAuth } from '../../context/authcontext/useAuth'

export default function Dashboard() {
  const { user } = useAuth()


  return (
    <div className="flex min-h-full w-full items-center justify-center px-4">
        <div>Welcome back, {user?.fullName.split(' ')[0] ?? 'there'}!</div>
    </div>
  )
}
