import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/auth.store';

export function LoginScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [serverUrl, setServerUrl] = useState('https://matrix.ozturu.com');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(serverUrl, username, password);
      // Navigation will happen via useEffect when isAuthenticated becomes true
    } catch (err) {
      // Error already set by store
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pardus-bg p-4">
      <div className="card-pardus p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pardus-primary">Neo</h1>
          <p className="text-pardus-text/70 mt-2">
            {t('app.description')}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-pardus-text mb-2">
              {t('auth.serverUrl')}
            </label>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full px-4 py-2 border border-pardus-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pardus-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pardus-text mb-2">
              {t('auth.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-pardus-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pardus-primary"
              placeholder="@user:server.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pardus-text mb-2">
              {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-pardus-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pardus-primary"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-pardus py-3 font-medium disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t('auth.login')}...
              </span>
            ) : (
              t('auth.login')
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-pardus-text/70">
            Demo için: matrix.ozturu.com sunucusunu kullanın
          </p>
        </div>
      </div>
    </div>
  );
}