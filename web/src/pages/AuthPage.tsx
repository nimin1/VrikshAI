/**
 * Authentication Page - Login & Signup
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Strings } from '../constants/strings';
import Button from '../components/Button';
import Input from '../components/Input';
import './AuthPage.css';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isLogin = mode === 'login';

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
