import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PatientDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('search');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [specialization, setSpecialization] = useState('');
    const [searchName, setSearchName] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [slots, setSlots] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal potwierdzenia rezerwacji
    const [confirmModal, setConfirmModal] = useState(null); // { slotId, slotTime, doctorName }

    useEffect(() => { searchDoctors(); }, [specialization, sortBy, sortOrder]);
    useEffect(() => { if (activeTab === 'appointments') fetchAppointments(); }, [activeTab]);

    // Debounced name search
    useEffect(() => {
        const timeout = setTimeout(() => { searchDoctors(); }, 400);
        return () => clearTimeout(timeout);
    }, [searchName]);

    async function searchDoctors() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (specialization) params.set('specialization', specialization);
            if (searchName.trim()) params.set('search', searchName.trim());
            if (sortBy) { params.set('sortBy', sortBy); params.set('order', sortOrder); }
            const res = await fetch(`/api/doctors?${params}`, { credentials: 'include' });
            const data = await res.json();
            setDoctors(data.doctors || []);
        } catch (err) {
            setError('Błąd ładowania lekarzy.');
        } finally {
            setLoading(false);
        }
    }

    async function fetchAppointments() {
        try {
            const res = await fetch('/api/appointments', { credentials: 'include' });
            const data = await res.json();
            setAppointments(data.appointments || []);
        } catch (err) {
            setError('Błąd ładowania wizyt.');
        }
    }

    async function loadSlots(doctorId) {
        setSelectedDoctor(selectedDoctor === doctorId ? null : doctorId);
        try {
            const res = await fetch(`/api/doctors/${doctorId}/slots`, { credentials: 'include' });
            const data = await res.json();
            setSlots(data.slots || []);
        } catch (err) {
            setError('Błąd ładowania slotów.');
        }
    }

    function handleSlotClick(slotId, slotTime, doctorName) {
        setConfirmModal({ slotId, slotTime, doctorName });
    }

    async function confirmBooking() {
        if (!confirmModal) return;
        setMessage(''); setError('');
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ slot_id: confirmModal.slotId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage('Wizyta zarezerwowana!');
            setConfirmModal(null);
            loadSlots(selectedDoctor);
        } catch (err) {
            setError(err.message);
            setConfirmModal(null);
        }
    }

    async function cancelAppointment(id) {
        setMessage(''); setError('');
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage('Wizyta anulowana.');
            fetchAppointments();
        } catch (err) {
            setError(err.message);
        }
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
                    <span className="navbar-role" data-testid="user-role">PACJENT</span>
                    <button className="btn btn-logout btn-sm" onClick={logout} data-testid="logout-btn">Wyloguj</button>
                </div>
            </nav>

            <div className="tabs" data-testid="patient-tabs">
                <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')} data-testid="tab-search">
                    Szukaj Lekarzy
                </button>
                <button className={`tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')} data-testid="tab-appointments">
                    Moje Wizyty
                </button>
            </div>

            {message && <div className="alert alert-success" data-testid="alert-success">{message}</div>}
            {error && <div className="alert alert-error" data-testid="alert-error">{error}</div>}

            {activeTab === 'search' && (
                <div>
                    <div className="section-header">
                        <h1 className="section-title">Wyszukaj Lekarza</h1>
                        <p className="section-subtitle">Szukaj po nazwisku, filtruj po specjalizacji, sortuj po cenie lub ocenie</p>
                    </div>

                    <div className="card filters-bar" data-testid="filters-bar">
                        <div className="form-group" style={{ flex: 2, minWidth: 220, marginBottom: 0 }}>
                            <label className="form-label">Szukaj lekarza</label>
                            <input
                                type="text"
                                className="form-input"
                                data-testid="search-name"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                placeholder="Wpisz imię lub nazwisko..."
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
                            <label className="form-label">Specjalizacja</label>
                            <select
                                className="form-select"
                                data-testid="search-specialization"
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                            >
                                <option value="">Wszystkie</option>
                                <option value="Internista">Internista</option>
                                <option value="Kardiolog">Kardiolog</option>
                                <option value="Neurolog">Neurolog</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: 150, marginBottom: 0 }}>
                            <label className="form-label">Sortuj wg</label>
                            <select
                                className="form-select"
                                data-testid="sort-by"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="">Domyślnie</option>
                                <option value="price">Cena</option>
                                <option value="rating">Ocena</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: 120, marginBottom: 0 }}>
                            <label className="form-label">Kolejność</label>
                            <select
                                className="form-select"
                                data-testid="sort-order"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="asc">Rosnąco</option>
                                <option value="desc">Malejąco</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">Ładowanie wyników...</div>
                    ) : (
                        <div className="grid-2" data-testid="doctors-list">
                            {doctors.map((doc) => (
                                <div key={doc.id} className="card doctor-card" data-testid={`doctor-card-${doc.id}`}>
                                    <div className="doctor-name" data-testid={`doctor-name-${doc.id}`}>{doc.full_name}</div>
                                    <div className="doctor-specialization" data-testid={`doctor-specialization-${doc.id}`}>
                                        {doc.specialization}
                                    </div>
                                    <div className="doctor-meta">
                                        <span className="doctor-price" data-testid={`doctor-price-${doc.id}`}>{doc.price} PLN</span>
                                        <span className="doctor-rating" data-testid={`doctor-rating-${doc.id}`}>★ {doc.rating}</span>
                                    </div>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        style={{ marginTop: 14 }}
                                        onClick={() => loadSlots(doc.id)}
                                        data-testid={`doctor-slots-btn-${doc.id}`}
                                    >
                                        {selectedDoctor === doc.id ? 'Ukryj terminy' : 'Pokaż wolne terminy'}
                                    </button>

                                    {selectedDoctor === doc.id && (
                                        <div className="slots-grid" data-testid={`slots-grid-${doc.id}`}>
                                            {slots.length === 0 ? (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Brak wolnych terminów</span>
                                            ) : (
                                                slots.map((slot) => (
                                                    <button
                                                        key={slot.id}
                                                        className="slot-btn"
                                                        data-testid={`slot-${slot.id}`}
                                                        onClick={() => handleSlotClick(slot.id, slot.start_time, doc.full_name)}
                                                    >
                                                        {formatDate(slot.start_time)}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {doctors.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: 20 }}>
                                    Nie znaleziono lekarzy dla wybranych filtrów.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'appointments' && (
                <div>
                    <div className="section-header">
                        <h1 className="section-title">Moje Wizyty</h1>
                        <p className="section-subtitle">Przeglądaj i zarządzaj swoimi wizytami</p>
                    </div>

                    <div className="table-wrapper card" data-testid="appointments-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Lekarz</th>
                                    <th>Specjalizacja</th>
                                    <th>Termin</th>
                                    <th>Status</th>
                                    <th>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((apt) => (
                                    <tr key={apt.id} data-testid={`appointment-row-${apt.id}`}>
                                        <td>{apt.doctor_name}</td>
                                        <td>{apt.doctor_specialization}</td>
                                        <td>{formatDate(apt.start_time)}</td>
                                        <td>
                                            <span className={getBadgeClass(apt.status)} data-testid={`appointment-status-${apt.status}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td>
                                            {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => cancelAppointment(apt.id)}
                                                    data-testid={`cancel-appointment-${apt.id}`}
                                                >
                                                    Anuluj
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {appointments.length === 0 && (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Brak wizyt</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* === Modal potwierdzenia rezerwacji === */}
            {confirmModal && (
                <div className="modal-overlay" data-testid="confirm-modal-overlay" onClick={() => setConfirmModal(null)}>
                    <div className="modal-content" data-testid="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Potwierdź rezerwację</h2>
                        <div className="modal-body">
                            <p>Czy na pewno chcesz zarezerwować wizytę?</p>
                            <div className="modal-details">
                                <div className="modal-detail-row">
                                    <span className="modal-label">Lekarz:</span>
                                    <span className="modal-value">{confirmModal.doctorName}</span>
                                </div>
                                <div className="modal-detail-row">
                                    <span className="modal-label">Termin:</span>
                                    <span className="modal-value">{formatDate(confirmModal.slotTime)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => setConfirmModal(null)}
                                data-testid="confirm-modal-cancel"
                            >
                                Anuluj
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={confirmBooking}
                                data-testid="confirm-modal-accept"
                            >
                                Zarezerwuj wizytę
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
