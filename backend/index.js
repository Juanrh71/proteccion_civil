import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import incidentesRouter from './routes/incidentes.js'
import authRouter from './routes/auth.js'
import geocodingRouter from './routes/geocoding.js'
import { ensureIncidentesSchema } from './db/ensureSchema.js'

const app = express()
const PORT = process.env.PORT || 3000

/* origin: true permite 192.168.x.x y otros orígenes en red local (Vite --host) */
app.use(cors({ origin: true }))
app.use(express.json())

app.use('/api/incidentes', incidentesRouter)
app.use('/api/auth', authRouter)
app.use('/api/geocoding', geocodingRouter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

try {
  await ensureIncidentesSchema()
} catch {
  console.error('Revise la conexión a MySQL y que exista la base de datos.')
  process.exit(1)
}

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`)
})
