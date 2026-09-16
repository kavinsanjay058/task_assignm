import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">TaskFlow</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Trainee Assessment
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Graduate Support Engineer Evaluation</p>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-right">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User Profile'}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-slate-800 leading-tight">
                {user.displayName || 'Authenticated User'}
              </div>
              <div className="text-xs text-slate-500 truncate max-w-[180px]">
                {user.email || user.uid}
              </div>
            </div>
          </div>

          <button
            id="logout-button"
            type="button"
            onClick={logout}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
            title="Sign out of TaskFlow"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
