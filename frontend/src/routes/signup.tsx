import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/common/Navbar";
import { SignupForm } from "@/components/auth/SignupForm";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center px-4 py-12">
        <SignupForm />
      </main>
    </div>
  );
}
