# Snake

## Start spillet lokalt

### Alternativ 1: Dobbeltklikk

Dobbeltklikk på `start.command`.

### Alternativ 2: Kjor fra Terminal

```sh
cd "/Users/joel.nziza/Desktop/The Matrix/Test 1"
chmod +x start.command
./start.command
```

Nettleseren apner automatisk pa `http://127.0.0.1:4173/`.

## Kontroller

- Piltaster
- `W`, `A`, `S`, `D`
- Knappene pa skjermen

## Hvis macOS blokkerer filen

Hvis `start.command` ikke apnes ved dobbeltklikk:

1. Hoyreklikk `start.command`
2. Velg `Open`
3. Bekreft at du vil apne den

## Del spillet med andre via GitHub Pages

Prosjektet er satt opp for statisk publisering med GitHub Pages.

### Filer som publiseres

- `index.html` viser spillmenyen
- `snake.html` viser Snake-spillet
- `styles.css` og `src/` brukes av begge sidene
- `.nojekyll` sikrer at GitHub Pages serverer filene uten Jekyll-behandling

### Slik publiserer du

1. Opprett et nytt repository pa GitHub
2. Last opp alle filene i denne mappen
3. Gå til `Settings` -> `Pages`
4. Under `Build and deployment`, velg `Deploy from a branch`
5. Velg branchen `main` og mappen `/ (root)`
6. Lagre og vent til GitHub gir deg en offentlig lenke

Etter publisering kan andre spille fra mobil eller PC direkte i nettleseren.
