import { Suspense } from 'react';
import SignInClient from './SignInClient';

export const metadata = {
  title: 'Sign In | Banner Beauty',
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
