const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const userRepository = require('../repositories/UserRepository');
const patientRepository = require('../repositories/PatientRepository');
const doctorRepository = require('../repositories/DoctorRepository');
const guardianRepository = require('../repositories/GuardianRepository');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone, ...profileData } = req.body;

        // Check if user exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        // Create User
        console.log('[DEBUG] Calling userRepository.create with:', { name, email, role });
        const user = await userRepository.create({ name, email, passwordHash, role, phone });
        console.log('[DEBUG] user result:', user);

        if (!user) throw new Error('User creation returned null result');
        const userId = user.id;

        // Create Profile based on Role
        if (role === 'patient') {
            await patientRepository.create({ userId, ...profileData });
        } else if (role === 'doctor') {
            await doctorRepository.create({ userId, ...profileData });
        } else if (role === 'guardian') {
            await guardianRepository.create({ userId, ...profileData });
        }

        res.status(201).json({ message: 'User registered successfully', name: user.name });
    } catch (err) {
        console.error('[Registration Error]:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[LOGIN] Attempt for: ${email}`);

        let user = await userRepository.findByEmail(email);

        if (!user) {
            console.log(`[LOGIN] User not found: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = bcrypt.compareSync(password, user.passwordHash);
        if (!isMatch) {
            console.log(`[LOGIN] Password mismatch: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log(`[LOGIN] Success: ${email}`);
        res.json({ token, role: user.role, userId: user.id, name: user.name });
    } catch (err) {
        console.error(`[LOGIN ERROR]:`, err);
        res.status(500).json({ error: err.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { tokenId } = req.body;
        console.log(`[GOOGLE LOGIN] verified payload for...`);

        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, picture } = ticket.getPayload();
        let user = await userRepository.findByEmail(email);

        if (!user) {
            console.log(`[GOOGLE LOGIN] Auto-registering: ${email}`);
            const salt = bcrypt.genSaltSync(10);
            const passwordHash = bcrypt.hashSync(Math.random().toString(36), salt);

            user = await userRepository.create({
                name,
                email,
                passwordHash,
                role: 'patient',
                profilePicture: picture
            });
            await patientRepository.create({ userId: user.id });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, role: user.role, userId: user.id, name: user.name });
    } catch (err) {
        console.error(`[GOOGLE LOGIN ERROR]:`, err);
        res.status(500).json({ error: err.message });
    }
};

exports.testDb = async (req, res) => {
    try {
        const testData = {
            name: "Prisma Test User",
            email: `test_${Date.now()}@example.com`,
            passwordHash: "test_hash",
            role: "patient"
        };

        const result = await userRepository.create(testData);
        res.json({ message: "Prisma Test Successful", data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
