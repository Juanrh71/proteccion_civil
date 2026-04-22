const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export async function buscarLugarPhoton(consultaUsuario) {
  const q = consultaUsuario.trim()
  if (!q) return null

  const url = `${API_BASE}/api/geocoding?q=${encodeURIComponent(q)}`
  let res
  try {
    res = await fetch(url)
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor. Confirme que el backend está en marcha y que VITE_API_URL apunta al puerto correcto.'
    )
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = data.error || `Error ${res.status} al buscar`
    throw new Error(msg)
  }
  if (data.ok === false) {
    throw new Error(data.error || 'Error al buscar')
  }

  return data.result != null ? data.result : null
}
