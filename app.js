const STORAGE_KEY = 'jazz_app_songs';

const seedSongs = [
  {
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

function loadSongs() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedSongs));
    return [...seedSongs];
  }
  return JSON.parse(stored);
}

function saveSongs(songs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

function sortAlphabetic(items) {
  return items.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function groupBy(songs, field) {
  const map = songs.reduce((acc, song) => {
    const key = String(song[field] || 'Sin dato');
    if (!acc[key]) acc[key] = [];
    acc[key].push(song);
    return acc;
  }, {});
  return map;
}

function renderGrouped(title, songs, field, byYear = false) {
  const template = document.getElementById('list-template').content.cloneNode(true);
  template.querySelector('.section-title').textContent = title;
  const listContainer = template.querySelector('.list-container');

  const grouped = groupBy(songs, field);
  const keys = Object.keys(grouped);
  const sortedKeys = byYear ? keys.sort((a, b) => Number(a) - Number(b)) : sortAlphabetic(keys);

  sortedKeys.forEach((key) => {
    const section = document.createElement('article');
    section.className = 'group';
    const heading = document.createElement('h3');
    heading.textContent = key;
    section.appendChild(heading);

    const list = document.createElement('ul');
    grouped[key]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
      .forEach((song) => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${song.nombre}</strong> · <a href="${song.link}" target="_blank" rel="noreferrer">Enlace</a>`;
        list.appendChild(item);
      });

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
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
    .forEach((song) => {
      const item = document.createElement('li');
      item.innerHTML = `<strong>${song.nombre}</strong> (${song.anio}) · ${song.estilo}<br/><small>${song.interpretes} · ${song.album} · ${song.disquera}</small><br/><a href="${song.link}" target="_blank" rel="noreferrer">Escuchar / referencia</a>`;
      list.appendChild(item);
    });

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

  const normalized = input
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      nombre: String(item.nombre || '').trim(),
      link: String(item.link || '').trim(),
      estilo: String(item.estilo || '').trim(),
      interpretes: String(item.interpretes || '').trim(),
      album: String(item.album || '').trim(),
      anio: Number(item.anio),
      disquera: String(item.disquera || '').trim(),
      observaciones: String(item.observaciones || '').trim()
    }))
    .filter((song) => song.nombre && song.link && song.estilo && song.interpretes && song.album && song.disquera && Number.isFinite(song.anio));

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
      alert(`Librería cargada correctamente con ${normalized.length} tema(s).`);
      onImported();
    } catch (error) {
      alert('No se pudo leer el archivo JSON. Verifica su formato.');
    }
  };

  reader.readAsText(file);
}

function renderForm(songs) {
  const template = document.getElementById('form-template').content.cloneNode(true);
  const form = template.querySelector('#song-form');
  const exportButton = template.querySelector('#export-json');
  const importInput = template.querySelector('#import-json');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const song = Object.fromEntries(formData.entries());
    song.anio = Number(song.anio);

    songs.push(song);
    saveSongs(songs);
    form.reset();
    alert('Tema guardado correctamente. Ya aparece en los menús.');
  });

  exportButton.addEventListener('click', () => {
    exportLibrary(loadSongs());
  });

  importInput.addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    importLibrary(file, () => {
      renderView('temas');
    });

    event.target.value = '';
  });

  content.innerHTML = '';
  content.appendChild(template);
}

function activateTab(view) {
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.view === view));
}

function renderView(view) {
  const songs = loadSongs();
  activateTab(view);

  if (view === 'temas') return renderTemas([...songs]);
  if (view === 'estilos') return renderGrouped('Estilos', songs, 'estilo');
  if (view === 'interpretes') return renderGrouped('Intérpretes', songs, 'interpretes');
  if (view === 'albums') return renderGrouped('Albums', songs, 'album');
  if (view === 'anio') return renderGrouped('Año de grabación', songs, 'anio', true);
  if (view === 'disquera') return renderGrouped('Disquera', songs, 'disquera');
  if (view === 'nuevo') return renderForm(songs);
}

tabs.forEach((btn) => {
  btn.addEventListener('click', () => renderView(btn.dataset.view));
});

renderView('temas');
