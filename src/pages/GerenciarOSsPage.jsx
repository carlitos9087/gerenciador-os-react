import { useState, useEffect } from 'react';
import { api, userId, URL_BASE, getToken } from '../api';
import { StatusBadge, SignaturesBadge, Spinner, Empty } from '../components/UI';

export default function GerenciarOSsPage({ usuario, showAlert }) {
  const [oscs, setOscs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadOscs(); }, []);

  useEffect(() => {
    const b = busca.trim().toLowerCase();
    const f = oscs.filter(o => {
      const okB = !b || (o.descricao || '').toLowerCase().includes(b) || (o.equipamento || '').toLowerCase().includes(b) || (o.emitenteNome || '').toLowerCase().includes(b);
      const okS = !statusFilter || String(o.status || '').toLowerCase() === statusFilter;
      return okB && okS;
    });
    setFiltered(f);
  }, [busca, statusFilter, oscs]);

  async function loadOscs() {
    setLoading(true); setError('');
    try {
      const r = await api('GET', '/osc');
      if (!r.ok) { setError(`Erro ${r.status}`); return; }
      const all = await r.json() || [];
      setOscs(all.filter(o => {
        const s = String(o.status || '').toLowerCase();
        return s === 'aguardandoassinaturas' || s === 'aguardandovalidacao';
      }));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function acaoOsc(id, acao, desc) {
    const msg = acao === 'concluir'
      ? `Concluir OS-${String(id).padStart(3, '0')}?\n\n${desc}`
      : `Cancelar OS-${String(id).padStart(3, '0')}? Não pode ser desfeito.\n\n${desc}`;
    if (!confirm(msg)) return;
    try {
      const r = await fetch(`${URL_BASE}/osc/${id}/${acao}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: String(userId(usuario)),
      });
      if (r.ok) {
        showAlert(acao === 'concluir' ? 'OS concluída!' : 'OS cancelada!', 'success');
        loadOscs();
      } else {
        showAlert(`Erro: ${await r.text()}`);
      }
    } catch (e) { showAlert(`Erro: ${e.message}`); }
  }

  return (
    <div>
      <div className="page-title">🛠️ Gerenciar OSs</div>
      <div className="page-sub">Conclua ou cancele OSs ativas</div>

      <div className="filter-bar">
        <input placeholder="🔍 Buscar..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="aguardandoassinaturas">Ag. Assinaturas</option>
          <option value="aguardandovalidacao">Ag. Validação</option>
        </select>
        <button className="btn-clear" onClick={() => { setBusca(''); setStatusFilter(''); }}>✖ Limpar</button>
      </div>

      {loading ? <Spinner /> : error ? <div className="empty" style={{ color: 'red' }}>{error}</div> : (
        filtered.length === 0 ? (
          <Empty>Nenhuma OS ativa.</Empty>
        ) : (
          <div className="table-wrap">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>ID</th>
                    <th>Descrição</th>
                    <th>Emitente</th>
                    <th>Status</th>
                    <th>Ass.</th>
                    <th style={{ width: 160 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => {
                    const podeConc = String(o.status || '').toLowerCase() === 'aguardandovalidacao';
                    return (
                      <tr key={o.id}>
                        <td><strong>{o.id}</strong></td>
                        <td>{o.descricao || ''}</td>
                        <td>{o.emitenteNome || ''}</td>
                        <td><StatusBadge status={o.status} /></td>
                        <td><SignaturesBadge osc={o} /></td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="btn-sm-green"
                              disabled={!podeConc}
                              title={!podeConc ? 'Aguarda assinaturas' : ''}
                              onClick={() => acaoOsc(o.id, 'concluir', o.descricao)}
                            >✅ Concluir</button>
                            <button
                              className="btn-sm-red"
                              onClick={() => acaoOsc(o.id, 'cancelar', o.descricao)}
                            >❌ Cancelar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
