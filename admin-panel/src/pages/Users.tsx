import { useState, useEffect } from 'react';
import { 
  Search, 
  UserX, 
  UserCheck, 
  Trash2, 
  Eye, 
  Building,
  Mail,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import { useUsersStore, type User } from '../store/usersStore';

export const Users = () => {
  const { 
    users, 
    deleteUser, 
    updateUserStatus,
    subscribeToUsers
  } = useUsersStore();

  useEffect(() => { subscribeToUsers(); }, [subscribeToUsers]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Selected User for Drawer
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
      
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 space-y-6 relative overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all text-sm"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase">Role</span>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="Jeweller">Jewellers</option>
              <option value="Hallmarking Centre">Hallmarking Centres</option>
              <option value="Refiner">Refiners</option>
              <option value="Assayer">Assayers</option>
            </select>
          </div>

        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-4 px-6 font-medium">User Profile</th>
                <th className="py-4 px-6 font-medium">Contact Details</th>
                <th className="py-4 px-6 font-medium">Location</th>
                <th className="py-4 px-6 font-medium">Role</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 space-y-2">
                    <p className="text-gray-500 font-semibold text-lg">No users found</p>
                    <p className="text-sm text-gray-400">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* User Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">Joined: {user.joinedDate}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5 text-xs">
                        <p className="text-gray-700 flex items-center gap-1.5">
                          <Mail size={12} className="text-gray-400" />
                          {user.email}
                        </p>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {user.city}, {user.state}
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                        user.role === 'Hallmarking Centre' ? 'bg-indigo-50 text-indigo-700' :
                        user.role === 'Jeweller' ? 'bg-amber-50 text-amber-700' :
                        user.role === 'Refiner' ? 'bg-purple-50 text-purple-700' : 
                        user.role === 'Assayer' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>



                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Profile Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.status === 'active' 
                              ? 'text-amber-600 hover:bg-amber-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                        >
                          {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Profile Drawer (Slides in from Right) */}
      {selectedUser && (
        <>
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 transition-opacity"
            onClick={() => setSelectedUser(null)}
          />

          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">User Profile Details</h3>
                <p className="text-xs text-gray-400">ID: {selectedUser.id}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Block */}
              <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold text-2xl">
                  {selectedUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-400 capitalize">{selectedUser.role} • {selectedUser.city}, {selectedUser.state}</p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact & Account Details</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{selectedUser.city}, {selectedUser.state}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Joined {selectedUser.joinedDate}</span>
                  </div>

                  {selectedUser.companyName && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Building size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-800">{selectedUser.companyName}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};
