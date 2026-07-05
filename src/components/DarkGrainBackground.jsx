import { useEffect, useRef } from 'react'

export default function DarkGrainBackground() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.offsetWidth || 390
    const H = canvas.offsetHeight || 844
    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#060606'
    ctx.fillRect(0, 0, W, H)

    const blobs = [
      { x: 0.78, y: 0.22, r: 0.55, c0: 'rgba(80,80,80,0.32)', c1: 'rgba(50,50,50,0.18)' },
      { x: 0.65, y: 0.52, r: 0.50, c0: 'rgba(65,65,65,0.28)', c1: 'rgba(35,35,35,0.14)' },
      { x: 0.42, y: 0.78, r: 0.45, c0: 'rgba(55,55,55,0.22)', c1: 'rgba(25,25,25,0.10)' },
      { x: 0.05, y: 0.05, r: 0.40, c0: 'rgba(0,0,0,0.30)',   c1: 'rgba(0,0,0,0)' },
    ]
    blobs.forEach(({ x, y, r, c0, c1 }) => {
      const g = ctx.createRadialGradient(x*W, y*H, 0, x*W, y*H, r*W)
      g.addColorStop(0, c0)
      g.addColorStop(0.5, c1)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    })

    const imgData = ctx.getImageData(0, 0, W, H)
    const d = imgData.data
    let seed = 137
    const rand = () => {
      seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5
      return (seed >>> 0) / 0xffffffff
    }
    for (let i = 0; i < d.length; i += 4) {
      const n = (rand() - 0.5) * 44
      d[i]   = Math.max(0, Math.min(255, d[i]   + n))
      d[i+1] = Math.max(0, Math.min(255, d[i+1] + n))
      d[i+2] = Math.max(0, Math.min(255, d[i+2] + n))
    }
    ctx.putImageData(imgData, 0, 0)
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}
