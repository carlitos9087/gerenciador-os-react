import { statusInfo, totalAssinaturas } from '../api';

export function StatusBadge({ status }) {
  const info = statusInfo(status);
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
}

export function SignaturesBadge({ osc }) {
  const total = totalAssinaturas(osc);
  const cls = total === 3 ? 'badge-green' : total > 0 ? 'badge-yellow' : 'badge-red';
  const q = osc.qualidadeAssinou ? '✅' : '⏳';
  const e = osc.engenhariaAssinou ? '✅' : '⏳';
  const p = osc.producaoAssinou ? '✅' : '⏳';
  return (
    <>
      <span className={`badge ${cls}`}>{total}/3</span>{' '}
      <small style={{ color: '#888' }}>G{q}M{e}O{p}</small>
    </>
  );
}

export function Spinner() {
  return (
    <div className="loading">
      <div className="spinner" />
      Carregando...
    </div>
  );
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}
