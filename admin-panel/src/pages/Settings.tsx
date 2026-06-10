import { useState } from 'react';
import { 
  User,
  Save,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export const Settings = () => {
  // Admin Info
  const [adminName, setAdminName] = useState(localStorage.getItem('mx_admin_name') || 'Waqar');
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('mx_valid_email') || 'Waqar@nchgroup.in');
  const [adminPass, setAdminPass] = useState(localStorage.getItem('mx_valid_pass') || 'nch@waqar21');
  const [confirmPass, setConfirmPass] = useState(localStorage.getItem('mx_valid_pass') || 'nch@waqar21');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (adminPass !== confirmPass) {
      setError('Passwords do not match');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    localStorage.setItem('mx_admin_name', adminName);
    localStorage.setItem('mx_valid_email', adminEmail);
    localStorage.setItem('mx_valid_pass', adminPass);
    localStorage.setItem('mx_admin_email', adminEmail); // Update current session email
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Dispatch a custom event so the header can update
    window.dispatchEvent(new Event('admin_updated'));
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 text-left">Admin Panel Settings</h2>
        <p className="text-xs text-gray-400 text-left">Manage admin credentials, security protocols, and system moderators</p>
      </div>

      <div>
          {/* Profile Details */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
              <User className="text-gold" size={20} />
              <h3 className="font-bold text-gray-800">Profile Details</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Administrator Name</label>
                <input 
                  type="text" 
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Username (Email ID)</label>
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"} 
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPass ? "text" : "password"} 
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center gap-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-dark hover:bg-black text-white font-bold rounded-xl text-sm transition-colors"
              >
                <Save size={16} /> Save Changes
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                  <CheckCircle2 size={16} /> Settings saved!
                </span>
              )}
              {error && (
                <span className="text-sm font-semibold text-red-500">
                  {error}
                </span>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};
