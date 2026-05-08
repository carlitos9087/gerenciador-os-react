import { useState } from 'react';
import { api, userId } from '../api';

export default function CriarOSPage({ usuario, showAlert, onNavigate }) {
  const [desc, setDesc] = useState('');
  const [equip, setEquip] = useState('');
  const [acao, setAcao] = useState('');
  const [loading, setLoading] = useState(false);

  async function salvarOS() {
    if (!desc) { alert('Informe a descrição!'); return; }
    if (!equip) { alert('Informe o equipamento!'); return; }
    if (!acao) { alert('Informe a ação tomada!'); return; }

    setLoading(true);
    try {
      const r = await api('POST', '/osc', { descricao: desc, equipamento: equip, acaoTomada: acao, usuarioLogadoId: userId(usuario) });
      if (r.ok) {
        showAlert('OS criada com sucesso!', 'success');
        onNavigate('dashboard');
      } else {
        showAlert(`Erro: ${r.status} — ${await r.text()}`);
      }
    } catch (e) {
      showAlert(`Erro: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-title">Criar Nova OS</div>
      <div className="page-sub">Preencha os campos para criar uma nova Ordem de Serviço</div>
      <div className="form-section">
        <div className="form-group">
          <label>Descrição</label>
          <input placeholder="Descreva a ordem de serviço..." value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Equipamento</label>
          <input placeholder="Nome ou código do equipamento..." value={equip} onChange={e => setEquip(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Ação Tomada</label>
          <textarea placeholder="Descreva a ação tomada..." value={acao} onChange={e => setAcao(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={salvarOS} disabled={loading}>
          {loading ? '⏳ Salvando...' : '💾 Salvar OS'}
        </button>
      </div>
    </div>
  );
}
