// import { useState, useEffect, Component } from 'react';
// import { getUsuario, clearAuth, isAuthenticated, perfil, isAdmin, userName, userPerfil } from './api';
// import LoginPage from './pages/LoginPage';
// import DashboardPage from './pages/DashboardPage';
// import CriarOSPage from './pages/CriarOSPage';
// import AssinarPage from './pages/AssinarPage';
// import GerenciarOSsPage from './pages/GerenciarOSsPage';
// import UsuariosPage from './pages/UsuariosPage';
// import ExportarPage from './pages/ExportarPage';
// import AlertToast from './components/AlertToast';

// class ErrorBoundary extends Component {
//   state = { erro: false };
//   static getDerivedStateFromError() { return { erro: true }; }
//   render() {
//     if (this.state.erro)
//       return (
//         <div style={{ padding: 40, textAlign: 'center', color: '#b91c1c' }}>
//           <p style={{ fontSize: 16, marginBottom: 12 }}>⚠️ Algo deu errado ao carregar esta página.</p>
//           <button
//             style={{ padding: '8px 20px', background: '#1E50A0', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 14 }}
//             onClick={() => { this.setState({ erro: false }); window.location.reload(); }}
//           >
//             🔄 Recarregar
//           </button>
//         </div>
//       );
//     return this.props.children;
//   }
// }

// export default function App() {
//   const [loggedIn, setLoggedIn] = useState(isAuthenticated());
//   const [usuario, setUsuario] = useState(getUsuario());
//   const [currentPage, setCurrentPage] = useState('dashboard');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [alert, setAlert] = useState(null);

//   function handleLogin() {
//     setUsuario(getUsuario());
//     setLoggedIn(true);
//     setCurrentPage('dashboard');
//   }

//   function handleLogout() {
//     if (confirm('Deseja sair da conta?')) {
//       clearAuth();
//       setLoggedIn(false);
//       setUsuario(null);
//     }
//   }

//   function showAlert(msg, type = 'error') {
//     setAlert({ msg, type });
//   }

//   function navigate(page) {
//     const p = perfil(usuario);
//     const admin = isAdmin(usuario);
//     if (page === 'criar'    && p !== 'emitente' && !admin) return;
//     if (page === 'assinar'  && p !== 'gerente') return;
//     if (page === 'usuarios' && !admin) return;
//     if (page === 'oscs'     && !admin) return;
//     setCurrentPage(page);
//     setSidebarOpen(false);
//   }

//   if (!loggedIn) {
//     return (
//       <ErrorBoundary>
//         <LoginPage onLogin={handleLogin} />
//       </ErrorBoundary>
//     );
//   }

//   const p = perfil(usuario);
//   const admin = isAdmin(usuario);

//   const navItems = [
//     { id: 'dashboard', label: '📈 Dashboard', locked: false },
//     { id: 'criar',     label: '➕ Criar OS',  locked: p !== 'emitente' && !admin, tip: '⛔ Sem acesso' },
//     { id: 'assinar',   label: '✅ Assinar OS', locked: p !== 'gerente', tip: '⛔ Somente Gerentes' },
//     { id: 'usuarios',  label: '👥 Gerenciar Usuários', locked: !admin, tip: '⛔ Somente Admins' },
//     { id: 'oscs',      label: '🛠️ Gerenciar OSs', locked: !admin, tip: '⛔ Somente Admins' },
//     { id: 'exportar',  label: '📄 Exportar PDF', locked: false, extra: 'nav-btn-export' },
//   ];

//   const pages = {
//     dashboard: <DashboardPage usuario={usuario} showAlert={showAlert} />,
//     criar:     <CriarOSPage usuario={usuario} showAlert={showAlert} onNavigate={navigate} />,
//     assinar:   <AssinarPage usuario={usuario} showAlert={showAlert} />,
//     usuarios:  <UsuariosPage usuario={usuario} showAlert={showAlert} />,
//     oscs:      <GerenciarOSsPage usuario={usuario} showAlert={showAlert} />,
//     exportar:  <ExportarPage usuario={usuario} showAlert={showAlert} />,
//   };

//   return (
//     <ErrorBoundary>
//       <>
//         <div className="app-shell">
//           <div id="header">
//             <button className="btn-menu" onClick={() => setSidebarOpen(v => !v)}>
//               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
//                 <line x1="3" y1="6" x2="21" y2="6"/>
//                 <line x1="3" y1="12" x2="21" y2="12"/>
//                 <line x1="3" y1="18" x2="21" y2="18"/>
//               </svg>
//             </button>
//             <h1>📋 Gerenciador de Ordens de Serviço</h1>
//             <div className="header-right">
//               <span className="header-user">👤 {userName(usuario)} | {userPerfil(usuario)}</span>
//               <button className="btn-sair" onClick={handleLogout}>⬅ Sair</button>
//             </div>
//           </div>

//           <div className="app-body">
//             <div
//               className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
//               onClick={() => setSidebarOpen(false)}
//             />

//             <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
//               {navItems.map(item => (
//                 <button
//                   key={item.id}
//                   className={`nav-btn ${item.extra || ''} ${currentPage === item.id ? 'active' : ''} ${item.locked ? 'disabled' : ''}`}
//                   onClick={() => !item.locked && navigate(item.id)}
//                   data-tip={item.locked ? item.tip : undefined}
//                 >
//                   {item.label}
//                 </button>
//               ))}
//               <a
//                 className="nav-btn nav-btn-download"
//                 href="Gerenciador-OS.zip"
//                 download
//                 title="Baixar o aplicativo desktop"
//               >
//                 💾 Baixar App Desktop
//               </a>
//             </nav>

