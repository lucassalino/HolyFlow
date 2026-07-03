const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']

export function formatarData(d) {
  if (!d) return '—'
  const [y, m, dia] = d.split('-')
  return `${parseInt(dia)} de ${MESES[parseInt(m) - 1]} de ${y}`
}
