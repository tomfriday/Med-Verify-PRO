import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [logPage, setLogPage] = useState(1);
    const [logPagination, setLogPagination] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { if (activeTab === 'logs') fetchLogs(); }, [activeTab, logPage]);

    async function fetchStats() {
        try {
            const res = await fetch('/api/admin/stats', { credentials: 'include' });
            const data = await res.json();
            setStats(data.stats);
        } catch (err) {
            console.error('Stats error:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchLogs() {
        try {
            const res = await fetch(`/api/admin/audit-logs?page=${logPage}&limit=20`, { credentials: 'include' });
            const data = await res.json();
            setLogs(data.logs || []);
            setLogPagination(data.pagination || {});
        } catch (err) {
            console.error('Logs error:', err);
        }
    }

    function formatDate(iso) {
        return new Date(iso).toLocaleString('pl-PL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="navbar-brand">Med-Verify PRO</div>
                <div className="navbar-user">
                    <div className="navbar-profile" onClick={() => navigate('/profile')}>
                        <div className="navbar-avatar">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" />
                            ) : (
                                <span>👤</span>
                            )}
                        </div>
                        <span className="navbar-name">{user.full_name}</span>
                    </div>
                    <span className="navbar-role" data-testid="user-role">ADMIN</span>
                    <button className="btn btn-logout btn-sm" onClick={logout} data-testid="logout-btn">Wyloguj</button>
                </div>
            </nav>

            <div className="tabs" data-testid="admin-tabs">
                <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')} data-testid="tab-stats">
                    Statystyki
                </button>
                <button className={`tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')} data-testid="tab-logs">
                    Logi Systemowe
                </button>
            </div>

            {/* === Stats Tab === */}
            {activeTab === 'stats' && (
                <div>
                    <div className="section-header">
                        <h1 className="section-title">Panel Administracyjny</h1>
                        <p className="section-subtitle">Przegląd statystyk systemu</p>
                    </div>

                    {loading ? (
                        <div className="loading">Ładowanie statystyk...</div>
                    ) : stats && (
                        <>
                            <div className="grid-stats" data-testid="stats-grid">
                                <div className="card stat-card" data-testid="stat-total-users">
                                    <div className="stat-value">{stats.users.total}</div>
                                    <div className="stat-label">Użytkownicy</div>
                                </div>
                                <div className="card stat-card" data-testid="stat-doctors">
                                    <div className="stat-value">{stats.users.doctors}</div>
                                    <div className="stat-label">Lekarze</div>
                                </div>
                                <div className="card stat-card" data-testid="stat-patients">
                                    <div className="stat-value">{stats.users.patients}</div>
                                    <div className="stat-label">Pacjenci</div>
                                </div>
                                <div className="card stat-card" data-testid="stat-total-appointments">
                                    <div className="stat-value">{stats.appointments.total}</div>
                                    <div className="stat-label">Wizyty</div>
                                </div>
                            </div>

                            <div className="card" data-testid="appointment-stats">
                                <h3 style={{ fontSize: '0.9rem', marginBottom: 14, color: 'var(--text-secondary)' }}>Wizyty wg statusu</h3>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {Object.entries(stats.appointments.byStatus || {}).map(([status, count]) => (
                                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* === Logs Tab === */}
            {activeTab === 'logs' && (
                <div>
                    <div className="section-header">
                        <h1 className="section-title">Logi Systemowe</h1>
                        <p className="section-subtitle">Audit trail — wszystkie zdarzenia systemu</p>
                    </div>
                    <div className="table-wrapper card" data-testid="audit-logs-table">
                        <table>
                            <thead>
                                <tr><th>Data</th><th>Użytkownik</th><th>Akcja</th><th>Zasób</th><th>Szczegóły</th><th>IP</th></tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} data-testid={`audit-log-row-${log.id}`}>
                                        <td>{formatDate(log.created_at)}</td>
                                        <td>{log.user_name || log.user_email || '—'}</td>
                                        <td>
                                            <span style={{
                                                color: log.action.includes('UNAUTHORIZED') ? 'var(--danger)' : 'var(--accent-teal)',
                                                fontWeight: 600, fontSize: '0.75rem'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>{log.resource}</td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {log.details}
                                        </td>
                                        <td>{log.ip_address}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {logPagination.pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                                disabled={logPage <= 1}
                            >
                                ← Poprzednia
                            </button>
                            <span style={{ alignSelf: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                Strona {logPage} z {logPagination.pages}
                            </span>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setLogPage(p => p + 1)}
                                disabled={logPage >= logPagination.pages}
                            >
                                Następna →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
