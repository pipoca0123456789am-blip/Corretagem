'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type Props = {
  url: string
  size?: number
  className?: string
  alt?: string
}

/**
 * QR Code local (data URL) — não depende de API externa (CSP bloqueia qrserver).
 */
export function SiteQrCode({ url, size = 180, className = '', alt = 'QR Code' }: Props) {
  const [src, setSrc] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url) {
      setSrc('')
      return
    }
    let cancelled = false
    setError(false)
    QRCode.toDataURL(url, { margin: 1, width: size, color: { dark: '#111111', light: '#ffffff' } })
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl)
      })
      .catch(() => {
        if (!cancelled) {
          setSrc('')
          setError(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [url, size])

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-border bg-muted text-center text-xs text-muted-foreground ${className}`}
        style={{ width: size, height: size }}
      >
        Não foi possível gerar o QR
      </div>
    )
  }

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-border bg-muted text-xs text-muted-foreground ${className}`}
        style={{ width: size, height: size }}
      >
        Gerando QR…
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-lg border border-border bg-white p-2 ${className}`}
    />
  )
}
