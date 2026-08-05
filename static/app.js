const API_BASE = '';

let allPokemon = [];
let deletePokemonId = null;

const pokemonContainer = document.getElementById('pokemon-container');
const loading = document.getElementById('loading');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('search-input');

const pokemonModal = document.getElementById('pokemon-modal');
const deleteModal = document.getElementById('delete-modal');
const detailModal = document.getElementById('detail-modal');

const pokemonForm = document.getElementById('pokemon-form');
const modalTitle = document.getElementById('modal-title');

document.getElementById('btn-load').addEventListener('click', loadPokemons);
document.getElementById('btn-add').addEventListener('click', openAddModal);
document.getElementById('btn-search').addEventListener('click', searchPokemon);
document.getElementById('btn-clear').addEventListener('click', clearSearch);
document.getElementById('btn-confirm-delete').addEventListener('click', confirmDelete);
document.getElementById('btn-cancel-delete').addEventListener('click', () => closeModal(deleteModal));

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchPokemon();
});

document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(pokemonModal);
        closeModal(deleteModal);
        closeModal(detailModal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === pokemonModal) closeModal(pokemonModal);
    if (e.target === deleteModal) closeModal(deleteModal);
    if (e.target === detailModal) closeModal(detailModal);
});

pokemonForm.addEventListener('submit', handleFormSubmit);

async function loadPokemons() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/pokemons`);
        if (!response.ok) throw new Error('Error al cargar Pokemon');
        allPokemon = await response.json();
        renderPokemon(allPokemon);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los Pokemon. Asegurate de que el servidor este corriendo.');
    } finally {
        showLoading(false);
    }
}

function renderPokemon(pokemons) {
    pokemonContainer.innerHTML = '';

    if (pokemons.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    pokemons.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.imagen || 'https://via.placeholder.com/120?text=No+Image'}" alt="${pokemon.nombre}">
            <h3>${pokemon.nombre}</h3>
            <span class="pokemon-type type-${pokemon.tipo.toLowerCase()}">${pokemon.tipo}</span>
            <p class="pokemon-info">Peso: ${pokemon.caracteristicas.peso} kg | Altura: ${pokemon.caracteristicas.altura} m</p>
            <p class="pokemon-info">Fuerza: ${pokemon.caracteristicas.fuerza} | Edad: ${pokemon.caracteristicas.edad}</p>
            <div class="pokemon-actions">
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); openDetailModal(${pokemon.id})">Ver</button>
                <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); openEditModal(${pokemon.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); openDeleteModal(${pokemon.id}, '${pokemon.nombre}')">Eliminar</button>
            </div>
        `;
        card.addEventListener('click', () => openDetailModal(pokemon.id));
        pokemonContainer.appendChild(card);
    });
}

function searchPokemon() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderPokemon(allPokemon);
        return;
    }
    const filtered = allPokemon.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        p.tipo.toLowerCase().includes(query) ||
        p.habitat.toLowerCase().includes(query)
    );
    renderPokemon(filtered);
}

function clearSearch() {
    searchInput.value = '';
    renderPokemon(allPokemon);
}

function openAddModal() {
    modalTitle.textContent = 'Agregar Pokemon';
    pokemonForm.reset();
    document.getElementById('pokemon-id').value = '';
    openModal(pokemonModal);
}

function openEditModal(id) {
    const pokemon = allPokemon.find(p => p.id === id);
    if (!pokemon) return;

    modalTitle.textContent = 'Editar Pokemon';
    document.getElementById('pokemon-id').value = pokemon.id;
    document.getElementById('nombre').value = pokemon.nombre;
    document.getElementById('imagen').value = pokemon.imagen;
    document.getElementById('peso').value = pokemon.caracteristicas.peso;
    document.getElementById('altura').value = pokemon.caracteristicas.altura;
    document.getElementById('fuerza').value = pokemon.caracteristicas.fuerza;
    document.getElementById('edad').value = pokemon.caracteristicas.edad;
    document.getElementById('habilidades').value = pokemon.habilidades.join(', ');
    document.getElementById('tipo').value = pokemon.tipo;
    document.getElementById('habitat').value = pokemon.habitat;

    openModal(pokemonModal);
}

function openDeleteModal(id, name) {
    deletePokemonId = id;
    document.getElementById('delete-name').textContent = name;
    openModal(deleteModal);
}

function openDetailModal(id) {
    const pokemon = allPokemon.find(p => p.id === id);
    if (!pokemon) return;

    const content = document.getElementById('detail-content');
    content.innerHTML = `
        <img class="detail-image" src="${pokemon.imagen || 'https://via.placeholder.com/150?text=No+Image'}" alt="${pokemon.nombre}">
        <h2 class="detail-name">${pokemon.nombre}</h2>
        <div class="detail-type">
            <span class="pokemon-type type-${pokemon.tipo.toLowerCase()}">${pokemon.tipo}</span>
        </div>
        <div class="detail-stats">
            <h4>Caracteristicas</h4>
            <div class="stat-row">
                <span class="stat-label">Peso</span>
                <span class="stat-value">${pokemon.caracteristicas.peso} kg</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Altura</span>
                <span class="stat-value">${pokemon.caracteristicas.altura} m</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Fuerza</span>
                <span class="stat-value">${pokemon.caracteristicas.fuerza}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Edad</span>
                <span class="stat-value">${pokemon.caracteristicas.edad} anos</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Habitat</span>
                <span class="stat-value">${pokemon.habitat}</span>
            </div>
        </div>
        <div class="detail-abilities">
            <h4>Habilidades</h4>
            ${pokemon.habilidades.map(a => `<span class="ability-tag">${a}</span>`).join('')}
        </div>
        <div class="pokemon-actions" style="margin-top: 1.5rem;">
            <button class="btn btn-secondary btn-small" onclick="closeModal(detailModal); openEditModal(${pokemon.id})">Editar</button>
            <button class="btn btn-danger btn-small" onclick="closeModal(detailModal); openDeleteModal(${pokemon.id}, '${pokemon.nombre}')">Eliminar</button>
        </div>
    `;

    openModal(detailModal);
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('pokemon-id').value;
    const habilidadesStr = document.getElementById('habilidades').value;

    const data = {
        nombre: document.getElementById('nombre').value,
        imagen: document.getElementById('imagen').value,
        caracteristicas: {
            peso: parseFloat(document.getElementById('peso').value),
            altura: parseFloat(document.getElementById('altura').value),
            fuerza: parseInt(document.getElementById('fuerza').value),
            edad: parseInt(document.getElementById('edad').value)
        },
        habilidades: habilidadesStr.split(',').map(h => h.trim()).filter(h => h),
        tipo: document.getElementById('tipo').value,
        habitat: document.getElementById('habitat').value
    };

    try {
        let response;
        if (id) {
            response = await fetch(`${API_BASE}/pokemons/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(`${API_BASE}/pokemons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar');
        }

        closeModal(pokemonModal);
        await loadPokemons();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al guardar el Pokemon');
    }
}

async function confirmDelete() {
    if (!deletePokemonId) return;

    try {
        const response = await fetch(`${API_BASE}/pokemons/${deletePokemonId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar');

        closeModal(deleteModal);
        await loadPokemons();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el Pokemon');
    }
}

function openModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
        pokemonContainer.innerHTML = '';
        noResults.classList.add('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', loadPokemons);
