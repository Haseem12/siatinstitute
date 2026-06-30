// src/app/registration/login/page.tsx
import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function RegistrationLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}