const API_BASE = 'https://swapi.dev/api/planets/';

let currentUrl = API_BASE;
let nextUrl = null;
let prevUrl = null;
let currentPage = 1;
let isLoading = false;

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');
const loadingSpinner = document.getElementById('loading-spinner');
const tableContainer = document.getElementById('table-container');
const planetTbody = document.getElementById('planet-tbody');
const modalLoading = document.getElementById('modal-loading');
const residentsTableContainer = document.getElementById('residents-table-container');
const residentsTbody = document.getElementById('residents-tbody');
const residentsModalLabel = document.getElementById('residentsModalLabel');

function setupNavigation() {
    btnPrev.addEventListener('click', () => {
        if (prevUrl && !isLoading) {
            currentPage--;
            loadPlanets(prevUrl);
        }
    });

    btnNext.addEventListener('click', () => {
        if (nextUrl && !isLoading) {
            currentPage++;
            loadPlanets(nextUrl);
        }
    });
}

async function loadPlanets(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP hiba: ${response.status}`);
        const data = await response.json();

        // Navigáció frissítése
        nextUrl = data.next;
        prevUrl = data.previous;
        currentUrl = url;

        // Táblázat feltöltése
        planetTbody.innerHTML = '';

    planets.forEach((planet) => {
        const tr = document.createElement('tr');
        tr.classList.add('planet-row');

        const diameter = planet.diameter + " km";
        const surfaceWater = planet.surface_water + " %";
        const population = planet.population;
        const residentsCount = planet.residents.length;

        tr.innerHTML = `
            <td data-label="Név"><span class="planet-name">${escapeHtml(planet.name)}</span></td>
            <td data-label="Átmérő">${diameter}</td>
            <td data-label="Éghajlat">${escapeHtml(planet.climate)}</td>
            <td data-label="Terep">${escapeHtml(planet.terrain)}</td>
            <td data-label="Felszíni víz">${surfaceWater}</td>
            <td data-label="Népesség">${population}</td>
            <td data-label="Lakosok">${renderResidentsButton(planet)}</td>
        `;
        planetTbody.appendChild(tr);
    });
        btnPrev.disabled = !prevUrl;
        btnNext.disabled = !nextUrl;
        pageInfo.textContent = `Oldal ${currentPage}`;
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


