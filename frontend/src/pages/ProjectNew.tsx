import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function ProjectNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: `WED-${new Date().getFullYear()}-001`,
    clientName: '',
    eventType: 'Wedding',
    eventDate: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    phoneNumber: '',
    packageType: '',
    photographer: '',
    videographer: '',
    notes: ''
  });

  useEffect(() => {
    api.get('/projects').then(data => {
      if (data && data.length > 0) {
        const year = new Date().getFullYear();
        const prefix = `WED-${year}-`;
        let maxNum = 0;
        data.forEach((p: any) => {
          if (p.id.startsWith(prefix)) {
            const numPart = parseInt(p.id.split('-')[2], 10);
            if (!isNaN(numPart) && numPart > maxNum) {
              maxNum = numPart;
            }
          }
        });
        const nextNum = (maxNum + 1).toString().padStart(3, '0');
        setFormData(prev => ({ ...prev, id: `${prefix}${nextNum}` }));
      }
    }).catch(err => console.error("Failed to fetch projects for ID generation", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const project = await api.post('/projects', formData);
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create project. Does the ID already exist?");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Project ID <span className="text-red-500">*</span></label>
              <input name="id" required value={formData.id} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Client / Couple Name <span className="text-red-500">*</span></label>
              <input name="clientName" required placeholder="e.g. Rahul & Anu" value={formData.clientName} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Event Type <span className="text-red-500">*</span></label>
              <select name="eventType" required value={formData.eventType} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option>Wedding</option>
                <option>Engagement</option>
                <option>Baptism</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Event Date <span className="text-red-500">*</span></label>
              <input type="date" name="eventDate" required value={formData.eventDate} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none [color-scheme:light] dark:[color-scheme:dark]" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Package Type</label>
              <input name="packageType" placeholder="e.g. Premium Photo+Video" value={formData.packageType} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Lead Photographer</label>
              <input name="photographer" value={formData.photographer} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Lead Videographer</label>
              <input name="videographer" value={formData.videographer} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Notes</label>
            <textarea name="notes" rows={4} value={formData.notes} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-lg hover:bg-muted font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
