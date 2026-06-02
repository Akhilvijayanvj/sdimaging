import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

type User = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
};

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'COLOR_GRADER' });
  const [roleSelection, setRoleSelection] = useState('COLOR_GRADER');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.get('/users')
      .then(data => { setUsers(data); setLoading(false); })
      .catch(err => console.error(err));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setFormData({ username: '', password: '', role: 'COLOR_GRADER' });
      setRoleSelection('COLOR_GRADER');
      fetchUsers();
    } catch (error) {
      alert("Failed to create user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" /> Add New Staff Member
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Username</label>
            <input required type="text" className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <input required type="password" className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <div className="flex gap-2">
              <select required className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                value={roleSelection} 
                onChange={e => {
                  setRoleSelection(e.target.value);
                  if (e.target.value !== 'OTHER') {
                    setFormData({...formData, role: e.target.value});
                  } else {
                    setFormData({...formData, role: ''});
                  }
                }}>
                <option value="ADMIN">Manager (Admin)</option>
                <option value="COLOR_GRADER">Colorist</option>
                <option value="ALBUM_DESIGNER">Album Designer</option>
                <option value="HIGHLIGHT_EDITOR">Highlight Video Editor</option>
                <option value="FULL_VIDEO_EDITOR">Full Length Video Editor</option>
                <option value="OTHER">Other...</option>
              </select>
              {roleSelection === 'OTHER' && (
                <input 
                  required 
                  type="text" 
                  placeholder="Custom Role"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                />
              )}
            </div>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm h-[42px]">
            Add User
          </button>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm border-b border-border">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/80 text-muted-foreground">
                      {u.role === 'ADMIN' && <Shield className="w-3.5 h-3.5" />}
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.id !== currentUser?.id && (
                      <button onClick={() => handleDelete(u.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
