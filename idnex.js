let currentPageUrl = 'https://swapi.dev/api/planets/';
let nextUrl = null;
let prevUrl = null;
let isLoading = false;

const planetBody = document.getElementById('planetBody');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const loader = document.getElementById('loader');

// Formázó függvény a népességhez
const formatNumber = (num) => {
    if (num === "unknown") return "ismeretlen";
    return new Intl.NumberFormat('hu-HU').format(num) + " fő";
};

// Felszíni víz formázó
const formatWater = (val) => {
    return val === "unknown" ? "ismeretlen" : `${val}%`;
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderResidentsButton(planet) {
    if (planet.residents.length === 0) {
        return '<span class="no-residents">Nincs ismert lakos</span>';
    }
    const count = planet.residents.length;
    return `<button class="btn-residents" 
                data-planet-name="${escapeHtml(planet.name)}" 
                data-residents='${JSON.stringify(planet.residents)}'>
                ${count} lakos
            </button>`;
}

async function fetchPlanets(url) {
    if (!url || isLoading) return; // Dupla kattintás és üres URL elleni védelem

    isLoading = true;
    loader.style.display = 'inline';
    nextBtn.disabled = true;
    prevBtn.disabled = true;

    try {
        const response = await fetch(url);
        const data = await response.json();

        nextUrl = data.next;
        prevUrl = data.previous;
        renderTable(data.results);
        console.log("Adatok betöltve:", data);
    } catch (error) {
        
        alert("Nem sikerült betölteni az adatokat.");
    } finally {
        isLoading = false;
        loader.style.display = 'none';
        // Gombok állapotának frissítése
        nextBtn.disabled = !nextUrl;
        prevBtn.disabled = !prevUrl;
    }
}

async function openResidentsModal(planetName, residentUrls) {
    // Modális ablak megnyitása
    residentsModalLabel.textContent = `${planetName} — Lakosok`;
    modalLoading.classList.remove('d-none');
    residentsTableContainer.classList.add('d-none');
    residentsTbody.innerHTML = '';
    residentsModal.show();

    try {
        // Összes lakos lekérése párhuzamosan
        const responses = await Promise.all(
            residentUrls.map(url => fetch(url).then(res => {
                if (!res.ok) throw new Error(`HTTP hiba: ${res.status}`);
                return res.json();
            }))
        );

        renderResidents(responses);

    } catch (error) {
        console.error('Hiba a lakosok betöltésekor:', error);
        residentsTbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-3">
                    Hiba történt a lakosok betöltésekor.
                </td>
            </tr>`;
        residentsTableContainer.classList.remove('d-none');
    } finally {
        modalLoading.classList.add('d-none');
    }
}

function renderTable(planets) {
    planetBody.innerHTML = '';
    planets.forEach(p => {
        const row = `
                <tr>
                    <td data-label="Név">${p.name}</td>
                    <td data-label="Átmérő">${p.diameter} km</td>
                    <td data-label="Éghajlat">${p.climate}</td>
                    <td data-label="Terep">${p.terrain}</td>
                    <td data-label="Felszíni víz">${formatWater(p.surface_water)}</td>
                    <td data-label="Népesség">${formatNumber(p.population)}</td>
                    <td data-label="Lakosok">${renderResidentsButton(p.residents)}</td>
                </tr>
            `;
        planetBody.innerHTML += row;

        document.querySelectorAll('.btn-residents').forEach(btn => {
        btn.addEventListener('click', () => {
            const planetName = btn.dataset.planetName;
            const residentUrls = JSON.parse(btn.dataset.residents);
            openResidentsModal(planetName, residentUrls);
        });
    });

    tableContainer.classList.remove('d-none');
    });
}



// Eseménykezelők
nextBtn.addEventListener('click', () => fetchPlanets(nextUrl));
prevBtn.addEventListener('click', () => fetchPlanets(prevUrl));

// Első betöltés
fetchPlanets(currentPageUrl);