//             <main className="content">
//               {alert && (
//                 <AlertToast
//                   message={alert.msg}
//                   type={alert.type}
//                   onDismiss={() => setAlert(null)}
//                 />
//               )}
//               {pages[currentPage]}
//             </main>
//           </div>
//         </div>

//         <div id="print-area" />
//       </>
//     </ErrorBoundary>
//   );
// }

import { useState, useEffect, Component } from 'react';
import { getUsuario, clearAuth, isAuthenticated, perfil, isAdmin, isTester, userName, userPerfil } from './api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CriarOSPage from './pages/CriarOSPage';
import AssinarPage from './pages/AssinarPage';
import GerenciarOSsPage from './pages/GerenciarOSsPage';
import UsuariosPage from './pages/UsuariosPage';
import ExportarPage from './pages/ExportarPage';
import AlertToast from './components/AlertToast';

class ErrorBoundary extends Component {
  state = { erro: false };
  static getDerivedStateFromError() { return { erro: true }; }
  render() {
    if (this.state.erro)
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#b91c1c' }}>
          <p style={{ fontSize: 16, marginBottom: 12 }}>⚠️ Algo deu errado ao carregar esta página.</p>
          <button
            style={{ padding: '8px 20px', background: '#1E50A0', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 14 }}
            onClick={() => { this.setState({ erro: false }); window.location.reload(); }}
          >
            🔄 Recarregar
          </button>
        </div>
      );
    return this.props.children;
  }
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [usuario, setUsuario] = useState(getUsuario());
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  function handleLogin() {
    setUsuario(getUsuario());
    setLoggedIn(true);
    setCurrentPage('dashboard');
  }

  function handleLogout() {
    if (confirm('Deseja sair da conta?')) {
      clearAuth();
      setLoggedIn(false);
      setUsuario(null);
    }
  }

  function showAlert(msg, type = 'error') {
    setAlert({ msg, type });
  }

  function navigate(page) {
    const p = perfil(usuario);
    const admin = isAdmin(usuario);
    const tester = isTester(usuario);

    // Tester tem acesso livre a todas as abas
    if (tester) {
      setCurrentPage(page);
      setSidebarOpen(false);
      return;
    }

    if (page === 'criar'    && p !== 'emitente' && !admin) return;
    if (page === 'assinar'  && p !== 'gerente') return;
    if (page === 'usuarios' && !admin) return;
    if (page === 'oscs'     && !admin) return;
    setCurrentPage(page);
    setSidebarOpen(false);
  }

  if (!loggedIn) {
    return (
      <ErrorBoundary>
        <LoginPage onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  const p = perfil(usuario);
  const admin = isAdmin(usuario);
  const tester = isTester(usuario);

  const navItems = [
    { id: 'dashboard', label: '📈 Dashboard',          locked: false },
    { id: 'criar',     label: '➕ Criar OS',            locked: !tester && p !== 'emitente' && !admin, tip: '⛔ Sem acesso' },
    { id: 'assinar',   label: '✅ Assinar OS',          locked: !tester && p !== 'gerente',            tip: '⛔ Somente Gerentes' },
    { id: 'usuarios',  label: '👥 Gerenciar Usuários', locked: !tester && !admin,                     tip: '⛔ Somente Admins' },
    { id: 'oscs',      label: '🛠️ Gerenciar OSs',      locked: !tester && !admin,                     tip: '⛔ Somente Admins' },
    { id: 'exportar',  label: '📄 Exportar PDF',       locked: false, extra: 'nav-btn-export' },
  ];

  const pages = {
    dashboard: <DashboardPage usuario={usuario} showAlert={showAlert} />,
    criar:     <CriarOSPage usuario={usuario} showAlert={showAlert} onNavigate={navigate} />,
    assinar:   <AssinarPage usuario={usuario} showAlert={showAlert} />,
    usuarios:  <UsuariosPage usuario={usuario} showAlert={showAlert} />,
    oscs:      <GerenciarOSsPage usuario={usuario} showAlert={showAlert} />,
    exportar:  <ExportarPage usuario={usuario} showAlert={showAlert} />,
  };

  return (
    <ErrorBoundary>
      <>
        <div className="app-shell">
          <div id="header">
            <button className="btn-menu" onClick={() => setSidebarOpen(v => !v)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1>📋 Gerenciador de Ordens de Serviço</h1>
            <div className="header-right">
              <span className="header-user">👤 {userName(usuario)} | {userPerfil(usuario)}</span>
              <button className="btn-sair" onClick={handleLogout}>⬅ Sair</button>
            </div>
          </div>

          <div className="app-body">
            <div
              className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
              onClick={() => setSidebarOpen(false)}
            />

            <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`nav-btn ${item.extra || ''} ${currentPage === item.id ? 'active' : ''} ${item.locked ? 'disabled' : ''}`}
                  onClick={() => !item.locked && navigate(item.id)}
                  data-tip={item.locked ? item.tip : undefined}
                >
                  {item.label}
                </button>
              ))}
<a
  className="nav-btn nav-btn-download"
  href="https://github.com/carlitos9087/gerenciador-os-react/raw/master/Gerenciador-OS.zip"
  download="Gerenciador-OS.zip"
  title="Baixar o aplicativo desktop"
>
  💾 Baixar App Desktop
</a>
            </nav>

            <main className="content">
              {alert && (
                <AlertToast
                  message={alert.msg}
                  type={alert.type}
                  onDismiss={() => setAlert(null)}
                />
              )}
              {pages[currentPage]}
            </main>
          </div>
        </div>

        <div id="print-area" />
      </>
    </ErrorBoundary>
  );
}
