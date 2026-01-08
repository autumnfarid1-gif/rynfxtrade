document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const pokemonGrid = document.getElementById('pokemonGrid');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const typeContainer = document.getElementById('typeContainer');
    const favoritesGrid = document.getElementById('favoritesGrid');
    const pokemonModal = document.getElementById('pokemonModal');
    const closeModal = document.querySelector('.close-modal');
    const modalBody = document.getElementById('modalBody');

    // Global Variables
    let currentOffset = 0;
    const limit = 20;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let typeColors = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD'
    };

    // Initialize
    displayTypeBadges();
    loadPokemon();
    displayFavorites();

    // Type Badges Display
    function displayTypeBadges() {
        for (const [type, color] of Object.entries(typeColors)) {
            const typeBadge = document.createElement('div');
            typeBadge.className = 'type-badge';
            typeBadge.style.backgroundColor = color;
            typeBadge.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            typeBadge.addEventListener('click', () => filterByType(type));
            typeContainer.appendChild(typeBadge);
        }
    }

    // Load Pokémon from PokeAPI
    async function loadPokemon() {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`);
            const data = await response.json();
            
            for (const pokemon of data.results) {
                await displayPokemon(pokemon.url);
            }
            
            currentOffset += limit;
        } catch (error) {
            console.error('Error loading Pokémon:', error);
        }
    }

    // Display Individual Pokémon
    async function displayPokemon(url) {
        try {
            const response = await fetch(url);
            const pokemon = await response.json();
            
            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.dataset.id = pokemon.id;
            
            const isFavorite = favorites.includes(pokemon.id);
            
            card.innerHTML = `
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${pokemon.id}">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="card-image">
                    <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                         alt="${pokemon.name}" 
                         loading="lazy">
                </div>
                <div class="card-info">
                    <div class="card-id">#${pokemon.id.toString().padStart(3, '0')}</div>
                    <h3 class="card-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                    <div class="card-types">
                        ${pokemon.types.map(typeInfo => `
                            <span style="background-color: ${typeColors[typeInfo.type.name] || '#777'}">
                                ${typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Add click event to show modal
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.favorite-btn')) {
                    showPokemonModal(pokemon.id);
                }
            });
            
            // Add favorite button event
            const favoriteBtn = card.querySelector('.favorite-btn');
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(pokemon.id, favoriteBtn);
            });
            
            pokemonGrid.appendChild(card);
        } catch (error) {
            console.error('Error displaying Pokémon:', error);
        }
    }

    // Show Pokémon Modal with Details
    async function showPokemonModal(id) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const pokemon = await response.json();
            
            // Get species data for description
            const speciesResponse = await fetch(pokemon.species.url);
            const speciesData = await speciesResponse.json();
            
            const description = speciesData.flavor_text_entries.find(
                entry => entry.language.name === 'en'
            )?.flavor_text || 'No description available.';
            
            modalBody.innerHTML = `
                <div class="modal-pokemon">
                    <div class="modal-header" style="background: linear-gradient(135deg, ${typeColors[pokemon.types[0].type.name]} 0%, ${typeColors[pokemon.types[pokemon.types.length - 1]?.type.name] || typeColors[pokemon.types[0].type.name]} 100%); padding: 2rem; text-align: center;">
                        <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">
                            ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                        </h2>
                        <div style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.9);">
                            #${pokemon.id.toString().padStart(3, '0')}
                        </div>
                    </div>
                    
                    <div class="modal-content-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem;">
                        <div class="modal-image" style="text-align: center;">
                            <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                                 alt="${pokemon.name}" 
                                 style="max-width: 100%; max-height: 300px;">
                        </div>
                        
                        <div class="modal-info">
                            <div class="modal-types" style="margin-bottom: 1.5rem;">
                                <h3 style="margin-bottom: 0.5rem; color: #ffde00;">Types</h3>
                                <div style="display: flex; gap: 0.5rem;">
                                    ${pokemon.types.map(typeInfo => `
                                        <span style="background-color: ${typeColors[typeInfo.type.name] || '#777'}; 
                                                     padding: 0.5rem 1rem; 
                                                     border-radius: 20px;
                                                     font-weight: 600;">
                                            ${typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="modal-stats" style="margin-bottom: 1.5rem;">
                                <h3 style="margin-bottom: 0.5rem; color: #ffde00;">Base Stats</h3>
                                ${pokemon.stats.map(stat => `
                                    <div style="margin-bottom: 0.5rem;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
                                            <span>${stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.slice(1)}</span>
                                            <span>${stat.base_stat}</span>
                                        </div>
                                        <div style="height: 8px; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden;">
                                            <div style="height: 100%; 
                                                        width: ${(stat.base_stat / 255) * 100}%; 
                                                        background-color: ${stat.base_stat > 80 ? '#4CAF50' : stat.base_stat > 50 ? '#FFC107' : '#F44336'};">
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="modal-description">
                                <h3 style="margin-bottom: 0.5rem; color: #ffde00;">Description</h3>
                                <p style="color: #ddd; line-height: 1.6;">
                                    ${description.replace(/\n/g, ' ').replace(/\f/g, ' ')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            pokemonModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Error loading Pokémon details:', error);
            modalBody.innerHTML = '<p style="text-align: center; padding: 2rem;">Error loading Pokémon details. Please try again.</p>';
            pokemonModal.style.display = 'block';
        }
    }

    // Toggle Favorite
    function toggleFavorite(id, button) {
        const index = favorites.indexOf(id);
        
        if (index === -1) {
            favorites.push(id);
            button.classList.add('active');
        } else {
            favorites.splice(index, 1);
            button.classList.remove('active');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }

    // Display Favorites
    async function displayFavorites() {
        favoritesGrid.innerHTML = '';
        
        if (favorites.length === 0) {
            favoritesGrid.innerHTML = '<p class="empty-favorites">No favorites yet. Click the heart icon on Pokémon cards to add them!</p>';
            return;
        }
        
        for (const id of favorites) {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                const pokemon = await response.json();
                
                const card = document.createElement('div');
                card.className = 'pokemon-card';
                card.style.transform = 'scale(0.9)';
                
                card.innerHTML = `
                    <div class="card-image">
                        <img src="${pokemon.sprites.front_default}" 
                             alt="${pokemon.name}" 
                             loading="lazy">
                    </div>
                    <div class="card-info">
                        <div class="card-id">#${pokemon.id.toString().padStart(3, '0')}</div>
                        <h3 class="card-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                        <div class="card-types">
                            ${pokemon.types.map(typeInfo => `
                                <span style="background-color: ${typeColors[typeInfo.type.name] || '#777'}">
                                    ${typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
                
                card.addEventListener('click', () => showPokemonModal(pokemon.id));
                favoritesGrid.appendChild(card);
            } catch (error) {
                console.error('Error loading favorite Pokémon:', error);
            }
        }
    }

    // Search Pokémon
    async function searchPokemon() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) return;
        
        try {
            // Clear current grid
            pokemonGrid.innerHTML = '';
            currentOffset = 0;
            
            // Search by ID or name
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
            
            if (response.ok) {
                const pokemon = await response.json();
                await displayPokemon(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
            } else {
                // If not found by ID/name, search by partial name
                const listResponse = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
                const listData = await listResponse.json();
                
                const matchingPokemon = listData.results.filter(p => 
                    p.name.includes(query) || 
                    p.url.split('/')[6].startsWith(query)
                );
                
                for (const p of matchingPokemon.slice(0, 20)) {
                    await displayPokemon(p.url);
                }
            }
        } catch (error) {
            console.error('Error searching Pokémon:', error);
            pokemonGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No Pokémon found. Try a different search term.</p>';
        }
    }

    // Filter by Type
    async function filterByType(type) {
        try {
            pokemonGrid.innerHTML = '';
            
            const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
            const data = await response.json();
            
            // Display first 20 Pokémon of this type
            for (const pokemon of data.pokemon.slice(0, 20)) {
                await displayPokemon(pokemon.pokemon.url);
            }
        } catch (error) {
            console.error('Error filtering by type:', error);
        }
    }

    // Event Listeners
    searchBtn.addEventListener('click', searchPokemon);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPokemon();
    });

    loadMoreBtn.addEventListener('click', loadPokemon);

    closeModal.addEventListener('click', () => {
        pokemonModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === pokemonModal) {
            pokemonModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});