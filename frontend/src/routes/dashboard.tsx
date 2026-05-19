import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/common/Navbar";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome, {user?.fullName || user?.email} 👋
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You're signed in via{" "}
            <span className="font-medium text-foreground">{user?.provider}</span>.
            Access tokens refresh automatically in the background.
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="User ID" value={user?.id ?? "—"} mono />
            <Stat label="Email" value={user?.email ?? "—"} />
            <Stat label="Provider" value={user?.provider ?? "—"} />
          </dl>

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleLogout}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 truncate text-sm ${mono ? "font-mono" : "font-medium"}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
