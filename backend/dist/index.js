"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-studio-key';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// Helpers for automatic status & department calculation
function calculateStatusAndDepartment(checklist) {
    // Ordered from latest stage to earliest stage. 
    // If a later stage is started/done, it takes precedence.
    if (checklist.isProjectClosed)
        return { status: 'Completed', department: 'Archived' };
    if (checklist.isPendrivePrepared || checklist.isPrintingCompleted || checklist.isFramePrinted)
        return { status: 'Ready For Delivery', department: 'Delivery Team' };
    // Video workflow
    if (checklist.isFullVideoEditingStarted && !checklist.isFullVideoDelivered)
        return { status: 'Waiting For Video Editing', department: 'Video Editing Team' };
    if (checklist.isHighlightVideoEditingStarted && !checklist.isHighlightVideoDelivered)
        return { status: 'Waiting For Video Editing', department: 'Video Editing Team' };
    if (checklist.isReelEditingStarted && !checklist.isReelDelivered)
        return { status: 'Waiting For Video Editing', department: 'Video Editing Team' };
    // Album Workflow
    if (checklist.isSentForPrinting && !checklist.isPrintingCompleted)
        return { status: 'Waiting For Printing', department: 'Printing Team' };
    if (checklist.isClientApprovalReceived && !checklist.isSentForPrinting)
        return { status: 'Waiting For Printing', department: 'Printing Team' };
    if (checklist.isAlbumExportCompleted && !checklist.isAlbumDesignCompleted)
        return { status: 'Waiting For Album Design', department: 'Album Design Team' };
    if (checklist.isSelectionReceived && !checklist.isAlbumGradingCompleted)
        return { status: 'Waiting For Album Grading', department: 'Photo Editing Team' };
    // Selection
    if (checklist.isSelectionSent && !checklist.isSelectionReceived)
        return { status: 'Waiting For Selection', department: 'Client Selection Team' };
    // Lightroom Prep
    if (checklist.isHighlightExportCompleted && !checklist.isUploadedToFotoOwl)
        return { status: 'Lightroom Preparation', department: 'Photo Editing Team' };
    if (checklist.isImportedToLightroom && !checklist.isUploadedToFotoOwl)
        return { status: 'Lightroom Preparation', department: 'Photo Editing Team' };
    // Highlights
    if (checklist.isBackupCompleted && !checklist.isHighlightExportCompleted)
        return { status: 'Waiting For Highlight Delivery', department: 'Photo Editing Team' };
    return { status: 'Waiting For Backup', department: 'Backup Team' };
}
// ==========================================
// AUTH & USERS ROUTES
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db_1.prisma.user.findUnique({ where: { username } });
        if (!user)
            return res.status(400).json({ error: 'Invalid credentials' });
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid)
            return res.status(400).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});
app.get('/api/users', exports.authenticateToken, async (req, res) => {
    const users = await db_1.prisma.user.findMany({
        select: { id: true, username: true, role: true, createdAt: true }
    });
    res.json(users);
});
app.post('/api/users', exports.authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN')
        return res.status(403).json({ error: 'Admin only' });
    try {
        const { username, password, role } = req.body;
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: { username, passwordHash, role }
        });
        res.json({ id: user.id, username: user.username, role: user.role });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});
