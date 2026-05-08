import { useState, useEffect } from 'react';
import { api, userId, exibirSetor, setorParaApi } from '../api';
import { Spinner, Empty } from '../components/UI';
import Modal from '../components/Modal';

const PERFIS = ['Emitente', 'Gerente', 'Administrador'];
const SETORES = ['Garantia de Validação', 'Mecatrônica', 'Operação', 'Nenhum'];

export default function UsuariosPage({ usuario, showAlert }) {
  const [usuarios, setUsuarios] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [perfilFilter, setPerfilFilter] = useState('');
  const [setorFilter, setSetorFilter] = useState('');
  const [modal, setModal] = useState(null); // null | { id, nome, email, perfil, setor }

  useEffect(() => { loadUsuarios(); }, []);

  useEffect(() => {
    const b = busca.trim().toLowerCase();
    const f = usuarios.filter(u => {
      const okB = !b || (u.Nome || u.nome || '').toLowerCase().includes(b) || (u.Email || u.email || '').toLowerCase().includes(b);
      const okP = !perfilFilter || String(u.Perfil || u.perfil || '').toLowerCase() === perfilFilter.toLowerCase();
      const setorApi = setorParaApi(setorFilter);
      const okS = !setorFilter || String(u.Setor || u.setor || '').toLowerCase() === setorApi.toLowerCase();
      return okB && okP && okS;
    });
    setFiltered(f);
  }, [busca, perfilFilter, setorFilter, usuarios]);

  async function loadUsuarios() {
    setLoading(true); setError('');
    try {
      const r = await api('GET', '/usuarios');
      if (!r.ok) { setError(`Erro ${r.status}`); return; }
      setUsuarios(await r.json() || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function abrirModal(id) {
    const u = id ? usuarios.find(x => (x.Id || x.id) === id) : null;
    setModal({
      id: u ? (u.Id || u.id) : null,
      nome: u ? (u.Nome || u.nome || '') : '',
      email: u ? (u.Email || u.email || '') : '',
      senha: '',
      perfil: u ? (u.Perfil || u.perfil || 'Emitente') : 'Emitente',
      setor: u ? exibirSetor(u.Setor || u.setor) : 'Garantia de Validação',
    });
  }

  async function salvarUsuario() {
    const { id, nome, email, senha, perfil: perf, setor } = modal;
    if (!nome) { alert('Informe o nome.'); return; }
    if (!email) { alert('Informe o email.'); return; }
    if (!id && !senha) { alert('Informe a senha.'); return; }
    const editando = !!id;
    try {
      let r;
      if (editando) {
        const body = senha ? { nome, email, senha, perfil: perf, setor: setorParaApi(setor) } : { nome, email, perfil: perf, setor: setorParaApi(setor) };
        r = await api('PUT', `/usuarios/${id}`, body);
      } else {
        r = await api('POST', '/usuarios', { adminId: userId(usuario), nome, email, senha, perfil: perf, setor: setorParaApi(setor) });
      }
      if (r.ok) {
        setModal(null);
        showAlert(editando ? 'Usuário atualizado!' : 'Usuário criado!', 'success');
        loadUsuarios();
      } else {
        showAlert(`Erro: ${r.status} — ${await r.text()}`);
      }
    } catch (e) { showAlert(`Erro: ${e.message}`); }
  }

  async function excluirUsuario(id, nome) {
    if (!confirm(`Excluir "${nome}"? Não pode ser desfeito.`)) return;
    try {
      const r = await api('DELETE', `/usuarios/${id}`);
      if (r.ok) { showAlert('Usuário excluído!', 'success'); loadUsuarios(); }
      else showAlert(`Erro: ${await r.text()}`);
    } catch (e) { showAlert(`Erro: ${e.message}`); }
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-title" style={{ margin: 0 }}>👥 Usuários</div>
        <button className="btn-success" onClick={() => abrirModal(null)}>➕ Novo Usuário</button>
      </div>
      <div className="page-sub">Cadastre, edite ou remova usuários</div>

      <div className="filter-bar">
        <input placeholder="🔍 Nome ou email..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select value={perfilFilter} onChange={e => setPerfilFilter(e.target.value)}>
          <option value="">Todos os perfis</option>
          {PERFIS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={setorFilter} onChange={e => setSetorFilter(e.target.value)}>
          <option value="">Todos os setores</option>
          {SETORES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-clear" onClick={() => { setBusca(''); setPerfilFilter(''); setSetorFilter(''); }}>✖ Limpar</button>
      </div>

      {loading ? <Spinner /> : error ? <div className="empty" style={{ color: 'red' }}>{error}</div> : (
        filtered.length === 0 ? <Empty>Nenhum usuário encontrado.</Empty> : (
          <div className="table-wrap">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>ID</th>
                    <th>Nome</th>
                    <th>Perfil</th>
                    <th>Setor</th>
                    <th style={{ width: 110 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const id = u.Id || u.id;
                    const nome = u.Nome || u.nome || '';
                    const perf = u.Perfil || u.perfil || '';
                    const setor = exibirSetor(u.Setor || u.setor);
                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td><strong>{nome}</strong></td>
                        <td>{perf}</td>
                        <td>{setor}</td>
                        <td style={{ display: 'flex', gap: 5, padding: '7px 8px' }}>
                          <button className="btn-edit" onClick={() => abrirModal(id)}>✏️</button>
                          <button className="btn-del" onClick={() => excluirUsuario(id, nome)}>🗑️</button>
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

      {modal && (
        <Modal onClose={() => setModal(null)}>
          <h2>{modal.id ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <div className="form-group">
            <label>Nome</label>
            <input value={modal.nome} onChange={e => setModal(m => ({ ...m, nome: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={modal.email} onChange={e => setModal(m => ({ ...m, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Senha{modal.id ? ' (em branco = não altera)' : ''}</label>
            <input type="password" value={modal.senha} onChange={e => setModal(m => ({ ...m, senha: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Perfil</label>
            <select value={modal.perfil} onChange={e => setModal(m => ({ ...m, perfil: e.target.value }))}>
              {PERFIS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Setor</label>
            <select value={modal.setor} onChange={e => setModal(m => ({ ...m, setor: e.target.value }))}>
              {SETORES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn-primary" onClick={salvarUsuario}>💾 Salvar</button>
            <button className="btn-clear" onClick={() => setModal(null)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
