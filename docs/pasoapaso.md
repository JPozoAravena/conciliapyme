# ConciliaPyme: guia paso a paso

Oct 19, 2026 · @Jotafonkas

## Antes de empezar

La guía se sigue en orden, en 7 sesiones; cada paso termina con una verificación para que sepas que funcionó antes de seguir. Si una verificación falla, no avances: arréglala primero.

### Requisitos en tu equipo

| Herramienta | Cómo verificar | Si falta |
| --- | --- | --- |
| Node.js (versión LTS) | `node -v` | Instala la LTS desde nodejs.org o con nvm |
| Git | `git --version` | Instala Git; configura `git config --global user.name` y `user.email` |
| Docker Desktop o Docker Engine | `docker --version` y `docker compose version` | Instala Docker; en Windows usa WSL 2 |
| GitHub CLI | `gh --version` | Instala `gh` desde cli.github.com |
| VS Code con Claude Code | Abre la carpeta del proyecto | Ya lo usas |

En Windows, ejecuta los comandos en Git Bash o en WSL; los ejemplos son de bash.

### Cuentas gratuitas

Crea o confirma estas cuentas antes de la sesión 2. Ninguna debería pedir tarjeta; si alguna la pide, detente y usa el plan B local (`docker compose` y un video de demostración).

- **GitHub:** repositorio público.
- **Neon:** base PostgreSQL para la demo.
- **MongoDB Atlas:** clúster gratuito M0.
- **SonarQube Cloud:** entra con tu cuenta de GitHub.
- **Vercel:** plan Hobby.

### Convenciones que se usan en toda la guía

- **Ramas:** una rama por issue, con nombre `feat/<número>-<tema>`, `fix/...` o `chore/...`.
- **Commits:** formato Conventional Commits, por ejemplo `feat(auth): add credentials login`. Tipos usados: `feat`, `fix`, `chore`, `test`, `docs`, `ci`, `refactor`.
- **Pull requests:** uno por issue, con `Closes #N` en la descripción, y merge con squash cuando el CI esté verde.
- **Idioma:** código, commits, README y ADRs en inglés (ayuda para empleos remotos); los textos de la interfaz pueden ir en español.
- **Versiones:** Prisma y Auth.js cambian su configuración entre versiones mayores. Los pasos de esta guía están escritos para las versiones clásicas; antes de instalar, abre la guía de inicio actual de cada uno y ajusta lo que difiera.

### Ritmo sugerido

| Sesión | Contenido | Horas |
| --- | --- | --- |
| 1 | Repositorio, entorno e higiene (pasos 1 y 2) | 2 |
| 2 | Bases locales, esquema, pipeline y Sonar (paso 3) | 2.5 |
| 3 | RUT, roles, autenticación y clientes (paso 4) | 2.5 |
| 4 | Importación de cartolas y sugerencias (paso 5) | 3 |
| 5 | Auditoría y confirmación atómica (paso 6) | 2.5 |
| 6 | Docker, dependabot y pruebas E2E (paso 7) | 2 |
| 7 | Despliegue, documentación y publicación (paso 8) | 2.5 |

El total ronda las 17 horas, más que las 10 a 12 de la ficha original. Si tu semana solo da para unas 12, divide el proyecto en dos semanas: sesiones 1 a 4 la primera y 5 a 7 la segunda, y deja la semana 2 del plan para la siguiente. Es mejor un proyecto terminado y publicado que dos a medias.

### Cómo usar Claude Code en cada issue

Abre VS Code en la carpeta del proyecto y pide, por cada issue: *Construye el issue número N con un subagente, siguiendo los criterios de aceptación de la guía. Luego lanza otro subagente auditor que revise seguridad, pruebas, accesibilidad y que no haya secretos en el código, y corrige lo que encuentre antes de abrir el PR.* Lee siempre el diff antes de hacer commit: eres quien responde por el código.

## Sesión 1: crear la app y el repositorio

Al terminar esta sección tendrás una app Next.js corriendo en tu equipo y un repositorio público en GitHub con el commit inicial.

### Paso 1.1: verifica tus herramientas

```bash
mkdir -p ~/proyectos && cd ~/proyectos
node -v
git --version
docker --version
gh --version
```

**Verificación:** los cuatro comandos imprimen una versión. Si alguno falla, instala esa herramienta antes de seguir.

### Paso 1.2: inicia sesión en GitHub CLI

```bash
gh auth login
```

Elige `GitHub.com`, protocolo `HTTPS` y autenticación por navegador; copia el código que te muestra y pégalo en la página que se abre.

**Verificación:** `gh auth status` muestra `Logged in to github.com account <tu-usuario>`.

### Paso 1.3: crea la app Next.js

```bash
npx create-next-app@latest conciliapyme --ts --app --eslint --tailwind --src-dir --use-npm
cd conciliapyme
```

Si el asistente pregunta por opciones adicionales (Turbopack, alias de importación u otras), acepta los valores por defecto.

**Verificación:**

1. `npm run dev` y abre `http://localhost:3000`: ves la página inicial de Next.js. Detén el servidor con `Ctrl+C`.
2. `git log --oneline` muestra un commit inicial; `create-next-app` ya inicializó Git.
3. La carpeta contiene `src/app` (con `layout.tsx` y `page.tsx`), `public`, `package.json`, `tsconfig.json` y la configuración de ESLint. Los nombres exactos pueden variar un poco según la versión.

### Paso 1.4: protege tu correo en los commits

Todos tus commits quedarán públicos. En GitHub entra a **Settings > Emails**, activa *Keep my email addresses private* y copia tu dirección `noreply`. Luego, dentro del repo:

```bash
git config user.name "Tu Nombre"
git config user.email "<id>+<usuario>@users.noreply.github.com"
```

### Paso 1.5: crea el repositorio público y sube el código

```bash
gh repo create conciliapyme --public --source=. --remote=origin --push --description "Bank reconciliation for Chilean SMEs (Next.js, PostgreSQL, MongoDB)"
```

**Verificación:**

1. `git remote -v` muestra `origin` apuntando a tu cuenta.
2. `git branch --show-current` imprime `main`. Si imprime `master`, corre `git branch -M main && git push -u origin main`.
3. `gh repo view --web` abre el repositorio en el navegador con el commit inicial.

### Paso 1.6: abre el proyecto en VS Code

```bash
code .
```

Abre una terminal integrada en VS Code y confirma que el directorio actual es `conciliapyme`.

**Punto de control de la sesión 1 (parte A):** repo público con el commit inicial, `npm run dev` funcionando y tus datos de commit configurados.

## Sesión 1: higiene del repositorio

Al terminar tendrás formato, pruebas y commits convencionales automáticos, los 10 issues creados y el tablero Kanban listo.

### Paso 2.1: fija la versión de Node

```bash
node -v > .nvmrc
```

**Verificación:** `cat .nvmrc` muestra algo como `v22.x.x`. El pipeline leerá este archivo.

### Paso 2.2: instala las herramientas de desarrollo

```bash
npm i -D prettier vitest @vitest/coverage-v8 @playwright/test @commitlint/cli @commitlint/config-conventional husky
```

**Verificación:** `npm ls --depth=0` lista los siete paquetes sin errores.

### Paso 2.3: configura Prettier

Crea `.prettierrc`:

```json
{ "singleQuote": true, "semi": true }
```

### Paso 2.4: agrega los scripts

En `package.json`, dentro de `scripts`, deja estos (conserva los que ya existen):

```json
"typecheck": "tsc --noEmit",
"test": "vitest run",
"test:cov": "vitest run --coverage",
"test:e2e": "playwright test",
"format": "prettier --write ."
```

### Paso 2.5: configura Vitest y una prueba de humo

Crea `vitest.config.ts` en la raíz:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**'],
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
```

Crea `tests/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs the test runner', () => {
    expect(1 + 1).toBe(2);
  });
});
```

**Verificación:** `npm test` termina con `1 passed`. La cobertura se mide solo sobre `src/lib`, donde vivirá la lógica de negocio.

### Paso 2.6: commits convencionales automáticos

```bash
npx husky init
```

Crea los siguientes archivos **con el editor de VS Code**, no con `echo`: en `cmd` y PowerShell, `echo` guarda las comillas dentro del archivo y el hook queda roto (`npm run lint: command not found`). Contenido exacto de cada uno:

`commitlint.config.js`:

```js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

`.husky/commit-msg`:

```
npx --no -- commitlint --edit $1
```

`.husky/pre-commit` (reemplaza lo que creó `husky init`):

```
npm run lint
```

Guarda los archivos de `.husky` con fin de línea **LF** (abajo a la derecha en VS Code, haz clic en `CRLF` y elige `LF`), y crea `.gitattributes` con esta línea para que no vuelva a pasar:

```
.husky/* text eol=lf
```

**Verificación:**

1. `git commit --allow-empty -m "mensaje malo"` debe fallar.
2. `git commit --allow-empty -m "chore: test hooks"` debe pasar. Deshazlo con `git reset --soft HEAD~1`.

### Paso 2.7: permite versionar el archivo de ejemplo de entorno

Next.js ignora todos los archivos `.env*`. Agrega esta línea al final de `.gitignore` para poder publicar `.env.example`:

```
!.env.example
```

### Paso 2.8: agrega la licencia

En GitHub abre el repo, **Add file > Create new file**, llama al archivo `LICENSE` y elige la plantilla **MIT**. Confirma en `main` y luego trae el cambio: `git pull`.

### Paso 2.9: crea los 10 issues

Cada issue lleva sus criterios de aceptación. Ejecuta estos comandos uno a uno:

```bash
gh issue create --title "chore: scaffold, lint and test tooling" --body "Acceptance: npm run lint, typecheck and test pass; hooks enforce Conventional Commits."
gh issue create --title "feat: authentication with roles" --body "Acceptance: login works; an OWNER gets 403 on admin routes; login attempts are rate limited."
gh issue create --title "feat: clients and invoices with RUT validation" --body "Acceptance: invalid RUT and non-integer amounts are rejected."
gh issue create --title "feat: idempotent bank statement import" --body "Acceptance: importing the same CSV twice creates no duplicates."
gh issue create --title "feat: reconciliation suggestions" --body "Acceptance: every suggestion states the rule that produced it."
gh issue create --title "feat: atomic reconciliation confirmation" --body "Acceptance: a failure in any step leaves no partial changes."
gh issue create --title "feat: audit log" --body "Acceptance: each change stores who, what, when and the previous state."
gh issue create --title "ci: pipeline with SonarQube quality gate" --body "Acceptance: PRs run lint, tests, coverage and the Sonar quality gate."
gh issue create --title "chore: Docker, dependabot and E2E tests" --body "Acceptance: docker compose up runs the whole app; the E2E flow passes in CI."
gh issue create --title "docs: README, ADR and diagram" --body "Acceptance: an outsider can run the project from the README alone."
```

**Verificación:** `gh issue list` muestra 10 issues abiertos, numerados del 1 al 10 en este orden.

### Paso 2.10: crea el tablero Kanban

1. En el repo, abre la pestaña **Projects** y elige **New project**, plantilla **Board**.
2. Nómbralo `ConciliaPyme`.
3. Usa las columnas `Backlog`, `In progress` y `Done`.
4. Agrega los 10 issues con **Add item**.

Mueve cada issue a `In progress` cuando abras su rama y a `Done` cuando se haga merge.

### Paso 2.11: primer PR (issue 1)

```bash
git switch -c chore/1-scaffold
git add -A
git commit -m "chore: add prettier, vitest, commitlint and husky"
git push -u origin HEAD
gh pr create --fill --body "Closes #1"
```

Revisa el diff en GitHub y haz el merge:

```bash
gh pr merge --squash --delete-branch
git switch main && git pull
```

**Verificación:** el issue 1 aparece cerrado y `main` contiene los cambios.

### Paso 2.12: protege la rama principal

En **Settings > Branches** (o **Rules > Rulesets**, según la interfaz actual), crea una regla para `main` que exija pull request y bloquee los force push. Cuando exista el pipeline (sesión 2), agrega también el requisito de que el CI pase.

### Paso 2.13: activa las revisiones de seguridad

En **Settings > Code security**, activa las alertas de Dependabot, el escaneo de secretos con *push protection* y CodeQL en modo por defecto. Según lo que conozco son gratuitos en repositorios públicos; confírmalo en esa pantalla.

**Punto de control de la sesión 1:** issue 1 cerrado, tablero con 9 issues pendientes, rama `main` protegida, hooks funcionando y seguridad activada.

## Sesión 2: bases de datos, esquema, pipeline y SonarQube

Al terminar tendrás PostgreSQL y MongoDB corriendo en Docker, el esquema migrado, un endpoint de salud y un pipeline que analiza cada pull request con SonarQube.

### Paso 3.1: levanta las bases de datos locales

Crea la rama `chore/db-foundation` (`git switch -c chore/db-foundation`) y el archivo `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: conciliapyme
      POSTGRES_PASSWORD: conciliapyme
      POSTGRES_DB: conciliapyme
    ports: ['5432:5432']
    volumes: ['pgdata:/var/lib/postgresql/data']
  mongo:
    image: mongo:7
    ports: ['27017:27017']
    volumes: ['mongodata:/data/db']
volumes:
  pgdata:
  mongodata:
```

Crea `.env.example` (este sí se versiona):

```
DATABASE_URL=postgresql://conciliapyme:conciliapyme@localhost:5432/conciliapyme
MONGODB_URI=mongodb://localhost:27017/conciliapyme
AUTH_SECRET=replace-with-output-of-openssl-rand-base64-32
```

Luego crea tu `.env` real y levanta los servicios:

```bash
cp .env.example .env
openssl rand -base64 32   # pega el resultado como AUTH_SECRET en .env
docker compose up -d
```

**Verificación:**

1. `docker compose ps` muestra `postgres` y `mongo` en estado `running`.
2. `docker compose exec postgres psql -U conciliapyme -c "select 1"` devuelve una fila.
3. `docker compose exec mongo mongosh --eval "db.runCommand({ping:1})"` devuelve `ok: 1`.
4. `git status` no muestra `.env` (está ignorado) pero sí `.env.example`.

