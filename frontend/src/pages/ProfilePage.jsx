import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: ''
    });
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch('/api/profile', { credentials: 'include' });
            const data = await res.json();
            if (data.user) {
                setFormData({
                    full_name: data.user.full_name || '',
                    email: data.user.email || '',
                    phone_number: data.user.phone_number || ''
                });
                if (data.user.avatar_url) {
                    setPreview(data.user.avatar_url);
                }
            }
        } catch (err) {
            setError('Błąd pobierania profilu.');
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        setError(''); setMessage('');
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage('Profil zaktualizowany pomyślnie.');
            await refreshUser();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await fetch('/api/profile/avatar', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage('Avatar zaktualizowany.');
            await refreshUser();
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) return <div className="loading">Ładowanie...</div>;

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Med-Verify PRO</div>
                <div className="navbar-user">
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>Wróć</button>
                </div>
            </nav>

            <div className="card" style={{ maxWidth: 800, margin: '40px auto' }}>
                <div className="section-header">
                    <h1 className="section-title">Edycja Profilu</h1>
                    <p className="section-subtitle">Zaktualizuj swoje dane osobowe i zdjęcie</p>
                </div>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 250, textAlign: 'center' }}>
                        <div style={{
                            width: 150, height: 150, borderRadius: '50%',
                            background: 'var(--bg-glass)', border: '2px solid var(--border-accent)',
                            margin: '0 auto 20px', overflow: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {preview ? (
                                <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>👤</span>
                            )}
                        </div>
                        <label className="btn btn-outline btn-sm">
                            Zmień zdjęcie
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
                        </label>
                    </div>

                    <div style={{ flex: 2, minWidth: 300 }}>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label className="form-label">Imię i Nazwisko</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Numer Telefonu</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    placeholder="+48 000 000 000"
                                />
                            </div>
                            <div style={{ marginTop: 20, textAlign: 'right' }}>
                                <button type="submit" className="btn btn-primary">Zapisz zmiany</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
