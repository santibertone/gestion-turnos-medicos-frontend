# Clínica Virtual — Frontend (Turnos Médicos)

Frontend del **Sistema de Gestión de Turnos Médicos** (Programación II — Proyecto
integrador final). **Angular 21 + Angular Material 21**, consume la API del backend
(repositorio aparte). Aplicación completa para los cuatro roles: **administrador,
médico, operador y paciente**.

> Pensada para usarse en **escritorio** (no requiere diseño responsive).

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
| **Gráficos**     | **ng2-charts 8 + Chart.js 4** |

> Angular 21 requiere Node `^20.19.0`, `^22.12.0` o `^24.0.0`. **No usar Node 25.**
> Recomendado administrar Node con [nvm](https://github.com/nvm-sh/nvm):
> `nvm install 22 && nvm use 22`.

---

## Levantar el sistema completo desde cero

### 1) Base de datos (MySQL/MariaDB)

```bash
# Crear la base y el esquema, luego los datos de prueba
mysql -u root -p < backend/db/clinica.sql
mysql -u root -p clinica < backend/db/seed_demo.sql
```

El `seed_demo.sql` carga datos de prueba con **fechas relativas a hoy** (para que el
demo funcione cualquier día): 3 médicos (uno con agenda en **dos sedes**),
especialidades y coberturas variadas, y **turnos en los tres estados**
(confirmado / cancelado / atendido).

### 2) Backend (repositorio `gestion-turnos-medicos`)

```bash
cd backend
# archivo .env (no se versiona) con:
#   PORT=3000
#   DB_HOST=localhost
#   DB_PORT=3306
#   DB_USER=root
#   DB_PASSWORD=tu_password
#   DB_NAME=clinica
#   JWT_SECRET=una_clave_secreta
#   JWT_EXPIRES_IN=1d
npm install
npm run dev          # http://localhost:3000  (CORS habilitado para :4200)
```

### 3) Frontend (este repositorio)

```bash
npm install
npm start            # http://localhost:4200
```

Abrí **http://localhost:4200**. La URL base de la API se define en un único lugar:
[`src/environments/environment.ts`](src/environments/environment.ts).

### Otros comandos

```bash
npm run build        # build de producción (dist/)
npm test             # tests unitarios
```

---

## Usuarios de prueba (contraseña: `clinica123`)

Se ingresa con **DNI + contraseña**.

| Rol           | DNI        | Nombre        | Notas                                   |
|---------------|------------|---------------|-----------------------------------------|
| Administrador | `18222333` | Marcos Gómez  | ABMs, usuarios, auditoría y reportes     |
| Operador      | `15200548` | Juan Pérez    | Sede Centro                              |
| Médico        | `20111222` | Ana López     | Traumatología, agenda en **2 sedes**     |
| Médico        | `25333444` | Lucas García  | Clínica Médica y Cardiología (Sede Centro) |
| Médico        | `30555666` | Sofía Martínez| Pediatría (Sede Norte)                   |
| Paciente      | `36000960` | Franco Friggeri | Tiene turnos en varios estados         |

También podés **registrarte** como paciente nuevo desde la pantalla de registro.

---

## Funcionalidades por rol

- **Administrador:** ABM de sedes, especialidades y coberturas; gestión de usuarios
  (alta de operador/médico/admin + edición de cualquiera, con especialidades del
  médico); auditoría (solo lectura, con filtros); dashboard de reportes con gráficos.
- **Médico:** su agenda (alta/edición/baja de rangos por fecha, en una o más sedes);
  turnos programados (atender → carga de historial, cancelar, ver notas); historial
  clínico de los pacientes que atendió.
- **Operador:** agenda y turnos por sede (sólo modifica su sede, consulta el resto);
  alta de pacientes; asignar turnos a un paciente.
- **Paciente:** sacar turno (paso a paso), mis turnos (con estado, cancelación e
  historial si fue atendido), mis datos (edita email, contraseña, teléfono y cobertura).
- **Todos:** campana de notificaciones con contador en vivo.

---

## Detalles técnicos

- **Sesión:** token JWT en `localStorage` (persiste al recargar); se envía
  automáticamente a los endpoints protegidos vía interceptor. Si el token vence, la
  app lleva al login.
- **Rutas por rol:** `/admin/...`, `/medico/...`, `/operador/...`, `/paciente/...`,
  protegidas por sesión y por rol (desde el menú y escribiendo la URL a mano).
- **Reutilización:** el formulario de alta de paciente y el wizard de turno se
  comparten entre roles (no hay pantallas duplicadas).
- **Fechas:** se muestran en formato local `dd/MM/yyyy` (locale `es-AR`).
- **UX:** indicadores de carga, estados vacíos, confirmación antes de las bajas y
  mensajes claros de los errores del backend.

---

## Estructura

```
src/app/
├─ core/            # models, services, guards, interceptors, utils
├─ shared/          # confirmar, cargando, sin-datos, formularios y wizard reutilizables
├─ layout/          # header (con notificaciones), menú por rol, footer
└─ features/
   ├─ auth/         # login, registro
   ├─ home, perfil, errores
   ├─ admin/        # sedes, especialidades, coberturas, usuarios, auditoria, reportes
   ├─ medico/       # agenda, turnos, historial
   ├─ operador/     # agenda, pacientes, turnos
   └─ paciente/     # nuevo-turno, mis-turnos, mis-datos
```
