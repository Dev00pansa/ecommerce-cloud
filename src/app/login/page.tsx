import { Navbar } from "@/components/Navbar";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <>
      <Navbar isAuthenticated={false} />
      <main className="relative z-0 w-full max-w-[1440px] mx-auto flex flex-1 items-center justify-center px-6 py-12 md:px-12 lg:px-16">
        <AuthForm />
      </main>
    </>
  );
}
