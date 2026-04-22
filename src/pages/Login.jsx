import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await login(email, password);

    if (error) {
      alert("Erro ao logar: " + error.message);
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
        background: 'linear-gradient(135deg, #153d7a, #0f2c57)',
        flexDirection: 'column'
      }}
    >
      {/* LOGO */}
      <img
        src={logo}
        alt="Logo"
        style={{
          width: '260px',
          height: 'auto',
          marginBottom: '30px'
        }}
      />

      {/* CARD */}
      <form
        onSubmit={handleLogin}
        style={{
          background: '#ffffff',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          width: '340px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '25px',
            color: '#1f2937'
          }}
        >
          Portal de Dashboards
        </h2>

        {/* EMAIL */}
        <div style={{ marginBottom: '15px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              color: '#374151',
              fontWeight: '500'
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              fontWeight:'bold',
              width: '100%',
              padding: '11px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#f9fafb', // 🔥 fundo suave
              color: '#111827',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid #c8a24a';
              e.target.style.boxShadow = '0 0 0 2px rgba(200,162,74,0.2)';
              e.target.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid #d1d5db';
              e.target.style.boxShadow = 'none';
              e.target.style.background = '#f9fafb';
            }}
            required
          />
        </div>

        {/* SENHA */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              color: '#374151',
              fontWeight: '500'
            }}
          >
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              color: '#111827',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid #c8a24a';
              e.target.style.boxShadow = '0 0 0 2px rgba(200,162,74,0.2)';
              e.target.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid #d1d5db';
              e.target.style.boxShadow = 'none';
              e.target.style.background = '#f9fafb';
            }}
            required
          />
        </div>

        {/* BOTÃO */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            background: '#0f2c57',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#1f4f9c'}
          onMouseOut={(e) => e.target.style.background = '#0f2c57'}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}