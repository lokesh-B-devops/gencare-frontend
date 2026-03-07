const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const prisma = require('./prisma/client');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Ensure the virtual assistant user always exists in Supabase
async function ensureAssistantUser() {
    try {
        const email = 'assistant@ivfcare.com';
        const existing = await prisma.user.findUnique({ where: { email } });

        if (!existing) {
            await prisma.user.create({
                data: {
                    id: '00000000-0000-0000-0000-000000000000', // Specialized UUID for assistant
                    name: 'Virtual Assistant',
                    email: email,
                    passwordHash: bcrypt.hashSync('assistant_secure_pass', 10),
                    role: 'doctor'
                }
            });
            console.log('[Setup] Virtual Assistant user created in Supabase.');
        } else {

            console.log('[Setup] Virtual Assistant user already exists in Supabase.');
        }
    } catch (err) {
        console.error('[Setup] Failed to ensure assistant user in Supabase:', err.message);
    }
}

// Database Connection Logic
const startServer = async () => {
    // Validate Supabase Configuration
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('CRITICAL: Supabase configuration missing. Backend cannot start.');
        process.exit(1);
    }

    console.log('[Supabase] Strategy: Supplying direct PostgreSQL connection via Prisma.');

    // Ensure critical setup is done
    await ensureAssistantUser();

    // Start the notification scheduler
    const { startScheduler } = require('./services/notificationScheduler');
    startScheduler();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Connected to Supabase PostgreSQL via Prisma.');
    });
};

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

// Routes
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

// Basic Route
app.get('/', (req, res) => {
    res.send('GENCARE API Running (Supabase Only Mode)');
});

startServer();