Las credenciales de este archivo son solo para desarrollo local; en Neon y Atlas usarás otras.

### Paso 3.2: instala Prisma y las dependencias de datos

```bash
npm i @prisma/client mongoose zod
npm i -D prisma
npx prisma init --datasource-provider postgresql
```

Prisma crea `prisma/schema.prisma`. **Verifica que tu `.env` siga teniendo las tres variables**; si `prisma init` lo reescribió, restaura el contenido desde `.env.example`.

Agrega este script en `package.json` para que el cliente de Prisma se genere al instalar (lo necesitarán el CI y Vercel):

```json
"postinstall": "prisma generate"
```

> Prisma 7 cambió parte de su configuración (por ejemplo, la URL de la base de datos pasa a un archivo `prisma.config.ts`). Si tu versión es la 7 o posterior, sigue su guía de inicio actual y conserva el esquema de abajo.

### Paso 3.3: define el esquema

Reemplaza `prisma/schema.prisma` por:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CONTADOR
  DUENO
  ADMIN
}

enum FacturaEstado {
  PENDIENTE
  PAGADA
  CON_DIFERENCIA
}

enum MovimientoEstado {
  SIN_CONCILIAR
  CONCILIADO
}

model User {
  id             String         @id @default(cuid())
  email          String         @unique
  passwordHash   String
  role           Role
  createdAt      DateTime       @default(now())
  conciliaciones Conciliacion[]
}

model Cliente {
  id          String    @id @default(cuid())
  rut         String    @unique
  razonSocial String
  facturas    Factura[]
}

model Factura {
  id             String         @id @default(cuid())
  folio          Int            @unique
  clienteId      String
  cliente        Cliente        @relation(fields: [clienteId], references: [id])
  montoClp       Int
  emision        DateTime
  vencimiento    DateTime
  estado         FacturaEstado  @default(PENDIENTE)
  conciliaciones Conciliacion[]
}

model MovimientoBancario {
  id           String            @id @default(cuid())
  importId     String
  banco        String
  fecha        DateTime
  montoClp     Int
  descripcion  String
  referencia   String?
  lineHash     String            @unique
  estado       MovimientoEstado  @default(SIN_CONCILIAR)
  conciliacion Conciliacion?
}

model Conciliacion {
  id            String             @id @default(cuid())
  movimientoId  String             @unique
  movimiento    MovimientoBancario @relation(fields: [movimientoId], references: [id])
  facturaId     String
  factura       Factura            @relation(fields: [facturaId], references: [id])
  userId        String
  user          User               @relation(fields: [userId], references: [id])
  regla         String
  diferenciaClp Int                @default(0)
  createdAt     DateTime           @default(now())
}
```

Decisiones que conviene explicar en el ADR: los montos son `Int` en pesos (sin decimales flotantes); `lineHash` es único para que reimportar una cartola no duplique movimientos; el folio se simplifica como único global (en la vida real sería único por emisor).

### Paso 3.4: crea la migración

```bash
npx prisma migrate dev --name init
```

**Verificación:** aparece `prisma/migrations/<fecha>_init/migration.sql` y el comando termina con `Your database is now in sync with your schema`. Opcional: `npx prisma studio` abre un visor con las tablas vacías.

### Paso 3.5: conexiones a las bases

`src/lib/db.ts`:

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

`src/lib/mongo.ts`:

```ts
import mongoose from 'mongoose';

const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};

export function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  globalForMongoose.mongooseConn ??= mongoose.connect(uri);
  return globalForMongoose.mongooseConn;
}
```

El objeto global evita abrir una conexión nueva en cada recarga en desarrollo.

### Paso 3.6: endpoint de salud

`src/app/api/health/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { connectMongo } from '@/lib/mongo';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const mongo = await connectMongo();
    await mongo.connection.db?.admin().ping();
    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
```

**Verificación:** con `npm run dev` corriendo, `curl http://localhost:3000/api/health` devuelve `{"status":"ok"}`. Si apagas Mongo (`docker compose stop mongo`) debe devolver 503.

### Paso 3.7: prepara SonarQube Cloud

1. Entra a SonarQube Cloud con tu cuenta de GitHub y crea (o elige) tu organización gratuita.
2. Elige **Import project** y selecciona el repositorio `conciliapyme`.
3. Cuando pregunte el método de análisis, elige **With GitHub Actions**. Te mostrará el nombre de tu organización, la clave del proyecto y un token.
4. Si el proyecto tiene activado el *análisis automático*, desactívalo en **Administration > Analysis Method**, porque no puede convivir con el análisis desde el CI.
5. Guarda el token como secreto del repositorio:

```bash
gh secret set SONAR_TOKEN
```

Pega el token cuando lo pida. **Verificación:** `gh secret list` muestra `SONAR_TOKEN`.

### Paso 3.8: configuración de Sonar

`sonar-project.properties` (reemplaza los valores entre `<>` por los que te mostró SonarQube Cloud):

```
sonar.projectKey=<tu-org>_conciliapyme
sonar.organization=<tu-org>
sonar.sources=src
sonar.tests=tests
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=src/app/**/page.tsx,src/app/**/layout.tsx,src/components/**,tests/**,prisma/**
```

La cobertura se exige sobre la lógica (`src/lib`), no sobre las páginas de la interfaz; por eso hay que mantener la lógica fuera de los componentes.

### Paso 3.9: el pipeline

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: conciliapyme
          POSTGRES_PASSWORD: conciliapyme
          POSTGRES_DB: conciliapyme
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U conciliapyme"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10
      mongo:
        image: mongo:7
        ports: ['27017:27017']
    env:
      DATABASE_URL: postgresql://conciliapyme:conciliapyme@localhost:5432/conciliapyme
      MONGODB_URI: mongodb://localhost:27017/conciliapyme
      AUTH_SECRET: ci-only-secret
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:cov
      - name: SonarQube scan
        uses: SonarSource/sonarqube-scan-action@v5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      - name: Quality gate
        uses: SonarSource/sonarqube-quality-gate-action@v1
        timeout-minutes: 5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

`fetch-depth: 0` es necesario para que Sonar detecte qué código es nuevo. Las versiones de las acciones de Sonar pueden haber cambiado: si el asistente de SonarQube Cloud te mostró un fragmento distinto, usa el suyo.

### Paso 3.10: primer PR del pipeline

```bash
git add -A
git commit -m "ci: add database foundation, health endpoint and sonar pipeline"
git push -u origin HEAD
gh pr create --fill --body "Closes #8. Refs #3."
```

**Verificación:**

1. En la pestaña **Actions** el workflow `CI` termina en verde.
2. En SonarQube Cloud aparece el primer análisis del proyecto.
3. En el PR ves el estado de la revisión de Sonar. Si el quality gate falla, abre el detalle: lo más común es cobertura insuficiente sobre código nuevo; agrega pruebas o revisa las exclusiones.

Haz el merge con `gh pr merge --squash --delete-branch` y vuelve a `main` con `git switch main && git pull`.

### Paso 3.11: exige el CI en la rama principal

En la regla de `main` (paso 2.12) agrega como requisito obligatorio el job `build` y, si aparece, el estado de SonarQube Cloud.

**Punto de control de la sesión 2:** issue 8 cerrado, CI verde, análisis de Sonar visible, `/api/health` respondiendo y las migraciones aplicadas en el CI.

## Sesión 3: RUT, roles, autenticación y clientes

Al terminar tendrás un validador de RUT probado, permisos por rol, login con tres usuarios de demostración y un CRUD de clientes protegido. Son dos pull requests: uno para el issue 2 (autenticación) y otro para el issue 3 (clientes y facturas).

### Paso 4.1: validador de RUT con pruebas primero

Empieza por la lógica pura: es la que Sonar medirá y la más fácil de probar. Crea la rama:

```bash
git switch main && git pull
git switch -c feat/3-rut-validator
```

Primero la prueba, en `tests/rut.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizarRut, validarRut } from '@/lib/rut';

describe('validarRut', () => {
  it('acepta RUT con dígito verificador numérico', () => {
    expect(validarRut('12.345.678-5')).toBe(true);
  });
  it('acepta RUT con dígito verificador K, en mayúscula o minúscula', () => {
    expect(validarRut('10.000.013-K')).toBe(true);
    expect(validarRut('10000013-k')).toBe(true);
  });
  it('acepta RUT con dígito verificador 0', () => {
    expect(validarRut('14.000.000-0')).toBe(true);
  });
  it('rechaza dígito verificador incorrecto', () => {
    expect(validarRut('12.345.678-9')).toBe(false);
  });
  it('rechaza formatos inválidos', () => {
    expect(validarRut('')).toBe(false);
    expect(validarRut('abc')).toBe(false);
    expect(validarRut('123-4')).toBe(false);
  });
});

describe('normalizarRut', () => {
  it('quita puntos y deja guion antes del dígito verificador', () => {
    expect(normalizarRut('12.345.678-5')).toBe('12345678-5');
    expect(normalizarRut('10000013k')).toBe('10000013-K');
  });
});
```

Ejecuta `npm test`: debe **fallar** porque `@/lib/rut` aún no existe. Ese fallo es la señal de que la prueba realmente prueba algo. Ahora `src/lib/rut.ts`:

```ts
function limpiar(input: string): string {
  return input.replace(/[.\-\s]/g, '').toUpperCase();
}

export function validarRut(input: string): boolean {
  const limpio = limpiar(input);
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === esperado;
}

export function normalizarRut(input: string): string {
  const limpio = limpiar(input);
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}
```

**Verificación:** `npm test` pasa en verde y `npm run test:cov` muestra 100 % en `rut.ts`. Si falla una prueba, no cambies la prueba: revisa el algoritmo (los factores van 2, 3, 4, 5, 6, 7 y vuelven a 2, de derecha a izquierda).

### Paso 4.2: esquemas de validación

`src/lib/schemas.ts`:

```ts
import { z } from 'zod';
import { validarRut } from '@/lib/rut';

export const clienteSchema = z.object({
  rut: z.string().refine(validarRut, 'RUT inválido'),
  razonSocial: z.string().trim().min(2, 'Ingresa la razón social'),
});

export const facturaSchema = z
  .object({
    folio: z.coerce.number().int().positive(),
    clienteId: z.string().min(1),
    montoClp: z.coerce.number().int().positive('El monto debe ser mayor a 0'),
    emision: z.coerce.date(),
    vencimiento: z.coerce.date(),
  })
  .refine((f) => f.vencimiento >= f.emision, {
    message: 'El vencimiento no puede ser anterior a la emisión',
    path: ['vencimiento'],
  });
```

Escribe `tests/schemas.test.ts` con al menos cuatro casos: cliente válido, RUT inválido, monto con decimales (debe fallar porque el CLP es entero) y vencimiento anterior a la emisión. Haz commit de todo:

```bash
git add -A
git commit -m "feat(clientes): add RUT validator and zod schemas"
```

### Paso 4.3: permisos por rol y límite de intentos

Crea la rama de autenticación (puedes apilarla sobre la anterior si el PR de RUT aún no se mergea, o abrir antes ese PR; lo más limpio es mergear primero):

```bash
git push -u origin HEAD
gh pr create --fill --body "Refs #3. Pure validation logic first; CRUD comes in the next PR."
gh pr merge --squash --delete-branch   # cuando el CI esté verde
git switch main && git pull
git switch -c feat/2-auth-roles
```

`src/lib/rbac.ts`:

```ts
export type Role = 'CONTADOR' | 'DUENO' | 'ADMIN';

const permisos = {
  'cliente:gestionar': ['CONTADOR', 'ADMIN'],
  'cartola:importar': ['CONTADOR', 'ADMIN'],
  'conciliacion:confirmar': ['CONTADOR', 'ADMIN'],
  'auditoria:ver': ['DUENO', 'ADMIN'],
} as const;

export type Accion = keyof typeof permisos;

export function puede(role: Role, accion: Accion): boolean {
  return (permisos[accion] as readonly Role[]).includes(role);
}
```

`src/lib/rate-limit.ts` (en memoria; en la semana 2 lo reemplazarás por Redis):

```ts
const intentos = new Map<string, { count: number; reset: number }>();

export function limitar(clave: string, max = 5, ventanaMs = 60_000, ahora = Date.now()): boolean {
  const entrada = intentos.get(clave);
  if (!entrada || entrada.reset <= ahora) {
    intentos.set(clave, { count: 1, reset: ahora + ventanaMs });
    return true;
  }
  if (entrada.count >= max) return false;
  entrada.count += 1;
  return true;
}
```

Escribe `tests/rbac.test.ts` (el DUEÑO no puede confirmar conciliaciones; el CONTADOR no ve auditoría) y `tests/rate-limit.test.ts` (el sexto intento dentro de la ventana falla; con `ahora` posterior a la ventana vuelve a pasar; claves distintas no se afectan). Pasar `ahora` como parámetro evita usar relojes falsos.

**Limitación honesta para el README:** en un entorno serverless cada instancia tiene su propio `Map`, así que este límite es de mejor esfuerzo. Por eso la semana 2 usa Redis.

### Paso 4.4: Auth.js con credenciales

```bash
npm i next-auth@beta bcryptjs
```

bcryptjs 3 trae sus propios tipos; si instalaste la versión 2, agrega `@types/bcryptjs` como dependencia de desarrollo. Auth.js v5 lee `AUTH_SECRET` del entorno automáticamente.

`src/auth.ts`:

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { limitar } from '@/lib/rate-limit';
import type { Role } from '@/lib/rbac';

const credencialesSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      async authorize(raw) {
        const parsed = credencialesSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        if (!limitar(`login:${email}`)) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        return ok ? { id: user.id, email: user.email, role: user.role } : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
});
```

`src/types/next-auth.d.ts`:

```ts
import type { DefaultSession } from 'next-auth';
import type { Role } from '@/lib/rbac';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: Role } & DefaultSession['user'];
  }
  interface User {
    role?: Role;
  }
}
```

`src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

