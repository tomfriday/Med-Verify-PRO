const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
    await knex('audit_logs').del();
    await knex('medical_notes').del();
    await knex('appointments').del();
    await knex('slots').del();
    await knex('users').del();

    const hash = bcrypt.hashSync('password123', 10);

    // --- Admin ---
    await knex('users').insert([
        { email: 'admin@medverify.com', password_hash: hash, role: 'ADMIN', full_name: 'Anna Admin' }
    ]);

    // --- 20 Doctors ---
    const doctors = [
        { email: 'jan.kowalski@medverify.com', full_name: 'Dr. Jan Kowalski', specialization: 'Internista', price: 150, rating: 4.5 },
        { email: 'maria.nowak@medverify.com', full_name: 'Dr. Maria Nowak', specialization: 'Kardiolog', price: 250, rating: 4.8 },
        { email: 'piotr.wisniewski@medverify.com', full_name: 'Dr. Piotr Wiśniewski', specialization: 'Neurolog', price: 200, rating: 4.2 },
        { email: 'anna.zielinska@medverify.com', full_name: 'Dr. Anna Zielińska', specialization: 'Kardiolog', price: 280, rating: 4.9 },
        { email: 'tomasz.lewandowski@medverify.com', full_name: 'Dr. Tomasz Lewandowski', specialization: 'Internista', price: 130, rating: 4.3 },
        { email: 'katarzyna.wojcik@medverify.com', full_name: 'Dr. Katarzyna Wójcik', specialization: 'Neurolog', price: 220, rating: 4.6 },
        { email: 'michal.kaminski@medverify.com', full_name: 'Dr. Michał Kamiński', specialization: 'Kardiolog', price: 300, rating: 4.7 },
        { email: 'ewa.szymanska@medverify.com', full_name: 'Dr. Ewa Szymańska', specialization: 'Internista', price: 160, rating: 4.1 },
        { email: 'adam.wozniak@medverify.com', full_name: 'Dr. Adam Woźniak', specialization: 'Neurolog', price: 190, rating: 4.4 },
        { email: 'magdalena.dabrowa@medverify.com', full_name: 'Dr. Magdalena Dąbrowska', specialization: 'Kardiolog', price: 270, rating: 4.5 },
        { email: 'krzysztof.kozlowski@medverify.com', full_name: 'Dr. Krzysztof Kozłowski', specialization: 'Internista', price: 140, rating: 4.0 },
        { email: 'agnieszka.jankowska@medverify.com', full_name: 'Dr. Agnieszka Jankowska', specialization: 'Neurolog', price: 210, rating: 4.8 },
        { email: 'robert.mazur@medverify.com', full_name: 'Dr. Robert Mazur', specialization: 'Kardiolog', price: 260, rating: 4.3 },
        { email: 'joanna.krawczyk@medverify.com', full_name: 'Dr. Joanna Krawczyk', specialization: 'Internista', price: 170, rating: 4.6 },
        { email: 'marcin.piotrow@medverify.com', full_name: 'Dr. Marcin Piotrowski', specialization: 'Neurolog', price: 230, rating: 4.2 },
        { email: 'barbara.grabowska@medverify.com', full_name: 'Dr. Barbara Grabowska', specialization: 'Kardiolog', price: 290, rating: 4.9 },
        { email: 'lukasz.pawlak@medverify.com', full_name: 'Dr. Łukasz Pawlak', specialization: 'Internista', price: 155, rating: 4.4 },
        { email: 'monika.michalska@medverify.com', full_name: 'Dr. Monika Michalska', specialization: 'Neurolog', price: 205, rating: 4.7 },
        { email: 'pawel.nowicki@medverify.com', full_name: 'Dr. Paweł Nowicki', specialization: 'Kardiolog', price: 240, rating: 4.1 },
        { email: 'karolina.adamczyk@medverify.com', full_name: 'Dr. Karolina Adamczyk', specialization: 'Internista', price: 145, rating: 4.5 },
    ];

    const insertedDoctors = [];
    for (const doc of doctors) {
        const [inserted] = await knex('users').insert({
            email: doc.email,
            password_hash: hash,
            role: 'DOCTOR',
            full_name: doc.full_name,
            specialization: doc.specialization,
            price: doc.price,
            rating: doc.rating
        }).returning('id');
        insertedDoctors.push(typeof inserted === 'object' ? inserted.id : inserted);
    }

    // --- 2 Patients ---
    await knex('users').insert([
        { email: 'patient1@test.com', password_hash: hash, role: 'PATIENT', full_name: 'Tomek Pacjent' },
        { email: 'patient2@test.com', password_hash: hash, role: 'PATIENT', full_name: 'Ewa Pacjentka' }
    ]);

    // --- Slots (future dates) ---
    const baseDate = new Date('2026-02-16');

    for (const docId of insertedDoctors) {
        const slots = [];
        for (let day = 0; day < 5; day++) {
            for (let hour = 9; hour < 17; hour++) {
                const start = new Date(baseDate);
                start.setDate(start.getDate() + day);
                start.setHours(hour, 0, 0, 0);
                const end = new Date(start);
                end.setMinutes(15);
                slots.push({
                    doctor_id: docId,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    is_available: true
                });
            }
        }
        await knex('slots').insert(slots);
    }
};
