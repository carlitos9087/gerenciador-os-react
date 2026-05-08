import { useState } from 'react';
import { URL_BASE, setAuth } from '../api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function fazerLogin() {
    setError(''); setSuccess('');
    if (!email || !senha) { setError('Digite o e-mail e a senha.'); return; }

    setLoading(true);
    try {
      const resp = await fetch(`${URL_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const text = await resp.text();
      let data = null;
      try { data = JSON.parse(text); } catch (_) {}

      if (resp.ok && data) {
        const u = data.usuario || data.Usuario || {};
        const token = data.token || data.Token || '';
        setAuth(token, u);
        setSuccess('Login realizado com sucesso!');
        setTimeout(() => onLogin(), 800);
      } else if (resp.status === 401) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(`Erro da API: ${resp.status}`);
      }
    } catch (err) {
      setError(`Falha na conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') fazerLogin();
  }

  return (
    <div className="login-body">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <h1>Gerenciador de OS</h1>
          <p className="subtitle">Faça login para continuar</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="field">
          <label>E-mail</label>
          <div className="input-wrap">
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') document.getElementById('pw-input').focus(); }}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field">
          <label>Senha</label>
          <div className="input-wrap">
            <input
              id="pw-input"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ paddingRight: 40 }}
              autoComplete="current-password"
            />
            <button className="toggle-pw" type="button" onClick={() => setShowPw(v => !v)}>
              {showPw ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button className="btn-login" onClick={fazerLogin} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}