La autorización se verifica **en el servidor, dentro de cada página y acción**, no solo ocultando botones. No uses middleware que importe `auth` aquí: Prisma no corre en el runtime edge y el build fallaría.

**Verificación:** `npm run typecheck` y `npm run lint` sin errores. Si TypeScript se queja de `token.role`, confirma que el archivo `next-auth.d.ts` está dentro de `include` en `tsconfig.json` (por defecto `**/*.ts` lo cubre).

### Paso 4.5: usuarios y datos de demostración

```bash
npm i -D tsx
```

`prisma/seed.ts`:

```ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Demo1234!', 10);
  const usuarios = [
    { email: 'contador@demo.cl', role: Role.CONTADOR },
    { email: 'dueno@demo.cl', role: Role.DUENO },
    { email: 'admin@demo.cl', role: Role.ADMIN },
  ];
  for (const u of usuarios) {
    await prisma.user.upsert({ where: { email: u.email }, update: {}, create: { ...u, passwordHash } });
  }

  const clientes = [
    { rut: '76000000-0', razonSocial: 'Constructora Los Alerces SpA' },
    { rut: '12345678-5', razonSocial: 'Panadería San Martín' },
    { rut: '10000013-K', razonSocial: 'Clínica Dental Ñuñoa' },
    { rut: '14000000-0', razonSocial: 'Transportes Andes Sur' },
  ];
  for (const c of clientes) {
    await prisma.cliente.upsert({ where: { rut: c.rut }, update: {}, create: c });
  }

  const hoy = new Date();
  const enDias = (n: number) => new Date(hoy.getTime() + n * 86_400_000);
  const facturas = [
    { folio: 1001, rut: '76000000-0', montoClp: 1_190_000, dias: 10 },
    { folio: 1002, rut: '12345678-5', montoClp: 238_000, dias: 5 },
    { folio: 1003, rut: '10000013-K', montoClp: 595_000, dias: -3 },
    { folio: 1004, rut: '14000000-0', montoClp: 1_785_000, dias: 20 },
  ];
  for (const f of facturas) {
    const cliente = await prisma.cliente.findUniqueOrThrow({ where: { rut: f.rut } });
    await prisma.factura.upsert({
      where: { folio: f.folio },
      update: {},
      create: {
        folio: f.folio,
        clienteId: cliente.id,
        montoClp: f.montoClp,
        emision: enDias(f.dias - 30),
        vencimiento: enDias(f.dias),
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
```

Regístralo en `package.json` y ejecútalo:

```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

```bash
npx prisma db seed
```

En Prisma 7 la configuración del seed se mueve a `prisma.config.ts`; si es tu caso, sigue su documentación vigente. La clave `Demo1234!` es solo de demostración y va documentada en el README como tal.

**Verificación:** `npx prisma studio` muestra 3 usuarios, 4 clientes y 4 facturas, y `passwordHash` empieza con `$2`.

### Paso 4.6: página de login y página protegida

`src/app/login/page.tsx`:

```tsx
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function login(formData: FormData) {
    'use server';
    try {
      await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: '/',
      });
    } catch (e) {
      if (e instanceof AuthError) redirect('/login?error=1');
      throw e;
    }
  }

  return (
    <main className='mx-auto mt-24 max-w-sm px-4'>
      <h1 className='mb-6 text-2xl font-semibold'>Ingresar a ConciliaPyme</h1>
      <form action={login} className='flex flex-col gap-3'>
        <label htmlFor='email'>Correo</label>
        <input id='email' name='email' type='email' autoComplete='username' required className='rounded border px-2 py-1' />
        <label htmlFor='password'>Contraseña</label>
        <input id='password' name='password' type='password' autoComplete='current-password' required className='rounded border px-2 py-1' />
        {error && <p role='alert' className='text-red-700'>Credenciales inválidas o demasiados intentos.</p>}
        <button className='rounded bg-black px-3 py-2 text-white'>Ingresar</button>
      </form>
    </main>
  );
}
```

El mensaje de error es genérico a propósito: no revela si el correo existe. Las etiquetas enlazadas con `htmlFor`, el `role='alert'` y los `autoComplete` son parte de la accesibilidad básica que un revisor sí mira.

`src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <main className='mx-auto mt-16 max-w-2xl px-4'>
      <h1 className='text-2xl font-semibold'>Hola, {session.user.email}</h1>
      <p className='mt-2'>Rol: {session.user.role}</p>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}
      >
        <button className='mt-6 rounded border px-3 py-2'>Cerrar sesión</button>
      </form>
    </main>
  );
}
```

**Verificación manual** (`npm run dev`):

1. `http://localhost:3000` te redirige a `/login`.
2. `contador@demo.cl` con `Demo1234!` entra y muestra el rol CONTADOR.
3. Una clave incorrecta muestra el mensaje de error.
4. Seis intentos fallidos seguidos con el mismo correo bloquean incluso la clave correcta durante un minuto.
5. «Cerrar sesión» te devuelve a `/login`.

### Paso 4.7: revisión con el subagente auditor y primer PR de autenticación

Antes de abrir el PR, pide una revisión independiente en Claude Code. Usa un agente distinto al que escribió el código y dile que **no edite**, solo reporte:

> Actúa como auditor de seguridad. Revisa solo el diff de esta rama contra main. Busca: secretos en el código, rutas sin verificación de sesión o rol, mensajes de error que filtren información, y pruebas que no prueben nada. Entrega una lista con severidad y archivo. No modifiques archivos.

Corrige lo que tenga sentido y anota en la descripción del PR qué hallazgos aceptaste y cuáles descartaste (esto alimenta tu sección «AI usage» del README).

```bash
git add -A
git commit -m "feat(auth): add credentials login, roles and rate limiting"
git push -u origin HEAD
gh pr create --fill --body "Closes #2. Auditor review: <resumen>."
```

Cuando el CI y Sonar estén en verde: `gh pr merge --squash --delete-branch`.

### Paso 4.8: CRUD de clientes con permisos

```bash
git switch main && git pull
git switch -c feat/3-clientes
```

`src/app/clientes/actions.ts`:

```ts
'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { puede } from '@/lib/rbac';
import { normalizarRut } from '@/lib/rut';
import { clienteSchema } from '@/lib/schemas';

export async function crearCliente(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user || !puede(session.user.role, 'cliente:gestionar')) {
    return { ok: false, error: 'No tienes permiso para esta acción' };
  }
  const parsed = clienteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await prisma.cliente.create({
      data: { rut: normalizarRut(parsed.data.rut), razonSocial: parsed.data.razonSocial },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe un cliente con ese RUT' };
    }
    throw e;
  }
  revalidatePath('/clientes');
  return { ok: true };
}
```

`src/app/clientes/cliente-form.tsx`:

```tsx
'use client';

import { useActionState } from 'react';
import { crearCliente } from './actions';

export function ClienteForm() {
  const [estado, accion, pendiente] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const r = await crearCliente(formData);
      return r.ok ? null : { error: r.error };
    },
    null,
  );
  return (
    <form action={accion} className='flex max-w-md flex-col gap-3'>
      <label htmlFor='rut'>RUT</label>
      <input id='rut' name='rut' required className='rounded border px-2 py-1' />
      <label htmlFor='razonSocial'>Razón social</label>
      <input id='razonSocial' name='razonSocial' required className='rounded border px-2 py-1' />
      {estado?.error && <p role='alert' className='text-red-700'>{estado.error}</p>}
      <button disabled={pendiente} className='rounded bg-black px-3 py-2 text-white'>
        {pendiente ? 'Guardando…' : 'Crear cliente'}
      </button>
    </form>
  );
}
```

`src/app/clientes/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { puede } from '@/lib/rbac';
import { ClienteForm } from './cliente-form';

export default async function ClientesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const clientes = await prisma.cliente.findMany({ orderBy: { razonSocial: 'asc' } });

  return (
    <main className='mx-auto mt-12 max-w-3xl px-4'>
      <h1 className='mb-4 text-2xl font-semibold'>Clientes</h1>
      <table className='mb-8 w-full text-left'>
        <thead>
          <tr><th scope='col'>RUT</th><th scope='col'>Razón social</th></tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}><td>{c.rut}</td><td>{c.razonSocial}</td></tr>
          ))}
        </tbody>
      </table>
      {puede(session.user.role, 'cliente:gestionar') && <ClienteForm />}
    </main>
  );
}
```

El formulario solo se muestra a quien puede usarlo, **y además** la acción vuelve a verificar el permiso: ocultar el botón no es seguridad.

### Paso 4.9: facturas con Claude Code (ejercicio guiado)

Las facturas siguen exactamente el mismo patrón. Pídele a Claude Code, con tu archivo `actions.ts` de clientes como referencia:

> Crea `src/app/facturas/actions.ts`, `factura-form.tsx` y `page.tsx` siguiendo el patrón de `src/app/clientes`. Usa `facturaSchema`, el permiso `cliente:gestionar`, y muestra el monto con `Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })`. Maneja folio duplicado con el código P2002.

Revisa el resultado tú mismo: ¿verifica sesión y rol?, ¿el monto se formatea sin decimales?, ¿el folio duplicado da un mensaje claro? Luego pasa el auditor igual que en el paso 4.7.

```bash
git add -A
git commit -m "feat(clientes): add client and invoice management with role checks"
git push -u origin HEAD
gh pr create --fill --body "Closes #3."
```

**Verificación manual:** con `contador@demo.cl` ves el formulario y puedes crear un cliente; con `dueno@demo.cl` ves la tabla pero no el formulario; un RUT con dígito verificador malo muestra «RUT inválido».

**Punto de control de la sesión 3:** issues 2 y 3 cerrados, tres usuarios de demostración funcionando, pruebas de RUT, esquemas, permisos y límite de intentos en verde, y cobertura de `src/lib` sobre el umbral de Sonar.

## Sesión 4: importación idempotente de cartolas y sugerencias de conciliación

Es la sesión con más valor de portafolio: aquí demuestras manejo de datos sucios, idempotencia, dos bases de datos con roles distintos y lógica de negocio probada. Son dos pull requests: issue 4 (importación) e issue 5 (sugerencias).

### Paso 5.1: rama y dependencias

```bash
git switch main && git pull
git switch -c feat/4-cartola-import
npm i papaparse
npm i -D @types/papaparse
```

Antes de programar, define el contrato con estas dos reglas, que irán al ADR:

1. Importar dos veces **el mismo archivo** no cambia nada (hash del archivo, índice único en MongoDB).
2. Importar **otro archivo que repite líneas** (cartolas que se traslapan) no duplica movimientos (hash por línea, índice único en PostgreSQL).

### Paso 5.2: archivo de ejemplo y parser, pruebas primero

Crea `tests/fixtures/banco-a.csv` (separador punto y coma, miles con punto, cargos y abonos en columnas separadas):

```
Fecha;Descripción;Cargo;Abono;Saldo
02/09/2026;TRANSF DE 76000000-0 FAC 1001;;1.190.000;5.400.000
03/09/2026;PAGO PROVEEDOR LUZ;85.000;;5.315.000
04/09/2026;DEPOSITO 12345678-5;;237.500;5.552.500
```

Y `tests/fixtures/banco-b.csv` (coma, fecha ISO, monto con signo, columna de referencia):

```
date,detail,amount,reference
2026-09-05,Transferencia recibida,595000,FAC 1003
2026-09-06,Comisión mantención,-4500,
```

Escribe `tests/cartola.test.ts` antes del código:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CartolaError, parseCartola, parseFechaCL, parseMontoClp } from '@/lib/cartola/parse';

const leer = (nombre: string) => readFileSync(`tests/fixtures/${nombre}`, 'utf8');

describe('parseMontoClp', () => {
  it('interpreta separador de miles y signo', () => {
    expect(parseMontoClp('1.190.000')).toBe(1190000);
    expect(parseMontoClp('-4500')).toBe(-4500);
  });
  it('rechaza decimales y texto', () => {
    expect(() => parseMontoClp('12,5')).toThrow(CartolaError);
    expect(() => parseMontoClp('abc')).toThrow(CartolaError);
  });
});

describe('parseFechaCL', () => {
  it('lee dd/mm/aaaa en UTC', () => {
    expect(parseFechaCL('02/09/2026').toISOString()).toBe('2026-09-02T00:00:00.000Z');
  });
  it('rechaza fechas imposibles', () => {
    expect(() => parseFechaCL('31/02/2026')).toThrow(CartolaError);
  });
});

describe('parseCartola', () => {
  it('detecta el formato del banco A y calcula montos con signo', () => {
    const r = parseCartola(leer('banco-a.csv'));
    expect(r.banco).toBe('BANCO_A');
    expect(r.lineas.map((l) => l.montoClp)).toEqual([1190000, -85000, 237500]);
  });
  it('detecta el formato del banco B y conserva la referencia', () => {
    const r = parseCartola(leer('banco-b.csv'));
    expect(r.banco).toBe('BANCO_B');
    expect(r.lineas[0].referencia).toBe('FAC 1003');
    expect(r.lineas[1].referencia).toBeNull();
  });
  it('informa la fila con error y no importa nada a medias', () => {
    const malo = 'Fecha;Descripción;Cargo;Abono;Saldo\n02/09/2026;X;;abc;1\n';
    expect(() => parseCartola(malo)).toThrow(/fila 2/i);
  });
  it('rechaza formatos desconocidos', () => {
    expect(() => parseCartola('a,b\n1,2\n')).toThrow(CartolaError);
  });
});
```

Ejecuta `npm test`: debe fallar. Ahora `src/lib/cartola/parse.ts`:

```ts
import Papa from 'papaparse';

export class CartolaError extends Error {}

export type LineaCartola = {
  fila: number;
  fecha: Date;
  montoClp: number;
  descripcion: string;
  referencia: string | null;
  raw: Record<string, string>;
};

export type CartolaParseada = { banco: 'BANCO_A' | 'BANCO_B'; lineas: LineaCartola[] };

export function parseMontoClp(texto: string): number {
  const limpio = texto.trim().replace(/\./g, '').replace(/\s/g, '');
  if (!/^-?\d+$/.test(limpio)) throw new CartolaError(`Monto inválido: '${texto}'`);
  return Number(limpio);
}

