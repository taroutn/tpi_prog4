# Food Store — Trabajo Práctico Integrador (Programación 4 - UTN)

Aplicación web full-stack para la gestión de pedidos de un negocio gastronómico, construida con **FastAPI + SQLModel** en el backend (arquitectura en capas con patrón *Unit of Work* y autenticación JWT mediante cookies `HttpOnly`) y **React 19 + TypeScript + Vite + Tailwind CSS 4** en el frontend (*TanStack Query*, *TanStack Form*, *TanStack Table* y *Zustand*).

- **Repositorio GitHub:** `https://github.com/taroutn/tpi_prog4`
- **Video de demostración:** https://youtu.be/puSC6okOTh8

---

## 1. Requisitos Previos

- **Python:** `3.11` a `3.13`
- **Node.js:** `20.19+`
- **Gestor de paquetes Frontend:** `pnpm` `9+` (`npm install -g pnpm`)
- **Base de datos:** PostgreSQL `15+` (o SQLite para ejecución local rápida).

---

## 2. Variables de Entorno

### Backend (`backend/.env`)
Copiar el archivo `backend/.env.example` a `backend/.env`:

```env
DATABASE_URL=usuario:contrasena@localhost:5432/bd_food_store
SECRET_KEY=cambiar-esta-clave-secreta-de-al-menos-32-caracteres-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=URL_DEL_FRONTEND
```

### Frontend (`frontend/.env`)
Copiar el archivo `frontend/.env.example` a `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 3. Instalación y Ejecución del Backend

```bash
cd backend
python -m venv .venv

# Activar entorno virtual en Windows:
.venv\Scripts\activate
# Activar entorno virtual en Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env

# Poblar base de datos inicial (idempotente)
python -m app.db.seed

# Iniciar servidor de desarrollo
uvicorn app.main:app --reload
```

- **API Base URL:** `http://localhost:8000/api/v1`
- **Documentación interactiva Swagger UI:** `http://localhost:8000/docs`
- **Documentación ReDoc:** `http://localhost:8000/redoc`

### Credenciales del Seed Inicial
Al ejecutar `python -m app.db.seed`, se crean 4 categorías, 10 productos con stock y el siguiente usuario para el panel de administración:
- **Usuario:** `admin`
- **Contraseña:** `Admin1234!`
- **Rol:** `admin`

---

## 4. Instalación y Ejecución del Frontend

En una nueva terminal:

```bash
cd frontend
copy .env.example .env

pnpm install

# Verificar compilación estricta y tipado de TypeScript
pnpm build

# Levantar servidor de desarrollo
pnpm dev
```

- **Aplicación Web Frontend:** `http://localhost:5173`