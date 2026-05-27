// export const URL_BASE = 'https://triumphant-clarity-production-264b.up.railway.app';

// export function getToken() {
//   return localStorage.getItem('os_token') || '';
// }

// export function getUsuario() {
//   try {
//     return JSON.parse(localStorage.getItem('os_usuario') || 'null');
//   } catch {
//     return null;
//   }
// }

// export function setAuth(token, usuario) {
//   localStorage.setItem('os_token', token);
//   localStorage.setItem('os_usuario', JSON.stringify(usuario));
// }

// export function clearAuth() {
//   localStorage.removeItem('os_token');
//   localStorage.removeItem('os_usuario');
// }

// export function isAuthenticated() {
//   return !!(getToken() && getUsuario());
// }

// function headers() {
//   return {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${getToken()}`,
//   };
// }

// export async function api(method, path, body) {
//   const opts = { method, headers: headers() };
//   if (body !== undefined) opts.body = JSON.stringify(body);
//   const r = await fetch(URL_BASE + path, opts);
//   if (r.status === 401) {
//     clearAuth();
//     window.location.reload();
//   }
//   return r;
// }

// export function perfil(usuario) {
//   return String(usuario?.perfil || usuario?.Perfil || '').toLowerCase();
// }
// export function userId(usuario) {
//   return usuario?.id || usuario?.Id;
// }
// export function userName(usuario) {
//   return usuario?.nome || usuario?.Nome || '';
// }
// export function userPerfil(usuario) {
//   return usuario?.perfil || usuario?.Perfil || '';
// }
// export function userSetor(usuario) {
//   return usuario?.setor || usuario?.Setor || '';
// }
// export function isAdmin(usuario) {
//   const p = perfil(usuario);
//   return p === 'administrador' || p === 'admin';
// }

// export function exibirSetor(s) {
//   return ({
//     qualidade: 'Garantia de Validação',
//     engenharia: 'Mecatrônica',
//     producao: 'Operação',
//   })[String(s || '').toLowerCase()] || s || '—';
// }

// export function setorParaApi(label) {
//   return ({
//     'Garantia de Validação': 'Qualidade',
//     'Mecatrônica': 'Engenharia',
//     'Operação': 'Producao',
//   })[label] || label;
// }

// export function ordemStatus(s) {
//   return ({
//     aguardandoassinaturas: 0,
//     aguardandovalidacao: 1,
//     concluida: 2,
//     cancelada: 3,
//   })[String(s || '').toLowerCase()] ?? 0;
// }

// export function statusInfo(s) {
//   const map = {
//     aguardandoassinaturas: { cls: 'badge-yellow', label: 'Ag. Assinaturas', bg: '#fff4cd', color: '#a05a00', border: '#fbbf24', icon: '⏳' },
//     aguardandovalidacao:   { cls: 'badge-blue',   label: 'Ag. Validação',   bg: '#dce9ff', color: '#1E50A0', border: '#3C82D2', icon: '🔵' },
//     concluida:             { cls: 'badge-green',  label: 'Concluída',       bg: '#dcffe8', color: '#00824a', border: '#28AA5A', icon: '✅' },
//     cancelada:             { cls: 'badge-red',    label: 'Cancelada',       bg: '#ffdede', color: '#aa1e1e', border: '#D23C3C', icon: '❌' },
//   };
//   return map[String(s || '').toLowerCase()] || { cls: 'badge-gray', label: s || '—', bg: '#ebebeb', color: '#555', border: '#ccc', icon: '❓' };
// }

// export function jaAssinou(osc, usuario) {
//   const s = String(userSetor(usuario) || '').toLowerCase();
//   if (s === 'qualidade')  return osc.qualidadeAssinou;
//   if (s === 'engenharia') return osc.engenhariaAssinou;
//   if (s === 'producao')   return osc.producaoAssinou;
//   return false;
// }

