import { useState, useEffect, useRef } from 'react';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController } from 'chart.js';
import { api, perfil, userId, userSetor, exibirSetor, ordemStatus, jaAssinou, statusInfo, totalAssinaturas } from '../api';
import { StatusBadge, SignaturesBadge, Spinner, Empty } from '../components/UI';
import OSDetailPanel from '../components/OSDetailPanel';
import AlertToast from '../components/AlertToast';

Chart.register(DoughnutController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function SummaryPanel({ lista }) {
  const counts = { aguardandoassinaturas: 0, aguardandovalidacao: 0, concluida: 0, cancelada: 0 };
  lista.forEach(o => { const k = String(o.status || '').toLowerCase(); if (k in counts) counts[k]++; });
  return (
    <div className="summary-card">
      <h3>Resumo</h3>
      <div className="summary-item"><span className="lbl">Total</span><span className="val" style={{ color: '#19234a' }}>{lista.length}</span></div>
      <div className="summary-item"><span className="lbl">Ag. Assinaturas</span><span className="val" style={{ color: '#a05a00' }}>{counts.aguardandoassinaturas}</span></div>
      <div className="summary-item"><span className="lbl">Ag. Validação</span><span className="val" style={{ color: '#1E50A0' }}>{counts.aguardandovalidacao}</span></div>
      <div className="summary-item"><span className="lbl">Concluídas</span><span className="val" style={{ color: '#00824a' }}>{counts.concluida}</span></div>
      <div className="summary-item"><span className="lbl">Canceladas</span><span className="val" style={{ color: '#aa1e1e' }}>{counts.cancelada}</span></div>
    </div>
  );
}

function Charts({ lista }) {
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const pieChart = useRef(null);
  const barChart = useRef(null);

  useEffect(() => {
  if (!pieRef.current || !barRef.current) return;

  const counts = { aguardandoassinaturas: 0, aguardandovalidacao: 0, concluida: 0, cancelada: 0 };
  lista.forEach(o => { const k = String(o.status || '').toLowerCase(); if (k in counts) counts[k]++; });
  const sigs = [0, 1, 2, 3].map(n => lista.filter(o => totalAssinaturas(o) === n).length);

  // ✅ CORREÇÃO: destruir E limpar a referência antes de recriar
  if (pieChart.current) { pieChart.current.destroy(); pieChart.current = null; }
  if (barChart.current) { barChart.current.destroy(); barChart.current = null; }

  pieChart.current = new Chart(pieRef.current, {
    type: 'doughnut',
    data: {
      labels: ['Ag. Assinaturas', 'Ag. Validação', 'Concluída', 'Cancelada'],
      datasets: [{ data: Object.values(counts), backgroundColor: ['#FFC33C', '#3C82D2', '#28AA5A', '#D23C3C'], borderWidth: 2, borderColor: '#fff' }],
    },
    options: { plugins: { legend: { position: 'right', labels: { font: { size: 10 }, boxWidth: 10 } } }, cutout: '55%', responsive: true, maintainAspectRatio: false },
  });

  barChart.current = new Chart(barRef.current, {
    type: 'bar',
    data: {
      labels: ['0 ass.', '1 ass.', '2 ass.', 'Todas'],
      datasets: [{ data: sigs, backgroundColor: ['#D23C3C', '#D28228', '#FFC33C', '#28AA5A'], borderRadius: 4 }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, responsive: true, maintainAspectRatio: false },
  });

  return () => {
    // ✅ CORREÇÃO: limpar referência no cleanup também
    if (pieChart.current) { pieChart.current.destroy(); pieChart.current = null; }
    if (barChart.current) { barChart.current.destroy(); barChart.current = null; }
  };
}, [lista]);

  return (
    <div className="charts-row">
      <div className="chart-card">
        <h3>Status das OSs</h3>
        <div style={{ height: 160 }}><canvas ref={pieRef} /></div>
      </div>
      <div className="chart-card">
        <h3>Progresso de Assinaturas</h3>
        <div style={{ height: 160 }}><canvas ref={barRef} /></div>
      </div>
      <SummaryPanel lista={lista} />
    </div>
  );
}

export default function DashboardPage({ usuario, showAlert }) {
  const [allOscs, setAllOscs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOs, setSelectedOs] = useState(null);

  const p = perfil(usuario);
  const isGer = p === 'gerente';
  const urlOsc = p === 'emitente' ? `/osc/emitente/${userId(usuario)}` : `/osc`;
  const subtitulo = p === 'emitente' ? 'Suas OSs criadas' : p === 'gerente' ? `OSs do setor ${exibirSetor(userSetor(usuario))}` : 'Todas as OSs';

  useEffect(() => {
    loadOscs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [busca, statusFilter, allOscs]);

  async function loadOscs() {
    setLoading(true); setError('');
    try {
      const r = await api('GET', urlOsc);
      if (!r.ok) { setError(`Erro ${r.status}`); return; }
      const data = (await r.json() || []).sort((a, b) => ordemStatus(a.status) - ordemStatus(b.status) || b.id - a.id);
      setAllOscs(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function applyFilters() {
    const b = busca.trim().toLowerCase();
    const f = allOscs.filter(o => {
      const okB = !b || (o.descricao || '').toLowerCase().includes(b) || (o.equipamento || '').toLowerCase().includes(b) || (o.emitenteNome || '').toLowerCase().includes(b);
      const okS = !statusFilter || String(o.status || '').toLowerCase() === statusFilter.toLowerCase();
      return okB && okS;
    });
    setFiltered(f);
  }

  return (
    <div style={{ position: 'relative' }}>
      {selectedOs && (
        <OSDetailPanel
          os={selectedOs}
          usuario={usuario}
          onClose={() => setSelectedOs(null)}
          onAssinar={() => {}} // read-only in dashboard
        />
      )}

      <div className="page-title">Dashboard</div>
      <div className="page-sub">{subtitulo}</div>

      {loading ? <Spinner /> : error ? <div className="empty" style={{ color: 'red' }}>{error}</div> : (
        <>
          <Charts lista={filtered} />

          <div className="filter-bar">
            <input placeholder="🔍 Descrição ou equipamento..." value={busca} onChange={e => setBusca(e.target.value)} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="AguardandoAssinaturas">Ag. Assinaturas</option>
              <option value="AguardandoValidacao">Ag. Validação</option>
              <option value="Concluida">Concluída</option>
              <option value="Cancelada">Cancelada</option>
            </select>
            <button className="btn-clear" onClick={() => { setBusca(''); setStatusFilter(''); }}>✖ Limpar</button>
          </div>

          {filtered.length === 0 ? (
            <Empty>Nenhuma OS encontrada.</Empty>
          ) : (
            <div className="table-wrap">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>ID</th>
                      <th>Descrição</th>
                      <th>Equipamento</th>
                      <th>Emitente</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Ass.</th>
                      {isGer && <th>Minha ass.</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(o => {
                      const dt = o.dataEmissao ? new Date(o.dataEmissao).toLocaleDateString('pt-BR') : '—';
                      const selected = selectedOs?.id === o.id;
                      return (
                        <tr key={o.id} className={`clickable ${selected ? 'row-selected' : ''}`} onClick={() => setSelectedOs(selected ? null : o)}>
                          <td><strong>{o.id}</strong></td>
                          <td>{o.descricao || ''}</td>
                          <td>{o.equipamento || ''}</td>
                          <td>{o.emitenteNome || ''}</td>
                          <td>{dt}</td>
                          <td><StatusBadge status={o.status} /></td>
                          <td><SignaturesBadge osc={o} /></td>
                          {isGer && <td>{jaAssinou(o, usuario) ? <span className="badge badge-green">✅</span> : <span className="badge badge-yellow">⏳</span>}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
