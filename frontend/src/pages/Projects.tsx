import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { Plus, Search, LayoutGrid, List, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../components/Layout';

export function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'kanban' | 'calendar'>('table');

  useEffect(() => {
    api.get('/projects').then(data => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const filteredProjects = projects.filter(p => 
    p.clientName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    (p.phoneNumber && p.phoneNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const kanbanColumns = [
    'Waiting For Backup',
    'Waiting For Selection',
    'Waiting For Album Grading',
    'Waiting For Album Design',
    'Waiting For Printing',
    'Waiting For Video Editing',
    'Ready For Delivery',
    'Completed'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col pb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all studio projects and track their progress.</p>
        </div>
        <Link to="/projects/new" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by ID, Name, Phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-transparent border-none outline-none focus:ring-0 text-foreground"
          />
        </div>
        <div className="flex p-1 bg-muted rounded-md shrink-0 w-full sm:w-auto">
          <button 
            onClick={() => setView('table')} 
            className={cn("flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-all", view === 'table' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <List className="w-4 h-4" /> Table
          </button>
          <button 
            onClick={() => setView('kanban')} 
            className={cn("flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-all", view === 'kanban' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <LayoutGrid className="w-4 h-4" /> Kanban
          </button>
          <button 
            onClick={() => setView('calendar')} 
            className={cn("flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-all", view === 'calendar' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <CalendarIcon className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {view === 'table' && (
            <div className="bg-card border border-border rounded-xl shadow-sm flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 font-medium text-muted-foreground border-b border-border">Project ID</th>
                    <th className="p-4 font-medium text-muted-foreground border-b border-border">Client Name</th>
                    <th className="p-4 font-medium text-muted-foreground border-b border-border">Event Type</th>
                    <th className="p-4 font-medium text-muted-foreground border-b border-border">Event Date</th>
                    <th className="p-4 font-medium text-muted-foreground border-b border-border">Status</th>
                    <th className="p-4 font-medium text-muted-foreground border-b border-border">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="p-4">
                        <Link to={`/projects/${project.id}`} className="font-medium text-primary hover:underline">
                          {project.id}
                        </Link>
                      </td>
                      <td className="p-4 font-medium">{project.clientName}</td>
                      <td className="p-4 text-muted-foreground">{project.eventType}</td>
                      <td className="p-4 text-muted-foreground">{new Date(project.eventDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {project.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">{project.currentDepartment}</td>
                    </tr>
                  ))}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No projects found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {view === 'kanban' && (
            <div className="flex-1 overflow-x-auto pb-4 flex gap-6">
              {kanbanColumns.map(status => {
                // Group logic - a bit fuzzy because actual status strings vary. 
                // We map them loosely or just use exact matches.
                let columnProjects = filteredProjects.filter(p => {
                  if (status === 'Completed') return p.status === 'Completed';
                  if (status === 'Ready For Delivery') return p.status === 'Ready For Delivery';
                  if (status === 'Waiting For Video Editing') return p.status === 'Waiting For Video Editing';
                  if (status === 'Waiting For Printing') return p.status === 'Waiting For Printing';
                  if (status === 'Waiting For Album Design') return p.status === 'Waiting For Album Design';
                  if (status === 'Waiting For Album Grading') return p.status === 'Waiting For Album Grading';
                  if (status === 'Waiting For Selection') return p.status.includes('Selection');
                  if (status === 'Waiting For Backup') return p.status.includes('Backup') || p.status.includes('Lightroom');
                  return false;
                });
                
                return (
                  <div key={status} className="w-80 shrink-0 flex flex-col bg-muted/30 rounded-xl border border-border h-full">
                    <div className="p-4 font-semibold border-b border-border flex items-center justify-between">
                      <span>{status}</span>
                      <span className="bg-background text-muted-foreground px-2 py-0.5 rounded-full text-xs border border-border">{columnProjects.length}</span>
                    </div>
                    <div className="p-3 overflow-y-auto flex-1 space-y-3">
                      {columnProjects.map(project => (
                        <Link key={project.id} to={`/projects/${project.id}`} className="block">
                          <div className="bg-card p-4 rounded-lg border border-border shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="text-xs text-muted-foreground mb-1">{project.id}</div>
                            <div className="font-medium mb-3">{project.clientName}</div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5"><CalendarIcon className="w-3 h-3"/> {new Date(project.eventDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {view === 'calendar' && (
             <div className="bg-card border border-border rounded-xl shadow-sm flex-1 p-8 flex items-center justify-center flex-col text-muted-foreground">
               <CalendarIcon className="w-16 h-16 mb-4 opacity-50" />
               <p className="text-lg">Calendar view visualization goes here.</p>
               <p className="text-sm mt-2">Projects are displayed based on Event Date.</p>
               <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl text-left">
                  {filteredProjects.slice(0, 6).map(p => (
                    <Link to={`/projects/${p.id}`} key={p.id} className="p-4 border border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors">
                      <div className="font-medium text-foreground">{new Date(p.eventDate).toLocaleDateString()}</div>
                      <div className="text-sm mt-1">{p.clientName}</div>
                      <div className="text-xs mt-2 text-primary">{p.eventType}</div>
                    </Link>
                  ))}
               </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