// export function totalAssinaturas(osc) {
//   return (osc.qualidadeAssinou ? 1 : 0) + (osc.engenhariaAssinou ? 1 : 0) + (osc.producaoAssinou ? 1 : 0);
// }

export const URL_BASE = 'http://200.234.218.87';

export function getToken() {
  return localStorage.getItem('os_token') || '';
}

export function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem('os_usuario') || 'null');
  } catch {
    return null;
  }
}

export function setAuth(token, usuario) {
  localStorage.setItem('os_token', token);
  localStorage.setItem('os_usuario', JSON.stringify(usuario));
}

export function clearAuth() {
  localStorage.removeItem('os_token');
  localStorage.removeItem('os_usuario');
}

export function isAuthenticated() {
  return !!(getToken() && getUsuario());
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}

export async function api(method, path, body) {
  const opts = { method, headers: headers() };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(URL_BASE + path, opts);
  if (r.status === 401) {
    clearAuth();
    window.location.reload();
  }
  return r;
}

export function perfil(usuario) {
  return String(usuario?.perfil || usuario?.Perfil || '').toLowerCase();
}
export function userId(usuario) {
  return usuario?.id || usuario?.Id;
}
export function userName(usuario) {
  return usuario?.nome || usuario?.Nome || '';
}
export function userPerfil(usuario) {
  return usuario?.perfil || usuario?.Perfil || '';
}
export function userSetor(usuario) {
  return usuario?.setor || usuario?.Setor || '';
}
export function isAdmin(usuario) {
  const p = perfil(usuario);
  return p === 'administrador' || p === 'admin';
}

// Tester = perfil Executante (valor 4 no backend)
// O backend retorna a string "Executante"; o frontend exibe como "Tester"
export function isTester(usuario) {
  const p = perfil(usuario);
  return p === 'executante' || p === 'tester';
}

export function exibirSetor(s) {
  return ({
    qualidade: 'Garantia de Validação',
    engenharia: 'Mecatrônica',
    producao: 'Operação',
  })[String(s || '').toLowerCase()] || s || '—';
}

export function setorParaApi(label) {
  return ({
    'Garantia de Validação': 'Qualidade',
    'Mecatrônica': 'Engenharia',
    'Operação': 'Producao',
  })[label] || label;
}

export function ordemStatus(s) {
  return ({
    aguardandoassinaturas: 0,
    aguardandovalidacao: 1,
    concluida: 2,
    cancelada: 3,
  })[String(s || '').toLowerCase()] ?? 0;
}

export function statusInfo(s) {
  const map = {
    aguardandoassinaturas: { cls: 'badge-yellow', label: 'Ag. Assinaturas', bg: '#fff4cd', color: '#a05a00', border: '#fbbf24', icon: '⏳' },
    aguardandovalidacao:   { cls: 'badge-blue',   label: 'Ag. Validação',   bg: '#dce9ff', color: '#1E50A0', border: '#3C82D2', icon: '🔵' },
    concluida:             { cls: 'badge-green',  label: 'Concluída',       bg: '#dcffe8', color: '#00824a', border: '#28AA5A', icon: '✅' },
    cancelada:             { cls: 'badge-red',    label: 'Cancelada',       bg: '#ffdede', color: '#aa1e1e', border: '#D23C3C', icon: '❌' },
  };
  return map[String(s || '').toLowerCase()] || { cls: 'badge-gray', label: s || '—', bg: '#ebebeb', color: '#555', border: '#ccc', icon: '❓' };
}

export function jaAssinou(osc, usuario) {
  const s = String(userSetor(usuario) || '').toLowerCase();
  if (s === 'qualidade')  return osc.qualidadeAssinou;
  if (s === 'engenharia') return osc.engenhariaAssinou;
  if (s === 'producao')   return osc.producaoAssinou;
  return false;
}

export function totalAssinaturas(osc) {
  return (osc.qualidadeAssinou ? 1 : 0) + (osc.engenhariaAssinou ? 1 : 0) + (osc.producaoAssinou ? 1 : 0);
}