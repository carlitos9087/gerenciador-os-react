import { statusInfo, totalAssinaturas, jaAssinou } from '../api';
import { StatusBadge } from './UI';

export default function OSDetailPanel({ os, usuario, onClose, onAssinar }) {
  if (!os) return null;

  const dt = os.dataEmissao ? new Date(os.dataEmissao).toLocaleString('pt-BR') : '—';
  const jaSig = jaAssinou(os, usuario);
  const total = totalAssinaturas(os);

  const sigItems = [
    { label: 'Garantia Val.', signed: os.qualidadeAssinou },
    { label: 'Mecatrônica',   signed: os.engenhariaAssinou },
    { label: 'Operação',      signed: os.producaoAssinou },
  ];

  return (
    <div className="os-detail-panel open">
      <div className="panel-header">
        <h3>OS-{String(os.id).padStart(3, '0')}</h3>
        <button className="btn-close-panel" onClick={onClose} title="Fechar">✕</button>
      </div>

      <div className="panel-body">
        <div className="detail-section">
          <div className="detail-section-title">Identificação</div>
          <div className="detail-row">
            <span className="dl">Número</span>
            <span className="dv">OS-{String(os.id).padStart(3, '0')}</span>
          </div>
          <div className="detail-row">
            <span className="dl">Status</span>
            <span className="dv"><StatusBadge status={os.status} /></span>
          </div>
          <div className="detail-row">
            <span className="dl">Data de Emissão</span>
            <span className="dv">{dt}</span>
          </div>
          <div className="detail-row">
            <span className="dl">Emitente</span>
            <span className="dv">{os.emitenteNome || '—'}</span>
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-section-title">Informações</div>
          <div className="detail-row">
            <span className="dl">Equipamento</span>
            <span className="dv">{os.equipamento || '—'}</span>
          </div>
          <div className="detail-row">
            <span className="dl">Descrição</span>
            <span className="dv texto">{os.descricao || '—'}</span>
          </div>
          <div className="detail-row">
            <span className="dl">Ação Tomada</span>
            <span className="dv texto">{os.acaoTomada || '—'}</span>
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-section-title">Assinaturas</div>
          <div className="sig-grid">
            {sigItems.map((s) => (
              <div key={s.label} className={`sig-item ${s.signed ? 'signed' : 'pending'}`}>
                <div className="si-label">{s.label}</div>
                <div className="si-icon">{s.signed ? '✅' : '⏳'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-footer">
        {jaSig ? (
          <button className="btn-sign" disabled>✅ Seu setor já assinou</button>
        ) : (
          <button className="btn-sign" onClick={() => onAssinar(os)}>
            ✍️ Assinar esta OS
          </button>
        )}
      </div>
    </div>
  );
}
