# Apreciación Musical del Jazz del Siglo XX

Aplicación web móvil para catalogar temas de jazz del siglo XX.

## Características
- Menús principales: **Temas, Estilos, Intérpretes, Albums, Año, Disquera**.
- Menú **+ Nuevo tema** con formulario completo.
- Edición y borrado de temas existentes desde los listados.
- Exportación de toda la librería a archivo **.json**.
- Carga/importación de librería completa desde archivo **.json** válido.
- Persistencia local con `localStorage`.
- Ordenamientos:
  - **Temas**: alfabético por nombre.
  - **Año**: cronológico ascendente.
  - Otros menús: agrupación por índice y temas ordenados alfabéticamente.

## Ejecutar localmente
Abre `index.html` directamente o usa un servidor estático.

```bash
python3 -m http.server 4173
```

Luego visita: `http://localhost:4173`.

## Publicación en GitHub
Para lanzarla desde un link de GitHub:
1. Sube este proyecto a un repositorio en GitHub.
2. Activa **Settings → Pages**.
3. Selecciona la rama principal y carpeta `/root`.
4. GitHub entregará un enlace público para abrir la app.


## Publicación automática (sin programar)
Para que se publique sola cada vez que cambies algo:

1. Sube este proyecto a GitHub y usa la rama `main`.
2. En GitHub entra a **Settings → Pages**.
3. En **Build and deployment**, selecciona **Source: GitHub Actions**.
4. Listo: desde ahora, cada `push` a `main` actualiza el sitio automáticamente.

> Nota: este repositorio incluye el workflow `.github/workflows/deploy-pages.yml` para automatizar el despliegue.


## Si no ves los cambios en el link
Haz estas 3 verificaciones (sin programar):

1. En **Actions**, revisa que el workflow **Deploy static site to GitHub Pages** termine en verde.
2. En **Settings → Pages**, confirma que el source sea **GitHub Actions**.
3. Abre la web y valida la etiqueta visible de versión en el encabezado (debe decir: `Versión: 2026-02-21.3`).

Si no aparece esa versión, todavía estás viendo una publicación anterior o cacheada.


## Verificación rápida del despliegue (1 minuto)
1. Abre la página pública: `https://jaimejaramilloarias.github.io/apreciacion-musical/`.
2. Debe verse en el encabezado: **`Versión: 2026-02-21.3`**.
3. En `+ Nuevo tema` deben verse los controles:
   - **Exportar librería (.json)**
   - **Cargar librería (.json)**
4. En los listados, cada tema debe tener botones **Editar** y **Borrar**.

Si no ves eso, no se ha publicado el commit correcto todavía en GitHub Pages.
