import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import incidentesRouter from './routes/incidentes.js'
import authRouter from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json())

app.use('/api/incidentes', incidentesRouter)
app.use('/api/auth', authRouter)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`)
})
