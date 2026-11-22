import { Navbar } from "@/components/Navbar";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <>
      <Navbar isAuthenticated={false} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <AuthForm />
      </main>
    </>
  );
}
