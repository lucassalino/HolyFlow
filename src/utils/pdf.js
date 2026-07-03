import { jsPDF } from 'jspdf'
import { formatarData } from './formatarData'

export function gerarPDF(roteiro, momentos) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, H = 297, margemEsq = 18, margemDir = 18, colDir = W - margemDir
  let y = 0

  const PRETO = [15, 15, 15]
  const CINZA_ESCURO = [60, 60, 60]
  const CINZA_MEDIO = [120, 120, 120]
  const CINZA_CLARO = [170, 170, 170]
  const LINHA = [210, 210, 210]

  const nome = roteiro?.nome || 'Roteiro de Culto'
  const dataStr = formatarData(roteiro?.data)
  const tema = roteiro?.tema || ''
  const versiculo = roteiro?.versiculo || ''

  let paginaAtual = 1

  function rodapePagina() {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...CINZA_CLARO)
    doc.text('Roteiro do Culto', margemEsq, H - 9)
    doc.text(String(paginaAtual), colDir, H - 9, { align: 'right' })
  }

  function novaPagina() {
    rodapePagina()
    doc.addPage()
    paginaAtual++
    y = 20
  }

  function checkPage(needed) {
    if (y + needed > H - 16) novaPagina()
  }

  y = 28
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRETO)
  doc.text('Roteiro de Culto', W / 2, y, { align: 'center' })
  y += 9

  if (dataStr && dataStr !== '—') {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...CINZA_MEDIO)
    doc.text(dataStr, W / 2, y, { align: 'center' })
    y += 6
  }

  y += 3
  doc.setDrawColor(...PRETO)
  doc.setLineWidth(0.6)
  doc.line(margemEsq, y, colDir, y)
  y += 9

  if (tema) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRETO)
    doc.text('Tema: ', margemEsq, y)
    const temaX = margemEsq + doc.getTextWidth('Tema: ')
    doc.setFont('helvetica', 'normal')
    const temaLines = doc.splitTextToSize(tema, colDir - temaX)
    temaLines.forEach((line, li) => { doc.text(line, li === 0 ? temaX : margemEsq, y); y += 5.4 })
    y += 1
  }
  if (versiculo) {
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...CINZA_MEDIO)
    const versLines = doc.splitTextToSize(versiculo, colDir - margemEsq)
    versLines.forEach(line => { doc.text(line, margemEsq, y); y += 4.6 })
    y += 2
  }
  if (tema || versiculo) {
    doc.setDrawColor(...LINHA)
    doc.setLineWidth(0.3)
    doc.line(margemEsq, y, colDir, y)
    y += 4
  }

  const colNumX = margemEsq
  const colNumW = 16
  const colHoraW = 22
  const colHoraX = colDir - colHoraW
  const colConteudoX = colNumX + colNumW + 4
  const colConteudoW = colHoraX - colConteudoX - 4

  momentos.forEach((m, i) => {
    const resp = m.tipo === 'pessoa' ? (m.responsavel || '') : m.tipo === 'video' ? 'Vídeo' : 'Projeção'
    const numStr = String(i + 1).padStart(2, '0')
    const nomeLines = doc.splitTextToSize(m.nome, colConteudoW)
    const extras = []

    if (m.musicas?.filter(x => x).length) {
      extras.push({ tipo: 'titulo', texto: 'Louvores' })
      m.musicas.filter(x => x).forEach((mu, mi) => {
        extras.push({ tipo: 'item', linhas: doc.splitTextToSize(`${mi + 1}. ${mu}`, colConteudoW - 3) })
      })
    }
    if (m.avisos?.filter(x => x).length) {
      m.avisos.filter(x => x).forEach((av, ai) => {
        extras.push({ tipo: 'item', linhas: doc.splitTextToSize(`${ai + 1}. ${av}`, colConteudoW - 3) })
      })
    }
    if (m.palavraTema) extras.push({ tipo: 'label', label: 'Tema', linhas: doc.splitTextToSize(m.palavraTema, colConteudoW - 3) })
    if (m.palavraTexto) extras.push({ tipo: 'label', label: 'Texto Base', linhas: doc.splitTextToSize(m.palavraTexto, colConteudoW - 3) })
    if (m.obs) extras.push({ tipo: 'obs', linhas: doc.splitTextToSize(m.obs, colConteudoW - 3) })

    let subAltura = 0
    extras.forEach(e => {
      if (e.tipo === 'titulo') subAltura += 5.2
      else subAltura += e.linhas.length * 4.6
    })
    const alturaBloco = Math.max(nomeLines.length * 5.4, 10) + subAltura
    checkPage(alturaBloco + 4)

    const yTopo = y
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRETO)
    doc.text(numStr, colNumX, yTopo + 7)

    if (m.duracao) {
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...CINZA_MEDIO)
      doc.splitTextToSize(m.duracao, colHoraW).forEach((line, li) => doc.text(line, colDir, yTopo + 4.5 + li * 4, { align: 'right' }))
    }

    let yy = yTopo + 4.5
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRETO)
    doc.text(nomeLines[0], colConteudoX, yy)

    if (resp) {
      const nomeW = doc.getTextWidth(nomeLines[0])
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...CINZA_MEDIO)
      doc.text('  ' + resp, colConteudoX + nomeW, yy)
    }
    yy += 5.4

    for (let li = 1; li < nomeLines.length; li++) {
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PRETO)
      doc.text(nomeLines[li], colConteudoX, yy); yy += 5.4
    }
    yy += 1

    extras.forEach(e => {
      if (e.tipo === 'titulo') {
        doc.setFontSize(8.5); doc.setFont('helvetica', 'bolditalic'); doc.setTextColor(...CINZA_ESCURO)
        doc.text(e.texto, colConteudoX, yy); yy += 5.2
      } else if (e.tipo === 'item') {
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA_ESCURO)
        e.linhas.forEach(linha => { doc.text(linha, colConteudoX + 2, yy); yy += 4.6 })
      } else if (e.tipo === 'label') {
        doc.setFontSize(8.7); doc.setFont('helvetica', 'bolditalic'); doc.setTextColor(...CINZA_ESCURO)
        doc.text(e.label + ':', colConteudoX, yy)
        const labelW = doc.getTextWidth(e.label + ': ')
        doc.setFont('helvetica', 'italic'); doc.setTextColor(...CINZA_MEDIO)
        e.linhas.forEach((linha, li) => { doc.text(linha, colConteudoX + (li === 0 ? labelW : 0), yy); yy += 4.6 })
      } else if (e.tipo === 'obs') {
        doc.setFontSize(8.7); doc.setFont('helvetica', 'italic'); doc.setTextColor(...CINZA_MEDIO)
        e.linhas.forEach(linha => { doc.text(linha, colConteudoX, yy); yy += 4.4 })
      }
    })

    y = Math.max(yy, yTopo + alturaBloco)
    if (i < momentos.length - 1) {
      doc.setDrawColor(...LINHA); doc.setLineWidth(0.25)
      doc.line(margemEsq, y, colDir, y); y += 0.5
    }
  })

  checkPage(16)
  y += 4
  doc.setDrawColor(...LINHA); doc.setLineWidth(0.3)
  doc.line(margemEsq, y, colDir, y); y += 7
  doc.setFontSize(9); doc.setFont('helvetica', 'italic'); doc.setTextColor(...CINZA_MEDIO)
  doc.text('Que o Senhor seja glorificado em cada momento deste culto.', W / 2, y, { align: 'center' })
  rodapePagina()

  const nomeFile = nome.replace(/[^a-zA-Z0-9À-ú\s]/g, '').trim().replace(/\s+/g, '-').toLowerCase()
  doc.save(`roteiro-${nomeFile}.pdf`)
}
