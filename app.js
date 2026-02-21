const STORAGE_KEY = 'jazz_app_songs';
const REQUIRED_FIELDS = ['nombre', 'link', 'estilo', 'interpretes', 'album', 'anio', 'disquera'];

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

function createSongId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `song_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeSong(song) {
  return {
    id: song.id || createSongId(),
    nombre: song.nombre || '',
    link: song.link || '',
    estilo: song.estilo || '',
    interpretes: song.interpretes || '',
    album: song.album || '',
    anio: Number(song.anio) || '',
    disquera: song.disquera || '',
    observaciones: song.observaciones || ''
  };
}

function loadSongs() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const normalizedSeed = seedSongs.map(normalizeSong);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSeed));
    return normalizedSeed;
  }
  const parsedSongs = JSON.parse(stored).map(normalizeSong);
  saveSongs(parsedSongs);
  return parsedSongs;
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
  const sortedKeys = byYear
    ? keys.sort((a, b) => Number(a) - Number(b))
    : sortAlphabetic(keys);

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

      const actions = document.createElement('div');
      actions.className = 'song-actions';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'secondary-btn';
      editButton.textContent = 'Editar';
      editButton.addEventListener('click', () => renderForm(loadSongs(), song.id));

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger-btn';
      deleteButton.textContent = 'Borrar';
      deleteButton.addEventListener('click', () => {
        const accepted = confirm(`¿Seguro que deseas borrar "${song.nombre}"?`);
        if (!accepted) return;

        const updatedSongs = loadSongs().filter((storedSong) => storedSong.id !== song.id);
        saveSongs(updatedSongs);
        renderView('temas');
      });

      actions.append(editButton, deleteButton);
      item.appendChild(actions);
      list.appendChild(item);
    });

  wrapper.appendChild(list);
  listContainer.appendChild(wrapper);

  content.innerHTML = '';
  content.appendChild(template);
}

function renderForm(songs, editSongId = null) {
  const template = document.getElementById('form-template').content.cloneNode(true);
  const sectionTitle = template.querySelector('.section-title');
  const form = template.querySelector('#song-form');
  const editingSong = songs.find((song) => song.id === editSongId) || null;

  sectionTitle.textContent = editingSong ? 'Editar tema' : 'Añadir nuevo tema';

  if (editingSong) {
    Object.entries(editingSong).forEach(([key, value]) => {
      const input = form.elements.namedItem(key);
      if (input) input.value = value;
    });
    form.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'secondary-btn';
    cancelButton.textContent = 'Cancelar edición';
    cancelButton.addEventListener('click', () => renderView('temas'));
    form.appendChild(cancelButton);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const song = normalizeSong(Object.fromEntries(formData.entries()));

    if (editingSong) {
      song.id = editingSong.id;
      const updatedSongs = songs.map((item) => (item.id === editingSong.id ? song : item));
      saveSongs(updatedSongs);
      alert('Tema actualizado correctamente.');
      return renderView('temas');
    }

    songs.push(song);
    saveSongs(songs);
    form.reset();
    alert('Tema guardado correctamente. Ya aparece en los menús.');
  });

  const ioCard = document.createElement('section');
  ioCard.className = 'group';
  ioCard.innerHTML = `
    <h3>Respaldo de librería</h3>
    <p>Exporta o carga toda la librería de temas en formato JSON.</p>
  `;

  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = 'secondary-btn';
  exportBtn.textContent = 'Exportar biblioteca (.json)';
  exportBtn.addEventListener('click', () => {
    const data = JSON.stringify(loadSongs(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'biblioteca-jazz.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  const importLabel = document.createElement('label');
  importLabel.textContent = 'Cargar biblioteca (.json)';
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = 'application/json,.json';
  importInput.addEventListener('change', async (event) => {
    const [file] = event.target.files;
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('El archivo debe contener un arreglo JSON.');

      const validatedSongs = parsed.map((item) => {
        REQUIRED_FIELDS.forEach((field) => {
          if (item[field] === undefined || item[field] === null || item[field] === '') {
            throw new Error(`Falta el campo obligatorio: ${field}`);
          }
        });
        return normalizeSong(item);
      });

      const accepted = confirm('Se reemplazará la librería actual por la del archivo. ¿Deseas continuar?');
      if (!accepted) return;

      saveSongs(validatedSongs);
      alert('Biblioteca cargada correctamente.');
      renderView('temas');
    } catch (error) {
      alert(`No fue posible importar el JSON: ${error.message}`);
    } finally {
      importInput.value = '';
    }
  });

  importLabel.appendChild(importInput);
  ioCard.append(exportBtn, importLabel);

  content.innerHTML = '';
  content.appendChild(template);
  content.appendChild(ioCard);
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
