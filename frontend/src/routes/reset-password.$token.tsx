import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/common/Navbar";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const Route = createFileRoute("/reset-password/$token")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useParams();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center px-4 py-12">
        <ResetPasswordForm token={token} />
      </main>
    </div>
  );
}
