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
    console.log(success);
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
            <div>
              <div className="w-25 h-17 overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dgwx34lqc/image/upload/v1770875314/LOGO_jfhzkk.png"
                  className="w-full h-full object-cover object-top scale-150"
                  alt="Logo"
                />
              </div>
              <p className="ml-7 text-xs text-primary-200">Admin Panel</p>
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
              placeholder="admin@vitija.com"
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
          <p>© 2026 18 Bites. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
