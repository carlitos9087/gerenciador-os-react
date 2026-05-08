import { useState, useEffect } from 'react';
import { api, perfil, userId, userName, ordemStatus, statusInfo, totalAssinaturas } from '../api';
import { Spinner, Empty } from '../components/UI';

function dotClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'concluida') return 'dot-green';
  if (s === 'cancelada') return 'dot-red';
  if (s === 'aguardandovalidacao') return 'dot-blue';
  return 'dot-yellow';
}

const STATUS_LABELS = {
  aguardandoassinaturas: 'Ag. Assinaturas',
  aguardandovalidacao: 'Ag. Validação',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export default function ExportarPage({ usuario }) {
  const [oscs, setOscs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(new Set());

  useEffect(() => { loadOscs(); }, []);

  useEffect(() => {
    const b = busca.trim().toLowerCase();
    const f = oscs.filter(o => {
      const okB = !b || (o.descricao || '').toLowerCase().includes(b) || (o.equipamento || '').toLowerCase().includes(b) || (o.emitenteNome || '').toLowerCase().includes(b);
      const okS = !statusFilter || String(o.status || '').toLowerCase() === statusFilter;
      return okB && okS;
    });
    setFiltered(f);
    // Reset selection when filter changes
    setSelected(new Set());
  }, [busca, statusFilter, oscs]);

  async function loadOscs() {
    setLoading(true); setError('');
    try {
      const p = perfil(usuario);
      const url = p === 'emitente' ? `/osc/emitente/${userId(usuario)}` : `/osc`;
      const r = await api('GET', url);
      if (!r.ok) { setError(`Erro ${r.status}`); return; }
      const data = (await r.json() || []).sort((a, b) => ordemStatus(a.status) - ordemStatus(b.status) || b.id - a.id);
      setOscs(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function toggleItem(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll(checked) {
    if (checked) setSelected(new Set(filtered.map(o => o.id)));
    else setSelected(new Set());
  }

  function sigRow(label, assinou) {
    return `<tr>
      <td style="padding:7px 12px;font-size:12px;color:#374151;border-bottom:1px solid #f0f2f6">${label}</td>
      <td style="padding:7px 12px;font-size:13px;font-weight:700;border-bottom:1px solid #f0f2f6;color:${assinou ? '#166534' : '#92400e'}">
        ${assinou ? '✅ Assinado' : '⏳ Pendente'}
      </td>
    </tr>`;
  }

  function gerarPDF() {
    const oscsExport = filtered.filter(o => selected.has(o.id));
    if (!oscsExport.length) return;

    const agora = new Date();
    const dtExport = agora.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const hrExport = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const exportadoPor = userName(usuario);

    function info(s) {
      const k = String(s || '').toLowerCase();
      const map = {
        concluida:             { label: 'CONCLUÍDA',        color: '#166534', bg: '#dcfce7', border: '#86efac', icon: '✅' },
        cancelada:             { label: 'CANCELADA',         color: '#991b1b', bg: '#fee2e2', border: '#fca5a5', icon: '❌' },
        aguardandovalidacao:   { label: 'AG. VALIDAÇÃO',     color: '#1e40af', bg: '#dbeafe', border: '#93c5fd', icon: '🔵' },
        aguardandoassinaturas: { label: 'AG. ASSINATURAS',   color: '#92400e', bg: '#fef3c7', border: '#fcd34d', icon: '⚠️' },
      };
      return map[k] || { label: s || '—', color: '#374151', bg: '#f3f4f6', border: '#d1d5db', icon: '' };
    }

    const coverHTML = `
      <div class="pdf-cover">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:40px">
          <div>
            <div style="font-size:28px;font-weight:800;color:#1E50A0;margin-bottom:6px">📋 Relatório de Ordens de Serviço</div>
            <div style="font-size:14px;color:#6b7280">Gerenciador de OS — Relatório exportado</div>
          </div>
          <div style="text-align:right;font-size:12px;color:#6b7280;line-height:1.7">
            <div><strong>Data:</strong> ${dtExport}</div>
            <div><strong>Horário:</strong> ${hrExport}</div>
            <div><strong>Exportado por:</strong> ${exportadoPor}</div>
          </div>
        </div>
        <hr style="border:none;border-top:2px solid #1E50A0;margin-bottom:32px"/>
        <div style="margin-bottom:24px">
          <div style="font-size:16px;font-weight:700;color:#19234a;margin-bottom:16px">Resumo</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
            ${[
              { label: 'Total', val: oscsExport.length, color: '#19234a' },
              { label: 'Concluídas', val: oscsExport.filter(o => String(o.status || '').toLowerCase() === 'concluida').length, color: '#166534' },
              { label: 'Canceladas', val: oscsExport.filter(o => String(o.status || '').toLowerCase() === 'cancelada').length, color: '#991b1b' },
              { label: 'Pendentes', val: oscsExport.filter(o => !['concluida', 'cancelada'].includes(String(o.status || '').toLowerCase())).length, color: '#92400e' },
            ].map(c => `<div style="background:#f9fafb;border:1px solid #e5e9f0;border-radius:10px;padding:16px;text-align:center">
              <div style="font-size:28px;font-weight:800;color:${c.color}">${c.val}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:4px">${c.label}</div>
            </div>`).join('')}
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr style="background:#1e1e1e">
            <th style="color:#fff;padding:8px 10px;text-align:left">#</th>
            <th style="color:#fff;padding:8px 10px;text-align:left">OS</th>
            <th style="color:#fff;padding:8px 10px;text-align:left">Equipamento</th>
            <th style="color:#fff;padding:8px 10px;text-align:left">Emitente</th>
            <th style="color:#fff;padding:8px 10px;text-align:left">Status</th>
            <th style="color:#fff;padding:8px 10px;text-align:left">Ass.</th>
          </tr></thead>
          <tbody>
            ${oscsExport.map((o, i) => {
              const inf = info(o.status);
              const tot = totalAssinaturas(o);
              return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
                <td style="padding:7px 10px;color:#888">${i + 1}</td>
                <td style="padding:7px 10px;font-weight:700;color:#1E50A0">OS-${String(o.id).padStart(3, '0')}</td>
                <td style="padding:7px 10px">${o.equipamento || '—'}</td>
                <td style="padding:7px 10px">${o.emitenteNome || '—'}</td>
                <td style="padding:7px 10px"><span style="background:${inf.bg};color:${inf.color};border:1px solid ${inf.border};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">${inf.label}</span></td>
                <td style="padding:7px 10px;font-weight:700;color:${tot === 3 ? '#166534' : tot > 0 ? '#92400e' : '#991b1b'}">${tot}/3</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e9f0;font-size:11px;color:#9ca3af;text-align:center">
          Documento gerado automaticamente pelo Gerenciador de OS em ${dtExport} às ${hrExport}
        </div>
      </div>`;

    const osPages = oscsExport.map(o => {
      const inf = info(o.status);
      const tot = totalAssinaturas(o);
      const dt = o.dataEmissao ? new Date(o.dataEmissao).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' }) : '—';
      return `
        <div class="pdf-os">
          <div style="background:${inf.bg};border:2px solid ${inf.border};border-radius:10px;padding:14px 20px;margin-bottom:24px;display:flex;align-items:center;gap:14px">
            <span style="font-size:32px">${inf.icon}</span>
            <div>
              <div style="font-size:20px;font-weight:800;color:${inf.color}">${inf.label}</div>
              <div style="font-size:12px;color:${inf.color};opacity:.75;margin-top:2px">${tot}/3 assinaturas · OS-${String(o.id).padStart(3, '0')}</div>
            </div>
            <div style="margin-left:auto;text-align:right;font-size:11px;color:#6b7280;line-height:1.8">
              <div><strong>Exportado em:</strong> ${dtExport}</div><div><strong>Horário:</strong> ${hrExport}</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #e5e9f0">
            <div>
              <div style="font-size:22px;font-weight:800;color:#1E50A0">OS-${String(o.id).padStart(3, '0')}</div>
              <div style="font-size:13px;color:#6b7280;margin-top:2px">Ordem de Serviço</div>
            </div>
            <div style="text-align:right;font-size:12px;color:#6b7280;line-height:1.9">
              <div><strong>Data de Emissão:</strong> ${dt}</div>
              <div><strong>Emitente:</strong> ${o.emitenteNome || '—'}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
            <div style="background:#f9fafb;border:1px solid #e5e9f0;border-radius:8px;padding:14px">
              <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Equipamento</div>
              <div style="font-size:14px;font-weight:600">${o.equipamento || '—'}</div>
            </div>
            <div style="background:#f9fafb;border:1px solid #e5e9f0;border-radius:8px;padding:14px">
              <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Status</div>
              <div style="font-size:14px;font-weight:700;color:${inf.color}">${inf.label}</div>
            </div>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e9f0;border-radius:8px;padding:14px;margin-bottom:16px">
            <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Descrição</div>
            <div style="font-size:13px;line-height:1.6;white-space:pre-wrap">${o.descricao || '—'}</div>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e9f0;border-radius:8px;padding:14px;margin-bottom:20px">
            <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Ação Tomada</div>
            <div style="font-size:13px;line-height:1.6;white-space:pre-wrap">${o.acaoTomada || '—'}</div>
          </div>
          <div style="border:1px solid #e5e9f0;border-radius:8px;overflow:hidden;margin-bottom:20px">
            <div style="background:#1e1e1e;padding:10px 14px"><span style="color:#fff;font-size:12px;font-weight:700">ASSINATURAS (${tot}/3)</span></div>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:#f9fafb">
                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e9f0">Setor</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e9f0">Status</th>
              </tr></thead>
              <tbody>
                ${sigRow('Garantia de Validação (Qualidade)', o.qualidadeAssinou)}
                ${sigRow('Mecatrônica (Engenharia)', o.engenhariaAssinou)}
                ${sigRow('Operação (Produção)', o.producaoAssinou)}
              </tbody>
            </table>
          </div>
          <div style="padding-top:12px;border-top:1px solid #e5e9f0;font-size:10px;color:#9ca3af;display:flex;justify-content:space-between">
            <span>Gerenciador de OS — Documento gerado automaticamente</span>
            <span>OS-${String(o.id).padStart(3, '0')} · ${dtExport} · ${hrExport}</span>
          </div>
        </div>`;
    }).join('');

    const printArea = document.getElementById('print-area');
    printArea.innerHTML = coverHTML + osPages;
    setTimeout(() => {
      window.print();
      setTimeout(() => { printArea.innerHTML = ''; }, 1000);
    }, 150);
  }

  const allChecked = filtered.length > 0 && filtered.every(o => selected.has(o.id));
  const someChecked = filtered.some(o => selected.has(o.id));

  return (
    <div>
      <div className="page-title">📄 Exportar OSs como PDF</div>
      <div className="page-sub">Selecione as OSs que deseja exportar e clique em Gerar PDF</div>

      <div className="filter-bar">
        <input placeholder="🔍 Buscar por descrição ou equipamento..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="aguardandoassinaturas">Ag. Assinaturas</option>
          <option value="aguardandovalidacao">Ag. Validação</option>
          <option value="concluida">Concluída</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <button className="btn-clear" onClick={() => { setBusca(''); setStatusFilter(''); }}>✖ Limpar</button>
      </div>

      {loading ? <Spinner /> : error ? <div className="empty" style={{ color: 'red' }}>{error}</div> : (
        filtered.length === 0 ? <Empty>Nenhuma OS encontrada.</Empty> : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <label className="export-select-all" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                  onChange={e => toggleAll(e.target.checked)}
                />
                Selecionar todas
                <span className="export-count">{selected.size} de {filtered.length} selecionadas</span>
              </label>
            </div>

            <div className="table-wrap export-list">
              {filtered.map(o => {
                const s = String(o.status || '').toLowerCase();
                const label = STATUS_LABELS[s] || o.status || '—';
                const tot = totalAssinaturas(o);
                const dt = o.dataEmissao ? new Date(o.dataEmissao).toLocaleDateString('pt-BR') : '—';
                return (
                  <label key={o.id} className="export-item" htmlFor={`chk-os-${o.id}`}>
                    <input
                      type="checkbox"
                      id={`chk-os-${o.id}`}
                      checked={selected.has(o.id)}
                      onChange={() => toggleItem(o.id)}
                    />
                    <span className={`export-status-dot ${dotClass(o.status)}`} />
                    <div className="export-item-info">
                      <div className="export-item-title">OS-{String(o.id).padStart(3, '0')} — {o.descricao || ''}</div>
                      <div className="export-item-sub">{o.equipamento || '—'} · {o.emitenteNome || '—'} · {dt} · {label} · {tot}/3 ass.</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              <button className="btn-export-pdf" disabled={selected.size === 0} onClick={gerarPDF}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                Gerar PDF
              </button>
            </div>
          </>
        )
      )}
    </div>
  );
}
