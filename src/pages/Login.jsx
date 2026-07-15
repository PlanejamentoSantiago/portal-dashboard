import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error } = await login(email, password);
    setBusy(false);
    if (error) {
      setError('E-mail ou senha inválidos.');
    } else {
      navigate('/');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'radial-gradient(circle at 30% 20%, #1f4f9c 0%, #153d7a 45%, #0f2c57 100%)',
        flexDirection: 'column',
        padding: 20,
      }}
    >
      <img src={logo} alt="Santiago Advogados" style={{ width: 230, marginBottom: 28 }} />

      <form
        onSubmit={handleLogin}
        style={{
          background: '#fff',
          padding: 36,
          borderRadius: 18,
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          width: 360,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 4, fontSize: 20 }}>Portal de BI</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 26 }}>
          Acesse seus dashboards
        </p>

        <label style={labelStyle}>E-mail</label>
        <div style={inputWrap}>
          <Mail size={18} color="#94a3b8" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            style={inputStyle}
            required
          />
        </div>

        <label style={{ ...labelStyle, marginTop: 16 }}>Senha</label>
        <div style={inputWrap}>
          <Lock size={18} color="#94a3b8" />
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
            required
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
            aria-label="Mostrar senha"
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: 13, marginTop: 14 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 24, padding: 13 }} disabled={busy}>
          {busy ? 'Entrando...' : <>Entrar <LogIn size={17} /></>}
        </button>
      </form>

      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5, marginTop: 22 }}>
        © {new Date().getFullYear()} Santiago Advogados Associados
      </p>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: 6, color: '#374151', fontWeight: 600, fontSize: 13 };
const inputWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  padding: '11px 14px',
};
const inputStyle = { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: 14.5, color: '#111827' };
