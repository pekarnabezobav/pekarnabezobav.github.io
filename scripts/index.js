document.addEventListener('DOMContentLoaded', () => {
    
    // NASTAVENÍ AIRTABLE (Doplň své údaje!)
    const AIRTABLE_TOKEN = 'patcLqGALRmNxZ3mA.f2cfd1f2d255cbccbc11f0154dc9474e50a3a85b1e47f15c636c064b2662c733'; 
    const BASE_ID = 'app81BJfSOvz5luMr';
    const TABLE_NAME = 'Produkty';
    
    // URL s filtrem: stahuje pouze záznamy se zaškrtnutým políčkem "Na webu"
    const DOTAZ = '{Na webu}=1';
    const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=${encodeURIComponent(DOTAZ)}`;

    const seznamPeciva = document.getElementById('seznam-peciva');
    const kontejnerFiltru = document.getElementById('filtry-kategorii');
    const inputVyhledavani = document.getElementById('vyhledavani');

    let vsechnoPecivo = []; 
    let aktualniKategorie = 'Vše';
    let hledanyText = '';

    async function nactiMenu() {
        try {
            const odpoved = await fetch(AIRTABLE_URL, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_TOKEN}`
                }
            });
            
            if (!odpoved.ok) throw new Error('Nepodařilo se připojit k Airtable.');

            const data = await odpoved.json();
            
            // Mapování dat z Airtable do formátu pro web
            vsechnoPecivo = data.records.map(zaznam => {
                const p = zaznam.fields;
                
                // Ošetření obrázku z Airtable
                const obrazekUrl = (p['Obrázek'] && p['Obrázek'].length > 0) 
                    ? p['Obrázek'][0].url 
                    : 'https://via.placeholder.com/400x300?text=Foto+připravujeme';
                
                return {
                    documentId: zaznam.id,
                    Nazev: p['Název'] || 'Bez názvu',
                    Kategorie: p['Kategorie'] || 'Ostatní',
                    Cena: p['Cena'] || 0,
                    Popis: p['Popis'] || '',
                    Jednotka: p['Jednotka'] || '',
                    Hmotnost: p['Hmotnost'] || '',
                    ObrazekUrl: obrazekUrl
                };
            });

            if (vsechnoPecivo.length === 0) {
                seznamPeciva.innerHTML = '<p class="nacteni">Dnes ještě není upečeno.</p>';
                return;
            }

            vytvorFiltry();
            vykresliProdukty(vsechnoPecivo); 

        } catch (chyba) {
            console.error(chyba);
            seznamPeciva.innerHTML = '<p class="chyba">Chyba připojení k databázi pece.</p>';
        }
    }

    function aplikujFiltryAHledej() {
        let vysledek = vsechnoPecivo;

        if (aktualniKategorie !== 'Vše') {
            vysledek = vysledek.filter(p => p.Kategorie === aktualniKategorie);
        }

        if (hledanyText) {
            vysledek = vysledek.filter(p => 
                p.Nazev.toLowerCase().includes(hledanyText) || 
                (p.Popis && p.Popis.toLowerCase().includes(hledanyText))
            );
        }

        if (vysledek.length === 0) {
            seznamPeciva.className = ''; 
            // PROFESIONÁLNÍ EMPTY STATE
            seznamPeciva.innerHTML = `
                <div class="prazdny-stav">
                    <div class="prazdny-stav-ikona">🥖</div>
                    <h3>Tuhle dobrotu zrovna nemáme</h3>
                    <p>Zkuste hledat něco jiného, nebo se podívejte na celou naši nabídku.</p>
                    <button class="tlacitko" id="reset-hledani" style="margin-top: 15px;">Zobrazit celé menu</button>
                </div>
            `;
            
            // Aktivace tlačítka pro reset vyhledávání
            document.getElementById('reset-hledani').addEventListener('click', () => {
                inputVyhledavani.value = '';
                hledanyText = '';
                document.querySelectorAll('.filtr-btn').forEach(b => b.classList.remove('aktivni'));
                document.querySelector('.filtr-btn').classList.add('aktivni'); // Vybere 'Vše'
                aktualniKategorie = 'Vše';
                aplikujFiltryAHledej();
            });
            
        } else {
            vykresliProdukty(vysledek);
        }
    }

    // Úryvek funkce pro vykreslení karet - přidán LAZY LOADING
    function vykresliProdukty(produktyKVykresleni) {
        seznamPeciva.innerHTML = ''; 
        seznamPeciva.classList.remove('mrizka-peciva');

        const skupinyPodleKategorie = {};
        produktyKVykresleni.forEach(polozka => {
            const kat = polozka.Kategorie;
            if (!skupinyPodleKategorie[kat]) skupinyPodleKategorie[kat] = [];
            skupinyPodleKategorie[kat].push(polozka);
        });

        for (const [nazevKategorie, produktyVKategorii] of Object.entries(skupinyPodleKategorie)) {
            const sekce = document.createElement('div');
            sekce.className = 'kategorie-sekce';

            const nadpis = document.createElement('h3');
            nadpis.className = 'kategorie-nadpis';
            nadpis.textContent = nazevKategorie;
            sekce.appendChild(nadpis);

            const pruh = document.createElement('div');
            pruh.className = 'kategorie-pruh';

            produktyVKategorii.forEach(polozka => {
                const karta = document.createElement('div');
                karta.className = 'karta-peciva karta-horizontalni';

                const jednotkaText = polozka.Jednotka ? ` / ${polozka.Jednotka}` : '';
                const hmotnostText = polozka.Hmotnost ? `<span class="hmotnost">(~ ${polozka.Hmotnost})</span>` : '';

                karta.innerHTML = `
                    <!-- PŘIDÁNO: loading="lazy" pro brutální zrychlení Performance skóre -->
                    <img src="${polozka.ObrazekUrl}" alt="${polozka.Nazev}" class="karta-obrazek" loading="lazy">
                    <div class="karta-texty">
                        <h3>${polozka.Nazev}</h3>
                        <p>${polozka.Popis.substring(0, 60)}...</p>
                        <span class="cena">${polozka.Cena} Kč${jednotkaText}</span>
                        ${hmotnostText}
                    </div>
                `;

                karta.addEventListener('click', () => {
                    window.location.href = `produkt-detail.html?id=${polozka.documentId}`;
                });
                
                pruh.appendChild(karta);
            });

            sekce.appendChild(pruh);
            seznamPeciva.appendChild(sekce);
        }
    }

    function vytvorFiltry() {
        const kategorieSet = new Set(vsechnoPecivo.map(p => p.Kategorie));
        const kategoriePole = ['Vše', ...kategorieSet]; 

        kontejnerFiltru.innerHTML = ''; 

        kategoriePole.forEach(kat => {
            const btn = document.createElement('button');
            btn.className = 'filtr-btn';
            if(kat === 'Vše') btn.classList.add('aktivni');
            btn.textContent = kat;

            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filtr-btn').forEach(b => b.classList.remove('aktivni'));
                e.target.classList.add('aktivni');

                aktualniKategorie = kat;
                aplikujFiltryAHledej();
            });

            kontejnerFiltru.appendChild(btn);
        });
    }

    nactiMenu();
});
