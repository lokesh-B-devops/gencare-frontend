require('dotenv').config();
const mongoose = require('mongoose');
const prisma = require('../prisma/client');

const userRepository = require('../repositories/UserRepository');
const patientRepository = require('../repositories/PatientRepository');
const doctorRepository = require('../repositories/DoctorRepository');
const guardianRepository = require('../repositories/GuardianRepository');
const adherenceRepository = require('../repositories/AdherenceRepository');
const appointmentRepository = require('../repositories/AppointmentRepository');
const medicalReportRepository = require('../repositories/MedicalReportRepository');
const medicationEducationRepository = require('../repositories/MedicationEducationRepository');
const timelineRepository = require('../repositories/TimelineRepository');
const availabilityRepository = require('../repositories/AvailabilityRepository');
const messageRepository = require('../repositories/MessageRepository');
const emergencyRepository = require('../repositories/EmergencyRepository');
const notificationPreferenceRepository = require('../repositories/NotificationPreferenceRepository');
const notificationLogRepository = require('../repositories/NotificationLogRepository');
const doctorAlertRepository = require('../repositories/DoctorAlertRepository');
const newbornCareRepository = require('../repositories/NewbornCareRepository');
const surrogacyExpenseRepository = require('../repositories/SurrogacyExpenseRepository');
const surrogacyPaymentRepository = require('../repositories/SurrogacyPaymentRepository');
const donorRepository = require('../repositories/DonorRepository');
const surrogateRepository = require('../repositories/SurrogateRepository');

async function verify() {
    console.log("=== Data Migration Verification Audit ===");

    // Connect to MongoDB for counting
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found.");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);

    // Set DB_MODE to dual so count() checks both
    process.env.DB_MODE = 'dual';

    const models = [
        { name: 'Users', repo: userRepository },
        { name: 'Patient Profiles', repo: patientRepository },
        { name: 'Doctor Profiles', repo: doctorRepository },
        { name: 'Guardian Profiles', repo: guardianRepository },
        { name: 'Adherence Logs', repo: adherenceRepository },
        { name: 'Appointments', repo: appointmentRepository },
        { name: 'Medical Reports', repo: medicalReportRepository },
        { name: 'Medication Education', repo: medicationEducationRepository },
        { name: 'Treatment Timelines', repo: timelineRepository },
        { name: 'Doctor Availability', repo: availabilityRepository },
        { name: 'Messages', repo: messageRepository },
        { name: 'Emergency Events', repo: emergencyRepository },
        { name: 'Notification Prefs', repo: notificationPreferenceRepository },
        { name: 'Notification Logs', repo: notificationLogRepository },
        { name: 'Doctor Alerts', repo: doctorAlertRepository },
        { name: 'Newborn Guidance', repo: newbornCareRepository },
        { name: 'Surrogacy Expenses', repo: surrogacyExpenseRepository },
        { name: 'Surrogacy Payments', repo: surrogacyPaymentRepository },
        { name: 'Donor Profiles', repo: donorRepository },
        { name: 'Surrogate Profiles', repo: surrogateRepository }
    ];

    let allMatch = true;

    for (const model of models) {
        try {
            const counts = await model.repo.count();
            const match = counts.mongodb === counts.postgresql;
            const status = match ? "✅ MATCH" : "❌ MISMATCH";
            if (!match) allMatch = false;

            console.log(`${model.name.padEnd(20)}: Mongo=${counts.mongodb.toString().padEnd(5)} PG=${counts.postgresql.toString().padEnd(5)} [${status}]`);
        } catch (err) {
            console.error(`Error auditing ${model.name}: ${err.message}`);
            allMatch = false;
        }
    }

    console.log("=========================================");
    if (allMatch) {
        console.log("Audit Status: SUCCESS - All record counts match.");
    } else {
        console.log("Audit Status: ATTENTION - Some count mismatches found.");
        console.log("Recommendation: Run the migration script (migrateToPg.js) again or check logs.");
    }

    await mongoose.disconnect();
    await prisma.$disconnect();
    process.exit(0);
}

verify();
