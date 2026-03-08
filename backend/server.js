console.log('--- BACKEND PROCESS STARTING ---');
process.stdout.write('[RAW LOG] Node.js is executing server.js\n');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Global error handlers for production stability
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err.message);
    console.error(err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const prisma = require('./prisma/client');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Essential for some cloud environments

let requestCount = 0;

// Middleware
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        const allowed = [
            /\.vercel\.app$/,        // Vercel deployments
            /localhost/,              // Local dev
            /gencare-backend-production\.up\.railway\.app/  // Railway self-calls
        ];
        if (!origin || allowed.some(re => re.test(origin))) {
            callback(null, true);
        } else {
            console.warn('[CORS] Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Request Logger
app.use((req, res, next) => {
    requestCount++;
    console.log(`[Request #${requestCount}] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Ensure the virtual assistant user always exists
async function ensureAssistantUser() {
    try {
        const email = 'assistant@ivfcare.com';
        const existing = await prisma.user.findUnique({ where: { email } });

        if (!existing) {
            await prisma.user.create({
                data: {
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'Virtual Assistant',
                    email: email,
                    passwordHash: bcrypt.hashSync('assistant_secure_pass', 10),
                    role: 'doctor'
                }
            });
            console.log('[Setup] Virtual Assistant user created.');
        }
    } catch (err) {
        console.error('[Setup] Warning: Could not ensure assistant user:', err.message);
    }
}

// Startup Logic
const startServer = async () => {
    // 1. Immediately start listening to satisfy Railway health checks
    const server = app.listen(PORT, HOST, () => {
        console.log(`[Server] Gencare API is live on http://${HOST}:${PORT}`);
        console.log(`[Server] Accepting external traffic via Railway proxy.`);
    });

    server.on('error', (err) => {
        console.error('[Server] Fatal Error:', err.message);
    });

    // 2. Validate Environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const dbUrl = process.env.DATABASE_URL;

    // Check for placeholders
    if (dbUrl && dbUrl.includes('your_') || (dbUrl && dbUrl.includes('password'))) {
        console.warn('[Setup] CRITICAL: DATABASE_URL appears to contain placeholders. Please update Railway variables.');
    }

    if (!supabaseUrl || !supabaseKey || !dbUrl) {
        console.warn('[Setup] Warning: Missing environment variables. Some features may be limited.');
        return;
    }

    try {
        console.log('[Setup] Testing Database Connection...');
        // 3. Test Connection
        await prisma.$connect();
        console.log('[Setup] Database connection successful.');

        // 4. Background initialization
        await ensureAssistantUser();

        // 4. Notification Scheduler
        const { startScheduler } = require('./services/notificationScheduler');
        startScheduler();

        console.log('[Setup] Database connection and scheduler initialized.');
    } catch (err) {
        console.error('[Setup] Background initialization failed:', err.message);
    }
};

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const emergencyRoutes = require('./routes/emergency');
const medicalRoutes = require('./routes/medical');
const searchRoutes = require('./routes/search');
const adherenceRoutes = require('./routes/adherence');
const timelineRoutes = require('./routes/timeline');
const messageRoutes = require('./routes/message');
const schedulingRoutes = require('./routes/scheduling');
const transparencyRoutes = require('./routes/transparency');
const postDeliveryRoutes = require('./routes/postDelivery');
const surrogacyRoutes = require('./routes/surrogacy');
const notificationRoutes = require('./routes/notification');
const embryoTransferRoutes = require('./routes/embryoTransfer');
const healthRoutes = require('./routes/health');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/adherence', adherenceRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/transparency', transparencyRoutes);
app.use('/api/post-delivery', postDeliveryRoutes);
app.use('/api/surrogacy', surrogacyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/embryo-transfer', embryoTransferRoutes);
app.use('/api/health', healthRoutes);

app.get('/', (req, res) => {
    res.send('GENCARE API - Online');
});

startServer();
