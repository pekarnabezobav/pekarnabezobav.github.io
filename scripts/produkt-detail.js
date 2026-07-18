document.addEventListener('DOMContentLoaded', () => {
    
    const parametryZUrl = new URLSearchParams(window.location.search);
    const produktId = parametryZUrl.get('id');
    const kontejnerDetailu = document.getElementById('detail-produktu');

    if (!produktId) {
        window.location.href = 'index.html';
        return;
    }

    // NASTAVENÍ AIRTABLE (Doplň své fungující údaje z Webzdarma)
    const AIRTABLE_TOKEN = 'patcLqGALRmNxZ3mA.f2cfd1f2d255cbccbc11f0154dc9474e50a3a85b1e47f15c636c064b2662c733'; 
    const BASE_ID = 'app81BJfSOvz5luMr';
    const TABLE_NAME = 'Produkty';
    
    const DETAIL_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${produktId}`;

    async function nactiDetail() {
        try {
            const odpoved = await fetch(DETAIL_URL, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_TOKEN}`
                }
            });
            
            if (!odpoved.ok) throw new Error('Produkt nenalezen v databázi');

            const data = await odpoved.json();
            const p = data.fields; 

            if(!p) throw new Error('Produkt neexistuje');

            // Uložení VŠECH obrázků do pole
            const obrazkyPole = (p['Obrázek'] && p['Obrázek'].length > 0) 
                ? p['Obrázek'].map(img => img.url) 
                : ['https://via.placeholder.com/600x450?text=Foto+připravujeme'];

            const polozka = {
                Nazev: p['Název'] || 'Bez názvu',
                Kategorie: p['Kategorie'] || 'Ostatní',
                Cena: p['Cena'] || 0,
                Popis: p['Popis'] || '',
                Jednotka: p['Jednotka'] || '',
                Hmotnost: p['Hmotnost'] || '',
                Alergeny: p['Alergeny'] || [], 
                Obrazky: obrazkyPole // Předáváme pole obrázků
            };

            vykresliProdukt(polozka);

        } catch (chyba) {
            console.error(chyba);
            kontejnerDetailu.innerHTML = '<p class="chyba">Omlouváme se, tento produkt jsme nenašli.</p>';
        }
    }

    function vykresliProdukt(polozka) {
        // Příprava alergenů
        let alergenyHtml = '';
        if (polozka.Alergeny && polozka.Alergeny.length > 0) {
            alergenyHtml = `
                <div class="box-alergeny">
                    <strong>⚠️ Pozor na alergeny:</strong><br> 
                    ${polozka.Alergeny.join(', ')}
                </div>
            `;
        }

        const jednotkaText = polozka.Jednotka ? ` / ${polozka.Jednotka}` : '';
        const hmotnostText = polozka.Hmotnost ? ` (Hmotnost: ~ ${polozka.Hmotnost})` : '';

        // Generování HTML pro galerii, pokud je více fotek
        let sipkyHtml = '';
        let nahledyHtml = '';
        
        if (polozka.Obrazky.length > 1) {
            sipkyHtml = `
                <button class="galerie-sipka vlevo" id="sipka-vlevo">&#10094;</button>
                <button class="galerie-sipka vpravo" id="sipka-vpravo">&#10095;</button>
            `;
            
            nahledyHtml = '<div class="galerie-nahledy">';
            polozka.Obrazky.forEach((url, index) => {
                nahledyHtml += `<img src="${url}" class="nahled-foto ${index === 0 ? 'aktivni' : ''}" data-index="${index}" alt="Náhled">`;
            });
            nahledyHtml += '</div>';
        }

        kontejnerDetailu.innerHTML = `
            <div class="produkt-stranka-mrizka">
                
                <div class="produkt-fotky">
                    <div class="hlavni-foto-obal">
                        <img src="${polozka.Obrazky[0]}" alt="${polozka.Nazev}" id="hlavni-foto" class="produkt-hlavni-foto">
                        ${sipkyHtml}
                    </div>
                    ${nahledyHtml}
                </div>

                <div class="produkt-info">
                    <span class="produkt-kategorie">${polozka.Kategorie}</span>
                    <h1>${polozka.Nazev}</h1>
                    <p class="produkt-cena">${polozka.Cena} Kč${jednotkaText}${hmotnostText}</p>
                    
                    <div class="produkt-popis">
                        <p>${polozka.Popis}</p>
                    </div>

                    ${alergenyHtml}

                    <p style="margin-top: 30px; font-size: 0.9rem; color: #777;">
                        <em>* Vše z naší pekárny je zaručeně 100% bez lepku.</em>
                    </p>
                </div>
            </div>
        `;

        aktivujInterakceGalerie(polozka.Obrazky);
    }

    function aktivujInterakceGalerie(obrazky) {
        const hlavniFoto = document.getElementById('hlavni-foto');
        const sipkaVlevo = document.getElementById('sipka-vlevo');
        const sipkaVpravo = document.getElementById('sipka-vpravo');
        const nahledy = document.querySelectorAll('.nahled-foto');
        let aktualniIndex = 0;

        // Funkce pro změnu obrázku
        function ukazObrazek(index) {
            if (index < 0) index = obrazky.length - 1;
            if (index >= obrazky.length) index = 0;
            aktualniIndex = index;
            
            hlavniFoto.src = obrazky[aktualniIndex];
            
            nahledy.forEach(n => n.classList.remove('aktivni'));
            if(nahledy[aktualniIndex]) nahledy[aktualniIndex].classList.add('aktivni');
        }

        // Klikání na šipky
        if (sipkaVlevo) sipkaVlevo.addEventListener('click', () => ukazObrazek(aktualniIndex - 1));
        if (sipkaVpravo) sipkaVpravo.addEventListener('click', () => ukazObrazek(aktualniIndex + 1));

        // Klikání na malé náhledy
        nahledy.forEach(nahled => {
            nahled.addEventListener('click', (e) => {
                ukazObrazek(parseInt(e.target.dataset.index));
            });
        });

        // Přiblížení obrázku (Lightbox) po kliknutí na hlavní fotku
        hlavniFoto.addEventListener('click', () => {
            let lightbox = document.getElementById('galerie-lightbox');
            if (!lightbox) {
                lightbox = document.createElement('div');
                lightbox.id = 'galerie-lightbox';
                lightbox.className = 'lightbox';
                lightbox.innerHTML = `
                    <span class="lightbox-zavrit">&times;</span>
                    <img class="lightbox-img" src="${hlavniFoto.src}">
                `;
                document.body.appendChild(lightbox);
                
                // Zavření při kliknutí mimo fotku
                lightbox.addEventListener('click', (e) => {
                    if (e.target !== lightbox.querySelector('.lightbox-img')) {
                        lightbox.classList.remove('zobrazeno');
                    }
                });
            } else {
                lightbox.querySelector('.lightbox-img').src = hlavniFoto.src;
            }
            
            // Timeout pro plynulou animaci
            setTimeout(() => lightbox.classList.add('zobrazeno'), 10);
        });
    }

    nactiDetail();
});