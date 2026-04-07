import React, { useState } from 'react';
import { loginUser, registerUser } from '../api/placesApi';

interface Props {
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

const AuthModal: React.FC<Props> = ({ onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetFields = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    resetFields();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password);
      const token = data.token || data.access_token || data.Token;
      if (token) {
        localStorage.setItem('token', token);
        onLoginSuccess(token);
      } else {
        setError('Сервер не вернул токен');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(msg || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Заполните все поля');
      return;
    }
    if (username.length < 3 || username.length > 50) {
      setError('Имя пользователя: от 3 до 50 символов');
      return;
    }
    if (password.length < 6) {
      setError('Пароль минимум 6 символов');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await registerUser(username, email, password);
      const token = data.token || data.access_token || data.Token;
      if (token) {
        localStorage.setItem('token', token);
        onLoginSuccess(token);
      } else {
        // Регистрация прошла, но токен не вернули — переключаемся на вход
        setSuccess('Регистрация прошла успешно! Войдите в аккаунт.');
        setMode('login');
        setUsername('');
        setPassword('');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(msg || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') handleLogin();
    else handleRegister();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-bold">
              {mode === 'login' ? '🔑 Вход' : '📝 Регистрация'}
            </h2>
            <p className="text-blue-100 text-xs mt-0.5">
              {mode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте аккаунт'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Вход
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✅</span>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Username (только при регистрации) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Имя пользователя
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="от 3 до 50 символов"
                minLength={3}
                maxLength={50}
                autoComplete="username"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'минимум 6 символов' : 'Ваш пароль'}
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {mode === 'login' ? 'Входим...' : 'Регистрируем...'}
              </>
            ) : (
              mode === 'login' ? '🔑 Войти' : '📝 Зарегистрироваться'
            )}
          </button>

          {/* Switch mode link */}
          <p className="text-center text-xs text-gray-500">
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button type="button" onClick={() => switchMode('register')} className="text-blue-600 hover:underline font-medium">
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-blue-600 hover:underline font-medium">
                  Войти
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
