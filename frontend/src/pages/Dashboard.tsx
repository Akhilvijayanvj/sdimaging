import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle2, Image, Monitor } from 'lucide-react';

export function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/activities')
    ]).then(([projData, actData]) => {
      setProjects(projData);
      setActivities(actData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  // KPI Calculations
  const activeProjects = projects.filter(p => p.status !== 'Completed');
  const waitingSelection = projects.filter(p => p.status === 'Waiting For Selection');
  const waitingPrinting = projects.filter(p => p.status === 'Waiting For Printing');
  const readyDelivery = projects.filter(p => p.status === 'Ready For Delivery');

  const stats = [
    { label: 'Active Projects', value: activeProjects.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Waiting Selection', value: waitingSelection.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Waiting Printing', value: waitingPrinting.length, icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Ready Delivery', value: readyDelivery.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  // Group by status for Work Queue
  const queueStatuses = [
    'Waiting For Backup',
    'Waiting For Highlight Delivery',
    'Lightroom Preparation',
    'Waiting For Selection',
    'Waiting For Album Grading',
    'Waiting For Album Design',
    'Waiting For Printing',
    'Waiting For Video Editing',
    'Ready For Delivery'
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link to="/projects/new" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors shadow-sm text-center sm:text-left">
          + New Project
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card/40 backdrop-blur-md border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} opacity-20 group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between relative z-10 gap-3 sm:gap-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg ${stat.bg} self-start sm:self-auto`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Work Queue */}
        <div className="lg:col-span-2 flex flex-col bg-card/30 backdrop-blur-sm border border-border rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" /> 
              Work Queue
            </h2>
          </div>
          <div className="p-6 space-y-8">
            {queueStatuses.map(status => {
              const matched = projects.filter(p => p.status === status);
              if (matched.length === 0) return null;
              
              return (
                <div key={status} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                    {status} ({matched.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {matched.map(project => (
                      <Link key={project.id} to={`/projects/${project.id}`} className="block group">
                        <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all relative overflow-hidden flex flex-col gap-2 h-full">
                          {project.priority === 'High' && (
                            <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/20 rotate-45 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
                          )}
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{project.clientName}</h4>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">{project.id}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-auto pt-2 text-xs text-muted-foreground font-semibold">
                            <Users className="w-3.5 h-3.5" />
                            <span>{project.currentDepartment}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {activeProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                <CheckCircle2 className="w-12 h-12 mb-2 opacity-60" />
                <p>No active projects in the queue.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col bg-card/30 backdrop-blur-sm border border-border rounded-xl shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> 
              Recent Activity
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-6 relative">
            <div className="absolute top-8 bottom-8 left-[31px] sm:left-[39px] w-px bg-border"></div>
            <div className="space-y-6 relative z-10">
              {activities.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No activity recorded yet.
                </div>
              ) : (
                activities.map((activity: any) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-4 ring-card">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.project?.clientName} <span className="text-muted-foreground font-normal">→ {activity.description}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.createdAt).toLocaleString(undefined, { 
                          dateStyle: 'medium', timeStyle: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
