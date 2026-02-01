import { useAuthStore } from '../store/authStore';

export const Header = () => {
  const { user } = useAuthStore();

  return (
    <header className="hidden lg:flex bg-white border-b border-gray-200 h-16 items-center px-6">
      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
