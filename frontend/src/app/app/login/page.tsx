import { GradientBackground } from '@/components/landing-page/gradient';
import AuthFormSwitcher from '@/components/auth/AuthFormSwitcher';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your account to continue.',
};

export default function LoginPage() {
  return (
    <main className="overflow-hidden bg-gray-50">
      <GradientBackground />
      <div className="isolate flex min-h-dvh items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md rounded-xl bg-white shadow-md ring-1 ring-black/5">
          <AuthFormSwitcher />
        </div>
      </div>
    </main>
  );
}
