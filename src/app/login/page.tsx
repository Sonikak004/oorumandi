'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/app/actions';
import { useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(formData: FormData) {
    const res = await login(formData);
    if (res?.error) {
      setError(res.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-white/50 backdrop-blur-sm relative overflow-hidden">
        
        {/* Decorative background blob */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10 text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <span className="text-4xl text-white font-bold">ಊ</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Oorumandi</h2>
          <p className="text-gray-500 mt-3 font-medium">Smart ordering for your business</p>
        </div>

        <form action={handleLogin} className="relative z-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 ml-1">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter your password"
              className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
            />
          </div>

          <SubmitButton />
          
          </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-blue-200 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 transition-all active:scale-[0.98]"
    >
      {pending ? 'Signing in...' : 'Sign In to Dashboard'}
    </button>
  );
}
