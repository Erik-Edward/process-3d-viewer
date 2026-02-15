# Process 3D Viewer

## Projektbeskrivning
Detta projekt är en 3D-visualiserare för raffinaderi- och processanläggningar. Syftet är att kunna ta P&ID-scheman (Piping and Instrumentation Diagrams) och konvertera dem till interaktiva 3D-visualiseringar.

## Teknisk Stack
- **Frontend:** HTML + JavaScript med Three.js för 3D-rendering
- **Backend (framtida):** Python för att parsa P&ID-data från Draw.io XML-filer
- **Visualisering:** Three.js (webbaserad 3D)

## Projektmål - Fas 1 (Proof of Concept)
1. Skapa en enkel 3D-visualisering i webbläsaren
2. Definiera processkomponenter manuellt i kod:
   - Pumpar
   - Ventiler
   - Tankar
   - Rörledningar (pipes)
3. Visa interaktiv 3D-vy där användaren kan:
   - Rotera kameran
   - Zooma in/ut
   - Se komponentnamn och typ

## Projektmål - Fas 2 (Framtida)
- Parsa Draw.io P&ID XML-filer automatiskt
- Konvertera 2D-symboler till 3D-positioner
- Mer detaljerade 3D-modeller för komponenter
- Export till olika format

## Filstruktur
```
process-3d-viewer/
├── CLAUDE.md           # Projektinstruktioner för Claude Code
├── index.html          # Huvudfil med Three.js visualisering
├── styles.css          # Stilar
├── app.js              # Huvudlogik för 3D-scenen
├── components.js       # Definitioner av processkomponenter
├── data/               # Processdefinitioner och testdata
└── README.md           # Projektdokumentation
```

## Utvecklingsfilosofi
- Börja enkelt med manuella definitioner
- Iterativt bygga upp funktionalitet
- Fokusera på användbarhet och interaktivitet
- Koden ska vara läsbar och välkommenterad (svenska kommentarer OK)

## Användare
Student inom processteknik med fokus på raffinaderiprocesser. Använder Draw.io för P&ID-ritningar och vill visualisera dessa i 3D för bättre förståelse.

## Tekniska krav
- Webbläsarbaserat (ingen installation för slutanvändare)
- Responsivt (fungerar på olika skärmstorlekar)
- Lättnavigerat 3D-gränssnitt
- Använd CDN för Three.js (ingen npm installation behövs för fas 1)

## Startinstruktioner för utveckling
1. Öppna `index.html` direkt i webbläsaren för att se visualiseringen
2. Redigera `components.js` för att definiera nya processkomponenter
3. All utveckling sker lokalt - inga externa dependencies behövs initialt