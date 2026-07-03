export function gerarCodigoOrganizacao(nomeOrg) {
  const base = nomeOrg
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 7) || 'IGREJA'
  const sufixo = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}-${sufixo}`
}

export function traduzirErroAuth(msg) {
  if (!msg) return 'Ocorreu um erro. Tenta novamente.'
  if (msg.includes('Invalid login credentials')) return 'Email ou password incorretos.'
  if (msg.includes('already registered') || msg.includes('already exists')) return 'Este email já tem conta — tenta entrar.'
  if (msg.includes('Password should be at least')) return 'A password deve ter pelo menos 6 caracteres.'
  if (msg.includes('Unable to validate email')) return 'Email inválido.'
  return msg
}
