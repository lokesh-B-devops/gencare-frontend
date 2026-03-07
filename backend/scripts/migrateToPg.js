require('dotenv').config();
const mongoose = require('mongoose');
const prisma = require('../prisma/client');

// Repositories (will be used with DB_MODE=postgresql)
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

// Models (for reading from MongoDB)
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const GuardianProfile = require('../models/GuardianProfile');
const AdherenceLog = require('../models/AdherenceLog');
const Appointment = require('../models/Appointment');
const MedicalReport = require('../models/MedicalReport');
const MedicationEducation = require('../models/MedicationEducation');
const TreatmentTimeline = require('../models/TreatmentTimeline');
const Availability = require('../models/Availability');
const Message = require('../models/Message');
const EmergencyEvent = require('../models/EmergencyEvent');
const NotificationPreference = require('../models/NotificationPreference');
const NotificationLog = require('../models/NotificationLog');
const DoctorAlert = require('../models/DoctorAlert');
const NewbornCareGuidance = require('../models/NewbornCareGuidance');
const SurrogacyExpense = require('../models/SurrogacyExpense');
const SurrogacyPayment = require('../models/SurrogacyPayment');
const DonorProfile = require('../models/DonorProfile');
const SurrogateProfile = require('../models/SurrogateProfile');

async function migrate() {
    console.log("Starting Migration: MongoDB -> PostgreSQL");

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found in environment.");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Set DB_MODE to postgresql for repositories to only write to PG
    process.env.DB_MODE = 'postgresql';

    try {
        // 1. Core Models
        console.log("Migrating Users...");
        const users = await User.find();
        for (const user of users) {
            await userRepository.create(user.toObject()).catch(e => console.log(`User ${user._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Timelines...");
        const timelines = await TreatmentTimeline.find();
        for (const timeline of timelines) {
            await timelineRepository.create(timeline.toObject()).catch(e => console.log(`Timeline ${timeline._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Patient Profiles...");
        const patients = await PatientProfile.find();
        for (const patient of patients) {
            const data = patient.toObject();
            if (data.timeline && data.timeline.config) {
                data.timelineId = data.timeline.config.toString();
                data.startDate = data.timeline.startDate;
                data.currentDay = data.timeline.currentDay;
            }
            await patientRepository.create(data).catch(e => console.log(`Patient ${patient._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Doctor Profiles...");
        const doctors = await DoctorProfile.find();
        for (const doctor of doctors) {
            await doctorRepository.create(doctor.toObject()).catch(e => console.log(`Doctor ${doctor._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Guardian Profiles...");
        const guardians = await GuardianProfile.find();
        for (const guardian of guardians) {
            await guardianRepository.create(guardian.toObject()).catch(e => console.log(`Guardian ${guardian._id} exists or error: ${e.message}`));
        }

        // 2. Operational Models
        console.log("Migrating Appointments...");
        const appointments = await Appointment.find();
        for (const appt of appointments) {
            await appointmentRepository.create(appt.toObject()).catch(e => console.log(`Appointment ${appt._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Adherence Logs...");
        const adLogs = await AdherenceLog.find();
        for (const log of adLogs) {
            await adherenceRepository.create(log.toObject()).catch(e => console.log(`AdherenceLog ${log._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Medical Reports...");
        const reports = await MedicalReport.find();
        for (const report of reports) {
            await medicalReportRepository.create(report.toObject()).catch(e => console.log(`MedicalReport ${report._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Messages...");
        const messages = await Message.find();
        for (const msg of messages) {
            await messageRepository.create(msg.toObject()).catch(e => console.log(`Message ${msg._id} exists or error: ${e.message}`));
        }

        // 3. Secondary Models
        console.log("Migrating Emergency Events...");
        const emergencies = await EmergencyEvent.find();
        for (const emer of emergencies) {
            await emergencyRepository.create(emer.toObject()).catch(e => console.log(`Emergency ${emer._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Notification Preferences...");
        const prefs = await NotificationPreference.find();
        for (const pref of prefs) {
            await notificationPreferenceRepository.create(pref.toObject()).catch(e => console.log(`Pref ${pref._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Notification Logs...");
        const nLogs = await NotificationLog.find();
        for (const log of nLogs) {
            await notificationLogRepository.create(log.toObject()).catch(e => console.log(`NLog ${log._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Doctor Alerts...");
        const alerts = await DoctorAlert.find();
        for (const alert of alerts) {
            await doctorAlertRepository.create(alert.toObject()).catch(e => console.log(`Alert ${alert._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Newborn Care Guidance...");
        const guidances = await NewbornCareGuidance.find();
        for (const guide of guidances) {
            await newbornCareRepository.create(guide.toObject()).catch(e => console.log(`Guide ${guide._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Surrogacy Expenses...");
        const expenses = await SurrogacyExpense.find();
        for (const exp of expenses) {
            await surrogacyExpenseRepository.create(exp.toObject()).catch(e => console.log(`Expense ${exp._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Surrogacy Payments...");
        const sPayments = await SurrogacyPayment.find();
        for (const pay of sPayments) {
            await surrogacyPaymentRepository.create(pay.toObject()).catch(e => console.log(`Payment ${pay._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Donor Profiles...");
        const donors = await DonorProfile.find();
        for (const donor of donors) {
            await donorRepository.create(donor.toObject()).catch(e => console.log(`Donor ${donor._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Surrogate Profiles...");
        const surrogates = await SurrogateProfile.find();
        for (const surrogate of surrogates) {
            await surrogateRepository.create(surrogate.toObject()).catch(e => console.log(`Surrogate ${surrogate._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Medication Education...");
        const educations = await MedicationEducation.find();
        for (const edu of educations) {
            await medicationEducationRepository.create(edu.toObject()).catch(e => console.log(`MedicationEducation ${edu._id} exists or error: ${e.message}`));
        }

        console.log("Migrating Availability...");
        const availabilities = await Availability.find();
        for (const avail of availabilities) {
            await availabilityRepository.create(avail.toObject()).catch(e => console.log(`Availability ${avail._id} exists or error: ${e.message}`));
        }

        console.log("Migration Completed Successfully.");
    } catch (err) {
        console.error("Migration Failed:", err);
    } finally {
        await mongoose.disconnect();
        await prisma.$disconnect();
        process.exit(0);
    }
}

migrate();

migrate();
