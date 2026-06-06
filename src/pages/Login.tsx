import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Visual background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6">
        
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 bg-gold rounded-2xl items-center justify-center font-black text-dark text-xl shadow-lg shadow-gold/20">
            MX
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide">MachineXchange</h2>
            <p className="text-xs text-zinc-400">Administrative Control Center</p>
          </div>
        </div>

        {/* Error Banners */}
        {(localError || error) && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs flex items-start gap-2.5">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Username/Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Admin Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="email" 
                placeholder="Waqar@nchgroup.in" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-medium placeholder-zinc-600"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-medium placeholder-zinc-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-white rounded-lg transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full py-3 bg-gold hover:bg-gold-dark text-dark font-black rounded-xl text-sm transition-all shadow-lg shadow-gold/10 hover:shadow-gold/20 tracking-wide mt-2"
          >
            Authenticate Session
          </button>
        </form>
      </div>

      {/* Footer copyright */}
      <span className="text-[10px] text-zinc-600 mt-8">
        &copy; {new Date().getFullYear()} MachineXchange. All rights reserved.
      </span>
    </div>
  );
};