function fechaUtc(anio: number, mes: number, dia: number, original: string): Date {
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  if (fecha.getUTCMonth() !== mes - 1 || fecha.getUTCDate() !== dia) {
    throw new CartolaError(`Fecha inválida: '${original}'`);
  }
  return fecha;
}

export function parseFechaCL(texto: string): Date {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!m) throw new CartolaError(`Fecha inválida: '${texto}'`);
  return fechaUtc(Number(m[3]), Number(m[2]), Number(m[1]), texto);
}

function parseFechaIso(texto: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto.trim());
  if (!m) throw new CartolaError(`Fecha inválida: '${texto}'`);
  return fechaUtc(Number(m[1]), Number(m[2]), Number(m[3]), texto);
}

const montoOpcional = (t: string | undefined) => (t && t.trim() !== '' ? parseMontoClp(t) : 0);

export function parseCartola(contenido: string): CartolaParseada {
  const texto = contenido.replace(/^﻿/, '');
  const { data, meta } = Papa.parse<Record<string, string>>(texto, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) =>
      h.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''),
  });
  const campos = meta.fields ?? [];
  const esA = campos.includes('fecha') && campos.includes('cargo') && campos.includes('abono');
  const esB = campos.includes('date') && campos.includes('amount');
  if (!esA && !esB) throw new CartolaError('Formato de cartola no reconocido');

  const lineas = data.map((raw, i): LineaCartola => {
    const fila = i + 2; // la fila 1 es el encabezado
    try {
      if (esA) {
        return {
          fila,
          fecha: parseFechaCL(raw.fecha),
          montoClp: montoOpcional(raw.abono) - montoOpcional(raw.cargo),
          descripcion: (raw.descripcion ?? '').trim(),
          referencia: null,
          raw,
        };
      }
      return {
        fila,
        fecha: parseFechaIso(raw.date),
        montoClp: parseMontoClp(raw.amount),
        descripcion: (raw.detail ?? '').trim(),
        referencia: raw.reference?.trim() ? raw.reference.trim() : null,
        raw,
      };
    } catch (e) {
      if (e instanceof CartolaError) throw new CartolaError(`Fila ${fila}: ${e.message}`);
      throw e;
    }
  });

  if (lineas.length === 0) throw new CartolaError('El archivo no tiene movimientos');
  return { banco: esA ? 'BANCO_A' : 'BANCO_B', lineas };
}
```

Dos decisiones que conviene explicar en el ADR: se rechaza **todo** el archivo ante una fila inválida (mejor que importar a medias y dejar al contador sin saber qué falta), y las fechas se guardan en UTC a medianoche para que la zona horaria del servidor no cambie el día.

**Verificación:** `npm test` en verde. Si el caso de la fila 2 falla, revisa que el mensaje contenga `Fila 2`.

### Paso 5.3: hashes

`src/lib/cartola/hash.ts`:

```ts
import { createHash } from 'node:crypto';
import type { LineaCartola } from './parse';

export const sha256 = (texto: string) => createHash('sha256').update(texto).digest('hex');

/** Un hash por línea. Si la misma línea aparece dos veces en un archivo (dos pagos idénticos el mismo día), el contador de ocurrencias las distingue. */
export function hashesDeLineas(banco: string, lineas: LineaCartola[]): string[] {
  const vistos = new Map<string, number>();
  return lineas.map((l) => {
    const base = `${banco}|${l.fecha.toISOString().slice(0, 10)}|${l.montoClp}|${l.descripcion}`;
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    return sha256(`${base}|${n}`);
  });
}
```

Agrega a `tests/cartola.test.ts` dos pruebas: el mismo contenido produce los mismos hashes, y dos líneas idénticas dentro de un archivo producen hashes **distintos**.

### Paso 5.4: modelos de MongoDB

`src/models/cartola.ts`:

```ts
import mongoose, { Schema } from 'mongoose';

const importacionSchema = new Schema(
  {
    fileHash: { type: String, required: true, unique: true },
    nombreArchivo: { type: String, required: true },
    banco: { type: String, required: true },
    userId: { type: String, required: true },
    totalFilas: { type: Number, required: true },
    estado: { type: String, enum: ['PROCESANDO', 'COMPLETA'], default: 'PROCESANDO' },
  },
  { timestamps: true },
);

const lineaSchema = new Schema({
  importId: { type: String, required: true, index: true },
  fila: { type: Number, required: true },
  raw: { type: Schema.Types.Mixed, required: true },
});

export const Importacion =
  mongoose.models.Importacion || mongoose.model('Importacion', importacionSchema);
export const CartolaLinea =
  mongoose.models.CartolaLinea || mongoose.model('CartolaLinea', lineaSchema);
```

Por qué MongoDB aquí: cada banco entrega columnas distintas, así que la línea original se guarda tal cual (`raw`) sin migrar el esquema cada vez que aparece un banco nuevo. Lo que el negocio consulta y suma vive normalizado en PostgreSQL.

### Paso 5.5: servicio de importación

`src/lib/cartola/importar.ts`:

```ts
import { prisma } from '@/lib/db';
import { connectMongo } from '@/lib/mongo';
import { CartolaLinea, Importacion } from '@/models/cartola';
import { hashesDeLineas, sha256 } from './hash';
import { parseCartola } from './parse';

export type ResultadoImportacion =
  | { duplicada: true; importId: string }
  | { duplicada: false; importId: string; nuevas: number; omitidas: number };

export async function importarCartola(input: {
  contenido: string;
  nombreArchivo: string;
  userId: string;
}): Promise<ResultadoImportacion> {
  const parseada = parseCartola(input.contenido); // falla antes de tocar las bases
  await connectMongo();
  await Importacion.init(); // asegura el índice único antes de insertar
  const fileHash = sha256(input.contenido);

  const existente = await Importacion.findOne({ fileHash });
  if (existente) return { duplicada: true, importId: String(existente._id) };

  let importacion;
  try {
    importacion = await Importacion.create({
      fileHash,
      nombreArchivo: input.nombreArchivo,
      banco: parseada.banco,
      userId: input.userId,
      totalFilas: parseada.lineas.length,
    });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      // otra solicitud ganó la carrera con el mismo archivo
      const otra = await Importacion.findOne({ fileHash });
      return { duplicada: true, importId: String(otra?._id) };
    }
    throw e;
  }

  const importId = String(importacion._id);
  try {
    await CartolaLinea.insertMany(
      parseada.lineas.map((l) => ({ importId, fila: l.fila, raw: l.raw })),
    );
    const hashes = hashesDeLineas(parseada.banco, parseada.lineas);
    const res = await prisma.movimientoBancario.createMany({
      data: parseada.lineas.map((l, i) => ({
        importId,
        banco: parseada.banco,
        fecha: l.fecha,
        montoClp: l.montoClp,
        descripcion: l.descripcion,
        referencia: l.referencia,
        lineHash: hashes[i],
      })),
      skipDuplicates: true,
    });
    await Importacion.updateOne({ _id: importacion._id }, { estado: 'COMPLETA' });
    return {
      duplicada: false,
      importId,
      nuevas: res.count,
      omitidas: parseada.lineas.length - res.count,
    };
  } catch (e) {
    // PostgreSQL y MongoDB no comparten transacción: compensamos a mano.
    await CartolaLinea.deleteMany({ importId });
    await prisma.movimientoBancario.deleteMany({ where: { importId } });
    await Importacion.deleteOne({ _id: importacion._id });
    throw e;
  }
}
```

Esta compensación manual es justamente lo que un entrevistador quiere que sepas explicar: no hay transacción distribuida, así que el diseño es «registrar intención, ejecutar, confirmar o deshacer». Déjalo escrito en el ADR junto con la alternativa descartada (una tabla de importaciones en PostgreSQL).

### Paso 5.6: pruebas de integración contra las bases reales

Vitest no carga `.env` por sí solo. En `vitest.config.ts` agrega el import y la opción `env` dentro de `test`:

```ts
import { loadEnv } from 'vite';
// dentro de defineConfig({ test: { ... } }):
//   env: loadEnv('test', process.cwd(), ''),
```

En el CI las variables ya existen y esto no cambia nada. Crea `tests/integration/importar.test.ts`. Para no borrar tus datos de desarrollo, cada prueba genera contenido único y limpia solo lo que creó:

```ts
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/db';
import { importarCartola } from '@/lib/cartola/importar';
import { CartolaLinea, Importacion } from '@/models/cartola';

const creados: string[] = [];

function cartolaUnica() {
  const id = randomUUID().slice(0, 8);
  return (
    'Fecha;Descripción;Cargo;Abono;Saldo\n' +
    `02/09/2026;TEST ${id} UNO;;100.000;1\n` +
    `02/09/2026;TEST ${id} DOS;;200.000;1\n`
  );
}

afterAll(async () => {
  for (const importId of creados) {
    await prisma.movimientoBancario.deleteMany({ where: { importId } });
    await CartolaLinea.deleteMany({ importId });
    await Importacion.deleteOne({ _id: importId });
  }
  await prisma.$disconnect();
  await mongoose.disconnect();
});

describe('importarCartola', () => {
  it('es idempotente con el mismo archivo', async () => {
    const contenido = cartolaUnica();
    const a = await importarCartola({ contenido, nombreArchivo: 'a.csv', userId: 'test' });
    const b = await importarCartola({ contenido, nombreArchivo: 'a.csv', userId: 'test' });
    creados.push(a.importId);
    expect(a).toMatchObject({ duplicada: false, nuevas: 2, omitidas: 0 });
    expect(b).toMatchObject({ duplicada: true, importId: a.importId });
    expect(await prisma.movimientoBancario.count({ where: { importId: a.importId } })).toBe(2);
  });

  it('no duplica movimientos cuando otro archivo repite las mismas líneas', async () => {
    const contenido = cartolaUnica();
    const a = await importarCartola({ contenido, nombreArchivo: 'a.csv', userId: 'test' });
    const b = await importarCartola({ contenido: contenido + '\n', nombreArchivo: 'b.csv', userId: 'test' });
    creados.push(a.importId, b.importId);
    expect(b).toMatchObject({ duplicada: false, nuevas: 0, omitidas: 2 });
  });

  it('no deja rastros si el archivo es inválido', async () => {
    const antes = await Importacion.countDocuments();
    await expect(
      importarCartola({ contenido: 'x,y\n1,2\n', nombreArchivo: 'c.csv', userId: 'test' }),
    ).rejects.toThrow();
    expect(await Importacion.countDocuments()).toBe(antes);
  });
});
```

**Verificación:** con `docker compose up -d` activo, `npm test` pasa los tres casos. Detén Mongo (`docker compose stop mongo`) y comprueba que fallan con error de conexión en lugar de colgarse; vuelve a levantarlo.

### Paso 5.7: acción de servidor y formulario

`src/app/importar/actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { CartolaError } from '@/lib/cartola/parse';
import { importarCartola } from '@/lib/cartola/importar';
import { puede } from '@/lib/rbac';

export async function importarCartolaAction(
  formData: FormData,
): Promise<{ ok: true; mensaje: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user || !puede(session.user.role, 'cartola:importar')) {
    return { ok: false, error: 'No tienes permiso para importar cartolas' };
  }
  const archivo = formData.get('archivo');
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, error: 'Selecciona un archivo CSV' };
  }
  if (!archivo.name.toLowerCase().endsWith('.csv')) {
    return { ok: false, error: 'El archivo debe ser .csv' };
  }
  if (archivo.size > 1_000_000) {
    return { ok: false, error: 'El archivo supera 1 MB' };
  }
  try {
    const r = await importarCartola({
      contenido: await archivo.text(),
      nombreArchivo: archivo.name,
      userId: session.user.id,
    });
    if (r.duplicada) {
      return { ok: true, mensaje: 'Este archivo ya fue importado. No se hicieron cambios.' };
    }
    revalidatePath('/conciliacion');
    return { ok: true, mensaje: `${r.nuevas} movimientos nuevos, ${r.omitidas} ya existían.` };
  } catch (e) {
    // solo mostramos mensajes que escribimos nosotros; el resto se registra y se oculta
    if (e instanceof CartolaError) return { ok: false, error: e.message };
    console.error('importarCartola failed', e);
    return { ok: false, error: 'No se pudo importar el archivo. Inténtalo nuevamente.' };
  }
}
```

Crea `src/app/importar/importar-form.tsx` copiando el patrón de `ClienteForm` (`useActionState`), con estas diferencias: un `<input type='file' name='archivo' accept='.csv' required>` con su `<label>`, `encType` no es necesario con server actions, y el resultado se muestra en un `<p role='status'>` cuando es correcto y en un `<p role='alert'>` cuando falla. La página `src/app/importar/page.tsx` sigue el modelo de `/clientes`: verifica sesión, y si el rol no tiene `cartola:importar`, muestra un mensaje en vez del formulario.

**Verificación manual** con `contador@demo.cl`:

1. Subes `tests/fixtures/banco-a.csv`: «3 movimientos nuevos, 0 ya existían».
2. Lo subes otra vez: «Este archivo ya fue importado».
3. Subes `banco-b.csv`: 2 movimientos nuevos.
4. Subes un `.txt`: error de extensión. Subes un CSV roto: error con el número de fila.
5. Con `dueno@demo.cl` no puedes importar.
6. En `npx prisma studio` ves los movimientos, y en MongoDB (`docker compose exec mongo mongosh conciliapyme --eval "db.cartolalineas.find().limit(2)"`) ves las líneas originales.

### Paso 5.8: primer PR de la sesión

```bash
git add -A
git commit -m "feat(import): add idempotent bank statement import with postgres and mongo"
git push -u origin HEAD
gh pr create --fill --body "Closes #4. See ADR notes on cross-database compensation."
```

Pide al subagente auditor que revise el diff buscando: archivos grandes sin límite, mensajes de error que filtren datos internos, condiciones de carrera en la importación y pruebas que no prueben nada. Mergea con `gh pr merge --squash --delete-branch` cuando el CI esté verde.

### Paso 5.9: reglas de sugerencia, pruebas primero

```bash
git switch main && git pull
git switch -c feat/5-suggestions
```

La lógica es una función pura: recibe un movimiento y las facturas pendientes, y devuelve candidatos con puntaje. Reglas:

- **100**: monto exacto y el folio aparece en la glosa o referencia.
- **70**: monto exacto y fecha a 5 días o menos del vencimiento.
- **40**: diferencia menor (hasta el 1 % o $1.000, lo que sea mayor) y, además, folio o fecha cercana. Sin esa segunda señal, cualquier factura de monto parecido sería candidata.

Escribe primero `tests/sugerir.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { sugerir, type FacturaPendiente, type Movimiento } from '@/lib/conciliacion/sugerir';

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

