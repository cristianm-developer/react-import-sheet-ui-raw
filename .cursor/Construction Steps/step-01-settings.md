# Step 1 — Settings (Configuración del proyecto)

Plan para configurar la librería **react-import-sheet-ui**: UI sobre el engine headless `@cristianm/react-import-sheet-headless`.

---

## 1. Stack tecnológico

| Área | Herramienta | Propósito |
|------|-------------|-----------|
| **Framework** | React 18/19 | Peer dependency; componentes React |
| **Build** | `tsup` | Bundles ESNext (ESM) + CommonJS; tipos (.d.ts); source maps; salida en `dist`; root `src` |
| **Docs / workshop** | Storybook 10 | Probar componentes aislados |
| **Tests** | Vitest + React Testing Library | Tests unitarios |
| **Calidad** | ESLint + Prettier | Estilo y reglas (incl. React Hooks) |
| **Git** | Husky + lint-staged + Commitlint + Commitizen | Pre-commit: lint + Prettier + tests (todo debe pasar); commit-msg: mensajes convencionales; Commitizen para escribir commits con `npm run commit` |

---

## 2. Checklist de tareas

### 2.1 Dependencias

- [ ] **React como peer dependency**  
  - `react`, `react-dom` en `peerDependencies` (v18 o v19).  
  - Mantener `devDependencies` para desarrollo y Storybook.

- [ ] **Engine headless**  
  - Añadir dependencia: `@cristianm/react-import-sheet-headless`.

- [ ] **Build (tsup)**  
  - **Formatos:** ESNext (ESM) y CommonJS.  
  - **Tipos:** generación de `.d.ts` habilitada (`dts: true`).  
  - **Source maps:** exportar para depuración (`sourcemap: true`).  
  - **Salida:** directorio `dist`; código fuente (root) en `src`.

### 2.2 TypeScript

- [ ] `tsconfig.json` base (strict, JSX, paths si aplica).
- [ ] `tsconfig.build.json` o equivalente para `tsup` (solo lo que se exporta).
- [ ] Compatibilidad con React 18/19 en tipos (`@types/react` según versión).

### 2.3 ESLint + Prettier

- [ ] **ESLint**  
  - Configuración para TypeScript + React.  
  - Incluir `eslint-plugin-react-hooks`.  
  - Extender `eslint-config-prettier` para no chocar con Prettier.

- [ ] **Prettier**  
  - `.prettierrc` (o equivalente).  
  - `.prettierignore` (build, node_modules, Storybook static, etc.).

- [ ] Scripts en `package.json`:  
  - `lint`, `lint:fix`, `format`, `format:check`.

### 2.4 Vitest + React Testing Library

- [ ] **Vitest**  
  - `vitest.config.ts` (o integrado en `vite.config` si usas Vite para tests).  
  - Entorno `jsdom` para React.  
  - **Coverage:** umbral mínimo **90%** (líneas/funciones/branches según definas); el pre-commit ejecuta tests con coverage y debe cumplirlo.

- [ ] **React Testing Library**  
  - `@testing-library/react`, `@testing-library/jest-dom`.  
  - Setup en Vitest para `@testing-library/jest-dom`.

- [ ] Scripts: `test`, `test:run`, `test:coverage` (con umbral 90%).

### 2.5 Storybook 10

- [ ] Instalar/configurar **Storybook 10**.  
  - Framework: React + Vite (recomendado para librerías).  
  - Añadir addons que necesites (controls, actions, a11y, etc.).

- [ ] Carpeta `stories/` (o `src/stories`) con al menos un ejemplo del componente principal.  
  - Objetivo: probar componentes sin estilos heredados del host.

- [ ] Scripts: `storybook`, `build-storybook`.

### 2.6 Husky + lint-staged + Commitlint + Commitizen

