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
