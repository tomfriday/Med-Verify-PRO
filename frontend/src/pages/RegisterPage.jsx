import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(email, password, fullName);
            navigate('/patient');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h1 className="auth-title">Rejestracja</h1>
                <p className="auth-subtitle">Utwórz konto pacjenta</p>

                {error && <div className="alert alert-error" data-testid="register-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="register-name">Imię i nazwisko</label>
                        <input
                            id="register-name"
                            data-testid="register-name"
                            className="form-input"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jan Kowalski"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="register-email">Email</label>
                        <input
                            id="register-email"
                            data-testid="register-email"
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="twoj@email.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="register-password">Hasło</label>
                        <input
                            id="register-password"
                            data-testid="register-password"
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="min. 6 znaków"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        data-testid="register-submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={loading}
                    >
                        {loading ? 'Rejestracja...' : 'Zarejestruj się'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Masz już konto? <Link to="/login">Zaloguj się</Link>
                </p>
            </div>
        </div>
    );
}
