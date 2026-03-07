const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const PatientProfile = require('./models/PatientProfile');
const DoctorProfile = require('./models/DoctorProfile');
const GuardianProfile = require('./models/GuardianProfile');
const TreatmentTimeline = require('./models/TreatmentTimeline');
const AdherenceLog = require('./models/AdherenceLog');
const MedicalReport = require('./models/MedicalReport');
const Message = require('./models/Message');
const EmergencyEvent = require('./models/EmergencyEvent');
const NewbornCareGuidance = require('./models/NewbornCareGuidance');
const DonorProfile = require('./models/DonorProfile');
const SurrogateProfile = require('./models/SurrogateProfile');
const SurrogacyExpense = require('./models/SurrogacyExpense');
const SurrogacyPayment = require('./models/SurrogacyPayment');
const NotificationPreference = require('./models/NotificationPreference');
const NotificationLog = require('./models/NotificationLog');
const DoctorAlert = require('./models/DoctorAlert');

dotenv.config();

const seedData = async () => {
    try {
        console.log('--- STARTING COMPREHENSIVE SEEDING ---');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            PatientProfile.deleteMany({}),
            DoctorProfile.deleteMany({}),
            GuardianProfile.deleteMany({}),
            TreatmentTimeline.deleteMany({}),
            AdherenceLog.deleteMany({}),
            MedicalReport.deleteMany({}),
            Message.deleteMany({}),
            EmergencyEvent.deleteMany({}),
            NewbornCareGuidance.deleteMany({}),
            DonorProfile.deleteMany({}),
            SurrogateProfile.deleteMany({}),
            SurrogacyExpense.deleteMany({}),
            SurrogacyPayment.deleteMany({}),
            NotificationPreference.deleteMany({}),
            NotificationLog.deleteMany({}),
            DoctorAlert.deleteMany({})
        ]);

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync('password123', salt);

        // 1. Create Users with fixed IDs for stability
        const doctorId = new mongoose.Types.ObjectId('507f191e810c19729de86001');
        const patientId = new mongoose.Types.ObjectId('507f191e810c19729de86002');
        const guardianId = new mongoose.Types.ObjectId('507f191e810c19729de86003');
        const assistantId = new mongoose.Types.ObjectId('507f191e810c19729de86004');

        const doctorUser = new User({ _id: doctorId, name: 'Dr. Emily Chen', email: 'doctor@example.com', passwordHash, role: 'doctor' });
        const patientUser = new User({ _id: patientId, name: 'Sarah Jenkins', email: 'sarah@example.com', passwordHash, role: 'patient', whatsappNumber: '+919876543210', timezone: 'Asia/Kolkata' });
        const guardianUser = new User({ _id: guardianId, name: 'David Jenkins', email: 'david@example.com', passwordHash, role: 'guardian', whatsappNumber: '+919876543211', timezone: 'Asia/Kolkata' });
        const assistantUser = new User({ _id: assistantId, name: 'Virtual Assistant', email: 'assistant@ivfcare.com', passwordHash, role: 'doctor' });

        // Additional Demo Patients
        const patientEUser = new User({ name: 'Elena Rodriguez', email: 'elena@example.com', passwordHash, role: 'patient' });
        const patientPUser = new User({ name: 'Priya Sharma', email: 'priya@example.com', passwordHash, role: 'patient' });
        const patientCUser = new User({ name: 'Chloe Dubois', email: 'chloe@example.com', passwordHash, role: 'patient' });
        const patientMUser = new User({ name: 'Maya Gupta', email: 'maya@example.com', passwordHash, role: 'patient' });

        await Promise.all([
            doctorUser.save(), patientUser.save(), guardianUser.save(), assistantUser.save(),
            patientEUser.save(), patientPUser.save(), patientCUser.save(), patientMUser.save()
        ]);

        // 2. Create Treatment Timeline Config
        const timelineConfig = new TreatmentTimeline({
            name: "Premium IVF Protocol",
            phases: [
                {
                    label: "Preparation",
                    durationDays: 21,
                    advice: "Building a healthy foundation for your cycle.",
                    dosAndDonts: ["Prenatal vitamins daily", "Limit caffeine", "Healthy sleep routine"]
                },
                {
                    label: "Stimulation",
                    durationDays: 12,
                    advice: "Focus on follicular growth. Feeling some bloating is normal.",
                    dosAndDonts: ["Stay well hydrated", "Avoid high-impact exercise", "Rotate injection sites"]
                },
                {
                    label: "Trigger & Retrieval",
                    durationDays: 2,
                    advice: "The most critical timing phase.",
                    dosAndDonts: ["Fast from midnight", "No perfumes or jewelry", "Rest after procedure"]
                },
                {
                    label: "Embryo Transfer",
                    durationDays: 5,
                    advice: "Creating a welcoming environment for your embryo.",
                    dosAndDonts: ["Keep core warm", "Relaxing activities only", "Follow progesterone schedule"]
                },
                {
                    label: "Waiting Period",
                    durationDays: 14,
                    advice: "Stay calm and positive. You've come so far.",
                    isWaitingPhase: true,
                    dosAndDonts: ["Distract yourself with hobbies", "Gentle walking is OK", "Follow clinic blood-test schedule"]
                }
            ],
            createdBy: doctorUser._id
        });
        await timelineConfig.save();

        // 3. Create Profiles
        const doctorProfile = new DoctorProfile({
            user: doctorUser._id,
            specialization: 'Reproductive Endocrinology',
            hospitalName: 'Miracle Fertility Center',
            patients: []
        });

        const patientProfile = new PatientProfile({
            user: patientUser._id,
            pregnancyMonth: 'Month 1',
            ivfDetails: {
                stage: 'Stimulation',
                cycleNumber: 1,
                medications: [
                    { name: 'Gonal-F', dosage: '225 IU', time: '07:00 PM' },
                    { name: 'Menopur', dosage: '75 IU', time: '07:00 PM' },
                    { name: 'Cetrotide', dosage: '0.25 mg', time: '09:00 AM' },
                    { name: 'Ovidrel', dosage: '250 mcg', time: '10:30 PM' }
                ]
            },
            assignedDoctor: doctorUser._id,
            timeline: {
                currentDay: 8,
                phase: 'Stimulation',
                startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                config: timelineConfig._id
            },
            medicalNotes: 'Follicles progressing perfectly. 12 follicles detected today. Trigger shot expected in 48-72 hours.',
            hasDonorInvolvement: true,
            hasSurrogateInvolvement: true
        });

        const guardianProfile = new GuardianProfile({
            user: guardianUser._id,
            linkedPatient: patientProfile._id,
            relation: 'Primary Support'
        });

        // Additional Profiles
        const patientEProfile = new PatientProfile({
            user: patientEUser._id,
            age: 38,
            assignedDoctor: doctorUser._id,
            ivfDetails: { stage: 'Preparation', cycleNumber: 3, medications: [{ name: 'Lupron', dosage: '10 units', time: '08:00 AM' }] },
            medicalNotes: 'AI Seeding: Endometriosis history. Risks: Advanced maternal age, Endometriosis.'
        });

        const patientPProfile = new PatientProfile({
            user: patientPUser._id,
            age: 29,
            assignedDoctor: doctorUser._id,
            ivfDetails: { stage: 'Stimulation', cycleNumber: 1, medications: [{ name: 'Gonal-F', dosage: '150 IU', time: '07:00 PM' }] },
            medicalNotes: 'AI Seeding: Normal/Healthy baseline.'
        });

        const patientCProfile = new PatientProfile({
            user: patientCUser._id,
            age: 42,
            assignedDoctor: doctorUser._id,
            ivfDetails: { stage: 'Transfer', cycleNumber: 4, medications: [{ name: 'Estrace', dosage: '2mg', time: '09:00 AM' }] },
            medicalNotes: 'AI Seeding: Thin endometrial lining (6.5mm). Risks: Thin lining, Advanced maternal age.'
        });

        const patientMProfile = new PatientProfile({
            user: patientMUser._id,
            age: 34,
            assignedDoctor: doctorUser._id,
            ivfDetails: { stage: 'Waiting Period', cycleNumber: 2, medications: [{ name: 'Progesterone', dosage: '50mg', time: '10:00 PM' }] },
            medicalNotes: 'AI Seeding: Normal PCOS case. Risks: PCOS.'
        });

        await Promise.all([
            doctorProfile.save(), patientProfile.save(), guardianProfile.save(),
            patientEProfile.save(), patientPProfile.save(), patientCProfile.save(), patientMProfile.save()
        ]);

        // 4. Update Linking
        doctorProfile.patients.push(patientProfile._id, patientEProfile._id, patientPProfile._id, patientCProfile._id, patientMProfile._id);
        await doctorProfile.save();

        patientProfile.emergencyContacts.push(guardianUser._id);
        await patientProfile.save();

        // 5. Create Adherence Logs (Last 7 Days)
        const dayMillis = 24 * 60 * 60 * 1000;
        const adherenceData = [
            { day: 0, score: 95, status: 'on-time' },
            { day: 1, score: 90, status: 'on-time' },
            { day: 2, score: 85, status: 'late' },
            { day: 3, score: 45, status: 'missed', escalated: true },
            { day: 4, score: 75, status: 'on-time' },
            { day: 5, score: 95, status: 'on-time' },
            { day: 6, score: 100, status: 'on-time' }
        ];

        for (const data of adherenceData) {
            const logDate = new Date(Date.now() - (6 - data.day) * dayMillis);
            logDate.setHours(0, 0, 0, 0);

            const log = new AdherenceLog({
                patient: patientUser._id,
                date: logDate,
                dailyScore: data.score,
                isEscalated: data.escalated || false,
                medicationLogs: [
                    {
                        medName: 'Gonal-F',
                        scheduledTime: '07:00 PM',
                        status: data.status,
                        actualTime: data.status === 'on-time' ? new Date(logDate.getTime() + 19 * 60 * 60000 + 5 * 60000) : (data.status === 'late' ? new Date(logDate.getTime() + 21 * 60 * 60000) : null)
                    },
                    {
                        medName: 'Menopur',
                        scheduledTime: '07:00 PM',
                        status: data.status,
                        actualTime: data.status === 'on-time' ? new Date(logDate.getTime() + 19 * 60 * 60000 + 8 * 60000) : (data.status === 'late' ? new Date(logDate.getTime() + 21 * 60 * 60000 + 5 * 60000) : null)
                    }
                ]
            });

            if (data.day === 3) {
                log.symptomLogs.push({
                    symptom: 'Abdominal Cramping',
                    severity: 'Moderate',
                    isAbnormal: true,
                    reportedAt: logDate,
                    aiAnalysis: {
                        summary: 'Moderate cramping detected during stimulation phase.',
                        details: 'Potential mild OHSS symptom or normal follicle growth.',
                        recommendations: ['Increase fluid intake', 'Avoid heavy movement', 'Contact doctor if pain worsens']
                    }
                });
            }
            await log.save();
        }

        // 6. Create Medical Reports
        const reports = [
            { name: 'Follicle Ultrasound_D8.pdf', summary: 'Day 8 Scan: 12 follicles detected, range 14mm-18mm.' },
            { name: 'Blood Work_Estradiol.pdf', summary: 'Estradiol levels rising steadily, currently 1250 pg/mL.' }
        ];

        for (const r of reports) {
            await new MedicalReport({
                patient: patientUser._id,
                filename: r.name.toLowerCase().replace(/ /g, '_'),
                originalName: r.name,
                path: '/uploads/mock_report.pdf',
                mimetype: 'application/pdf',
                aiAnalysis: {
                    summary: r.summary,
                    details: 'Full report shows healthy progression for Stimulation phase.',
                    recommendations: ['Continue current dosage', 'Next scan in 48 hours']
                }
            }).save();
        }

        // 7. Create Messages
        const messages = [
            { from: doctorUser, to: patientUser, content: 'Hi Sarah, your blood work looks Great! Keep taking 225 IU of Gonal-F.', category: 'medication' },
            { from: patientUser, to: doctorUser, content: 'Thank you doctor! I felt some bloating today, is that normal?', category: 'symptoms' },
            { from: doctorUser, to: patientUser, content: 'Yes, bloating is expected as your follicles grow. Stay hydrated!', category: 'general' }
        ];

        for (const m of messages) {
            await new Message({
                sender: m.from._id,
                recipient: m.to._id,
                content: m.content,
                category: m.category
            }).save();
        }

        // 8. Create Emergency Event
        await new EmergencyEvent({
            patient: patientProfile._id, // CORRECTED POSSIBLY
            triggeredBy: 'SOS_BUTTON',
            location: {
                latitude: 34.0522,
                longitude: -118.2437
            },
            status: 'resolved',
            logs: [{ message: 'Emergency resolved by rescue team', timestamp: new Date() }]
        }).save();

        // 9. Seed Newborn Care Guidance
        console.log('Seeding Newborn Care Guidance...');
        const guidanceData = [
            {
                category: 'Recovery',
                title: 'Post-Delivery Recovery',
                description: 'Initial 24-48 hours of maternal recovery.',
                steps: [
                    { title: 'Rest and Hydration', content: 'Ensure at least 8 hours of sleep and drink 3 liters of water daily.' },
                    { title: 'Pain Management', content: 'Follow prescribed medication schedule and use cold packs for swelling.' }
                ],
                checklist: [
                    { id: 'rec-1', text: 'Checked vitals', mandatory: true },
                    { id: 'rec-2', text: 'First post-delivery walk', mandatory: true }
                ],
                safetyDisclaimer: 'Report heavy bleeding or severe pain immediately.'
            },
            {
                category: 'Feeding',
                title: 'Newborn Feeding Guide',
                description: 'Basics of breastfeeding and formula feeding.',
                steps: [
                    { title: 'Feeding Frequency', content: 'Feed every 2-3 hours or on demand.' },
                    { title: 'Burping', content: 'Burp the baby after every feeding sessions.' }
                ],
                checklist: [
                    { id: 'feed-1', text: 'Latched correctly', mandatory: false },
                    { id: 'feed-2', text: 'Recorded feeding time', mandatory: true }
                ],
                safetyDisclaimer: 'Consult a lactation specialist if feeding is painful.'
            }
        ];
        await NewbornCareGuidance.insertMany(guidanceData);

        // 10. Seed Transparency Data (for testing)
        console.log('Seeding Transparency Profiles...');
        await new DonorProfile({
            patient: patientProfile._id,
            type: 'Sperm',
            ageRange: '25-30',
            bloodGroup: 'O+',
            geneticScreening: 'Negative for 150+ markers',
            medicalFitness: 'Excellent',
            doctorNotes: 'Highly compatible donor with excellent history.',
            isPublished: true
        }).save();

        await new SurrogateProfile({
            patient: patientProfile._id,
            ageRange: '22-28',
            bloodGroup: 'A+',
            geneticScreening: 'Clear',
            medicalFitness: 'Fit',
            doctorNotes: 'Experienced surrogate with positive history.',
            isPublished: true
        }).save();

        // 11. Seed Surrogacy Expenses
        console.log('Seeding Surrogacy Expenses...');
        const surrogacyExpenses = [
            {
                patient: patientUser._id,
                category: 'Medical Checkups',
                amount: 500,
                description: 'First Trimester Ultrasound & Consultation',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                status: 'Pending'
            },
            {
                patient: patientUser._id,
                category: 'Medications',
                amount: 250,
                description: 'Prescribed prenatal vitamins and supplements',
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                status: 'Paid',
                disbursementStatus: 'Disbursed'
            },
            {
                patient: patientUser._id,
                category: 'Nutrition Allowance',
                amount: 300,
                description: 'Monthly special diet and nutrition allowance',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                status: 'Pending'
            }
        ];
        await SurrogacyExpense.insertMany(surrogacyExpenses);

        // 13. Create Notification Preferences
        const notificationPref = new NotificationPreference({
            patient: patientUser._id,
            whatsappEnabled: true,
            smsEnabled: true,
            reminderMinutesBefore: 15,
            whatsappConsent: true,
            smsConsent: true,
            whatsappConsentDate: new Date()
        });
        await notificationPref.save();

        // 14. Create Sample Notification Logs
        const logs = [
            {
                patient: patientUser._id,
                recipient: patientUser._id,
                recipientRole: 'patient',
                channel: 'whatsapp',
                messageType: 'reminder',
                status: 'delivered',
                messageContent: 'Reminder: Your scheduled IVF medication is due at 7:00 PM. Please confirm in the app.',
                sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                patient: patientUser._id,
                recipient: patientUser._id,
                recipientRole: 'patient',
                channel: 'sms',
                messageType: 'reminder',
                status: 'delivered',
                messageContent: 'Reminder: Your scheduled IVF medication is due at 7:00 PM. Please confirm in the app.',
                sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            }
        ];
        await NotificationLog.insertMany(logs);

        // 15. Create Sample Doctor Alerts
        const doctorAlert = new DoctorAlert({
            doctor: doctorUser._id,
            patient: patientUser._id,
            alertType: 'medication_escalation',
            message: 'Patient Sarah Jenkins has missed a dose of Menopur and has not responded to guardian escalation.',
            severity: 'high'
        });
        await doctorAlert.save();

        console.log('--- COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY ---');
    } catch (err) {
        console.error('SEEDING ERROR:', err);
        throw err;
    }
};

// Check if run directly
if (require.main === module) {
    const { MongoMemoryServer } = require('mongodb-memory-server');

    const runSeeder = async () => {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 2000
            });
            console.log('Connected to Local MongoDB');
        } catch (err) {
            console.log('Local MongoDB not found, using In-Memory Storage for seeding test...');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
        }
        await seedData();
        console.log('Seeding process finished.');
        process.exit(0);
    };

    runSeeder().catch(err => {
        console.error('Fatal Seeding Error:', err);
        process.exit(1);
    });
}

module.exports = seedData;
