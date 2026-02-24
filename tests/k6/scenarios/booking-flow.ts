/**
 * Scenario: Booking Flow — Custom Trend
 *
 * Typ testu: LOAD TEST z Custom Metrics
 * Cel: Zmierzenie pełnego flow rezerwacji wizyty z perspektywy użytkownika:
 *      1. Przeglądanie listy lekarzy
 *      2. Pobranie dostępnych slotów
 *      3. (Symulacja) Rezerwacja wizyty
 *
 * Custom metrics:
 * - booking_flow_duration (Trend) — pełny czas flow w ms
 * - booking_flow_seconds (Trend) — pełny czas flow w sekundach
 * - booking_steps_completed (Counter) — ile kroków flow'u się udało
 *
 * Wyniki custom Trend będą widoczne w raporcie K6 jako osobne metryki
 * z avg, min, max, p(90), p(95).
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, ACCOUNTS } from '../config/index.ts';
import { login, authHeaders, AuthToken } from '../helpers/auth.ts';
import { checkResponse } from '../helpers/checks.ts';

// ─── Custom Metrics ───────────────────────────────────────
const bookingFlowDuration = new Trend('booking_flow_duration_ms', false);
const bookingFlowSeconds = new Trend('booking_flow_duration_seconds', false);
const bookingStepsCompleted = new Counter('booking_steps_completed');

export const options: Options = {
    vus: 5,
    duration: '20s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.05'],
        checks: ['rate>0.90'],
        booking_flow_duration_ms: ['p(95)<500'],
        booking_flow_duration_seconds: ['p(95)<1'],
    },
};

export function setup(): AuthToken {
    return login(ACCOUNTS.patient);
}

/**
 * Formatuje milisekundy do formatu HH:MM:SS.mmm
 */
function formatDuration(ms: number): string {
    const totalSeconds = ms / 1000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = seconds.toFixed(3).padStart(6, '0');

    return `${hh}:${mm}:${ss}`;
}

export default function (token: AuthToken): void {
    const flowStart = Date.now();

    // ── Step 1: Przeglądanie listy lekarzy ───────────────
    const doctorsRes = http.get(`${BASE_URL}/api/doctors`, {
        headers: authHeaders(token),
        tags: { name: 'booking_step_1_doctors_list' },
    });

    const step1Ok = checkResponse(doctorsRes, 'booking step 1 (doctors)', 200, 'doctors');
    if (step1Ok) bookingStepsCompleted.add(1);

    // Wyciągnij ID pierwszego lekarza (jeśli istnieje)
    let doctorId = 1;
    try {
        const body = doctorsRes.json() as { doctors: Array<{ id: number }> };
        if (body.doctors && body.doctors.length > 0) {
            doctorId = body.doctors[0].id;
        }
    } catch (_) {
        // fallback to default doctorId
    }

    sleep(0.2);

    // ── Step 2: Pobranie dostępnych slotów lekarza ───────
    const slotsRes = http.get(`${BASE_URL}/api/doctors/${doctorId}/slots`, {
        headers: authHeaders(token),
        tags: { name: 'booking_step_2_doctor_slots' },
    });

    const step2Ok = checkResponse(slotsRes, 'booking step 2 (slots)', 200, 'slots');
    if (step2Ok) bookingStepsCompleted.add(1);

    sleep(0.1);

    // ── Step 3: Symulacja rezerwacji (GET appointments) ───
    // UWAGA: Nie robimy prawdziwego POST bo zabrałoby to sloty.
    // Zamiast tego symulujemy „potwierdzenie" requestem GET do appointments
    // co oddaje realistyczny czas odpowiedzi endpointu z JOINami.
    const bookRes = http.get(`${BASE_URL}/api/appointments`, {
        headers: authHeaders(token),
        tags: { name: 'booking_step_3_confirm' },
    });

    const step3Ok = checkResponse(bookRes, 'booking step 3 (confirm)', 200, 'appointments');
    if (step3Ok) bookingStepsCompleted.add(1);

    // ── Pomiar całego flow ────────────────────────────────
    const flowEnd = Date.now();
    const flowDurationMs = flowEnd - flowStart;
    const flowDurationSeconds = flowDurationMs / 1000;

    // Zapisz do custom Trend (pojawi się w raporcie K6)
    bookingFlowDuration.add(flowDurationMs);
    bookingFlowSeconds.add(flowDurationSeconds);

    // Wydrukuj czas w konsoli
    console.log(
        `[Booking Flow] Duration: ${flowDurationMs}ms | ` +
        `${flowDurationSeconds.toFixed(3)}s | ` +
        `${formatDuration(flowDurationMs)}`
    );

    sleep(0.5);
}
