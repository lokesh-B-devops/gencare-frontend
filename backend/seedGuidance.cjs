const mongoose = require('mongoose');
const NewbornCareGuidance = require('./models/NewbornCareGuidance');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const guidanceData = [
    {
        category: 'Recovery',
        title: 'Mother\'s Physical Recovery',
        description: 'Guided steps for post-delivery healing and rest.',
        steps: [
            'Prioritize 8-10 hours of rest daily.',
            'Maintain gentle hydration (2-3 liters of water).',
            'Follow prescribed pain management schedule.',
            'Monitor incision site (if C-section) for redness or swelling.'
        ],
        checklist: [
            { id: 'rec_1', label: 'Check temperature daily (report >100.4°F)', description: 'Fever can indicate infection.' },
            { id: 'rec_2', label: 'Monitor lochia (bleeding) patterns', description: 'Should decrease over 2-6 weeks.' },
            { id: 'rec_3', label: 'Gentle walking for 5-10 minutes', description: 'Prevents blood clots.' }
        ],
        safetyDisclaimers: ['Consult doctor if you experience heavy bleeding or severe abdominal pain.']
    },
    {
        category: 'Feeding',
        title: 'Feeding & Nutrition Guidance',
        description: 'Supports both breastfeeding and formula feeding schedules.',
        steps: [
            'Feed on demand (usually every 2-3 hours).',
            'Ensure proper latch-on technique for comfort.',
            'Keep a log of wet/dirty diapers (6-8 wet/day).',
            'Stay upright for 15 mins after feeding to reduce reflux.'
        ],
        checklist: [
            { id: 'feed_1', label: 'Sterilize all bottles and pump parts', description: 'Boil or use steam sterilizer.' },
            { id: 'feed_2', label: 'Take prenatal vitamins as directed', description: 'Continues to support recovery.' }
        ],
        safetyDisclaimers: ['Seek lactation support if feeding is painful or baby is not gaining weight.']
    },
    {
        category: 'Emergency',
        title: 'Danger Signs & Emergency Alerts',
        description: 'CRITICAL: Immediate medical attention required if these signs appear.',
        steps: [
            'Know your nearest ER location.',
            'Keep your doctor\'s emergency number on speed dial.',
            'Trust your maternal instincts.'
        ],
        checklist: [
            { id: 'em_1', label: 'High Fever (>38°C / 100.4°F)', description: 'Sudden onset of high fever.' },
            { id: 'em_2', label: 'Baby: Lethargy or poor feeding', description: 'Difficulty waking the baby.' },
            { id: 'em_3', label: 'Severe headache or blurred vision', description: 'Can indicate postpartum preeclampsia.' }
        ],
        safetyDisclaimers: ['THIS IS GUIDANCE, NOT DIAGNOSIS. CALL EMERGENCY SERVICES IMMEDIATELY FOR LIFE-THREATENING SIGNS.']
    },
    {
        category: 'Hygiene',
        title: 'Newborn Hygiene & Cleaning',
        description: 'Safe practices for bathing and cord care.',
        steps: [
            'Sponge baths only until the umbilical cord falls off.',
            'Keep the cord site dry and clean.',
            'Trim nails while the baby is sleeping to avoid scratches.'
        ],
        checklist: [
            { id: 'hyg_1', label: 'Check bath water temperature', description: 'Should be lukewarm (around 37°C).' },
            { id: 'hyg_2', label: 'Wash hands before handling the baby', description: 'Prevents germ transmission.' }
        ]
    }
];

async function seedGuidance() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ivf_db');
        console.log('Connected to DB for seeding guidance...');

        await NewbornCareGuidance.deleteMany({});
        await NewbornCareGuidance.insertMany(guidanceData);

        console.log('--- SEEDED NEWBORN CARE GUIDANCE ---');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedGuidance();
