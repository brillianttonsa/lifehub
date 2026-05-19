import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/common/Navbar";
import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center px-4 py-12">
        <LoginForm />
      </main>
    </div>
  );
}
