const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export async function obtenerUbicacionInversa(lat, lng) {
  const url = `${API_BASE}/api/geocoding/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (!res.ok || !data.ok) {
      return { municipio: null, via: '' }
    }
    return {
      municipio: data.municipio || null,
      via: typeof data.via === 'string' ? data.via : '',
    }
  } catch {
    return { municipio: null, via: '' }
  }
}

export async function obtenerMunicipioPorCoordenadas(lat, lng) {
  const u = await obtenerUbicacionInversa(lat, lng)
  return u.municipio
}
