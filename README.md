# 🌾 Pekárna Bez Obav – Webová aplikace

Tento projekt je frontendová webová aplikace pro rodinnou bezlepkovou pekárnu, postavená na moderní **JAMstack** architektuře (JavaScript, API, Markup). Aplikace dynamicky načítá data z headless CMS (Airtable) bez nutnosti tradičního backendu.

## 🚀 Architektura & Technologie

*   **Frontend:** Čisté HTML5, CSS3 a Vanilla JavaScript (ES6+). Nebyly použity žádné těžké frameworky (React/Vue) pro maximální optimalizaci výkonu a rychlost načítání.
*   **Backend / Databáze:** [Airtable API](https://airtable.com/). Funguje jako headless CMS pro jednoduchou správu sortimentu a cen ze strany klienta (pekařky).
*   **Hosting:** GitHub Pages s kontinuálním nasazením (CI/CD).
*   **Design Systém:** Plně responzivní CSS Flexbox/Grid layout, využití CSS proměnných pro snadný theming.

## ✨ Klíčové funkce

*   **Real-time synchronizace dat:** Úpravy v Airtable se na webu projeví okamžitě po obnovení stránky.
*   **Klientské filtrování a vyhledávání:** Asynchronní načtení databáze (fetch API) s okamžitým filtrováním pomocí JS přímo v prohlížeči.
*   **Performance Optimalizace:** Implementován Lazy Loading obrázků pro úsporu bandwidthu.
*   **UX/UI Mikrointerakce:** Nasazeny Skeleton Loadery omezující Cumulative Layout Shift (CLS) během asynchronních requestů na API, ošetření "Empty States" při vyhledávání.
*   **Interaktivní Lightbox Galerie:** Modulárně napsaná galerie pro prohlížení detailu produktů.

## 🔒 Bezpečnostní model

Z důvodu absence serverové vrstvy (serverless přístup) je API klíč uložen v klientském kódu. Bezpečnost je striktně zajištěna formou **Read-Only tokenu** omezeného pomocí scopes (`data.records:read`), s přístupem striktně vázaným na jedinou vyhrazenou databázi "Pekárna". Možnost zápisu nebo smazání dat přes tento token je vyloučena.

## ⚙️ Spuštění projektu (Pro Vývojáře)

1. Naklonujte repozitář:
   \`git clone https://github.com/vase-jmeno/pekarna-bez-obav.git\`
2. Otevřete adresář projektu.
3. Spusťte `index.html` přes jakýkoliv lokální vývojový server (např. *Live Server* ve VS Code).

---
*Vytvořeno v rámci obhajoby bakalářské práce. Zaměřeno na výkon, čistotu kódu a použitelnost v reálném business prostředí.*
