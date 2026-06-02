import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { HardDrive, Plus, Search, Archive, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function HDDs() {
  const [hdds, setHdds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHdd, setNewHdd] = useState({ name: '', status: 'Active', notes: '' });

  useEffect(() => {
    fetchHDDs();
  }, []);

  const fetchHDDs = () => {
    api.get('/hdds').then(data => {
      setHdds(data);
      setLoading(false);
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/hdds', newHdd);
    setIsModalOpen(false);
    setNewHdd({ name: '', status: 'Active', notes: '' });
    fetchHDDs();
  };

  const filteredHdds = hdds.filter(hdd => 
    hdd.name.toLowerCase().includes(search.toLowerCase()) || 
    (hdd.notes && hdd.notes.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Active': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Archive': return <Archive className="w-4 h-4 text-amber-500" />;
      case 'Damaged': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HDD Management</h1>
          <p className="text-muted-foreground mt-1">Track physical storage locations for your projects.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add HDD
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by HDD name or notes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {loading ? (
             <div className="flex h-32 items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : filteredHdds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <HardDrive className="w-12 h-12 mb-4 opacity-50" />
              <p>No HDDs found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredHdds.map(hdd => (
                <div key={hdd.id} className="border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all bg-background group cursor-pointer relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <HardDrive className="w-16 h-16 transform rotate-12" />
                   </div>
                   <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{hdd.name}</h3>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs font-medium">
                        {getStatusIcon(hdd.status)}
                        {hdd.status}
                      </span>
                    </div>
                    {hdd.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{hdd.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-semibold">Register New HDD</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <AlertTriangle className="hidden" /> {/* Just to import, replacing with X usually */}
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">HDD Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Big B3"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={newHdd.name}
                  onChange={e => setNewHdd({...newHdd, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Status</label>
                <select 
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={newHdd.status}
                  onChange={e => setNewHdd({...newHdd, status: e.target.value})}
                >
                  <option>Active</option>
                  <option>Archive</option>
                  <option>Damaged</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Notes (Optional)</label>
                <textarea 
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                  rows={3}
                  value={newHdd.notes}
                  onChange={e => setNewHdd({...newHdd, notes: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md hover:bg-muted font-medium text-foreground">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90">
                  Save HDD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
