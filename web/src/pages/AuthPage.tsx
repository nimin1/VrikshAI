/**
 * Authentication Page - Login & Signup
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Strings } from '../constants/strings';
import Button from '../components/Button';
import Input from '../components/Input';
import './AuthPage.css';

type AuthMode = 'login' | 'signup';

// Extend Window interface for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

export default function AuthPage() {
  const { login, signup, loading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const isLogin = mode === 'login';

  // Listen for the PWA install prompt
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  }

  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await signup({ email, password, name });
      }
      // Don't manually navigate - let PublicRoute handle redirect after state updates
      console.log('Auth successful, waiting for redirect...');
    } catch (error) {
      console.error('Auth error:', error);
    }
  }

  function toggleMode() {
    setMode(isLogin ? 'signup' : 'login');
    setErrors({});
  }

  return (
    <div className="auth-page">
      <div className="auth-page__background" />

      <div className="auth-page__content">
        <div className="auth-page__branding">
          <img
            src="/VrikshAI.png"
            alt="VrikshAI Logo"
            className="auth-page__logo"
          />
          <h1 className="auth-page__app-name">{Strings.app.name}</h1>
          <p className="auth-page__app-name-sanskrit">{Strings.app.nameSanskrit}</p>
          <p className="auth-page__tagline">{Strings.app.tagline}</p>

          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              className="auth-page__install-button"
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: '8px' }}
              >
                <path
                  d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
                  fill="currentColor"
                />
              </svg>
              Install App
            </button>
          )}
        </div>

        <div className="auth-page__form-card">
          <h2 className="auth-page__form-title">
            {isLogin ? Strings.auth.welcomeBack : Strings.auth.createAccount}
          </h2>

          <form onSubmit={handleSubmit} className="auth-page__form">
            {!isLogin && (
              <Input
                type="text"
                name="name"
                value={name}
                onChange={setName}
                placeholder={Strings.auth.name}
                label={Strings.auth.name}
                error={errors.name}
                required
                autoComplete="name"
              />
            )}

            <Input
              type="email"
              name="email"
              value={email}
              onChange={setEmail}
              placeholder={Strings.auth.email}
              label={Strings.auth.email}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              type="password"
              name="password"
              value={password}
              onChange={setPassword}
              placeholder={Strings.auth.password}
              label={Strings.auth.password}
              error={errors.password}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />

            <Button type="submit" fullWidth loading={loading}>
              {isLogin ? Strings.auth.login : Strings.auth.signup}
            </Button>
          </form>

          <div className="auth-page__toggle">
            <p>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={toggleMode}
                className="auth-page__toggle-button"
              >
                {isLogin ? Strings.auth.signup : Strings.auth.login}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
