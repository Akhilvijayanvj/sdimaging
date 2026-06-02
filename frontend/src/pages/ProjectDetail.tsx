import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, HardDrive, User, Calendar,
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import { cn } from '../components/Layout';
import { useAuth } from '../lib/AuthContext';

export function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [hdds, setHdds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const reqs = [
      api.get(`/projects/${id}`),
      api.get('/hdds')
    ];
    if (currentUser?.role === 'ADMIN') {
      reqs.push(api.get('/users'));
    }
    
    const [projData, hddData, usersData] = await Promise.all(reqs);
    setProject(projData);
    setHdds(hddData);
    if (usersData) setUsers(usersData);
    setLoading(false);
  };

  const handleChecklistChange = async (field: string, value: boolean) => {
    // Optimistic UI update
    const updatedProject = { ...project, checklist: { ...project.checklist, [field]: value } };
    setProject(updatedProject);

    // Friendly log message
    let actionStr = field.replace(/^is/, '').replace(/([A-Z])/g, ' $1').trim();
    let logMessage = `${actionStr} marked as ${value ? 'completed' : 'pending'}`;

    try {
      const res = await api.put(`/projects/${id}/checklist`, {
        checklistData: { [field]: value },
        logMessage
      });
      setProject(res); // update with server calculated status
    } catch (e) {
      console.error(e);
      fetchData(); // revert on fail
    }
  };

  const handleChecklistBulkChange = async (fields: string[], value: boolean, stageName: string) => {
    let updateData: Record<string, boolean> = {};
    fields.forEach(f => updateData[f] = value);
    
    // Optimistic UI update
    const updatedProject = { ...project, checklist: { ...project.checklist, ...updateData } };
    setProject(updatedProject);

    let logMessage = `All tasks in ${stageName} marked as ${value ? 'completed' : 'pending'}`;

    try {
      const res = await api.put(`/projects/${id}/checklist`, {
        checklistData: updateData,
        logMessage
      });
      setProject(res); 
    } catch (e) {
      console.error(e);
      fetchData(); 
    }
  };

  const updateField = async (field: string, value: any) => {
    try {
      await api.put(`/projects/${id}`, { [field]: value });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!project) return <div>Project not found</div>;

  const renderStageHeader = (title: string, fields: string[]) => {
    const allChecked = fields.every(f => project.checklist[f]);
    return (
      <div className="flex items-center justify-between mb-2 px-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
        <button 
          onClick={() => handleChecklistBulkChange(fields, !allChecked, title.split('.')[1].trim())} 
          className="text-xs font-medium text-primary hover:underline"
        >
          {allChecked ? 'Untick All' : 'Tick All'}
        </button>
      </div>
    );
  };

  const renderCheckbox = (field: string, label: string) => (
    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border group">
      <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
        <input 
          type="checkbox" 
          checked={project.checklist[field]} 
          onChange={(e) => handleChecklistChange(field, e.target.checked)}
          className="peer sr-only"
        />
        <div className="w-5 h-5 border-2 border-muted-foreground/50 rounded-sm peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
        <CheckCircle2 className="absolute text-primary-foreground w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
      </div>
      <span className={cn("text-sm font-medium transition-colors", project.checklist[field] ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary")}>
        {label}
      </span>
    </label>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 lg:h-[calc(100vh-6rem)] flex flex-col">
      {/* Top Header Ribbon */}
      <div className="flex flex-col gap-4 shrink-0 bg-card/40 backdrop-blur-md border border-border p-5 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
            <Link to="/" className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex flex-wrap items-center gap-2 sm:gap-3">
                {project.clientName}
                <span className="text-xs sm:text-sm font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border/50">{project.id}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm font-medium">
                <span className="text-primary flex items-center gap-1.5 bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20"><User className="w-3.5 h-3.5" /> {project.currentDepartment}</span>
                <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {new Date(project.eventDate).toLocaleDateString()}</span>
                <span className="text-muted-foreground">{project.eventType}</span>
                {project.priority === 'High' && (
                  <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1.5 border border-red-500/20"><AlertTriangle className="w-3.5 h-3.5" /> HIGH PRIORITY</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-left md:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
            <p className="font-bold text-lg text-foreground">{project.status}</p>
          </div>
        </div>

        <div className="h-px bg-border/50 w-full my-1"></div>

        {/* Quick Assign & Storage */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color:</span>
            {currentUser?.role === 'ADMIN' ? (
              <select className="p-1.5 sm:p-1 bg-muted border border-border rounded text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary w-28 sm:w-32" value={project.colorGraderId || ''} onChange={(e) => updateField('colorGraderId', e.target.value || null)}>
                <option value="">--</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            ) : <span className="text-xs">{project.colorGrader?.username || '--'}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Album:</span>
            {currentUser?.role === 'ADMIN' ? (
              <select className="p-1.5 sm:p-1 bg-muted border border-border rounded text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary w-28 sm:w-32" value={project.albumDesignerId || ''} onChange={(e) => updateField('albumDesignerId', e.target.value || null)}>
                <option value="">--</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            ) : <span className="text-xs">{project.albumDesigner?.username || '--'}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">HL Video:</span>
            {currentUser?.role === 'ADMIN' ? (
              <select className="p-1.5 sm:p-1 bg-muted border border-border rounded text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary w-28 sm:w-32" value={project.highlightVideoEditorId || ''} onChange={(e) => updateField('highlightVideoEditorId', e.target.value || null)}>
                <option value="">--</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            ) : <span className="text-xs">{project.highlightVideoEditor?.username || '--'}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Video:</span>
            {currentUser?.role === 'ADMIN' ? (
              <select className="p-1.5 sm:p-1 bg-muted border border-border rounded text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary w-28 sm:w-32" value={project.fullVideoEditorId || ''} onChange={(e) => updateField('fullVideoEditorId', e.target.value || null)}>
                <option value="">--</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            ) : <span className="text-xs">{project.fullVideoEditor?.username || '--'}</span>}
          </div>
          
          <div className="w-px h-4 bg-border mx-2"></div>

          <div className="flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">B1:</span>
            <select className="p-1.5 sm:p-1 bg-muted border border-border rounded text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary w-28 sm:w-32" value={project.backupHdd1Id || ''} onChange={(e) => updateField('backupHdd1Id', e.target.value || null)}>
              <option value="">--</option>
              {hdds.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">B2:</span>
            <select className="p-1.5 sm:p-1 bg-muted border border-border rounded text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary w-28 sm:w-32" value={project.backupHdd2Id || ''} onChange={(e) => updateField('backupHdd2Id', e.target.value || null)}>
              <option value="">--</option>
              {hdds.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LR:</span>
            <select className="p-1.5 sm:p-1 bg-muted border border-border rounded text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary w-28 sm:w-32" value={project.lightroomHddId || ''} onChange={(e) => updateField('lightroomHddId', e.target.value || null)}>
              <option value="">--</option>
              {hdds.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: 4 Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-visible lg:overflow-y-hidden hide-scrollbar">
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-full lg:min-w-max pb-4">
          
          {/* COLUMN 1 */}
          <div className="w-full lg:w-[340px] flex flex-col bg-card/30 backdrop-blur-sm border border-primary/20 rounded-xl overflow-hidden shadow-sm h-auto lg:h-full shrink-0">
            <div className="px-4 py-3 border-b border-primary/20 shrink-0 bg-primary/10">
              <h3 className="font-black text-sm tracking-widest uppercase text-primary">1. Quick Deliverables</h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-6 hide-scrollbar">
              <div>
                {renderStageHeader('1. Backup Stage', ['isBackupCompleted'])}
                <div className="space-y-1">{renderCheckbox('isBackupCompleted', 'Backup Completed')}</div>
              </div>
              <div>
                {renderStageHeader('2. Highlight Photos', ['isHighlightSelectionCompleted', 'isHighlightRetouchingCompleted', 'isHighlightGradingCompleted', 'isHighlightExportCompleted'])}
                <div className="space-y-1">
                  {renderCheckbox('isHighlightSelectionCompleted', 'Selection done by studio')}
                  {renderCheckbox('isHighlightRetouchingCompleted', 'Retouching Completed')}
                  {renderCheckbox('isHighlightGradingCompleted', 'Grading Completed')}
                  {renderCheckbox('isHighlightExportCompleted', 'Export Completed')}
                </div>
              </div>
              <div>
                {renderStageHeader('3. Reel Video', ['isReelEditingStarted', 'isReelEditingCompleted'])}
                <div className="space-y-1">
                  {renderCheckbox('isReelEditingStarted', 'Reel Editing Started')}
                  {renderCheckbox('isReelEditingCompleted', 'Reel Editing Completed')}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2 */}
          <div className="w-full lg:w-[340px] flex flex-col bg-card/30 backdrop-blur-sm border border-border rounded-xl overflow-hidden shadow-sm h-auto lg:h-full shrink-0">
            <div className="px-4 py-3 border-b border-amber-500/20 shrink-0 bg-amber-500/10">
              <h3 className="font-black text-sm tracking-widest uppercase text-amber-500">2. Album Workflow</h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-6 hide-scrollbar">
              <div>
                {renderStageHeader('4. Lightroom Prep', ['isImportedToLightroom', 'isRenamedByCaptureTime', 'isCulledUsingAfterShoot', 'isUploadedToFotoOwl'])}
                <div className="space-y-1">
                  {renderCheckbox('isImportedToLightroom', 'Imported To Lightroom')}
                  {renderCheckbox('isRenamedByCaptureTime', 'Renamed By Capture Time')}
                  {renderCheckbox('isCulledUsingAfterShoot', 'Culled Using AfterShoot')}
                  {renderCheckbox('isUploadedToFotoOwl', 'Uploaded To FotoOwl')}
                </div>
              </div>
              <div>
                {renderStageHeader('5. Client Selection', ['isSelectionSent', 'isSelectionReceived'])}
                <div className="space-y-1">
                  {renderCheckbox('isSelectionSent', 'Selection Sent')}
                  {renderCheckbox('isSelectionReceived', 'Selection Received')}
                </div>
              </div>
              <div>
                {renderStageHeader('6. Album Design & Print', ['isAlbumGradingCompleted', 'isAlbumExportCompleted', 'isAlbumDesignCompleted', 'isClientApprovalReceived', 'isSentForPrinting', 'isPrintingCompleted'])}
                <div className="space-y-1">
                  {renderCheckbox('isAlbumGradingCompleted', 'Album Grading Completed')}
                  {renderCheckbox('isAlbumExportCompleted', 'Album Export Completed')}
                  {renderCheckbox('isAlbumDesignCompleted', 'Album Design Completed')}
                  {renderCheckbox('isClientApprovalReceived', 'Client Approval Received')}
                  {renderCheckbox('isSentForPrinting', 'Sent For Printing')}
                  {renderCheckbox('isPrintingCompleted', 'Printing Completed')}
                </div>
              </div>
              <div>
                {renderStageHeader('7. Photo Frames', ['isFrameSelected', 'isFramePrinted'])}
                <div className="space-y-1">
                  {renderCheckbox('isFrameSelected', 'Frame Selection Completed')}
                  {renderCheckbox('isFramePrinted', 'Frame Printing Completed')}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3 */}
          <div className="w-[340px] flex flex-col bg-card/30 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden shadow-sm h-full">
            <div className="px-4 py-3 border-b border-purple-500/20 shrink-0 bg-purple-500/10">
              <h3 className="font-black text-sm tracking-widest uppercase text-purple-500">3. Video Workflow</h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-6 hide-scrollbar">
              <div>
                {renderStageHeader('8. Highlight Video', ['isHighlightVideoEditingStarted', 'isHighlightVideoEditingCompleted'])}
                <div className="space-y-1">
                  {renderCheckbox('isHighlightVideoEditingStarted', 'Editing Started')}
                  {renderCheckbox('isHighlightVideoEditingCompleted', 'Editing Completed')}
                </div>
              </div>
              <div>
                {renderStageHeader('9. Full Length Video', ['isFullVideoEditingStarted', 'isFullVideoEditingCompleted'])}
                <div className="space-y-1">
                  {renderCheckbox('isFullVideoEditingStarted', 'Editing Started')}
                  {renderCheckbox('isFullVideoEditingCompleted', 'Editing Completed')}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 4 */}
          <div className="w-full lg:w-[340px] flex flex-col bg-card/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl overflow-hidden shadow-sm h-auto lg:h-full shrink-0">
            <div className="px-4 py-3 border-b border-emerald-500/20 shrink-0 bg-emerald-500/10">
              <h3 className="font-black text-sm tracking-widest uppercase text-emerald-500">4. Final Delivery</h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-6 hide-scrollbar">
              <div>
                {renderStageHeader('10. Delivery Day', ['isAlbumDelivered', 'isFrameDelivered', 'isPendrivePrepared', 'isReelDelivered', 'isHighlightDeliveredToClient', 'isHighlightVideoDelivered', 'isFullVideoDelivered', 'isProjectClosed'])}
                <div className="space-y-1">
                  {renderCheckbox('isAlbumDelivered', 'Album Delivered')}
                  {renderCheckbox('isFrameDelivered', 'Photo Frames Delivered')}
                  {renderCheckbox('isPendrivePrepared', 'Pendrive (Highlight + Full Video)')}
                  {renderCheckbox('isReelDelivered', 'Reel Video Delivered')}
                  {renderCheckbox('isHighlightDeliveredToClient', 'Highlight Photos Delivered')}
                  {renderCheckbox('isHighlightVideoDelivered', 'Highlight Video Delivered')}
                  {renderCheckbox('isFullVideoDelivered', 'Full Length Video Delivered')}
                  {renderCheckbox('isProjectClosed', 'Project Closed')}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