app.delete('/api/users/:id', exports.authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN')
        return res.status(403).json({ error: 'Admin only' });
    try {
        await db_1.prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
// Apply auth middleware to all routes below this point
app.use('/api', exports.authenticateToken);
// ==========================================
// HDD ROUTES
// ==========================================
app.get('/api/hdds', async (req, res) => {
    const hdds = await db_1.prisma.hDD.findMany({
        orderBy: { name: 'asc' }
    });
    res.json(hdds);
});
app.post('/api/hdds', async (req, res) => {
    try {
        const { name, status, notes } = req.body;
        const hdd = await db_1.prisma.hDD.create({
            data: { name, status, notes }
        });
        res.json(hdd);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create HDD' });
    }
});
app.get('/api/hdds/:id', async (req, res) => {
    const hdd = await db_1.prisma.hDD.findUnique({
        where: { id: req.params.id },
        include: {
            backup1Projects: true,
            backup2Projects: true,
            lightroomProjects: true
        }
    });
    res.json(hdd);
});
// ==========================================
// PROJECT ROUTES
// ==========================================
app.get('/api/projects', async (req, res) => {
    const projects = await db_1.prisma.project.findMany({
        include: {
            backupHdd1: true,
            backupHdd2: true,
            lightroomHdd: true,
            checklist: true,
            colorGrader: { select: { id: true, username: true } },
            albumDesigner: { select: { id: true, username: true } },
            highlightVideoEditor: { select: { id: true, username: true } },
            fullVideoEditor: { select: { id: true, username: true } }
        },
        orderBy: { eventDate: 'desc' }
    });
    res.json(projects);
});
app.post('/api/projects', async (req, res) => {
    try {
        const data = req.body;
        // Auto-assign roles based on availability
        const colorist = await db_1.prisma.user.findFirst({ where: { role: 'COLORIST' } });
        const albumDesigner = await db_1.prisma.user.findFirst({ where: { role: 'ALBUM_DESIGNER' } });
        const highlightEditor = await db_1.prisma.user.findFirst({ where: { role: 'HIGHLIGHT_VIDEO_EDITOR' } });
        const fullVideoEditor = await db_1.prisma.user.findFirst({ where: { role: 'FULL_VIDEO_EDITOR' } });
        const project = await db_1.prisma.project.create({
            data: {
                id: data.id,
                clientName: data.clientName,
                eventType: data.eventType,
                eventDate: new Date(data.eventDate),
                phoneNumber: data.phoneNumber,
                packageType: data.packageType,
                photographer: data.photographer,
                videographer: data.videographer,
                notes: data.notes,
                priority: data.priority || 'Medium',
                status: 'Waiting For Backup',
                currentDepartment: 'Backup Team',
                colorGraderId: colorist?.id || null,
                albumDesignerId: albumDesigner?.id || null,
                highlightVideoEditorId: highlightEditor?.id || null,
                fullVideoEditorId: fullVideoEditor?.id || null,
                checklist: {
                    create: {} // Create empty checklist
                }
            }
        });
        await db_1.prisma.activityLog.create({
            data: {
                projectId: project.id,
                description: 'Project Created'
            }
        });
        res.json(project);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create Project' });
    }
});
app.get('/api/projects/:id', async (req, res) => {
    const project = await db_1.prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
            backupHdd1: true,
            backupHdd2: true,
            lightroomHdd: true,
            checklist: true,
            colorGrader: { select: { id: true, username: true } },
            albumDesigner: { select: { id: true, username: true } },
            highlightVideoEditor: { select: { id: true, username: true } },
            fullVideoEditor: { select: { id: true, username: true } },
            activities: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    res.json(project);
});
app.put('/api/projects/:id', async (req, res) => {
    try {
        const data = req.body;
        const updateData = { ...data };
        delete updateData.id;
        if (updateData.eventDate)
            updateData.eventDate = new Date(updateData.eventDate);
        const project = await db_1.prisma.project.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});
app.put('/api/projects/:id/checklist', async (req, res) => {
    try {
        const { checklistData, logMessage } = req.body;
        // Update checklist
        const updatedChecklist = await db_1.prisma.projectChecklist.update({
            where: { projectId: req.params.id },
            data: checklistData
        });
        // Recalculate status and department
        const { status, department } = calculateStatusAndDepartment(updatedChecklist);
        const project = await db_1.prisma.project.update({
            where: { id: req.params.id },
            data: { status, currentDepartment: department },
            include: { checklist: true, activities: true }
        });
        // Create activity log
        if (logMessage) {
            await db_1.prisma.activityLog.create({
                data: {
                    projectId: project.id,
                    description: logMessage
                }
            });
        }
        res.json(project);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update checklist' });
    }
});
// ==========================================
// ACTIVITY ROUTES
// ==========================================
app.get('/api/activities', async (req, res) => {
    try {
        const activities = await db_1.prisma.activityLog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                project: {
                    select: { clientName: true }
                }
            }
        });
        res.json(activities);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
