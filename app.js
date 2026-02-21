const APP_VERSION = '2026-02-21.3';
const STORAGE_KEY = 'jazz_app_songs';

const appState = {
  editingSongId: null
};

const seedSongs = [
  {
    id: 'seed-take-five',
    nombre: 'Take Five',
    link: 'https://es.wikipedia.org/wiki/Take_Five',
    estilo: 'Cool Jazz',
    interpretes: 'The Dave Brubeck Quartet',
    album: 'Time Out',
    anio: 1959,
    disquera: 'Columbia Records',
    observaciones: 'Compás 5/4 icónico del jazz moderno.'
  },
  {
    id: 'seed-so-what',
    nombre: 'So What',
    link: 'https://es.wikipedia.org/wiki/So_What_(composici%C3%B3n)',
    estilo: 'Modal Jazz',
    interpretes: 'Miles Davis',
    album: 'Kind of Blue',
    anio: 1959,
    disquera: 'Columbia Records',
    observaciones: 'Una referencia obligatoria del modal jazz.'
  }
];

const content = document.getElementById('content');
const tabs = document.querySelectorAll('.tab-btn');
const buildVersion = document.getElementById('build-version');
if (buildVersion) {
  buildVersion.textContent = `Versión: ${APP_VERSION}`;
}


function generateSongId() {
  return `song-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sanitizeSong(song) {
  return {
    id: String(song.id || generateSongId()),
    nombre: String(song.nombre || '').trim(),
    link: String(song.link || '').trim(),
    estilo: String(song.estilo || '').trim(),
    interpretes: String(song.interpretes || '').trim(),
    album: String(song.album || '').trim(),
    anio: Number(song.anio),
    disquera: String(song.disquera || '').trim(),
    observaciones: String(song.observaciones || '').trim()
  };
}

function isValidSong(song) {
  return song.nombre && song.link && song.estilo && song.interpretes && song.album && song.disquera && Number.isFinite(song.anio);
}

function loadSongs() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const source = stored ? JSON.parse(stored) : seedSongs;
  const normalized = source.map(sanitizeSong).filter(isValidSong);

  if (!stored) {
    saveSongs(normalized);
  }

  return normalized;
}

function saveSongs(songs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

function sortAlphabetic(items) {
  return items.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function groupBy(songs, field) {
  return songs.reduce((acc, song) => {
    const key = String(song[field] || 'Sin dato');
    if (!acc[key]) acc[key] = [];
    acc[key].push(song);
    return acc;
  }, {});
}

function buildSongActions(songId) {
  return `<div class="song-actions"><button type="button" class="mini-btn" data-action="edit" data-id="${songId}">Editar</button><button type="button" class="mini-btn danger" data-action="delete" data-id="${songId}">Borrar</button></div>`;
}

function createSongListItem(song, detailed = false) {
  const item = document.createElement('li');
  if (detailed) {
    item.innerHTML = `<strong>${song.nombre}</strong> (${song.anio}) · ${song.estilo}<br/><small>${song.interpretes} · ${song.album} · ${song.disquera}</small><br/><a href="${song.link}" target="_blank" rel="noreferrer">Escuchar / referencia</a>${buildSongActions(song.id)}`;
  } else {
    item.innerHTML = `<strong>${song.nombre}</strong> · <a href="${song.link}" target="_blank" rel="noreferrer">Enlace</a>${buildSongActions(song.id)}`;
  }
  return item;
}

function renderGrouped(title, songs, field, byYear = false) {
  const template = document.getElementById('list-template').content.cloneNode(true);
  template.querySelector('.section-title').textContent = title;
  const listContainer = template.querySelector('.list-container');

  const grouped = groupBy(songs, field);
  const sortedKeys = byYear ? Object.keys(grouped).sort((a, b) => Number(a) - Number(b)) : sortAlphabetic(Object.keys(grouped));

  sortedKeys.forEach((key) => {
    const section = document.createElement('article');
    section.className = 'group';
    const heading = document.createElement('h3');
    heading.textContent = key;
    section.appendChild(heading);

    const list = document.createElement('ul');
    grouped[key]
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
      .forEach((song) => list.appendChild(createSongListItem(song)));

    section.appendChild(list);
    listContainer.appendChild(section);
  });

  content.innerHTML = '';
  content.appendChild(template);
}

function renderTemas(songs) {
  const template = document.getElementById('list-template').content.cloneNode(true);
  template.querySelector('.section-title').textContent = 'Temas (orden alfabético)';
  const listContainer = template.querySelector('.list-container');

  const wrapper = document.createElement('article');
  wrapper.className = 'group';
  const list = document.createElement('ul');

  songs
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
    .forEach((song) => list.appendChild(createSongListItem(song, true)));

  wrapper.appendChild(list);
  listContainer.appendChild(wrapper);

  content.innerHTML = '';
  content.appendChild(template);
}

function exportLibrary(songs) {
  const payload = {
    exportedAt: new Date().toISOString(),
    total: songs.length,
    songs
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'apreciacion-musical-jazz-biblioteca.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function normalizeImportedSongs(input) {
  if (!Array.isArray(input)) return null;
  const normalized = input.map(sanitizeSong).filter(isValidSong);
  return normalized.length ? normalized : null;
}

function importLibrary(file, onImported) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const sourceSongs = Array.isArray(parsed) ? parsed : parsed.songs;
      const normalized = normalizeImportedSongs(sourceSongs);

      if (!normalized) {
        alert('El archivo no contiene una librería válida.');
        return;
      }

      saveSongs(normalized);
      appState.editingSongId = null;
      alert(`Librería cargada correctamente con ${normalized.length} tema(s).`);
      onImported();
    } catch {
      alert('No se pudo leer el archivo JSON. Verifica su formato.');
    }
  };

  reader.readAsText(file);
}

function renderForm(songs) {
  const template = document.getElementById('form-template').content.cloneNode(true);
  const form = template.querySelector('#song-form');
  const saveButton = template.querySelector('#save-song');
  const cancelButton = template.querySelector('#cancel-edit');
  const exportButton = template.querySelector('#export-json');
  const importInput = template.querySelector('#import-json');

  const editingSong = songs.find((song) => song.id === appState.editingSongId);
  if (editingSong) {
    template.querySelector('.section-title').textContent = `Editar tema: ${editingSong.nombre}`;
    saveButton.textContent = 'Actualizar tema';
    cancelButton.hidden = false;
    form.nombre.value = editingSong.nombre;
    form.link.value = editingSong.link;
    form.estilo.value = editingSong.estilo;
    form.interpretes.value = editingSong.interpretes;
    form.album.value = editingSong.album;
    form.anio.value = editingSong.anio;
    form.disquera.value = editingSong.disquera;
    form.observaciones.value = editingSong.observaciones;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const draft = sanitizeSong({ ...Object.fromEntries(formData.entries()), id: editingSong?.id });

    if (!isValidSong(draft)) {
      alert('Completa todos los campos requeridos con datos válidos.');
      return;
    }

    const updatedSongs = editingSong
      ? songs.map((song) => (song.id === editingSong.id ? draft : song))
      : [...songs, { ...draft, id: generateSongId() }];

    saveSongs(updatedSongs);
    appState.editingSongId = null;
    alert(editingSong ? 'Tema actualizado correctamente.' : 'Tema guardado correctamente. Ya aparece en los menús.');
    renderView('temas');
  });

  cancelButton.addEventListener('click', () => {
    appState.editingSongId = null;
    renderView('temas');
  });

  exportButton.addEventListener('click', () => {
    exportLibrary(loadSongs());
  });

  importInput.addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    importLibrary(file, () => renderView('temas'));
    event.target.value = '';
  });

  content.innerHTML = '';
  content.appendChild(template);
}

function handleSongAction(action, songId) {
  const songs = loadSongs();

  if (action === 'edit') {
    appState.editingSongId = songId;
    renderView('nuevo');
    return;
  }

  if (action === 'delete') {
    const song = songs.find((item) => item.id === songId);
    if (!song) return;
    if (!confirm(`¿Borrar el tema "${song.nombre}"?`)) return;

    const filteredSongs = songs.filter((item) => item.id !== songId);
    saveSongs(filteredSongs);
    appState.editingSongId = null;
    renderView('temas');
  }
}

function activateTab(view) {
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.view === view));
}

function renderView(view) {
  const songs = loadSongs();
  activateTab(view);

  if (view === 'temas') return renderTemas(songs);
  if (view === 'estilos') return renderGrouped('Estilos', songs, 'estilo');
  if (view === 'interpretes') return renderGrouped('Intérpretes', songs, 'interpretes');
  if (view === 'albums') return renderGrouped('Albums', songs, 'album');
  if (view === 'anio') return renderGrouped('Año de grabación', songs, 'anio', true);
  if (view === 'disquera') return renderGrouped('Disquera', songs, 'disquera');
  if (view === 'nuevo') return renderForm(songs);
}

tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.view !== 'nuevo') appState.editingSongId = null;
    renderView(btn.dataset.view);
  });
});

content.addEventListener('click', (event) => {
  const target = event.target.closest('button[data-action]');
  if (!target) return;
  handleSongAction(target.dataset.action, target.dataset.id);
});

renderView('temas');
