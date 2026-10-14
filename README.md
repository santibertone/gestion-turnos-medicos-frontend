# Clínica Virtual — Frontend (Turnos Médicos)

Frontend del **Sistema de Gestión de Turnos Médicos** (Programación II — Proyecto
integrador final). Construido en **Angular 21 + Angular Material 21**, consume la
API del backend del proyecto (repositorio aparte).

> Entrega **Frontend — Semana 1**: setup, Angular Material, layout general
> (header, menú y footer), pantalla principal con/sin sesión, registro de
> pacientes, login, cierre de sesión, "Mi perfil" y rutas protegidas por sesión
> y por rol.

---

## Versiones utilizadas

| Herramienta      | Versión            |
|------------------|--------------------|
| Node.js          | 22.x LTS (22.12+)  |
| npm              | 11.x               |
| Angular CLI      | 21.x               |
| Angular          | 21.2               |
| Angular Material | 21.2               |
| TypeScript       | 5.9                |

> Angular 21 requiere Node `^20.19.0`, `^22.12.0` o `^24.0.0`. **No usar Node 25**
> (impar / no LTS, fuera de soporte). Si tenés otra versión, recomendamos
> administrar Node con [nvm](https://github.com/nvm-sh/nvm): `nvm install 22 && nvm use 22`.

---

## Requisitos previos

1. **Node 22 LTS** y **npm 11** instalados (ver tabla de arriba).
2. El **backend** del proyecto corriendo en `http://localhost:3000`
   (repositorio: `gestion-turnos-medicos`). El backend ya tiene **CORS**
   habilitado para `http://localhost:4200`.

La URL base de la API se define en un único lugar:
[`src/environments/environment.ts`](src/environments/environment.ts). Si el
backend corre en otra dirección, cambiá `apiUrl` ahí.

---

## Instalar y levantar

```bash
# 1) Instalar dependencias
npm install

# 2) Levantar el servidor de desarrollo (http://localhost:4200)
npm start
# equivalente a: ng serve
```

Abrí el navegador en **http://localhost:4200**. La app recarga sola al guardar cambios.

### Otros comandos

```bash
npm run build   # build de producción (dist/)
npm test        # tests unitarios
```

---

## Credenciales de prueba

Los usuarios seed del backend tienen la contraseña **`clinica123`**. Se ingresa
con **DNI + contraseña**:

| Rol         | DNI        | Contraseña   |
|-------------|------------|--------------|
| Administrador | `18222333` | `clinica123` |
| Operador      | `15200548` | `clinica123` |
| Médico        | `20111222` | `clinica123` |
| Paciente      | `36000960` | `clinica123` |

También podés **registrarte** como paciente nuevo desde la pantalla de registro
(la cobertura se elige de un listado traído del backend).

---

## Estructura del proyecto

```
src/
├─ environments/
│  └─ environment.ts          # URL base de la API (único lugar)
└─ app/
   ├─ core/                   # lógica transversal
   │  ├─ models/              # ApiResponse, Usuario, Cobertura, Auth
   │  ├─ services/            # AuthService, CoberturaService
   │  ├─ interceptors/        # auth.interceptor (token Bearer)
   │  ├─ guards/              # authGuard (sesión), rolGuard (rol)
   │  └─ utils/               # helper de mensajes de error
   ├─ layout/                 # header, menú lateral, footer, shell
   ├─ features/               # pantallas
   │  ├─ home/                # pantalla principal (con/sin sesión)
   │  ├─ auth/login/          # login (DNI + contraseña)
   │  ├─ auth/registro/       # registro de paciente
   │  ├─ perfil/              # "Mi perfil" (GET /auth/perfil)
   │  └─ errores/             # En construcción / Acceso denegado / No encontrada
   ├─ app.routes.ts           # rutas + guards por sesión y por rol
   └─ app.config.ts           # providers (router, HTTP + interceptor, animaciones)
```

### Rutas y acceso

- **Públicas:** `/` (inicio), `/login`, `/registro`.
- **Con sesión:** `/perfil`.
- **Por rol:** `/admin/...`, `/medico/...`, `/operador/...`, `/paciente/...`.
  - Sin sesión → redirige a `/login`.
  - Rol no permitido → `/acceso-denegado`.
- Ruta inexistente → página **No encontrada** (`**`).

La sesión se guarda en `localStorage` (token JWT) y se mantiene al recargar.
El token se envía automáticamente a los endpoints protegidos vía interceptor.

---

## Endpoints consumidos (Semana 1)

| Método | Endpoint         | Uso                              |
|--------|------------------|----------------------------------|
| POST   | `/auth/registro` | Alta de paciente                 |
| POST   | `/auth/login`    | Inicio de sesión (devuelve JWT)  |
| GET    | `/auth/perfil`   | Datos del usuario logueado       |
| GET    | `/coberturas`    | Listado para el registro         |

El backend responde siempre con la estructura uniforme `{ codigo, estado, datos }`.