- [ ] **Commitizen**  
  - `commitizen` + `cz-conventional-changelog` (adaptador convencional).  
  - Script en `package.json`: `"commit": "cz"`.  
  - Configuración en `package.json`: `"config": { "commitizen": { "path": "cz-conventional-changelog" } }`.  
  - Uso: `npm run commit` para guiar el mensaje de commit (tipo, scope, descripción, etc.) en lugar de `git commit -m "..."`.

- [ ] **Husky — pre-commit**  
  - Antes de permitir el commit deben ejecutarse y **pasar todos**:
    1. **ESLint** (lint).
    2. **Prettier** (format check o format sobre archivos staged).
    3. **Tests unitarios** (Vitest), incluyendo **coverage ≥ 90%**.
  - Si alguno falla, el commit se rechaza.  
  - `prepare` script: `"prepare": "husky"`.  
  - Hook `pre-commit`: puede usar lint-staged para archivos staged + ejecución global de tests con coverage.

- [ ] **lint-staged**  
  - Sobre archivos staged: lint (ESLint) y format (Prettier) para `*.{ts,tsx,js,jsx,json,md}`.  
  - En el mismo pre-commit, después o en paralelo: `npm run test:coverage` (o equivalente) para que los tests y el 90% de coverage sean obligatorios.

- [ ] **Commitlint**  
  - `@commitlint/cli` + `@commitlint/config-conventional`.  
  - Archivo `commitlint.config.js` (o `.commitlintrc`).  
  - Hook `commit-msg` que ejecute `commitlint`.

### 2.7 package.json (resumen)

- [ ] `name`: `@cristianm/react-import-sheet-ui-raw` (publicación npm).
- [ ] `main`, `module`, `types` (o `exports`) apuntando a los artefactos de `tsup`.
- [ ] `files`: incluir solo `dist`, `README`, etc.
- [ ] Scripts unificados:  
  - `build`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:run`, `storybook`, `build-storybook`, `prepare`, `commit` (Commitizen).

### 2.8 Otros archivos recomendados

- [ ] `.nvmrc` o `.node-version`: versión de Node (p.ej. 20 LTS).
- [ ] `.gitignore`: `node_modules`, `dist`, `.storybook-static`, coverage, etc.
- [ ] `README.md` mínimo: descripción, instalación, uso con `@cristianm/react-import-sheet-headless`, scripts.

---

## 3. Orden sugerido de ejecución

1. Ajustar `package.json`: name, exports, peerDependencies, engine headless.  
2. Configurar TypeScript (tsconfig base + build).  
3. Añadir ESLint + Prettier y scripts.  
4. Configurar Vitest + RTL y scripts.  
5. Configurar Storybook 10 y una story de ejemplo.  
6. Instalar y configurar Husky → lint-staged → Commitlint; instalar Commitizen y configurar script `commit`.  
7. Ejecutar `npm run build`, `lint`, `format`, `test`, `storybook` y corregir hasta que todo pase.

---

## 4. Notas

- **Commitizen**: Usar `npm run commit` (o `npx cz`) para generar mensajes de commit convencionales; Commitlint validará el mensaje en el hook `commit-msg`.
- **Pre-commit**: No se puede comitar sin que pasen ESLint, Prettier y todos los tests unitarios con **coverage ≥ 90%** (Vitest).  
- **Vitest coverage**: Configurar en `vitest.config` umbrales de 90% (p. ej. `coverage.lines`, `coverage.functions`, `coverage.branches`); el CI y el hook pre-commit deben usar `test:coverage`.  
- **Storybook 10**: El proyecto usa Storybook 10 para documentar y probar componentes.  
- **Publicación npm**: Nombre del paquete `@cristianm/react-import-sheet-ui-raw`; campo `files` limita lo publicado a `dist` y `README.md`.  
- **Peer dependency**: No empaquetar React en la librería; el consumidor debe tener React 18 o 19.  
- **Engine**: Toda la lógica de “import sheet” debe vivir en `@cristianm/react-import-sheet-headless`; esta librería solo expone la UI (componentes React que usan ese engine).

Cuando termines este step, puedes usar **Step 2** (por definir en otro `.md`) para la estructura de componentes y la implementación de la UI.
