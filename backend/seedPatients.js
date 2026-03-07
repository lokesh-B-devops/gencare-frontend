const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const PatientProfile = require('./models/PatientProfile');
const DoctorProfile = require('./models/DoctorProfile');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function seedPatients() {
    try {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000
            });
            console.log('Connected to Local MongoDB');
        } catch (err) {
            console.log('Local MongoDB not found, using In-Memory Storage for seeding...');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
        }

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync('password123', salt);

        // Find the existing doctor
        const doctorUser = await User.findOne({ email: 'doctor@example.com' });
        if (!doctorUser) {
            console.error('Doctor user not found. Please run seed.js first.');
            process.exit(1);
        }
        const doctorProfile = await DoctorProfile.findOne({ user: doctorUser._id });

        const patientsData = [
            {
                name: 'Elena Rodriguez',
                email: 'elena@example.com',
                age: 38,
                cycleNumber: 3,
                stage: 'Preparation',
                embryoStage: 'Day 3',
                embryoQuality: 'Grade B',
                uterineHealth: 'Endometriosis history',
                riskFactors: ['Advanced maternal age', 'Endometriosis'],
                medications: [{ name: 'Lupron', dosage: '10 units', time: '08:00 AM' }]
            },
            {
                name: 'Priya Sharma',
                email: 'priya@example.com',
                age: 29,
                cycleNumber: 1,
                stage: 'Stimulation',
                embryoStage: 'Day 5',
                embryoQuality: 'Grade A',
                uterineHealth: 'Normal/Healthy',
                riskFactors: ['None'],
                medications: [{ name: 'Gonal-F', dosage: '150 IU', time: '07:00 PM' }]
            },
            {
                name: 'Chloe Dubois',
                email: 'chloe@example.com',
                age: 42,
                cycleNumber: 4,
                stage: 'Transfer',
                embryoStage: 'Day 5',
                embryoQuality: 'Grade B',
                uterineHealth: 'Thin endometrial lining (6.5mm)',
                riskFactors: ['Advanced maternal age', 'Multiple failed cycles'],
                medications: [{ name: 'Estrace', dosage: '2mg', time: '09:00 AM' }]
            },
            {
                name: 'Maya Gupta',
                email: 'maya@example.com',
                age: 34,
                cycleNumber: 2,
                stage: 'Waiting Period',
                embryoStage: 'Day 5',
                embryoQuality: 'Grade A',
                uterineHealth: 'Normal',
                riskFactors: ['PCOS'],
                medications: [{ name: 'Progesterone', dosage: '50mg', time: '10:00 PM' }]
            }
        ];

        console.log(`Seeding ${patientsData.length} new patients...`);

        for (const data of patientsData) {
            // Check if user already exists
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = new User({
                    name: data.name,
                    email: data.email,
                    passwordHash,
                    role: 'patient'
                });
                await user.save();
            }

            let profile = await PatientProfile.findOne({ user: user._id });
            if (!profile) {
                profile = new PatientProfile({
                    user: user._id,
                    age: data.age,
                    assignedDoctor: doctorUser._id,
                    ivfDetails: {
                        stage: data.stage,
                        cycleNumber: data.cycleNumber,
                        medications: data.medications
                    },
                    medicalNotes: `AI Seeding: ${data.uterineHealth}. Risks: ${data.riskFactors.join(', ')}.`,
                    // We can store the embryo details in medicalNotes or just rely on them being passed to the AI generator
                });
                await profile.save();

                // Link to doctor
                if (!doctorProfile.patients.includes(profile._id)) {
                    doctorProfile.patients.push(profile._id);
                }
            }
        }

        await doctorProfile.save();
        console.log('✅ Demo patients seeded successfully.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Seeding failed:', err);
    }
}

seedPatients();
