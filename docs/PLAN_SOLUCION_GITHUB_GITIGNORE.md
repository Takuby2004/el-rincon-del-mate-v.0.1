# 🛠️ Plan de Diagnóstico y Solución: Subida a GitHub
**Proyecto:** El Rincón del Mate  
**Problema:** No se puede subir el código al repositorio remoto de GitHub (`origin`).  
**Documento:** `/docs/PLAN_SOLUCION_GITHUB_GITIGNORE.md`

---

## 🔍 1. Diagnóstico de la Causa Raíz

Al analizar el estado del repositorio (`git status`), se detectó la causa exacta:
1. **Falta de archivo `.gitignore`:** El proyecto no cuenta con un archivo `.gitignore` en la raíz ni en las subcarpetas.
2. **Inclusión de `node_modules` y carpetas temporales:** Git está intentando rastrear y subir **más de 14,000 archivos** pertenecientes a:
   * `frontend/node_modules/` y `backend/node_modules/` (Librerías externas muy pesadas).
   * `frontend/.angular/` (Caché local del compilador).
   * `frontend/dist/` y `backend/dist/` (Compilados de producción).
   * `backend/.env` (Archivo de configuración con credenciales secretas).
   * `backend/uploads/` (Imágenes y comprobantes temporales locales).
3. **Bloqueo de GitHub:** GitHub tiene un límite estricto de tamaño por archivo (100 MB) y colapsa cuando se intenta enviar un commit masivo con decenas de miles de archivos de dependencias.

---

## 💡 2. Solución Propuesta

### Paso 1: Crear el archivo `.gitignore` en la raíz
Definir las exclusiones estándar para proyectos Fullstack (Angular + Node.js):
```gitignore
# Dependencias
node_modules/
*/node_modules/

# Compilados y builds
dist/
*/dist/
.angular/
*/.angular/

# Variables de entorno y secretos
.env
.env.*
!.env.example

# Archivos de subida local
uploads/
*/uploads/

# Logs y temporales
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDEs
.vscode/
.idea/
.DS_Store
Thumbs.db
```

### Paso 2: Limpiar el índice de Git (sin borrar archivos locales)
Remover de la memoria de Git los archivos que ya habían sido agregados accidentalmente:
```bash
git rm -r --cached .
git add .
git commit -m "chore: configurar .gitignore y actualizar a Angular 19"
```

### Paso 3: Subir a GitHub
```bash
git push origin <tu-rama>
```

---

## 📖 3. Glosario Técnico (Para Desarrolladores Junior)

* **`.gitignore`:** Es un archivo de texto que actúa como una **"lista de no admitidos"**. Le dice a Git qué carpetas y archivos debe ignorar por completo para que nunca se suban a internet.
* **`node_modules`:** Es la carpeta donde se descargan todas las librerías externas de JavaScript. **Nunca se debe subir a GitHub** porque pesa cientos de megabytes y cualquier programador puede reconstruirla en su computadora ejecutando `npm install`.
* **Archivo `.env`:** Es el archivo que guarda las contraseñas, claves secretas y enlaces de la base de datos. Por seguridad, **jamás debe subirse a GitHub** para evitar accesos no autorizados.
* **Índice de Git (Staging Area / Cache):** Es la lista de espera de archivos preparados para el próximo commit. El comando `git rm --cached` saca los archivos de esa lista de espera sin borrarlos de tu disco duro.
* **`git push`:** Es el comando que envía los cambios guardados en tu computadora local al servidor remoto de GitHub en la nube.
