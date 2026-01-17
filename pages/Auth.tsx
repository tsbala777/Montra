
import React, { useState } from 'react';
import { SignInPage } from '../components/ui/sign-in';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  currentView: 'login' | 'signup';
  onSwitch: (view: 'login' | 'signup') => void;
}
export const Auth: React.FC<Props> = ({ currentView, onSwitch }) => {
  const { signIn, signUp, signInWithGoogle, resetPassword, error, clearError, loading } = useAuth();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';

    if (rememberMe) {
      localStorage.setItem('montra_user_email', email);
    } else {
      localStorage.removeItem('montra_user_email');
    }

    try {
      if (currentView === 'signup') {
        await signUp(email, password, email.split('@')[0]);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
    }
  };

  const handleResetPassword = async () => {
    const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value;
    if (!email) {
      alert('Please enter your email address first');
      return;
    }
    try {
      await resetPassword(email);
      alert('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error('Password reset error:', err);
    }
  }

  const handleCreateAccount = () => {
    onSwitch('signup');
  }

  const handleSwitchToLogin = () => {
    onSwitch('login');
  }

  const title = currentView === 'login' ? (
    <>
      <span className="font-light tracking-tighter">Welcome to </span>
      <span className="font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Montra</span>
    </>
  ) : (
    <>
      <span className="font-light tracking-tighter">Join </span>
      <span className="font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Montra</span>
    </>
  );

  const description = currentView === 'login'
    ? "Access your account and manage your student finances with ease"
    : "Start your journey to better financial management today";

  return (
    <SignInPage
      mode={currentView}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
      onSwitchToLogin={handleSwitchToLogin}
    />
  );
};