const factura = (p: Partial<FacturaPendiente> & { id: string }): FacturaPendiente => ({
  folio: 1001,
  montoClp: 1190000,
  vencimiento: d('2026-09-10'),
  ...p,
});

const mov = (p: Partial<Movimiento> = {}): Movimiento => ({
  id: 'm1',
  fecha: d('2026-09-09'),
  montoClp: 1190000,
  descripcion: 'TRANSFERENCIA',
  referencia: null,
  ...p,
});

describe('sugerir', () => {
  it('da 100 puntos a monto exacto con folio en la glosa', () => {
    const r = sugerir(mov({ descripcion: 'TRANSF DE 76000000-0 FAC 1001' }), [factura({ id: 'f1' })]);
    expect(r[0]).toMatchObject({ facturaId: 'f1', puntaje: 100, regla: 'MONTO_Y_FOLIO', diferenciaClp: 0 });
  });

  it('da 70 puntos a monto exacto con fecha cercana y sin folio', () => {
    const r = sugerir(mov(), [factura({ id: 'f1' })]);
    expect(r[0]).toMatchObject({ puntaje: 70, regla: 'MONTO_Y_FECHA' });
  });

  it('no sugiere monto exacto con fecha lejana y sin folio', () => {
    const r = sugerir(mov({ fecha: d('2026-10-30') }), [factura({ id: 'f1' })]);
    expect(r).toEqual([]);
  });

  it('da 40 puntos a una diferencia pequeña y registra la diferencia', () => {
    const r = sugerir(mov({ montoClp: 1189500, descripcion: 'PAGO FAC 1001' }), [factura({ id: 'f1' })]);
    expect(r[0]).toMatchObject({ puntaje: 40, regla: 'DIFERENCIA_MENOR', diferenciaClp: -500 });
  });

  it('ignora movimientos negativos', () => {
    expect(sugerir(mov({ montoClp: -1190000 }), [factura({ id: 'f1' })])).toEqual([]);
  });

  it('ordena por puntaje y limita la cantidad', () => {
    const facturas = [
      factura({ id: 'sin-folio', folio: 2002 }),
      factura({ id: 'con-folio', folio: 1001 }),
    ];
    const r = sugerir(mov({ descripcion: 'FAC 1001' }), facturas, 1);
    expect(r).toHaveLength(1);
    expect(r[0].facturaId).toBe('con-folio');
  });
});
```

Con `npm test` verás el fallo esperado. Ahora `src/lib/conciliacion/sugerir.ts`:

```ts
export type Movimiento = {
  id: string;
  fecha: Date;
  montoClp: number;
  descripcion: string;
  referencia: string | null;
};

export type FacturaPendiente = {
  id: string;
  folio: number;
  montoClp: number;
  vencimiento: Date;
};

export type Regla = 'MONTO_Y_FOLIO' | 'MONTO_Y_FECHA' | 'DIFERENCIA_MENOR';

export type Sugerencia = {
  facturaId: string;
  puntaje: number;
  regla: Regla;
  diferenciaClp: number;
};

const DIA_MS = 86_400_000;
const VENTANA_DIAS = 5;

function mencionaFolio(m: Movimiento, folio: number): boolean {
  const numeros = `${m.referencia ?? ''} ${m.descripcion}`.match(/\d+/g) ?? [];
  return numeros.includes(String(folio));
}

export function sugerir(mov: Movimiento, facturas: FacturaPendiente[], max = 3): Sugerencia[] {
  if (mov.montoClp <= 0) return [];

  const candidatos: { sugerencia: Sugerencia; dias: number }[] = [];
  for (const f of facturas) {
    const diferenciaClp = mov.montoClp - f.montoClp;
    const dias = Math.abs(mov.fecha.getTime() - f.vencimiento.getTime()) / DIA_MS;
    const folio = mencionaFolio(mov, f.folio);
    const cerca = dias <= VENTANA_DIAS;
    const tolerancia = Math.max(1_000, Math.round(f.montoClp * 0.01));

    let regla: Regla | null = null;
    let puntaje = 0;
    if (diferenciaClp === 0 && folio) {
      regla = 'MONTO_Y_FOLIO';
      puntaje = 100;
    } else if (diferenciaClp === 0 && cerca) {
      regla = 'MONTO_Y_FECHA';
      puntaje = 70;
    } else if (Math.abs(diferenciaClp) <= tolerancia && (folio || cerca)) {
      regla = 'DIFERENCIA_MENOR';
      puntaje = 40;
    }
    if (regla) candidatos.push({ sugerencia: { facturaId: f.id, puntaje, regla, diferenciaClp }, dias });
  }

  return candidatos
    .sort((a, b) => b.sugerencia.puntaje - a.sugerencia.puntaje || a.dias - b.dias)
    .slice(0, max)
    .map((c) => c.sugerencia);
}
```

**Verificación:** `npm test` en verde y cobertura cercana a 100 % en `sugerir.ts`. Limitación para el README: un folio que coincida por azar con un número del RUT en la glosa generaría un falso positivo; por eso el sistema solo **sugiere** y una persona confirma.

### Paso 5.10: pantalla de conciliación (solo lectura)

Crea `src/lib/format.ts`:

```ts
export const formatClp = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
```

Y `src/app/conciliacion/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { sugerir, type Regla } from '@/lib/conciliacion/sugerir';
import { prisma } from '@/lib/db';
import { formatClp } from '@/lib/format';

const TEXTO_REGLA: Record<Regla, string> = {
  MONTO_Y_FOLIO: 'Monto y folio coinciden',
  MONTO_Y_FECHA: 'Monto exacto y fecha cercana',
  DIFERENCIA_MENOR: 'Diferencia menor',
};

