<<<<<<< HEAD
# 🏙️ SIRECOVIP - Sistema de Registro de Comerciantes en Vía Pública

Plataforma integral para el censo, geolocalización y administración de comerciantes en el Municipio de Querétaro.

## 🚀 Arquitectura

El sistema opera bajo una arquitectura de microservicios contenerizados (Monorepo):

* **Backend:** Node.js (v24), Express, Supabase (PostgreSQL & Auth).
* **Frontend:** React, Vite, TailwindCSS (Diseño Mobile-First).
* **Infraestructura:** Docker & Docker Compose.

---

## 📋 Pre-requisitos

1.  **Docker Desktop** instalado y corriendo.
2.  **Git** instalado.
3.  **Credenciales de Supabase** (Solicitar al Administrador del Proyecto: `SUPABASE_URL` y `SERVICE_ROLE_KEY`).

---

## 🛠️ Guía de Instalación y Ejecución

Sigue estos pasos en orden para levantar el entorno de desarrollo.

### 1. Configuración de Variables de Entorno

El proyecto requiere archivos `.env` en cada servicio. No subas estos archivos al repositorio.

**Backend:**
```bash
cd sirecovip-backend
cp .env.example .env
# IMPORTANTE: Edita .env y agrega tus credenciales reales de Supabase
````

**Frontend:**

```bash
cd ../sirecovip-frontend
cp .env.example .env
# Verifica que la URL apunte al backend local: VITE_API_URL=http://localhost:3000/api
```

-----

### 2\. Limpieza de Entorno (Opcional pero Recomendado)

Si necesitas reiniciar todo desde cero, tienes conflictos de puertos o errores de caché (ej. versiones incorrectas de librerías), ejecuta este comando "nuclear" en tu terminal (PowerShell) desde la raíz:

```powershell
# Detiene todos los contenedores y borra volúmenes (caché de node_modules)
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker system prune -a --volumes
```

-----

### 3\. Levantar el Backend (API)

El cerebro del sistema debe iniciar primero para que el Frontend pueda conectarse.

1.  Abre una terminal en `sirecovip-backend`.
2.  Ejecuta el servicio en segundo plano:
    ```bash
    docker compose up -d --build
    ```
3.  **Verificación:** Visita [http://localhost:3000/](https://www.google.com/search?q=http://localhost:3000/). Debería decir: `API SIRECOVIP Online`.

-----

### 4\. Levantar el Frontend (App)

1.  Abre una terminal en `sirecovip-frontend`.
2.  Ejecuta el servicio (verás los logs de compilación en tiempo real):
    ```bash
    docker compose up --build
    ```
3.  El sistema estará disponible en: **[http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)**

-----

## 🔐 Credenciales de Acceso (Demo)

Para pruebas de desarrollo, utiliza el siguiente usuario con rol de **Inspector**:

  * **Usuario:** `inspector@sirecovip.com`
  * **Contraseña:** `password123`

-----

## 📂 Estructura del Proyecto

```text
sirecovip/
├── sirecovip-backend/   # API REST: Controladores, Modelos y Lógica de Negocio.
│   ├── src/controllers  # Lógica de endpoints.
│   ├── src/routes       # Definición de rutas API.
│   └── Database-Schema.sql # Script de inicialización de Supabase.
│
└── sirecovip-frontend/  # Cliente Web: React + Vite.
    ├── src/pages        # Vistas por Rol (Inspector/Coordinador).
    ├── src/context      # Manejo de Sesión (AuthContext).
    └── src/api          # Configuración de Axios e Interceptores.
```

## 🤝 Colaboración

1.  Siempre corre `docker compose down` al terminar tu sesión para liberar recursos.
2.  No hagas commit de archivos `.env`.
3.  Si instalas una nueva librería (`npm install`), debes reconstruir el contenedor con `--build`.
=======
a
>>>>>>> 92a88b994a66193e8234685fa0e319f81769bee0
