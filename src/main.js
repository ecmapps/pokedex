import './style.css'
import './pokemon.scss'
import pokeball from '/pokeball_favicon.webp'

let currentArray = [];
let fullArray = [];

async function fetchPokemonData() {
  try {
    const response = await fetch('/pokedex.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    fullArray = data;
    let slicedArray = data.slice(0, 25);
    fillSlider(slicedArray);           // limitando a 25 elementos por rendimiento
  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

function fillSlider(array) {
  const slider = document.getElementById('slider');
  slider.innerHTML = '';

  if (array.length === 0) {
    slider.innerHTML = `
      <span>
        No se encontraron Pokémon que coincidan con la búsqueda
      </span>
    `;
    return;
  }
  // Máximo 25 para no saturar el DOM
  const slicedArray = array.slice(0, 25);
  currentArray = slicedArray;

  slicedArray.forEach((pokemon) => {
    slider.innerHTML += `
      <div class="pokemon-container">
        <img src="${pokemon.image["thumbnail"]}" alt="${pokemon.name["english"]} sprite" class="pokemon-sprite">
        <button class="pokemon-button">Seleccionar</button>
        <h3 class="pokemon-name" >${pokemon.name["english"]}</h3>
      </div>
    `;
  });

  addButtonListeners();
}

function addButtonListeners() {
  const buttons = document.querySelectorAll('.pokemon-button');
  buttons.forEach(button => {
    button.addEventListener('click', (event) => {
      const pokemonName = event.target.nextElementSibling.textContent;
      const selectedPokemon = currentArray.find(p => p.name["english"] === pokemonName);
      
      if (!selectedPokemon) return;

      document.getElementById('pokemon_name').textContent = selectedPokemon.name["english"];
      document.getElementById('hp').textContent = selectedPokemon.base.HP;
      document.getElementById('attack').textContent = selectedPokemon.base.Attack;
      document.getElementById('defense').textContent = selectedPokemon.base.Defense;
      document.getElementById('spattack').textContent = selectedPokemon.base["Sp. Attack"];
      document.getElementById('spdefense').textContent = selectedPokemon.base["Sp. Defense"];
      document.getElementById('speed').textContent = selectedPokemon.base.Speed;

      const typesContainer = document.getElementById('types');
      typesContainer.innerHTML = '';
      selectedPokemon.type.forEach(t => {
        typesContainer.innerHTML += `
          <img src="/types/${t}.png" alt="${t} type icon" class="type-icon">
        `;
      });

      const spritePlaceholder = document.getElementById('sprite-placeholder');
      spritePlaceholder.innerHTML = `
        <img src="${selectedPokemon.image["thumbnail"]}" alt="${selectedPokemon.name["english"]} sprite" class="pokemon-sprite">
      `;

      document.getElementById('description').innerHTML = `
        <button type="button" data-modal-open="container-modal">Ver descripción</button>
      `;

      // Prepara contenido del modal
      document.getElementById('modal-title').textContent = selectedPokemon.name["english"];
      document.getElementById('especie').textContent = `Especie: ${selectedPokemon.species}`;
      document.getElementById('detalle').textContent = selectedPokemon.description;
    });
  });
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function searchBar() {
  const input = document.querySelector('.base-filter input[type="text"]');
  
  if (!input) {
    console.warn("No se encontró el input de búsqueda");
    return;
  }

  const handleSearch = debounce((e) => {
    const term = e.target.value.toLowerCase().trim();

    if (term.length === 0) {
      // Restaurar vista original cuando se borra el texto
      fillSlider(currentArray);
      return;
    }

    const filtered = fullArray.filter(pokemon => {
      const name = pokemon.name["english"].toLowerCase();
      const especie = (pokemon.species || '').toLowerCase();
      const typesMatch = pokemon.type.some(t => t.toLowerCase().includes(term));

      return name.includes(term) || especie.includes(term) || typesMatch;
    });
    fillSlider(filtered);
  }, 350);  // 350 ms — evita saturar el DOM con cada tecla que se presiona si se escribe rapido

  input.addEventListener('keyup', handleSearch);
}

fetchPokemonData().then(() => {
  // la busquda se activa despues de cargar datos
  searchBar();
});

// Renderizado inicial del HTML en el id app
document.querySelector('#app').innerHTML = `
  <div class="contenedor-base">
    <div class="header-elements">
      <h1 class="titulo">Pokedex</h1>
      <div class="base-filter">
        <input type="text" placeholder="Buscar Pokemon...">
        <button class="search-button"><img src="${pokeball}" alt="pokeball search button"/></button>
      </div>
    </div>
    
    <div class="slider-container" id="slider"></div>

    <!-- Modal -->
    <div class="modal" id="container-modal" hidden>
      <div class="modal-backdrop"></div>
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="modal-title"></h2>
            <button type="button" class="modal-close" aria-label="Close modal">×</button>
          </div>
          <div class="modal-body" id="modal-body">
            <span class="body-custom-text" id="especie"></span>
            <span class="body-custom-text" id="detalle"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tarjeta del Pokemon seleccionado -->
    <div class="pokemon-card">
      <div class="card-header">
        <h2 class="pokemon-name" id="pokemon_name"></h2>
        <div class="types" id="types"></div>
      </div>
      <div class="content">
        <div class="stats">
          <div class="base-col"><span class="label">HP</span><span class="value" id="hp"></span></div>
          <div class="base-col"><span class="label">Attack</span><span class="value" id="attack"></span></div>
          <div class="base-col"><span class="label">Defense</span><span class="value" id="defense"></span></div>
          <div class="base-col"><span class="label">Sp. Attack</span><span class="value" id="spattack"></span></div>
          <div class="base-col"><span class="label">Sp. Defense</span><span class="value" id="spdefense"></span></div>
          <div class="base-col"><span class="label">Speed</span><span class="value" id="speed"></span></div>
        </div>
        <div>
          <div class="sprite-placeholder" id="sprite-placeholder"></div>
          <div class="description" id="description"></div>
        </div>
      </div>
    </div>
  </div>
`;