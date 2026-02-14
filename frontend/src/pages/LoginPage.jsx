import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user.role === 'DOCTOR') navigate('/doctor');
            else if (user.role === 'ADMIN') navigate('/admin');
            else navigate('/patient');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h1 className="auth-title">Med-Verify PRO</h1>
                <p className="auth-subtitle">Zaloguj się do swojego konta</p>

                {error && <div className="alert alert-error" data-testid="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            data-testid="login-email"
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="twoj@email.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-password">Hasło</label>
                        <input
                            id="login-password"
                            data-testid="login-password"
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        data-testid="login-submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={loading}
                    >
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Nie masz konta? <Link to="/register">Zarejestruj się</Link>
                </p>
            </div>
        </div>
    );
}
