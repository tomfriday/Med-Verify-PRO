import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DoctorDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('appointments');
    const [appointments, setAppointments] = useState([]);
    const [slots, setSlots] = useState([]);
    const [slotDate, setSlotDate] = useState('');
    const [startHour, setStartHour] = useState(9);
    const [endHour, setEndHour] = useState(17);
    const [duration, setDuration] = useState(15);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        fetchAppointments();
        fetchSlots();
    }, []);

    async function fetchAppointments() {
        try {
            const res = await fetch('/api/appointments', { credentials: 'include' });
            const data = await res.json();
            setAppointments(data.appointments || []);
        } catch (err) { setError('Błąd ładowania wizyt.'); }
    }

    async function fetchSlots() {
        try {
            const res = await fetch('/api/doctors/slots', { credentials: 'include' });
            const data = await res.json();
            setSlots(data.slots || []);
        } catch (err) { setError('Błąd ładowania slotów.'); }
    }

    async function createSlots(e) {
        e.preventDefault();
        setError(''); setMessage('');
        try {
            const res = await fetch('/api/doctors/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ date: slotDate, startHour, endHour, durationMinutes: duration })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage(data.message);
            fetchSlots();
        } catch (err) { setError(err.message); }
    }

    async function updateStatus(id, status) {
        setError(''); setMessage('');
        try {
            const res = await fetch(`/api/appointments/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage(data.message);
            fetchAppointments();
        } catch (err) { setError(err.message); }
    }

    async function loadNotes(appointmentId) {
        setSelectedAppointmentId(appointmentId);
        try {
            const res = await fetch(`/api/appointments/${appointmentId}/notes`, { credentials: 'include' });
            const data = await res.json();
            setNotes(data.notes || []);
        } catch (err) { setError('Błąd ładowania notatek.'); }
    }

    async function addNote(e) {
        e.preventDefault();
        setError(''); setMessage('');
        try {
            const res = await fetch(`/api/appointments/${selectedAppointmentId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: noteContent })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage('Notatka dodana.');
            setNoteContent('');
            loadNotes(selectedAppointmentId);
        } catch (err) { setError(err.message); }
    }

    function formatDate(iso) {
        return new Date(iso).toLocaleString('pl-PL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function getBadgeClass(status) {
        return `badge badge-${status.toLowerCase()}`;
    }

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="navbar-brand">Med-Verify PRO</div>
                <div className="navbar-user">
                    <span style={{ fontSize: '0.85rem' }}>{user.full_name}</span>
                    <span className="navbar-role" data-testid="user-role">LEKARZ</span>
                    <button className="btn btn-logout btn-sm" onClick={logout} data-testid="logout-btn">Wyloguj</button>
                </div>
            </nav>

            <div className="tabs" data-testid="doctor-tabs">
                <button className={`tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')} data-testid="tab-appointments">
                    Wizyty
                </button>
                <button className={`tab ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => setActiveTab('slots')} data-testid="tab-slots">
                    Harmonogram
                </button>
                <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')} data-testid="tab-notes">
                    Notatki
                </button>
            </div>

            {message && <div className="alert alert-success" data-testid="alert-success">{message}</div>}
            {error && <div className="alert alert-error" data-testid="alert-error">{error}</div>}

            {/* === Appointments Tab === */}
            {activeTab === 'appointments' && (
                <div>
                    <div className="section-header">
                        <h1 className="section-title">Wizyty Pacjentów</h1>
                        <p className="section-subtitle">Zarządzaj statusami wizyt</p>
                    </div>
                    <div className="table-wrapper card" data-testid="doctor-appointments-table">
                        <table>
                            <thead>
                                <tr><th>Pacjent</th><th>Termin</th><th>Status</th><th>Akcje</th></tr>
                            </thead>
                            <tbody>
                                {appointments.map((apt) => (
                                    <tr key={apt.id} data-testid={`appointment-row-${apt.id}`}>
                                        <td>{apt.patient_name}</td>
                                        <td>{formatDate(apt.start_time)}</td>
                                        <td>
                                            <span className={getBadgeClass(apt.status)} data-testid={`appointment-status-${apt.status}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {apt.status === 'PENDING' && (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => updateStatus(apt.id, 'CONFIRMED')} data-testid={`confirm-${apt.id}`}>Potwierdź</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(apt.id, 'CANCELLED')} data-testid={`cancel-${apt.id}`}>Odwołaj</button>
                                                </>
                                            )}
                                            {apt.status === 'CONFIRMED' && (
                                                <>
                                                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(apt.id, 'COMPLETED')} data-testid={`complete-${apt.id}`}>Zakończ</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(apt.id, 'CANCELLED')} data-testid={`cancel-${apt.id}`}>Odwołaj</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {appointments.length === 0 && (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Brak wizyt</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* === Slots Tab === */}
            {activeTab === 'slots' && (
                <div>
                    <div className="section-header">
                        <h1 className="section-title">Harmonogram</h1>
                        <p className="section-subtitle">Twórz sloty czasowe dla pacjentów</p>
                    </div>
                    <div className="card" style={{ marginBottom: 24 }}>
                        <form onSubmit={createSlots} className="filters-bar" style={{ margin: 0, padding: 0 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Data</label>
                                <input type="date" className="form-input" data-testid="slot-date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Od godz.</label>
                                <input type="number" className="form-input" data-testid="slot-start" value={startHour} onChange={(e) => setStartHour(+e.target.value)} min={0} max={23} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Do godz.</label>
                                <input type="number" className="form-input" data-testid="slot-end" value={endHour} onChange={(e) => setEndHour(+e.target.value)} min={1} max={24} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Czas (min)</label>
                                <input type="number" className="form-input" data-testid="slot-duration" value={duration} onChange={(e) => setDuration(+e.target.value)} min={5} max={60} />
                            </div>
                            <button type="submit" className="btn btn-primary" data-testid="create-slots-btn" style={{ alignSelf: 'flex-end' }}>Utwórz sloty</button>
                        </form>
                    </div>
                    <div className="card">
                        <h3 style={{ fontSize: '0.9rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Istniejące sloty ({slots.length})</h3>
                        <div className="slots-grid" data-testid="existing-slots">
                            {slots.slice(0, 40).map((s) => (
                                <span key={s.id} className="slot-btn" style={{ cursor: 'default', opacity: s.is_available ? 1 : 0.4 }} data-testid={`slot-${s.id}`}>
                                    {formatDate(s.start_time)} {s.is_available ? '' : '(zajęty)'}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* === Notes Tab === */}
            {activeTab === 'notes' && (
                <div>
                    <div className="section-header">
                        <h1 className="section-title">Notatki Lekarskie</h1>
                        <p className="section-subtitle">Wybierz zakończoną wizytę, aby dodać notatkę</p>
                    </div>
                    <div className="grid-2">
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Zakończone wizyty</h3>
                            {appointments.filter(a => a.status === 'COMPLETED').map((apt) => (
                                <div
                                    key={apt.id}
                                    className="card"
                                    style={{ marginBottom: 8, cursor: 'pointer', borderColor: selectedAppointmentId === apt.id ? 'var(--accent-blue)' : undefined }}
                                    onClick={() => loadNotes(apt.id)}
                                    data-testid={`notes-appointment-${apt.id}`}
                                >
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{apt.patient_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(apt.start_time)}</div>
                                </div>
                            ))}
                            {appointments.filter(a => a.status === 'COMPLETED').length === 0 && (
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Brak zakończonych wizyt</p>
                            )}
                        </div>
                        <div>
                            {selectedAppointmentId && (
                                <div className="card" data-testid="notes-panel">
                                    <h3 style={{ fontSize: '0.9rem', marginBottom: 12, color: 'var(--text-secondary)' }}>Notatki</h3>
                                    {notes.map((note) => (
                                        <div key={note.id} className="card note-card" data-testid={`note-${note.id}`}>
                                            <div className="note-content">{note.content}</div>
                                            <div className="note-meta">{formatDate(note.created_at)}</div>
                                        </div>
                                    ))}
                                    <form onSubmit={addNote} style={{ marginTop: 12 }}>
                                        <textarea
                                            className="form-input"
                                            data-testid="note-content"
                                            rows={3}
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            placeholder="Treść notatki..."
                                            required
                                        />
                                        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 8 }} data-testid="add-note-btn">Dodaj notatkę</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
