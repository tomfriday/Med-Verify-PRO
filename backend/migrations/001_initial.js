exports.up = function (knex) {
    return knex.schema
        .createTable('users', (t) => {
            t.increments('id').primary();
            t.string('email').notNullable().unique();
            t.string('password_hash').notNullable();
            t.enum('role', ['PATIENT', 'DOCTOR', 'ADMIN']).notNullable().defaultTo('PATIENT');
            t.string('full_name').notNullable();
            t.string('specialization').nullable();
            t.decimal('price', 10, 2).nullable();
            t.decimal('rating', 3, 2).nullable();
            t.timestamps(true, true);
        })
        .createTable('slots', (t) => {
            t.increments('id').primary();
            t.integer('doctor_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            t.datetime('start_time').notNullable();
            t.datetime('end_time').notNullable();
            t.boolean('is_available').notNullable().defaultTo(true);
            t.unique(['doctor_id', 'start_time']);
            t.timestamps(true, true);
        })
        .createTable('appointments', (t) => {
            t.increments('id').primary();
            t.integer('slot_id').unsigned().notNullable().references('id').inTable('slots').onDelete('CASCADE');
            t.integer('patient_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            t.integer('doctor_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            t.enum('status', ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED']).notNullable().defaultTo('PENDING');
            t.timestamps(true, true);
        })
        .createTable('medical_notes', (t) => {
            t.increments('id').primary();
            t.integer('appointment_id').unsigned().notNullable().references('id').inTable('appointments').onDelete('CASCADE');
            t.integer('doctor_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            t.integer('patient_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            t.text('content').notNullable();
            t.timestamps(true, true);
        })
        .createTable('audit_logs', (t) => {
            t.increments('id').primary();
            t.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
            t.string('action').notNullable();
            t.string('resource').notNullable();
            t.text('details').nullable();
            t.string('ip_address').nullable();
            t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('audit_logs')
        .dropTableIfExists('medical_notes')
        .dropTableIfExists('appointments')
        .dropTableIfExists('slots')
        .dropTableIfExists('users');
};
