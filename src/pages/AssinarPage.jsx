import { useState, useEffect } from 'react';
import { api, userId, userSetor, exibirSetor, userName, jaAssinou, totalAssinaturas, URL_BASE, getToken } from '../api';
import { SignaturesBadge, Spinner, Empty } from '../components/UI';
import OSDetailPanel from '../components/OSDetailPanel';

export default function AssinarPage({ usuario, showAlert }) {
  const [oscs, setOscs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [progFilter, setProgFilter] = useState('');
  const [selectedOs, setSelectedOs] = useState(null);

  useEffect(() => { loadOscs(); }, []);

  useEffect(() => {
    const b = busca.trim().toLowerCase();
    const f = oscs.filter(o => {
      const okB = !b || (o.descricao || '').toLowerCase().includes(b) || (o.equipamento || '').toLowerCase().includes(b);
      const total = totalAssinaturas(o);
      return okB && (progFilter === '' || total === parseInt(progFilter));
    });
    setFiltered(f);
  }, [busca, progFilter, oscs]);

  async function loadOscs() {
    setLoading(true); setError('');
    try {
      const r = await api('GET', `/osc/gerente/${userId(usuario)}`);
      if (!r.ok) { setError(`Erro ${r.status}`); return; }
      setOscs(await r.json() || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function assinarOS(os) {
    if (!confirm(`Confirma assinatura da OS-${String(os.id).padStart(3, '0')}?\n\n${os.descricao}`)) return;
    try {
      const r = await fetch(`${URL_BASE}/osc/${os.id}/assinar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: String(userId(usuario)),
      });
      if (r.ok) {
        showAlert('OS assinada com sucesso!', 'success');
        setSelectedOs(null);
        loadOscs();
      } else if (r.status === 401) {
        showAlert('Sem permissão para assinar.');
      } else {
        showAlert(`Erro: ${await r.text()}`);
      }
    } catch (e) { showAlert(`Erro: ${e.message}`); }
  }

  function toggleDetail(os) {
    setSelectedOs(prev => prev?.id === os.id ? null : os);
  }

  const setor = exibirSetor(userSetor(usuario));

  return (
    <div className={selectedOs ? 'panel-open' : ''} style={{ position: 'relative' }}>
      {selectedOs && (
        <OSDetailPanel
          os={selectedOs}
          usuario={usuario}
          onClose={() => setSelectedOs(null)}
          onAssinar={assinarOS}
        />
      )}

      <div className="page-title">Assinar OS</div>
      <div className="page-sub">
        OSs pendentes — {setor} · {userName(usuario)}{' '}
        <span style={{ fontSize: 12, color: '#aaa' }}>· clique em uma linha para ver detalhes</span>
      </div>

      <div className="filter-bar">
        <input placeholder="🔍 Buscar..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select value={progFilter} onChange={e => setProgFilter(e.target.value)}>
          <option value="">Todos os progressos</option>
          <option value="0">0 assinaturas</option>
          <option value="1">1 assinatura</option>
          <option value="2">2 assinaturas</option>
        </select>
        <button className="btn-clear" onClick={() => { setBusca(''); setProgFilter(''); }}>✖ Limpar</button>
      </div>

      {loading ? <Spinner /> : error ? <div className="empty" style={{ color: 'red' }}>{error}</div> : (
        filtered.length === 0 ? (
          <Empty>✅ Nenhuma OS pendente para o seu setor.</Empty>
        ) : (
          <div className="table-wrap">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>ID</th>
                    <th>Descrição</th>
                    <th>Equipamento</th>
                    <th>Progresso</th>
                    <th>Status minha ass.</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => {
                    const total = totalAssinaturas(o);
                    const cls = total === 3 ? 'badge-green' : total > 0 ? 'badge-yellow' : 'badge-red';
                    const jaSig = jaAssinou(o, usuario);
                    const selected = selectedOs?.id === o.id;
                    return (
                      <tr key={o.id} className={`clickable ${selected ? 'row-selected' : ''}`} onClick={() => toggleDetail(o)}>
                        <td><strong>{o.id}</strong></td>
                        <td>{o.descricao || ''}</td>
                        <td>{o.equipamento || ''}</td>
                        <td><span className={`badge ${cls}`}>{total}/3</span></td>
                        <td>{jaSig ? <span className="badge badge-green">✅ Assinado</span> : <span className="badge badge-yellow">⏳ Pendente</span>}</td>
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
