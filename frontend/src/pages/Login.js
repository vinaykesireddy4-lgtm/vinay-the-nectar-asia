import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, User, Lock, AlertCircle, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, credentials);
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (onLogin) {
        onLogin(response.data.user);
      }
      
      // Redirect based on role
      const userRole = response.data.user?.role;
      if (userRole === 'employee' || userRole === 'sales_employee' || userRole === 'marketing_employee') {
        navigate('/employee-portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[100px]"></div>

        {/* Animated Fishes - Realistic & Larger */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Realistic Fish 1 - Large Koi Fish */}
          <div className="absolute animate-swim-right" style={{ top: '10%', animationDuration: '35s', animationDelay: '0s' }}>
            <svg width="200" height="100" viewBox="0 0 200 100" className="opacity-80 drop-shadow-2xl">
              <defs>
                <linearGradient id="koi1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FF6B35', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#FF8E53', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FFA07A', stopOpacity: 1 }} />
                </linearGradient>
                <radialGradient id="koiSpot1">
                  <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.9 }} />
                  <stop offset="100%" style={{ stopColor: '#FFE4B5', stopOpacity: 0.6 }} />
                </radialGradient>
              </defs>
              {/* Body */}
              <ellipse cx="80" cy="50" rx="60" ry="28" fill="url(#koi1)" />
              {/* Belly highlight */}
              <ellipse cx="80" cy="65" rx="45" ry="15" fill="#FFE4B5" opacity="0.4" />
              {/* Spots */}
              <circle cx="70" cy="45" r="12" fill="url(#koiSpot1)" />
              <circle cx="95" cy="52" r="15" fill="url(#koiSpot1)" />
              {/* Tail */}
              <path d="M 20 50 Q 0 30, 10 45 Q 5 50, 10 55 Q 0 70, 20 50 Z" fill="#FF6B35" opacity="0.9" />
              <path d="M 20 50 Q 5 40, 10 50 Q 5 60, 20 50 Z" fill="#FF8E53" opacity="0.7" />
              {/* Dorsal fin */}
              <path d="M 75 22 Q 70 10, 85 20 Q 90 15, 95 25 L 85 35 Z" fill="#FF6B35" opacity="0.8" />
              {/* Pectoral fin */}
              <ellipse cx="110" cy="55" rx="20" ry="12" fill="#FF8E53" opacity="0.6" transform="rotate(-20 110 55)" />
              {/* Eye */}
              <circle cx="120" cy="45" r="8" fill="#1a1a1a" />
              <circle cx="123" cy="43" r="3" fill="white" />
              {/* Scales pattern */}
              <g opacity="0.2">
                <circle cx="60" cy="48" r="4" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="70" cy="50" r="4" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="80" cy="52" r="4" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="90" cy="50" r="4" fill="none" stroke="white" strokeWidth="1" />
              </g>
            </svg>
          </div>

          {/* Realistic Fish 2 - Blue Tang */}
          <div className="absolute animate-swim-left" style={{ top: '30%', animationDuration: '40s', animationDelay: '5s' }}>
            <svg width="180" height="120" viewBox="0 0 180 120" className="opacity-85 drop-shadow-2xl">
              <defs>
                <linearGradient id="tang1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#4A90E2', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#5BA3F5', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#87CEEB', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Body */}
              <ellipse cx="90" cy="60" rx="55" ry="35" fill="url(#tang1)" />
              {/* Yellow accent */}
              <path d="M 45 60 Q 40 50, 50 55 Q 45 65, 45 60 Z" fill="#FFD700" />
              <ellipse cx="120" cy="60" rx="8" ry="25" fill="#FFD700" opacity="0.8" />
              {/* Tail */}
              <path d="M 35 60 Q 15 45, 20 55 Q 10 60, 20 65 Q 15 75, 35 60 Z" fill="#FFD700" opacity="0.9" />
              {/* Dorsal fin */}
              <path d="M 70 25 Q 65 15, 75 20 Q 85 10, 95 18 Q 105 15, 110 30 L 95 45 Q 85 40, 75 42 Z" fill="#4A90E2" opacity="0.9" />
              {/* Anal fin */}
              <path d="M 70 95 Q 75 105, 85 100 Q 95 108, 105 95 L 95 75 Q 85 80, 75 78 Z" fill="#4A90E2" opacity="0.9" />
              {/* Pectoral fin */}
              <ellipse cx="120" cy="65" rx="25" ry="15" fill="#5BA3F5" opacity="0.5" transform="rotate(-30 120 65)" />
              {/* Eye */}
              <circle cx="130" cy="55" r="10" fill="#1a1a1a" />
              <circle cx="133" cy="52" r="4" fill="white" />
              <circle cx="133" cy="52" r="2" fill="#4A90E2" opacity="0.5" />
            </svg>
          </div>

          {/* Realistic Fish 3 - Goldfish */}
          <div className="absolute animate-swim-right" style={{ top: '55%', animationDuration: '32s', animationDelay: '10s' }}>
            <svg width="190" height="110" viewBox="0 0 190 110" className="opacity-82 drop-shadow-2xl">
              <defs>
                <linearGradient id="gold1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Body */}
              <ellipse cx="95" cy="55" rx="58" ry="32" fill="url(#gold1)" />
              {/* Belly */}
              <ellipse cx="95" cy="72" rx="45" ry="18" fill="#FFE4B5" opacity="0.6" />
              {/* Tail - flowing */}
              <path d="M 37 55 Q 10 35, 15 48 Q 5 55, 15 62 Q 10 75, 37 55 Z" fill="#FFD700" opacity="0.95" />
              <path d="M 37 55 Q 20 40, 20 55 Q 20 70, 37 55 Z" fill="#FFA500" opacity="0.8" />
              {/* Dorsal fin - large flowing */}
              <path d="M 80 23 Q 70 8, 85 15 Q 95 5, 105 12 Q 115 8, 120 25 L 105 40 Q 95 35, 85 38 Z" fill="#FFD700" opacity="0.9" />
              {/* Anal fin */}
              <path d="M 85 87 Q 90 100, 100 95 Q 110 102, 115 87 L 105 72 Q 95 75, 90 72 Z" fill="#FFD700" opacity="0.9" />
              {/* Pectoral fins */}
              <ellipse cx="125" cy="60" rx="28" ry="18" fill="#FFA500" opacity="0.6" transform="rotate(-25 125 60)" />
              {/* Eye */}
              <circle cx="140" cy="50" r="10" fill="#1a1a1a" />
              <circle cx="143" cy="47" r="4" fill="white" />
              {/* Scales highlight */}
              <g opacity="0.3">
                <circle cx="80" cy="52" r="5" fill="none" stroke="white" strokeWidth="1.5" />
                <circle cx="95" cy="55" r="5" fill="none" stroke="white" strokeWidth="1.5" />
                <circle cx="110" cy="52" r="5" fill="none" stroke="white" strokeWidth="1.5" />
              </g>
            </svg>
          </div>

          {/* Realistic Fish 4 - Clownfish */}
          <div className="absolute animate-swim-left" style={{ top: '70%', animationDuration: '36s', animationDelay: '15s' }}>
            <svg width="170" height="100" viewBox="0 0 170 100" className="opacity-83 drop-shadow-2xl">
              <defs>
                <linearGradient id="clown1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FF6B35', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FF8E53', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Body */}
              <ellipse cx="85" cy="50" rx="50" ry="28" fill="url(#clown1)" />
              {/* White stripes */}
              <ellipse cx="60" cy="50" rx="8" ry="28" fill="white" />
              <ellipse cx="60" cy="50" rx="6" ry="28" fill="white" stroke="#1a1a1a" strokeWidth="1" />
              <ellipse cx="95" cy="50" rx="10" ry="28" fill="white" />
              <ellipse cx="95" cy="50" rx="8" ry="28" fill="white" stroke="#1a1a1a" strokeWidth="1" />
              <ellipse cx="120" cy="50" rx="7" ry="24" fill="white" />
              <ellipse cx="120" cy="50" rx="5" ry="24" fill="white" stroke="#1a1a1a" strokeWidth="1" />
              {/* Tail */}
              <path d="M 35 50 Q 15 35, 20 45 Q 10 50, 20 55 Q 15 65, 35 50 Z" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
              {/* Dorsal fin - rounded */}
              <path d="M 70 22 Q 65 12, 80 18 Q 95 10, 105 22 L 95 35 Q 85 32, 78 34 Z" fill="#FF6B35" stroke="#1a1a1a" strokeWidth="1" />
              {/* Anal fin */}
              <path d="M 75 78 Q 85 88, 95 82 Q 105 87, 110 78 L 98 65 Q 88 68, 82 66 Z" fill="#FF6B35" stroke="#1a1a1a" strokeWidth="1" />
              {/* Pectoral fin */}
              <ellipse cx="115" cy="55" rx="22" ry="13" fill="#FF8E53" opacity="0.7" transform="rotate(-20 115 55)" stroke="#1a1a1a" strokeWidth="0.5" />
              {/* Eye */}
              <circle cx="130" cy="45" r="9" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
              <circle cx="130" cy="45" r="6" fill="#1a1a1a" />
              <circle cx="132" cy="43" r="3" fill="white" />
            </svg>
          </div>

          {/* Bubbles - larger and more visible */}
          <div className="absolute animate-bubble-1" style={{ left: '15%', bottom: '-80px' }}>
            <div className="w-8 h-8 bg-white/25 rounded-full backdrop-blur-sm border-2 border-white/40 shadow-lg"></div>
          </div>
          <div className="absolute animate-bubble-2" style={{ left: '40%', bottom: '-100px', animationDelay: '2s' }}>
            <div className="w-6 h-6 bg-white/20 rounded-full backdrop-blur-sm border-2 border-white/35 shadow-lg"></div>
          </div>
          <div className="absolute animate-bubble-3" style={{ left: '65%', bottom: '-120px', animationDelay: '4s' }}>
            <div className="w-10 h-10 bg-white/22 rounded-full backdrop-blur-sm border-2 border-white/38 shadow-lg"></div>
          </div>
          <div className="absolute animate-bubble-1" style={{ left: '85%', bottom: '-90px', animationDelay: '6s' }}>
            <div className="w-7 h-7 bg-white/24 rounded-full backdrop-blur-sm border-2 border-white/37 shadow-lg"></div>
          </div>
          <div className="absolute animate-bubble-2" style={{ left: '28%', bottom: '-110px', animationDelay: '8s' }}>
            <div className="w-9 h-9 bg-white/23 rounded-full backdrop-blur-sm border-2 border-white/36 shadow-lg"></div>
          </div>
          <div className="absolute animate-bubble-3" style={{ left: '52%', bottom: '-95px', animationDelay: '10s' }}>
            <div className="w-8 h-8 bg-white/26 rounded-full backdrop-blur-sm border-2 border-white/39 shadow-lg"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding & Features */}
          <div className="hidden lg:block space-y-8">
            {/* Logo Section */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-block p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
                <img 
                  src="/nectar-logo.svg" 
                  alt="Nectar" 
                  className="w-64 h-64 object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              <div className="group p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Enterprise-Grade Security</h3>
                    <p className="text-blue-100 text-sm">Advanced encryption and role-based access control</p>
                  </div>
                </div>
              </div>

              <div className="group p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Lightning Fast Performance</h3>
                    <p className="text-blue-100 text-sm">Real-time updates and instant data synchronization</p>
                  </div>
                </div>
              </div>

              <div className="group p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl shadow-lg group-hover:shadow-pink-500/50 transition-all">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Intelligent Insights</h3>
                    <p className="text-blue-100 text-sm">Smart analytics and comprehensive reporting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8 animate-fade-in">
              <div className="inline-block p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl mb-6">
                <img 
                  src="/nectar-logo-new.png?v=2" 
                  alt="Nectar" 
                  className="w-32 h-32 object-contain"
                />
              </div>
            </div>

            {/* Login Card */}
            <div className="relative group">
              {/* Glow Effect on Hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity"></div>
              
              <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
                {/* Header */}
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6 shadow-xl">
                    <LogIn className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">Sign in to access your dashboard</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl animate-shake" data-testid="login-error">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-semibold text-sm">Username</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <Input
                        id="username"
                        type="text"
                        className="pl-12 h-14 bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white transition-all duration-200 rounded-xl text-base"
                        placeholder="Enter your username"
                        value={credentials.username}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        required
                        autoFocus
                        data-testid="username-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">Password</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        className="pl-12 h-14 bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white transition-all duration-200 rounded-xl text-base"
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        required
                        data-testid="password-input"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-base rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 group"
                    disabled={loading}
                    data-testid="login-button"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Default Credentials</span>
                  </div>
                </div>

                {/* Credentials Card */}
                <div className="p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-2xl">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-blue-900 mb-1">Administrator Account</p>
                      <p className="text-xs text-blue-700">Use these credentials for first login</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur rounded-xl border border-blue-200">
                      <span className="text-sm text-gray-600 font-medium">Username:</span>
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">admin</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur rounded-xl border border-blue-200">
                      <span className="text-sm text-gray-600 font-medium">Password:</span>
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">admin123</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Change password after first login for security</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-white/80 mt-8 font-medium">
              © 2024 Nectar. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes swim-right {
          0% { transform: translateX(-100vw) translateY(0px); }
          100% { transform: translateX(100vw) translateY(-20px); }
        }
        @keyframes swim-left {
          0% { transform: translateX(100vw) translateY(0px) scaleX(-1); }
          100% { transform: translateX(-100vw) translateY(20px) scaleX(-1); }
        }
        @keyframes swim-diagonal-1 {
          0% { transform: translateX(-100vw) translateY(50px); }
          100% { transform: translateX(100vw) translateY(-50px); }
        }
        @keyframes swim-diagonal-2 {
          0% { transform: translateX(100vw) translateY(-50px) scaleX(-1); }
          100% { transform: translateX(-100vw) translateY(50px) scaleX(-1); }
        }
        @keyframes bubble-1 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes bubble-2 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(-30px); opacity: 0; }
        }
        @keyframes bubble-3 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(15px); opacity: 0; }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes sway-delayed {
          0%, 100% { transform: rotate(5deg); }
          50% { transform: rotate(-5deg); }
        }
        @keyframes light-ray {
          0%, 100% { opacity: 0.2; transform: translateX(0); }
          50% { opacity: 0.4; transform: translateX(10px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-swim-right { animation: swim-right linear infinite; }
        .animate-swim-left { animation: swim-left linear infinite; }
        .animate-swim-diagonal-1 { animation: swim-diagonal-1 linear infinite; }
        .animate-swim-diagonal-2 { animation: swim-diagonal-2 linear infinite; }
        .animate-bubble-1 { animation: bubble-1 15s infinite ease-in; }
        .animate-bubble-2 { animation: bubble-2 18s infinite ease-in; }
        .animate-bubble-3 { animation: bubble-3 20s infinite ease-in; }
      `}</style>
    </div>
  );
};

export default Login;