export default async function ConciliacionPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [movimientos, facturas] = await Promise.all([
    prisma.movimientoBancario.findMany({
      where: { estado: 'SIN_CONCILIAR', montoClp: { gt: 0 } },
      orderBy: { fecha: 'desc' },
      take: 100,
    }),
    prisma.factura.findMany({ where: { estado: 'PENDIENTE' }, include: { cliente: true } }),
  ]);

  return (
    <main className='mx-auto mt-12 max-w-5xl px-4'>
      <h1 className='mb-4 text-2xl font-semibold'>Conciliación</h1>
      <table className='w-full text-left'>
        <thead>
          <tr>
            <th scope='col'>Fecha</th>
            <th scope='col'>Descripción</th>
            <th scope='col'>Monto</th>
            <th scope='col'>Sugerencia</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => {
            const mejor = sugerir(m, facturas)[0];
            const factura = mejor && facturas.find((f) => f.id === mejor.facturaId);
            return (
              <tr key={m.id}>
                <td>{m.fecha.toISOString().slice(0, 10)}</td>
                <td>{m.descripcion}</td>
                <td>{formatClp(m.montoClp)}</td>
                <td>
                  {mejor && factura
                    ? `Factura ${factura.folio} · ${factura.cliente.razonSocial} · ${mejor.puntaje}/100 (${TEXTO_REGLA[mejor.regla]})`
                    : 'Sin sugerencia'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
```

El puntaje y la regla se muestran como texto, no solo con color, para que la información sea accesible. La confirmación llega en la sesión siguiente.

**Verificación manual:** tras importar `banco-a.csv`, el movimiento que menciona `FAC 1001` sugiere la factura 1001 con 100/100; el de `DEPOSITO 12345678-5` por $237.500 puede mostrar «Sin sugerencia» si la fecha del movimiento queda a más de 5 días del vencimiento de la factura 1002 (el seed usa fechas relativas a hoy). Eso es correcto y es un buen caso para tu prueba E2E de la sesión 6, donde usarás fechas fijas.

### Paso 5.11: segundo PR de la sesión

```bash
git add -A
git commit -m "feat(conciliacion): add scored match suggestions and read-only screen"
git push -u origin HEAD
gh pr create --fill --body "Closes #5."
```

Revisión con el auditor: pídele que intente romper `sugerir` con casos límite (monto cero, folio repetido en dos facturas, fechas en distinto huso) y que proponga pruebas que falten, sin editar. Mergea con el CI en verde.

**Punto de control de la sesión 4:** issues 4 y 5 cerrados, importación idempotente probada contra PostgreSQL y MongoDB reales, función de sugerencias con cobertura alta y la pantalla de conciliación mostrando sugerencias.

## Sesión 5: auditoría y confirmación atómica

Aquí está el corazón técnico del proyecto: una operación que toca varias filas debe ocurrir completa o no ocurrir, y cada acción importante debe quedar registrada. Son dos pull requests: primero la auditoría (issue 7), porque la confirmación (issue 6) la va a usar.

### Paso 6.1: modelo y servicio de auditoría

```bash
git switch main && git pull
git switch -c feat/7-audit-log
```

`src/models/auditoria.ts`:

```ts
import mongoose, { Schema } from 'mongoose';

const auditoriaSchema = new Schema({
  userId: { type: String, required: true, index: true },
  accion: { type: String, required: true, index: true },
  entidad: { type: String, required: true },
  entidadId: { type: String, required: true },
  antes: Schema.Types.Mixed,
  despues: Schema.Types.Mixed,
  fecha: { type: Date, required: true, default: Date.now, index: true },
});

export const Auditoria =
  mongoose.models.Auditoria || mongoose.model('Auditoria', auditoriaSchema);
```

`src/lib/auditoria.ts`:

```ts
import { connectMongo } from '@/lib/mongo';
import { Auditoria } from '@/models/auditoria';

export type EventoAuditoria = {
  userId: string;
  accion: string;
  entidad: string;
  entidadId: string;
  antes?: unknown;
  despues?: unknown;
};

export async function registrarAuditoria(evento: EventoAuditoria): Promise<void> {
  try {
    await connectMongo();
    await Auditoria.create({ ...evento, fecha: new Date() });
  } catch (e) {
    // La operación de negocio ya ocurrió; no la deshacemos por un fallo del registro.
    console.error('No se pudo registrar la auditoría', e);
  }
}
```

Dos decisiones para el ADR:

- **Solo se agrega, nunca se edita ni se borra.** El módulo no expone funciones de actualización ni eliminación; así el historial es confiable.
- **Si el registro falla, la operación no se revierte.** PostgreSQL y MongoDB no comparten transacción. La alternativa más robusta es el patrón *outbox* (guardar el evento en PostgreSQL dentro de la misma transacción y publicarlo después a MongoDB); déjala anotada como mejora futura.

### Paso 6.2: registrar eventos en lo que ya existe

En `src/app/clientes/actions.ts`, importa `registrarAuditoria` y reemplaza el bloque `try/catch` de creación por:

```ts
  let creado;
  try {
    creado = await prisma.cliente.create({
      data: { rut: normalizarRut(parsed.data.rut), razonSocial: parsed.data.razonSocial },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Ya existe un cliente con ese RUT' };
    }
    throw e;
  }
  await registrarAuditoria({
    userId: session.user.id,
    accion: 'CLIENTE_CREADO',
    entidad: 'Cliente',
    entidadId: creado.id,
    despues: { rut: creado.rut, razonSocial: creado.razonSocial },
  });
```

En `src/app/importar/actions.ts`, justo antes del `return` que informa los movimientos nuevos, agrega:

```ts
    await registrarAuditoria({
      userId: session.user.id,
      accion: 'CARTOLA_IMPORTADA',
      entidad: 'Importacion',
      entidadId: r.importId,
      despues: { archivo: archivo.name, nuevas: r.nuevas, omitidas: r.omitidas },
    });
```

Si creaste la acción de facturas con Claude Code, agrega allí `FACTURA_CREADA` con el mismo patrón.

### Paso 6.3: pantalla de auditoría para el dueño

`src/app/auditoria/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { connectMongo } from '@/lib/mongo';
import { puede } from '@/lib/rbac';
import { Auditoria } from '@/models/auditoria';

export default async function AuditoriaPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!puede(session.user.role, 'auditoria:ver')) {
    return (
      <main className='mx-auto mt-12 max-w-3xl px-4'>
        <h1 className='text-2xl font-semibold'>Auditoría</h1>
        <p role='alert' className='mt-4'>No tienes permiso para ver este registro.</p>
      </main>
    );
  }

  await connectMongo();
  const eventos = await Auditoria.find().sort({ fecha: -1 }).limit(50).lean();
  const ids = [...new Set(eventos.map((e) => e.userId))];
  const usuarios = await prisma.user.findMany({ where: { id: { in: ids } } });
  const email = new Map(usuarios.map((u) => [u.id, u.email]));

  return (
    <main className='mx-auto mt-12 max-w-5xl px-4'>
      <h1 className='mb-4 text-2xl font-semibold'>Auditoría</h1>
      <table className='w-full text-left'>
        <thead>
          <tr>
            <th scope='col'>Fecha</th>
            <th scope='col'>Usuario</th>
            <th scope='col'>Acción</th>
            <th scope='col'>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((e) => (
            <tr key={String(e._id)}>
              <td>{new Date(e.fecha).toISOString().replace('T', ' ').slice(0, 19)}</td>
              <td>{email.get(e.userId) ?? e.userId}</td>
              <td>{e.accion}</td>
              <td><code>{JSON.stringify(e.despues ?? {})}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

Agrega una barra de navegación mínima en `src/app/layout.tsx` con enlaces a Clientes, Importar, Conciliación y Auditoría (un `<nav aria-label='Principal'>` con enlaces visibles solo si el rol tiene el permiso correspondiente). Es un buen momento para pedirle a Claude Code que lo haga y que tú revises el resultado con el teclado: ¿puedes llegar a todo con Tab y ver el foco?

### Paso 6.4: prueba de integración y PR

Crea `tests/integration/auditoria.test.ts`:

```ts
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, expect, it } from 'vitest';
import { registrarAuditoria } from '@/lib/auditoria';
import { Auditoria } from '@/models/auditoria';

const userId = `test-${randomUUID()}`;

afterAll(async () => {
  await Auditoria.deleteMany({ userId });
  await mongoose.disconnect();
});

it('guarda el evento con fecha y datos antes/después', async () => {
  await registrarAuditoria({
    userId,
    accion: 'PRUEBA',
    entidad: 'Test',
    entidadId: '1',
    antes: { estado: 'A' },
    despues: { estado: 'B' },
  });
  const doc = await Auditoria.findOne({ userId }).lean();
  expect(doc?.accion).toBe('PRUEBA');
  expect(doc?.despues).toEqual({ estado: 'B' });
  expect(doc?.fecha).toBeInstanceOf(Date);
});
```

Agrega también una prueba unitaria en `tests/rbac.test.ts`: el dueño y el administrador pueden `auditoria:ver`; el contador no.

```bash
git add -A
git commit -m "feat(audit): add append-only audit log and owner view"
git push -u origin HEAD
gh pr create --fill --body "Closes #7."
```

**Verificación manual:** crea un cliente e importa una cartola con `contador@demo.cl`; entra con `dueno@demo.cl` a `/auditoria` y ves ambos eventos; el contador recibe el mensaje de permiso. Mergea con el CI en verde.

### Paso 6.5: servicio de confirmación atómica

```bash
git switch main && git pull
git switch -c feat/6-confirm-reconciliation
```

La regla de negocio: confirmar una conciliación marca el movimiento como conciliado, cambia el estado de la factura y crea el registro de conciliación. Las tres cosas, o ninguna. Además, dos personas confirmando a la vez el mismo movimiento no deben poder ganar las dos.

`src/lib/conciliacion/confirmar.ts`:

```ts
import { FacturaEstado } from '@prisma/client';
import { registrarAuditoria } from '@/lib/auditoria';
import { prisma } from '@/lib/db';
import { sugerir } from './sugerir';

export class ConciliacionError extends Error {}

export async function confirmarConciliacion(input: {
  movimientoId: string;
  facturaId: string;
  userId: string;
}) {
  const resultado = await prisma.$transaction(async (tx) => {
    const mov = await tx.movimientoBancario.findUnique({ where: { id: input.movimientoId } });
    const factura = await tx.factura.findUnique({ where: { id: input.facturaId } });
    if (!mov || !factura) throw new ConciliacionError('Movimiento o factura no encontrados');
    if (mov.montoClp <= 0) throw new ConciliacionError('Solo se concilian abonos');

    const diferenciaClp = mov.montoClp - factura.montoClp;
    const estadoFactura =
      diferenciaClp === 0 ? FacturaEstado.PAGADA : FacturaEstado.CON_DIFERENCIA;

    // Las actualizaciones condicionales evitan la doble confirmación: si otra
    // transacción ya cambió el estado, count será 0 y esta se revierte completa.
    const m = await tx.movimientoBancario.updateMany({
      where: { id: mov.id, estado: 'SIN_CONCILIAR' },
      data: { estado: 'CONCILIADO' },
    });
    if (m.count !== 1) throw new ConciliacionError('El movimiento ya fue conciliado');

    const f = await tx.factura.updateMany({
      where: { id: factura.id, estado: 'PENDIENTE' },
      data: { estado: estadoFactura },
    });
    if (f.count !== 1) throw new ConciliacionError('La factura ya no está pendiente');

    const regla = sugerir(mov, [factura])[0]?.regla ?? 'MANUAL';
    const conciliacion = await tx.conciliacion.create({
      data: {
        movimientoId: mov.id,
        facturaId: factura.id,
        userId: input.userId,
        regla,
        diferenciaClp,
      },
    });
    return { conciliacion, estadoFactura, regla, diferenciaClp };
  });

  await registrarAuditoria({
    userId: input.userId,
    accion: 'CONCILIACION_CONFIRMADA',
    entidad: 'Conciliacion',
    entidadId: resultado.conciliacion.id,
    antes: { movimiento: 'SIN_CONCILIAR', factura: 'PENDIENTE' },
    despues: {
      movimiento: 'CONCILIADO',
      factura: resultado.estadoFactura,
      regla: resultado.regla,
      diferenciaClp: resultado.diferenciaClp,
    },
  });
  return resultado.conciliacion;
}
```

Observa tres detalles que vale la pena contar en una entrevista: la regla se **recalcula en el servidor** (no se confía en lo que envía el navegador), la protección contra concurrencia está en la propia sentencia SQL (`UPDATE ... WHERE estado = ...`) y no en un chequeo previo que podría quedar obsoleto, y la auditoría se escribe **después** del commit.

### Paso 6.6: pruebas de integración, incluida la concurrencia

`tests/integration/conciliacion.test.ts`:

```ts
import { randomUUID } from 'node:crypto';
import type { FacturaEstado } from '@prisma/client';
import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ConciliacionError, confirmarConciliacion } from '@/lib/conciliacion/confirmar';
import { prisma } from '@/lib/db';
import { Auditoria } from '@/models/auditoria';

const sufijo = randomUUID().slice(0, 8);
const importId = `test-${sufijo}`;
const base = 800_000_000 + Math.floor(Math.random() * 100_000_000);
let seq = 0;
let userId: string;
let clienteId: string;

const crearFactura = (montoClp: number, estado: FacturaEstado = 'PENDIENTE') =>
  prisma.factura.create({
    data: {
      folio: base + ++seq,
      clienteId,
      montoClp,
      emision: new Date('2026-08-01'),
      vencimiento: new Date('2026-09-10'),
      estado,
    },
  });

const crearMovimiento = (montoClp: number) =>
  prisma.movimientoBancario.create({
    data: {
      importId,
      banco: 'BANCO_A',
      fecha: new Date('2026-09-09'),
      montoClp,
      descripcion: `TEST ${sufijo}`,
      lineHash: randomUUID(),
    },
  });

beforeAll(async () => {
  const user = await prisma.user.create({
    data: { email: `test-${sufijo}@test.cl`, passwordHash: 'x', role: 'CONTADOR' },
  });
  userId = user.id;
  const cliente = await prisma.cliente.create({
    data: { rut: `T-${sufijo}`, razonSocial: 'Cliente de prueba' },
  });
  clienteId = cliente.id;
});

afterAll(async () => {
  await prisma.conciliacion.deleteMany({ where: { userId } });
  await prisma.movimientoBancario.deleteMany({ where: { importId } });
  await prisma.factura.deleteMany({ where: { clienteId } });
  await prisma.cliente.delete({ where: { id: clienteId } });
  await prisma.user.delete({ where: { id: userId } });
  await Auditoria.deleteMany({ userId });
  await prisma.$disconnect();
  await mongoose.disconnect();
});

describe('confirmarConciliacion', () => {
  it('confirma un pago exacto y deja auditoría', async () => {
    const f = await crearFactura(1_190_000);
    const m = await crearMovimiento(1_190_000);
    const c = await confirmarConciliacion({ movimientoId: m.id, facturaId: f.id, userId });

    expect(c.diferenciaClp).toBe(0);
    expect((await prisma.factura.findUniqueOrThrow({ where: { id: f.id } })).estado).toBe('PAGADA');
    expect((await prisma.movimientoBancario.findUniqueOrThrow({ where: { id: m.id } })).estado).toBe('CONCILIADO');
    expect(await Auditoria.countDocuments({ userId, entidadId: c.id })).toBe(1);
  });

  it('marca la factura con diferencia cuando el monto no coincide', async () => {
    const f = await crearFactura(1_190_000);
    const m = await crearMovimiento(1_189_500);
    const c = await confirmarConciliacion({ movimientoId: m.id, facturaId: f.id, userId });

    expect(c.diferenciaClp).toBe(-500);
    expect((await prisma.factura.findUniqueOrThrow({ where: { id: f.id } })).estado).toBe('CON_DIFERENCIA');
  });

  it('rechaza cargos', async () => {
    const f = await crearFactura(10_000);
    const m = await crearMovimiento(-10_000);
    await expect(
      confirmarConciliacion({ movimientoId: m.id, facturaId: f.id, userId }),
    ).rejects.toThrow(ConciliacionError);
  });

  it('es atómica: si la factura ya está pagada, el movimiento vuelve a quedar libre', async () => {
    const f = await crearFactura(50_000, 'PAGADA');
    const m = await crearMovimiento(50_000);
    await expect(
      confirmarConciliacion({ movimientoId: m.id, facturaId: f.id, userId }),
    ).rejects.toThrow(ConciliacionError);

    const despues = await prisma.movimientoBancario.findUniqueOrThrow({ where: { id: m.id } });
    expect(despues.estado).toBe('SIN_CONCILIAR');
    expect(await prisma.conciliacion.count({ where: { movimientoId: m.id } })).toBe(0);
  });

  it('con dos confirmaciones simultáneas del mismo movimiento gana solo una', async () => {
    const f1 = await crearFactura(70_000);
    const f2 = await crearFactura(70_000);
    const m = await crearMovimiento(70_000);

    const resultados = await Promise.allSettled([
      confirmarConciliacion({ movimientoId: m.id, facturaId: f1.id, userId }),
      confirmarConciliacion({ movimientoId: m.id, facturaId: f2.id, userId }),
    ]);

    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(resultados.filter((r) => r.status === 'rejected')).toHaveLength(1);
    expect(await prisma.conciliacion.count({ where: { movimientoId: m.id } })).toBe(1);
    const pagadas = await prisma.factura.count({ where: { id: { in: [f1.id, f2.id] }, estado: 'PAGADA' } });
    expect(pagadas).toBe(1);
  });
});
```

La cuarta prueba es la que demuestra la atomicidad: el primer `updateMany` sí tiene éxito dentro de la transacción y luego se **revierte** porque el segundo falla. La quinta demuestra el manejo de concurrencia.

**Verificación:** con las bases levantadas, `npm test` pasa. Para convencerte de que la prueba de atomicidad es real, comenta temporalmente `$transaction` (usa `prisma` en lugar de `tx`), vuelve a correr: debe fallar. Restáuralo.

### Paso 6.7: acción de servidor

Agrega a `src/lib/schemas.ts`:

```ts
export const confirmarSchema = z.object({
  movimientoId: z.string().min(1),
  facturaId: z.string().min(1),
});
```

Y `src/app/conciliacion/actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ConciliacionError, confirmarConciliacion } from '@/lib/conciliacion/confirmar';
import { puede } from '@/lib/rbac';
import { confirmarSchema } from '@/lib/schemas';

export async function confirmarAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!puede(session.user.role, 'conciliacion:confirmar')) {
    redirect('/conciliacion?error=permiso');
  }
  const parsed = confirmarSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/conciliacion?error=invalido');

  let destino = '/conciliacion?ok=1';
  try {
    await confirmarConciliacion({ ...parsed.data, userId: session.user.id });
  } catch (e) {
    if (e instanceof ConciliacionError) {
      destino = '/conciliacion?error=conflicto';
    } else {
      console.error('confirmarConciliacion failed', e);
      destino = '/conciliacion?error=interno';
    }
  }
  revalidatePath('/conciliacion');
  redirect(destino); // redirect lanza una excepción: debe ir fuera del try/catch
}
```

Los errores viajan como **códigos fijos** en la URL y la página los traduce a texto. Si pusieras el mensaje directamente en la URL, cualquiera podría armar un enlace que muestre un texto falso dentro de tu aplicación.

### Paso 6.8: botón de confirmar en la pantalla

En `src/app/conciliacion/page.tsx` haz tres cambios.

1. Importa `puede` desde `@/lib/rbac` y `confirmarAction` desde `./actions`, y agrega antes del componente:

```tsx
const MENSAJES: Record<string, string> = {
  permiso: 'No tienes permiso para confirmar conciliaciones',
  invalido: 'Los datos enviados no son válidos',
  conflicto: 'Ese movimiento o esa factura ya fue conciliado por otra persona',
  interno: 'No se pudo confirmar. Inténtalo nuevamente.',
};
```

2. Recibe los parámetros de la URL:

```tsx
export default async function ConciliacionPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
```

Y muestra los mensajes bajo el título:

```tsx
      {ok && <p role='status' className='mb-4'>Conciliación confirmada.</p>}
      {error && <p role='alert' className='mb-4 text-red-700'>{MENSAJES[error] ?? MENSAJES.interno}</p>}
```

3. Reemplaza el contenido de la última celda por el texto de la sugerencia más un formulario:

```tsx
                <td>
                  {mejor && factura ? (
                    <>
                      <span>
                        {`Factura ${factura.folio} · ${factura.cliente.razonSocial} · ${mejor.puntaje}/100 (${TEXTO_REGLA[mejor.regla]})`}
                      </span>
                      {puede(session.user.role, 'conciliacion:confirmar') && (
                        <form action={confirmarAction} className='mt-1'>
                          <input type='hidden' name='movimientoId' value={m.id} />
                          <input type='hidden' name='facturaId' value={factura.id} />
                          <button
                            aria-label={`Confirmar conciliación de ${m.descripcion} con la factura ${factura.folio}`}
                            className='rounded border px-2 py-1'
                          >
                            Confirmar
                          </button>
                        </form>
                      )}
                    </>
                  ) : (
                    'Sin sugerencia'
                  )}
                </td>
```

El `aria-label` distingue los botones entre sí para quien usa lector de pantalla, ya que todos dicen «Confirmar».

**Verificación manual:**

1. Importa `banco-a.csv` con el contador y confirma la sugerencia de la factura 1001: el movimiento desaparece de la lista y aparece «Conciliación confirmada».
2. En Prisma Studio, la factura 1001 está `PAGADA` y existe una fila en `Conciliacion`.
3. Entra como dueño: no ves botones de confirmar, y `/auditoria` muestra el evento `CONCILIACION_CONFIRMADA` con el contador como autor.
4. Abre dos pestañas con la misma sugerencia, confirma en una y luego en la otra: la segunda muestra el mensaje de conflicto y no duplica nada.

### Paso 6.9: auditor, PR y cierre

Pide al subagente auditor que revise específicamente la transacción: ¿hay algún camino donde se pueda confirmar un movimiento ya conciliado?, ¿se puede confirmar con un rol sin permiso saltándose la interfaz?, ¿los mensajes de error revelan algo interno? Registra qué aceptaste y qué descartaste.

```bash
git add -A
git commit -m "feat(conciliacion): add atomic confirmation with concurrency guard"
git push -u origin HEAD
gh pr create --fill --body "Closes #6. Tests cover rollback and concurrent confirmation."
```

**Punto de control de la sesión 5:** issues 6 y 7 cerrados, pruebas de atomicidad y concurrencia en verde en el CI, auditoría visible para el dueño y el flujo completo funcionando a mano: importar, ver sugerencias, confirmar y auditar.

## Sesión 6: Docker, dependabot y pruebas E2E

Al terminar, cualquiera podrá levantar todo el proyecto con un comando, el CI ejecutará el flujo completo en un navegador real y las dependencias se actualizarán solas mediante pull requests. Es el issue 9.

### Paso 7.1: rama

```bash
git switch main && git pull
git switch -c chore/9-docker-e2e
```

### Paso 7.2: imagen de Docker en varias etapas

El modo `standalone` de Next.js genera un servidor mínimo para producción, pero lo activaremos solo al construir la imagen: `next start` no es compatible con ese modo y lo necesitamos en el CI y en Vercel. Reemplaza `next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
};

export default nextConfig;
```

Crea `.dockerignore`:

```
node_modules
.next
.git
.github
coverage
e2e
tests
.env
.env.*
playwright-report
test-results
```

Y `Dockerfile` (usa la misma versión mayor de Node que tu `.nvmrc`):

```dockerfile
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 DOCKER_BUILD=1
RUN npx prisma generate && npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN useradd --system --uid 1001 nextjs
COPY --from=build --chown=nextjs /app/public ./public
COPY --from=build --chown=nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

Por qué tres etapas: la imagen final solo contiene el servidor ya compilado y corre con un usuario sin privilegios, sin compiladores ni código fuente. Eso se explica en una frase en el README y se nota en una revisión.

### Paso 7.3: el servicio de la aplicación en compose

Agrega este servicio a `docker-compose.yml` (queda bajo un *profile* para que `docker compose up -d` siga levantando solo las bases cuando desarrollas):

```yaml
  app:
    profiles: ['app']
    build: .
    ports: ['3000:3000']
    environment:
      DATABASE_URL: postgresql://conciliapyme:conciliapyme@postgres:5432/conciliapyme
      MONGODB_URI: mongodb://mongo:27017/conciliapyme
      AUTH_SECRET: ${AUTH_SECRET:?define AUTH_SECRET en tu .env}
      AUTH_TRUST_HOST: 'true'
    depends_on: [postgres, mongo]
```

Las migraciones y el seed se ejecutan desde tu equipo contra el puerto publicado de PostgreSQL:

```bash
docker compose up -d postgres mongo
npx prisma migrate deploy
npx prisma db seed
docker compose --profile app up --build -d
```

**Verificación:**

1. `docker compose --profile app ps` muestra tres servicios en ejecución.
2. `curl http://localhost:3000/api/health` devuelve `{"status":"ok"}`.
3. En el navegador, `http://localhost:3000` te lleva a `/login` y puedes entrar con `contador@demo.cl`.
4. `docker images conciliapyme-app` (o el nombre que muestre `docker images`) muestra un tamaño razonable; anótalo en el README.

Si el contenedor falla con `Query engine library for current platform could not be found`, agrega estas dos líneas en la etapa `runner`, después de copiar `standalone`, y reconstruye:

```dockerfile
COPY --from=build --chown=nextjs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nextjs /app/node_modules/@prisma/client ./node_modules/@prisma/client
```

Si `/login` responde pero al ingresar vuelve con error, revisa que `AUTH_SECRET` esté en tu `.env` y que el servicio tenga `AUTH_TRUST_HOST`. Cuando termines: `docker compose --profile app down`.

### Paso 7.4: actualizaciones automáticas y análisis de seguridad

`.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
    groups:
      minor-and-patch:
        update-types: [minor, patch]
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
  - package-ecosystem: docker
    directory: /
    schedule:
      interval: weekly
```

Luego, en **Settings > Code security** del repositorio, activa **Code scanning** con la configuración predeterminada (CodeQL). Es gratis en repositorios públicos y aparece como una verificación más en cada pull request.

**Verificación:** en la pestaña **Insights > Dependency graph > Dependabot** ves los tres ecosistemas; unos minutos después de mergear, pueden aparecer los primeros PR de actualización. Revísalos como si fueran de un compañero: solo se mergean con el CI en verde.

### Paso 7.5: configuración de Playwright

Si aún no descargaste el navegador:

```bash
npx playwright install --with-deps chromium
```

Crea `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

try {
  process.loadEnvFile('.env'); // en el CI las variables ya vienen del entorno
} catch {
  // sin archivo .env
}

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Los archivos E2E terminan en `.e2e.ts`, así Vitest no los toma por error como pruebas unitarias.

### Paso 7.6: la prueba del flujo completo

Un buen E2E no depende del orden ni del estado de la base. Esta prueba crea su propia factura con un folio aleatorio, arma la cartola en memoria con ese folio y recorre el flujo. Crea `e2e/conciliacion.e2e.ts`:

```ts
import { expect, test, type Page } from '@playwright/test';
import { prisma } from '../src/lib/db';

test.describe.configure({ mode: 'serial' });

const folio = 700_000_000 + Math.floor(Math.random() * 99_000_000);
const monto = 100_000 + Math.floor(Math.random() * 899_999);
const conPuntos = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const cartola =
  'Fecha;Descripción;Cargo;Abono;Saldo\n' +
  `02/09/2026;TRANSF DE 76000000-0 FAC ${folio};;${conPuntos(monto)};1.000.000\n`;

async function ingresar(page: Page, correo: string) {
  await page.goto('/login');
  await page.getByLabel('Correo').fill(correo);
  await page.getByLabel('Contraseña').fill('Demo1234!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('heading', { name: `Hola, ${correo}` })).toBeVisible();
}

test.beforeAll(async () => {
  const cliente = await prisma.cliente.findUniqueOrThrow({ where: { rut: '76000000-0' } });
  await prisma.factura.create({
    data: {
      folio,
      clienteId: cliente.id,
      montoClp: monto,
      emision: new Date('2026-08-01'),
      vencimiento: new Date('2026-09-10'),
    },
  });
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test('el contador importa una cartola y confirma la conciliación sugerida', async ({ page }) => {
  await ingresar(page, 'contador@demo.cl');

  await page.goto('/importar');
  await page.getByLabel(/cartola/i).setInputFiles({
    name: 'cartola-e2e.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(cartola),
  });
  await page.getByRole('button', { name: /importar/i }).click();
  await expect(page.getByRole('status')).toContainText('1 movimientos nuevos');

  await page.goto('/conciliacion');
  const fila = page.getByRole('row', { name: new RegExp(`FAC ${folio}`) });
  await expect(fila).toContainText(`Factura ${folio}`);
  await expect(fila).toContainText('100/100');
  await fila.getByRole('button', { name: /Confirmar/ }).click();

  await expect(page.getByRole('status')).toContainText('Conciliación confirmada');
  await expect(page.getByRole('row', { name: new RegExp(`FAC ${folio}`) })).toHaveCount(0);
});

test('el dueño ve la auditoría pero no puede confirmar', async ({ page }) => {
  await ingresar(page, 'dueno@demo.cl');

  await page.goto('/auditoria');
  await expect(page.getByText('CONCILIACION_CONFIRMADA').first()).toBeVisible();
  await expect(page.getByText('contador@demo.cl').first()).toBeVisible();

  await page.goto('/conciliacion');
  await expect(page.getByRole('button', { name: /Confirmar/ })).toHaveCount(0);
});

test('el contador no puede ver la auditoría', async ({ page }) => {
  await ingresar(page, 'contador@demo.cl');
  await page.goto('/auditoria');
  await expect(page.getByRole('alert')).toContainText('No tienes permiso');
});
```

Notas para que funcione a la primera:

- El campo de archivo de `/importar` debe tener una etiqueta que contenga la palabra «cartola» (por ejemplo «Archivo de cartola (CSV)») y el botón debe decir «Importar». Los selectores por rol y etiqueta son los mismos que usa una persona con lector de pantalla: si el E2E no puede encontrar un elemento, probablemente el usuario real tampoco.
- Si en `/login` el título de la página principal no coincide, ajusta `Hola, ...` al encabezado que escribiste en la sesión 3.
- El límite de intentos de login (5 por minuto por correo) no se alcanza: cada usuario ingresa como máximo dos veces.
- La prueba deja en las bases locales una factura, un movimiento y eventos de auditoría de prueba. Para limpiar tu entorno de desarrollo: `docker compose down -v`, y vuelve a migrar y a ejecutar el seed.

Puedes pedirle a Claude Code que escriba este archivo a partir de la descripción del flujo, pero revisa tú que los selectores sean por rol o etiqueta (no por clases CSS) y que la prueba cree sus propios datos.

**Verificación local:** con las bases levantadas, migradas y con seed, `npm run test:e2e` pasa los tres escenarios. Si falla, abre el rastro con `npx playwright show-trace test-results/<carpeta>/trace.zip` (se genera al reintentar) o corre en modo visible con `npx playwright test --headed`.

### Paso 7.7: el CI ejecuta todo

En `.github/workflows/ci.yml` agrega `AUTH_TRUST_HOST: 'true'` al bloque `env` del job, y reemplaza los pasos desde `npm run lint` hasta el final por:

```yaml
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:cov
      - run: npm run build
      - run: npx prisma db seed
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
      - name: SonarQube scan
        uses: SonarSource/sonarqube-scan-action@v5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      - name: Quality gate
        uses: SonarSource/sonarqube-quality-gate-action@v1
        timeout-minutes: 5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

Y agrega, al mismo nivel que el job `build`, un job que valida que la imagen compile:

```yaml
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t conciliapyme:ci .
```

En la regla de la rama `main` agrega `docker` como verificación obligatoria. Si usas otras versiones de las acciones que las del ejemplo, confirma la versión vigente en el repositorio de cada acción.

### Paso 7.8: pull request y cierre

```bash
git add -A
git commit -m "chore: add dockerfile, compose app profile, dependabot and e2e tests"
git push -u origin HEAD
gh pr create --fill --body "Closes #9."
```

**Verificación:** en el PR deben quedar en verde `build` (con la prueba E2E incluida), `docker`, CodeQL y SonarQube. Pasa el auditor sobre el Dockerfile y el workflow (secretos expuestos, permisos excesivos, imágenes sin versión fija). Mergea con `gh pr merge --squash --delete-branch`.

Problemas frecuentes en el CI:

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| `prisma db seed` falla con `tsx: not found` | `tsx` quedó como dependencia de producción omitida o sin instalar | Verifica que esté en `devDependencies` y que el CI use `npm ci` |
| El E2E agota el tiempo esperando `/api/health` | El servidor no arrancó (falta `AUTH_SECRET` o `DATABASE_URL`) | Revisa el bloque `env` del job y el paso `npm run build` |
| Los selectores no encuentran el botón | Texto distinto al esperado | Alinea etiquetas con las pruebas (por rol, no por clase) |
| Sonar marca cobertura baja | Las pruebas de integración y E2E no suben cobertura de `src/app` | Mantén la lógica en `src/lib` y deja las páginas fuera del cálculo, como en `sonar-project.properties` |

**Punto de control de la sesión 6:** issue 9 cerrado, `docker compose --profile app up --build` levanta el sistema completo, el CI ejecuta lint, tipos, pruebas con cobertura, build, E2E, Sonar y la construcción de la imagen, y dependabot está activo.

## Sesión 7: despliegue, documentación y publicación

Un proyecto que nadie puede abrir ni entender en dos minutos no cuenta como portafolio. Esta sesión lo deja en línea, documentado en inglés y listo para mostrar. Es el issue 10.

### Paso 8.1: decide dónde corre cada cosa

| Parte | Servicio gratuito | Para qué |
| --- | --- | --- |
| Aplicación | Vercel (plan Hobby) | Demo pública con enlace |
| PostgreSQL | Neon (plan gratuito) | Datos del negocio de la demo |
| MongoDB | MongoDB Atlas (clúster M0) | Cartolas originales y auditoría de la demo |
| Desarrollo y pruebas | Docker en tu equipo | Todo lo demás |

Regla de oro: **tu equipo y el CI usan las bases locales; Neon y Atlas son solo para la demo desplegada.** Así las pruebas de integración y el E2E jamás escriben en la base que ve el público. Los límites de los planes gratuitos cambian: confirma en cada sitio que el plan siga siendo gratis y que no te pidan tarjeta antes de crear el servicio. Si alguno te la pide, usa el plan B del paso 8.9.

### Paso 8.2: PostgreSQL en Neon

Ya tienes un proyecto creado en Neon (región AWS US East 2, Ohio). Ve a **Connect** en el panel del proyecto y copia dos cadenas de conexión de la rama `production`:

- La **directa** (host sin `-pooler`): para migraciones.
- La **con pooler** (host con `-pooler`): para la aplicación en Vercel, porque cada solicitud serverless abre su propia conexión.

Aplica el esquema y el seed contra Neon desde tu equipo, pasando la variable solo para ese comando. En macOS o Linux:

```bash
DATABASE_URL='<cadena directa de Neon>' npx prisma migrate deploy
DATABASE_URL='<cadena directa de Neon>' npx prisma db seed
```

En PowerShell:

```powershell
$env:DATABASE_URL='<cadena directa de Neon>'; npx prisma migrate deploy; npx prisma db seed; Remove-Item Env:DATABASE_URL
```

**Verificación:** en el panel de Neon, en **Tables**, aparecen `User`, `Cliente`, `Factura`, `MovimientoBancario` y `Conciliacion` con las filas del seed.

**Sobre el prompt «Copy quickstart prompt» de Neon:** sirve para que Claude Code conecte el proyecto por ti, pero se ejecuta **dentro de la carpeta de `conciliapyme` en tu equipo**, no en otro lugar. Si lo usas, agrégale esta instrucción al final: «El proyecto ya usa Prisma; no cambies el driver ni el esquema, solo conecta `DATABASE_URL`». Además ten presente que Next.js lee `.env.local` y Prisma CLI lee `.env`: si el asistente escribe en `.env.local`, tu aplicación y tus migraciones podrían apuntar a bases distintas sin que lo notes. Revisa ambos archivos y deja siempre las bases locales en el desarrollo diario.

Si usas la cadena con pooler y las transacciones fallan con errores de sentencias preparadas, agrega `&pgbouncer=true` a la cadena; si persiste, usa la cadena directa para la demo, que alcanza para el tráfico de un portafolio. Revisa la guía vigente de Neon y Prisma, porque este detalle ha cambiado entre versiones.

### Paso 8.3: MongoDB en Atlas

1. Crea un clúster gratuito **M0** en AWS, en una región de Norteamérica del este (la más cercana a Ohio y a la región por defecto de Vercel).
2. En **Database Access**, crea un usuario con una contraseña generada larga. No uses la de ninguna otra cuenta.
3. En **Network Access**, agrega `0.0.0.0/0`. Vercel no tiene direcciones IP fijas en el plan gratuito, así que no hay otra opción; la defensa es la contraseña larga y un usuario con permisos solo sobre esta base. Dilo en el README, es una decisión consciente.
4. En **Connect > Drivers** copia la cadena `mongodb+srv://...` y agrega el nombre de la base antes de los parámetros: `.../conciliapyme?retryWrites=true&w=majority`.

**Verificación:** con la cadena en la mano, `MONGODB_URI='<cadena>' node -e "require('mongoose').connect(process.env.MONGODB_URI).then(()=>{console.log('ok');process.exit(0)}).catch(e=>{console.error(e.message);process.exit(1)})"` imprime `ok`. Si se queda colgado, casi siempre es el acceso de red del paso 3.

### Paso 8.4: despliegue en Vercel

1. En Vercel, **Add New > Project**, importa `conciliapyme` desde GitHub. Detecta Next.js solo.
2. Antes de desplegar, agrega estas variables de entorno **solo en el ámbito Production**: `DATABASE_URL` (cadena con pooler de Neon), `MONGODB_URI` (Atlas) y `AUTH_SECRET` (uno nuevo: `openssl rand -base64 32`; nunca el de tu `.env` local).
3. Despliega. El `postinstall` ejecuta `prisma generate`, así que el cliente queda listo.

**Verificación:**

1. `curl https://<tu-proyecto>.vercel.app/api/health` devuelve `{"status":"ok"}`.
2. Entras con `contador@demo.cl`, importas `tests/fixtures/banco-a.csv` y confirmas una conciliación.
3. Entras como `dueno@demo.cl` y ves el evento en `/auditoria`.

Si `/api/health` devuelve 503, mira **Logs** en Vercel: casi siempre es una cadena mal copiada (comillas, espacios) o el acceso de red de Atlas. Si el login falla en producción y no en local, revisa que `AUTH_SECRET` exista en el ámbito Production y vuelve a desplegar.

Limitación honesta para el README: la demo es pública y las claves de demostración son conocidas. Cualquiera puede importar archivos de hasta 1 MB, así que el almacenamiento gratuito podría llenarse. Documenta cómo reiniciar la demo (volver a ejecutar `prisma migrate reset` contra Neon desde tu equipo y vaciar las colecciones de Atlas).

### Paso 8.5: README en inglés

El README es lo primero y a veces lo único que lee un reclutador. Crea `README.md` con esta estructura y completa lo que está entre `<>` con datos reales (no inventes métricas; copia las de tu CI y de Sonar):

````markdown
# ConciliaPyme

![CI](https://github.com/<user>/conciliapyme/actions/workflows/ci.yml/badge.svg)
![Quality Gate](<badge URL from SonarQube Cloud>)
![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)

Bank statement reconciliation for Chilean SMEs: import a bank CSV, get scored invoice match suggestions, confirm them atomically and keep an audit trail.

**Live demo:** <vercel URL> · **Demo users** (password `Demo1234!`): `contador@demo.cl`, `dueno@demo.cl`, `admin@demo.cl`

![Demo](docs/demo.gif)

## The problem

A fictional client, *Servicios Técnicos Andes SpA* (25 employees, about 80 customers), reconciles its bank statement against invoices by hand in spreadsheets every month. ConciliaPyme replaces that with a repeatable, auditable process.

## Features

- Role-based access: accountant, owner and admin, enforced on the server.
- Idempotent CSV import for two bank formats; importing the same file twice changes nothing.
- Match suggestions with a score and the rule that produced them.
- Atomic confirmation: movement, invoice and reconciliation change together or not at all, even under concurrent requests.
- Append-only audit log, visible to the owner.

## Architecture

```mermaid
flowchart LR
  U[User] --> W[Next.js app]
  W --> P[(PostgreSQL: business data)]
  W --> M[(MongoDB: raw statements and audit log)]
  GH[GitHub Actions] --> S[SonarQube Cloud]
  GH --> W
```

| Concern | Choice | Why |
| --- | --- | --- |
| App | Next.js (App Router), TypeScript, Tailwind | Server actions keep authorization next to the data |
| Business data | PostgreSQL + Prisma | Relations and transactions; amounts are integer CLP |
| Raw statements and audit | MongoDB + Mongoose | Each bank has different columns; the audit log is append-only |
| Auth | Auth.js credentials, bcrypt, JWT | Simple and testable; roles in the token |
| Tests | Vitest, Playwright | Unit, integration against real databases, end to end |
| CI/CD | GitHub Actions, SonarQube Cloud, Vercel | Quality gate on every pull request |

See [docs/adr](docs/adr) for the decisions and their trade-offs.

## Run it locally

```bash
cp .env.example .env        # then set AUTH_SECRET
docker compose up -d
npx prisma migrate deploy && npx prisma db seed
npm run dev
```

Or everything in containers: `docker compose --profile app up --build`.

## Tests

```bash
npm test            # unit and integration (needs the databases)
npm run test:cov    # with coverage
npm run test:e2e    # Playwright
```

Coverage: <x>% on business logic (`src/lib`). Quality gate: passing.

## Known limitations

- Login rate limiting is in memory, so it is best effort on serverless.
- Postgres and Mongo cannot share a transaction; see ADR 0002 for the compensation strategy and the outbox alternative.
- The public demo uses known credentials and is open to the internet; Atlas allows any IP because Vercel has no fixed addresses.

## AI usage

<see step 8.7>

## License

MIT
````

Para el GIF de la demostración usa una herramienta gratuita de grabación de pantalla (por ejemplo ScreenToGif en Windows) y graba solo el flujo: importar, ver sugerencia, confirmar, ver auditoría. Debe durar menos de 30 segundos y pesar pocos megabytes. Guárdalo en `docs/demo.gif`.

**Verificación:** abre el README en GitHub (no en tu editor): los badges cargan, el diagrama Mermaid se dibuja y los enlaces relativos funcionan.

### Paso 8.6: registros de decisiones (ADR)

Crea `docs/adr/0001-postgres-and-mongo.md`:

```markdown
# 1. PostgreSQL for business data, MongoDB for raw statements and audit log

Date: <date>
Status: Accepted

## Context

Bank statements arrive in different layouts per bank. The business data (customers, invoices, reconciliations) is relational and needs transactions and constraints.

## Decision

Store normalized movements, invoices and reconciliations in PostgreSQL. Store each original statement line unchanged, plus the import log and the audit log, in MongoDB.

## Consequences

- Adding a new bank format needs a parser, not a schema migration.
- The audit log is append-only by construction (no update or delete code paths).
- Two databases to operate and no shared transaction (see ADR 0002).

## Alternatives considered

- PostgreSQL only, with a JSONB column for raw lines: simpler to operate; rejected here to demonstrate each store where it fits best. A reasonable choice for a real, small team.
- MongoDB only: rejected because reconciliation needs relations and multi-row atomicity.
```

Escribe también `0002-cross-database-consistency.md` (importación con compensación manual, auditoría posterior al commit, patrón outbox como mejora) y `0003-auth-and-authorization.md` (credenciales con JWT, permisos verificados en el servidor, por qué no hay middleware de autorización). Cada uno debe ser corto, honesto y mencionar al menos una alternativa descartada.

### Paso 8.7: CLAUDE.md y la sección «AI usage»

`CLAUDE.md` en la raíz le da contexto permanente a Claude Code y, de paso, muestra cómo trabajas:

```markdown
# ConciliaPyme

Next.js (App Router) + TypeScript, Prisma/PostgreSQL, Mongoose/MongoDB.

## Commands
- `npm run dev`, `npm test`, `npm run test:cov`, `npm run test:e2e`, `npm run lint`, `npm run typecheck`
- `docker compose up -d` starts the databases

## Rules
- Business logic lives in `src/lib`; pages stay thin.
- Write the test first for anything in `src/lib`.
- Money is an integer number of CLP. Never use floats.
- Check session and role on the server in every action and page.
- Conventional Commits. One branch and one PR per issue.
- Never commit secrets. `.env` is ignored; `.env.example` is the template.
- Do not edit audit log code to add update or delete paths.
```

Y en el README, la sección **AI usage**. Escríbela con tus palabras y con hechos verificables; esta es la estructura:

```markdown
## AI usage

I built this project with Claude Code and reviewed every change myself.

- **What AI did:** scaffolding, boilerplate, first drafts of tests and of the invoice screens.
- **What I did:** domain rules, data model, security decisions, all ADRs, code review of every diff.
- **How it was checked:** a second, read-only review agent audited each pull request; tests, CI and the SonarQube quality gate decide what merges.
- **Example findings:** <two real findings the auditor reported, and what I did about each>.
```

Los «hallazgos de ejemplo» deben ser reales: copia dos de las revisiones de los pasos 4.7, 5.8 o 6.9, incluyendo uno que descartaste y por qué. Eso vale más que cualquier declaración genérica.

### Paso 8.8: pulido del repositorio, publicación y post

```bash
gh repo edit --description "Bank statement reconciliation for Chilean SMEs (Next.js, PostgreSQL, MongoDB)" --homepage "https://<tu-proyecto>.vercel.app"
gh repo edit --add-topic nextjs --add-topic typescript --add-topic postgresql --add-topic mongodb --add-topic prisma --add-topic playwright --add-topic fintech
gh release create v1.0.0 --generate-notes --title "v1.0.0"
```

En tu perfil de GitHub, ancla (*pin*) este repositorio. Cierra el issue 10 desde el PR de documentación:

```bash
git switch main && git pull
git switch -c docs/10-readme-adr
git add -A
git commit -m "docs: add README, ADRs, CLAUDE.md and AI usage section"
git push -u origin HEAD
gh pr create --fill --body "Closes #10."
```

Borrador de publicación para LinkedIn (cámbialo con tus palabras y tus números reales):

> Esta semana construí ConciliaPyme, una herramienta que concilia la cartola bancaria de una pyme chilena con sus facturas. Next.js, PostgreSQL y MongoDB, con sugerencias de conciliación con puntaje, confirmación atómica (probada con solicitudes concurrentes), auditoría y pipeline con SonarQube. Lo que más aprendí: \<una cosa concreta>. Código y demo en el primer comentario. Siguiente proyecto: una API de billetera con doble entrada contable.

Pon el enlace al repositorio y a la demo en el primer comentario, no en el cuerpo. Y no publiques el proyecto sin haber probado la demo desde una ventana de incógnito.

### Paso 8.9: plan B si falla un servicio gratuito

- **No puedes crear Neon o Atlas sin tarjeta:** no despliegues la demo. Deja el proyecto con `docker compose --profile app up --build` como forma oficial de ejecutarlo y graba un video corto (2 a 3 minutos) subido como «no listado» a YouTube, con el enlace en el README.
- **Vercel rechaza el repositorio:** despliega la imagen de Docker en cualquier servicio con plan gratuito que no pida tarjeta, o usa el mismo plan B del video.
- **La demo se quedó sin almacenamiento:** reinicia las bases como se documentó en el paso 8.4.

### Paso 8.10: lista final de la semana 1

- [ ] Repositorio público con descripción, temas, licencia y release v1.0.0
- [ ] Los 10 issues cerrados y el tablero Kanban al día
- [ ] CI en verde en `main`: lint, tipos, pruebas con cobertura, build, E2E, Sonar, Docker
- [ ] Quality gate de SonarQube aprobado
- [ ] Demo desplegada y probada en ventana de incógnito (o video si usaste el plan B)
- [ ] README en inglés con diagrama, GIF, usuarios de demostración y limitaciones
- [ ] ADR 0001, 0002 y 0003 escritos
- [ ] `CLAUDE.md` y sección «AI usage» con hallazgos reales
- [ ] Ningún secreto en el historial: `git log -p | grep -i -E "(secret|password|mongodb\+srv)"` no muestra nada sensible
- [ ] Publicación de LinkedIn escrita y programada

Cuando termines, vuelve a este chat o espera el recordatorio del lunes: te preguntaré cómo te fue con la semana 1 y te entregaré la ficha completa de la semana 2.

**Preguntas que te harán sobre este proyecto** (prepara una respuesta de 30 segundos para cada una):

1. ¿Por qué dos bases de datos? ¿Qué cambiarías en un equipo pequeño real?
2. ¿Cómo evitas confirmar dos veces el mismo movimiento?
3. ¿Qué pasa si Mongo cae mientras importas una cartola?
4. ¿Por qué el monto es un entero y no un decimal?
5. ¿Qué parte hizo la IA y cómo verificaste que estaba bien?