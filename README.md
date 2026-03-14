# Página web para incidentes naturales y antrópicos con análisis geoespacial — Estado Carabobo

Proyecto de tesis: aplicación web para el **Instituto Autónomo del Sistema Integrado de Emergencias, Desastres y Apoyo a la Gestión de Riesgos del Estado Carabobo**.

La clasificación de incidentes sigue el documento oficial **"Clasificación para Incidentes Protección Civil"** (Centro de Control / Sala Situacional): Novedades Emergentes (respuesta inmediata) y Novedades No Emergentes (gestión y prevención).

---

## Estructura del proyecto

```
Proteccion_Civil/
├── frontend/     ← Vue 3 + Vite, mapa Leaflet, formularios, reportes
├── backend/      ← Node.js + Express + MySQL (API REST)
└── README.md
```

Solo estas carpetas son necesarias. Si ves **src** o **public** en la raíz: clic derecho sobre la carpeta → Eliminar (son sobrantes; el código está en `frontend/src/` y `frontend/public/`).

---

## Frontend

- **Tecnologías:** Vue 3, Vite, Vue Router, Leaflet, Axios
- **Ubicación:** carpeta `frontend/`

### Cómo ejecutar

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173**

### Contenido

| Módulo        | Descripción                                                                 |
|---------------|-----------------------------------------------------------------------------|
| Inicio        | Presentación y acceso a Mapa, Registrar, Listado, Reportes                  |
| Mapa          | Visualización de incidentes en Carabobo (OpenStreetMap + Leaflet)          |
| Registrar     | Formulario con **clasificación oficial** de incidentes y geolocalización   |
| Incidentes    | Listado con filtros por tipo, municipio y búsqueda                         |
| Reportes      | Estadísticas por tipo, municipio y categoría                               |

Los tipos de incidente están definidos en `frontend/src/config/incidentes.js` según el documento de clasificación (hechos viales, traumas graves, incendios, rescate SAR, eventos socio-naturales, prevención, traslados, educación, operaciones administrativas, otro).

Los datos se guardan en **MySQL** a través del backend. El frontend consume la API en `http://localhost:3000/api/incidentes`.

---

## Backend

- **Ubicación:** carpeta `backend/`
- **Stack:** Node.js, Express, MySQL (XAMPP)
- Crear la base de datos con `backend/db/schema.sql`, configurar `.env` y ejecutar `npm install` y `npm run dev` dentro de `backend/`. Ver `backend/README.md`.

---

## Clasificación de incidentes (resumen)

Según el documento "Clasificación para Incidentes Protección Civil":

1. **Novedades Emergentes:** Hechos viales (tipificaciones detalladas), Traumas graves, Incendios (estructura, vegetación, vehículo), Explosiones/GLP/MatPel, Búsqueda y rescate (SAR), Inundaciones, Deslizamientos, Árboles caídos.
2. **Novedades No Emergentes:** Inspecciones de riesgo, Talas y podas preventivas, Guardias de prevención, Traslados inter-hospitalarios, Altas médicas, Simulacros, Charlas de autoprotección, Mantenimiento de unidades, Suministro de agua.
