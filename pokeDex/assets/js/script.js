const container = document.getElementById('poke-container');
const loading = document.getElementById('loading');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');

let offset = 0;
const limit = 20;


async function fetchPokemonList() {
  showLoading(true);
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const data = await res.json();

    for (const pokemon of data.results) {
      const pokeData = await fetch(pokemon.url).then(res => res.json());
      renderCard(pokeData);
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Failed to load Pokémon. Try again later.</p>";
  } finally {
    showLoading(false);
  }
}


function renderCard(pokemon) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `
    <h4>#${pokemon.id.toString().padStart(3, '0')}</h4>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3>${capitalizeFirstLetter(pokemon.name)}</h3>
    <div>
      ${pokemon.types.map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`).join('')}
    </div>
  `;

  card.onclick = () => {
    fillOverlay(pokemon);
    overlay.classList.add('active');
  };

  container.appendChild(card);
}

function fillOverlay(pokemon) {
  document.querySelector('.overlay .image').innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
  `;
  document.querySelector('.overlay .nameNnum h3').textContent = capitalizeFirstLetter(pokemon.name);
  document.querySelector('.overlay .nameNnum h4').textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
  document.querySelector('.overlay .height p:nth-child(2)').textContent = `${(pokemon.height / 10).toFixed(1)} m`;
  document.querySelector('.overlay .weight p:nth-child(2)').textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
  document.querySelector('.overlay .exp p:nth-child(2)').textContent = `${pokemon.base_experience} XP`;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


function showLoading(isLoading) {
  loading.style.display = isLoading ? 'block' : 'none';
}


function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}


const searchPokemon = debounce(async () => {
  const input = document.getElementById('searchInput').value.toLowerCase();
  container.innerHTML = '';
  loadMoreBtn.style.display = 'none';

  if (input === '') {
    offset = 0;
    fetchPokemonList();
    loadMoreBtn.style.display = 'block';
    return;
  }

  showLoading(true);
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${input}`);
    if (!res.ok) throw new Error("Pokémon not found");
    const pokemon = await res.json();
    renderCard(pokemon);
  } catch (error) {
    container.innerHTML = "<p style='text-align:center; font-weight:bold;'>❌ No Pokémon found.</p>";
  } finally {
    showLoading(false);
  }
}, 500);


function loadMorePokemon() {
  offset += limit;
  fetchPokemonList();
}


async function filterByType(type) {
  const searchInput = document.getElementById('searchInput').value.trim();

  if (searchInput !== "") {
    searchPokemon();
    return;
  }

  container.innerHTML = '';
  loadMoreBtn.style.display = 'none';

  if (type === "") {
    offset = 0;
    fetchPokemonList();
    loadMoreBtn.style.display = 'block';
    return;
  }

  showLoading(true);
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    if (!res.ok) throw new Error("Type not found");
    const data = await res.json();
    const pokemonList = data.pokemon.map(p => p.pokemon);

    for (let i = 0; i < Math.min(20, pokemonList.length); i++) {
      const pokeData = await fetch(pokemonList[i].url).then(res => res.json());
      renderCard(pokeData);
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>❌ Failed to load Pokémon by type.</p>";
  } finally {
    showLoading(false);
  }
}


closeBtn.onclick = () => {
  overlay.classList.remove('active');
};


overlay.onclick = (e) => {
  if (e.target === overlay) {
    overlay.classList.remove('active');
  }
};


fetchPokemonList();
