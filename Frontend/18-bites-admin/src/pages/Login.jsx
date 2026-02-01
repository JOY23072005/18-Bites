import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import { useAuthStore } from '../store/authStore.js';
import { LogIn } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-secondary-400 rounded-lg flex items-center justify-center font-bold text-xl text-gray-900">
              AL
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">Aakash Life</h1>
              <p className="text-primary-200 text-sm">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aakashlife.com"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full flex items-center justify-center gap-2 mt-6"
            >
              <LogIn size={20} /> Sign In
            </Button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-4">
            Only authorized admins and super-admins can access this panel.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-primary-100 text-sm">
          <p>© 2024 Aakash Life. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
