================================================================================
GUIDA COMPLETA - COME AGGIUNGERE PROGETTI AL PORTFOLIO LKR
COMPLETE GUIDE - HOW TO ADD PROJECTS TO LKR PORTFOLIO
================================================================================

Versione 1.0 - Ottobre 2025
Creato per: LKR Renovation MC SARL
Sito web: https://lkr.mc


================================================================================
🇮🇹 GUIDA IN ITALIANO
================================================================================

📌 INTRODUZIONE
--------------------------------------------------------------------------------
Questa guida ti spiega passo dopo passo come aggiungere nuovi progetti di 
ristrutturazione al portfolio del sito LKR senza conoscere programmazione.

Il sistema è molto semplice:
1. Carichi le foto dei tuoi progetti su GitHub
2. Modifichi un file di testo (progetti.json) aggiungendo titoli e descrizioni
3. Il sito mostra automaticamente i progetti in tutte le lingue

Non serve conoscere HTML, CSS o JavaScript!


📸 STEP 1: PREPARARE LE FOTO
--------------------------------------------------------------------------------

REQUISITI TECNICI FOTO:

✅ Formato file:        JPG (consigliato) o PNG
✅ Dimensioni:          1200x800 pixel (orizzontale) oppure 800x1200 pixel (verticale)
✅ Peso massimo:        200 KB per foto (per velocità sito)
✅ Qualità:             Alta, ma compressa per web
✅ Naming (nomi file):  Tutto minuscolo, senza spazi, con trattini

❌ NON usare:           HEIC, TIFF, BMP, WebP (non supportati ovunque)
❌ NON usare:           Foto più grandi di 2 MB (rallentano il sito)
❌ NON usare:           Nomi con spazi o caratteri speciali (es: "foto Monaco 2024.jpg")


COME NOMINARE LE FOTO (IMPORTANTE):

Formato: progetto-[nome]-[numero].jpg

Esempi corretti:
✅ progetto-montecarlo-01.jpg
✅ progetto-montecarlo-02.jpg
✅ progetto-fontvieille-01.jpg
✅ progetto-bagno-monaco-01.jpg

Esempi sbagliati:
❌ Progetto Monte Carlo 1.jpg  (ha spazi e maiuscole)
❌ foto_bagno.JPG               (underscore invece di trattino)
❌ IMG_2024.jpg                 (nome generico)


COME RIDURRE IL PESO DELLE FOTO:

Se le tue foto sono troppo grandi (oltre 200 KB), usa uno di questi siti gratuiti:
- https://tinyjpg.com (trascini foto, scarichi versione compressa)
- https://squoosh.app (più opzioni avanzate)
- https://compressor.io (facile e veloce)

IMPORTANTE: Comprimi PRIMA di caricare su GitHub!


📤 STEP 2: CARICARE LE FOTO SU GITHUB
--------------------------------------------------------------------------------

1. Vai su GitHub.com e fai login
2. Apri il repository: lkr-renovation/lkr
3. Clicca sulla cartella "img"
4. Clicca sulla cartella "portfolio"
5. Clicca su "Add file" (in alto a destra)
6. Clicca su "Upload files"
7. Trascina le tue foto nella pagina (oppure clicca "choose your files")
8. Scrivi un messaggio tipo: "Aggiungi foto progetto Monte-Carlo"
9. Clicca su "Commit changes" (pulsante verde in basso)

⏱️ Le foto saranno online in 1-2 minuti dopo il commit!


📝 STEP 3: AGGIUNGERE IL PROGETTO AL FILE progetti.json
--------------------------------------------------------------------------------

ATTENZIONE: Questo è il passo più delicato! Segui ESATTAMENTE le istruzioni.

1. Vai su GitHub.com nel repository lkr-renovation/lkr
2. Clicca sulla cartella "data"
3. Clicca sul file "progetti.json"
4. Clicca sull'icona della MATITA (in alto a destra) per modificare
5. Scorri fino alla fine del file
6. Trova l'ULTIMA parentesi quadra chiusa ]
7. Posizionati PRIMA di quella parentesi
8. Aggiungi una VIRGOLA dopo l'ultimo progetto
9. Copia e incolla il TEMPLATE qui sotto

TEMPLATE NUOVO PROGETTO (copia dal segno di inizio a quello di fine):

--- INIZIO TEMPLATE ---
    ,
    {
      "id": "progetto-03",
      "anno": "2025",
      "categoria": "rénovation-complète",
      "immagini": [
        "img/portfolio/progetto-03-foto-01.jpg",
        "img/portfolio/progetto-03-foto-02.jpg",
        "img/portfolio/progetto-03-foto-03.jpg"
      ],
      "traduzioni": {
        "fr": {
          "titolo": "Rénovation Appartement Fontvieille",
          "luogo": "Fontvieille, Monaco",
          "descrizione": "Rénovation complète d'un appartement de 120m² avec vue port."
        },
        "it": {
          "titolo": "Ristrutturazione Appartamento Fontvieille",
          "luogo": "Fontvieille, Monaco",
          "descrizione": "Ristrutturazione completa di un appartamento di 120m² con vista porto."
        },
        "en": {
          "titolo": "Apartment Renovation Fontvieille",
          "luogo": "Fontvieille, Monaco",
          "descrizione": "Complete renovation of a 120m² apartment with harbor view."
        },
        "ru": {
          "titolo": "Ремонт Квартиры Фонвьей",
          "luogo": "Фонвьей, Монако",
          "descrizione": "Полный ремонт квартиры 120м² с видом на порт."
        },
        "de": {
          "titolo": "Wohnungsrenovierung Fontvieille",
          "luogo": "Fontvieille, Monaco",
          "descrizione": "Komplette Renovierung einer 120m² Wohnung mit Hafenblick."
        },
        "es": {
          "titolo": "Renovación Apartamento Fontvieille",
          "luogo": "Fontvieille, Mónaco",
          "descrizione": "Renovación completa de un apartamento de 120m² con vista al puerto."
        }
      }
    }
--- FINE TEMPLATE ---


COSA DEVI MODIFICARE NEL TEMPLATE:

1. "id": Cambia "progetto-03" con un nome unico (es: "progetto-bagno-monaco")
2. "anno": Cambia "2025" con l'anno del progetto
3. "categoria": Scegli UNA tra queste opzioni:
   - "rénovation-complète"
   - "rénovation-salle-de-bain"
   - "rénovation-cuisine"
4. "immagini": Inserisci i percorsi delle TUE foto caricate prima
5. "traduzioni": Modifica titolo, luogo e descrizione in TUTTE le 6 lingue


REGOLE IMPORTANTI JSON:

⚠️ NON cancellare le virgolette " "
⚠️ NON cancellare le virgole ,
⚠️ NON cancellare le parentesi graffe { }
⚠️ Ogni progetto DEVE finire con } seguito da virgola (tranne l'ultimo)
⚠️ L'ultima parentesi quadra ] NON deve avere virgola dopo


ESEMPIO PRATICO - STRUTTURA COMPLETA progetti.json:

{
  "progetti": [
    {
      "id": "progetto-01",
      ...
    },
    {
      "id": "progetto-02",
      ...
    },
    {
      "id": "progetto-03",
      ...
    }
  ]
}

Nota la VIRGOLA dopo progetto-01 e progetto-02, ma NON dopo progetto-03!


✅ STEP 4: SALVARE E VERIFICARE
--------------------------------------------------------------------------------

1. Dopo aver modificato progetti.json, scorri in basso
2. Scrivi messaggio tipo: "Aggiungi progetto Fontvieille"
3. Clicca "Commit changes" (pulsante verde)
4. Aspetta 1-2 minuti per il deploy automatico
5. Vai su https://lkr.mc/portfolio.html
6. Verifica che il nuovo progetto appaia
7. Prova a cambiare lingua (bottoni FR/IT/EN/RU/DE/ES)
8. Clicca sul progetto per aprire la galleria foto


❌ COSA FARE SE QUALCOSA NON FUNZIONA
--------------------------------------------------------------------------------

PROBLEMA: Il sito non mostra i progetti
SOLUZIONE: Probabilmente c'è un errore di sintassi in progetti.json
         Controlla di non aver cancellato virgolette, virgole o parentesi

PROBLEMA: Le foto non si vedono
SOLUZIONE: Controlla che i percorsi in "immagini" siano esatti
         Devono iniziare con img/portfolio/ e finire con .jpg

PROBLEMA: Appare solo una lingua
SOLUZIONE: Controlla di aver compilato TUTTE le 6 lingue nelle traduzioni

PROBLEMA: Errore "404 Not Found"
SOLUZIONE: Aspetta 2-3 minuti dopo il commit, Vercel sta facendo il deploy


📧 SUPPORTO
--------------------------------------------------------------------------------
Per problemi tecnici o dubbi, contatta:
Riccardo Barlozzetti - r.barlozzetti@gmail.com


================================================================================
🇬🇧 GUIDE IN ENGLISH
================================================================================

📌 INTRODUCTION
--------------------------------------------------------------------------------
This guide explains step by step how to add new renovation projects to the 
LKR website portfolio without programming knowledge.

The system is very simple:
1. Upload photos of your projects to GitHub
2. Edit a text file (progetti.json) adding titles and descriptions
3. The website automatically displays projects in all languages

No need to know HTML, CSS or JavaScript!


📸 STEP 1: PREPARE PHOTOS
--------------------------------------------------------------------------------

PHOTO TECHNICAL REQUIREMENTS:

✅ File format:         JPG (recommended) or PNG
✅ Dimensions:          1200x800 pixels (horizontal) or 800x1200 pixels (vertical)
✅ Maximum size:        200 KB per photo (for site speed)
✅ Quality:             High, but compressed for web
✅ Naming:              All lowercase, no spaces, with hyphens

❌ DO NOT use:          HEIC, TIFF, BMP, WebP (not supported everywhere)
❌ DO NOT use:          Photos larger than 2 MB (slow down the site)
❌ DO NOT use:          Names with spaces or special characters (e.g. "photo Monaco 2024.jpg")


HOW TO NAME PHOTOS (IMPORTANT):

Format: progetto-[name]-[number].jpg

Correct examples:
✅ progetto-montecarlo-01.jpg
✅ progetto-montecarlo-02.jpg
✅ progetto-fontvieille-01.jpg
✅ progetto-bagno-monaco-01.jpg

Wrong examples:
❌ Project Monte Carlo 1.jpg   (has spaces and uppercase)
❌ photo_bathroom.JPG           (underscore instead of hyphen)
❌ IMG_2024.jpg                 (generic name)


HOW TO REDUCE PHOTO SIZE:

If your photos are too large (over 200 KB), use one of these free sites:
- https://tinyjpg.com (drag photo, download compressed version)
- https://squoosh.app (more advanced options)
- https://compressor.io (easy and fast)

IMPORTANT: Compress BEFORE uploading to GitHub!


📤 STEP 2: UPLOAD PHOTOS TO GITHUB
--------------------------------------------------------------------------------

1. Go to GitHub.com and login
2. Open repository: lkr-renovation/lkr
3. Click on "img" folder
4. Click on "portfolio" folder
5. Click "Add file" (top right)
6. Click "Upload files"
7. Drag your photos to the page (or click "choose your files")
8. Write message like: "Add Monte-Carlo project photos"
9. Click "Commit changes" (green button at bottom)

⏱️ Photos will be online 1-2 minutes after commit!


📝 STEP 3: ADD PROJECT TO progetti.json FILE
--------------------------------------------------------------------------------

ATTENTION: This is the most delicate step! Follow instructions EXACTLY.

1. Go to GitHub.com in repository lkr-renovation/lkr
2. Click on "data" folder
3. Click on "progetti.json" file
4. Click on PENCIL icon (top right) to edit
5. Scroll to end of file
6. Find the LAST closing square bracket ]
7. Position BEFORE that bracket
8. Add a COMMA after the last project
9. Copy and paste the TEMPLATE below

NEW PROJECT TEMPLATE (copy from start to end mark):

--- START TEMPLATE ---
    ,
    {
      "id": "progetto-03",
      "anno": "2025",
      "categoria": "rénovation-complète",
      "immagini": [
        "img/portfolio/progetto-03-foto-01.jpg",
        "img/portfolio/progetto-03-foto-02.jpg",
        "img/portfolio/progetto-03-foto-03.jpg"
      ],
      "traduzioni": {
        "fr": {
          "titolo": "Rénovation Appartement Fontvieille",
          "luogo": "Fontvieille, Monaco",
          "descrizione": "Rénovation complète d'un appartement de 120m² avec vue port."
        },
        "it": {
          "titolo": "Ristrutturazione Appartamento Fontvieille",
          "luogo": "Fontvieille, Monaco",
          "descrizione": "Ristrutturazione completa di un appartamento di 120m² con vista porto."
        },
        "en": {
          "titolo": "Apartment Renovation Fontvieille",
          "luogo": "Fontvieille, Monaco",
          "descrizione": "Complete renovation of a 120m² apartment with harbor view."
        },
        "ru": {
          "titolo": "Ремонт Квартиры Фонвьей",
          "luogo": "Фонвьей, Монако",
          "descrizione": "Полный ремонт квартиры 120м² с видом на порт."
        },
        "de": {
          "titolo": "Wohnungsrenovierung Fontvieille",
          "luogo": "Fontvieille, Monaco",
          "descrizione": "Komplette Renovierung einer 120m² Wohnung mit Hafenblick."
        },
        "es": {
          "titolo": "Renovación Apartamento Fontvieille",
          "luogo": "Fontvieille, Mónaco",
          "descrizione": "Renovación completa de un apartamento de 120m² con vista al puerto."
        }
      }
    }
--- END TEMPLATE ---


WHAT YOU NEED TO MODIFY IN TEMPLATE:

1. "id": Change "progetto-03" with unique name (e.g. "progetto-bagno-monaco")
2. "anno": Change "2025" with project year
3. "categoria": Choose ONE from these options:
   - "rénovation-complète"
   - "rénovation-salle-de-bain"
   - "rénovation-cuisine"
4. "immagini": Insert paths of YOUR photos uploaded before
5. "traduzioni": Modify title, location and description in ALL 6 languages


IMPORTANT JSON RULES:

⚠️ DO NOT delete quotation marks " "
⚠️ DO NOT delete commas ,
⚠️ DO NOT delete curly braces { }
⚠️ Each project MUST end with } followed by comma (except the last one)
⚠️ The last square bracket ] must NOT have comma after


PRACTICAL EXAMPLE - COMPLETE progetti.json STRUCTURE:

{
  "progetti": [
    {
      "id": "progetto-01",
      ...
    },
    {
      "id": "progetto-02",
      ...
    },
    {
      "id": "progetto-03",
      ...
    }
  ]
}

Note the COMMA after progetto-01 and progetto-02, but NOT after progetto-03!


✅ STEP 4: SAVE AND VERIFY
--------------------------------------------------------------------------------

1. After editing progetti.json, scroll down
2. Write message like: "Add Fontvieille project"
3. Click "Commit changes" (green button)
4. Wait 1-2 minutes for automatic deploy
5. Go to https://lkr.mc/portfolio.html
6. Verify that new project appears
7. Try changing language (FR/IT/EN/RU/DE/ES buttons)
8. Click on project to open photo gallery


❌ WHAT TO DO IF SOMETHING DOESN'T WORK
--------------------------------------------------------------------------------

PROBLEM: Site doesn't show projects
SOLUTION: There's probably a syntax error in progetti.json
         Check you haven't deleted quotation marks, commas or brackets

PROBLEM: Photos don't show
SOLUTION: Check that paths in "immagini" are exact
         They must start with img/portfolio/ and end with .jpg

PROBLEM: Only one language appears
SOLUTION: Check you have filled ALL 6 languages in translations

PROBLEM: "404 Not Found" error
SOLUTION: Wait 2-3 minutes after commit, Vercel is deploying


📧 SUPPORT
--------------------------------------------------------------------------------
For technical problems or questions, contact:
Riccardo Barlozzetti - r.barlozzetti@gmail.com


================================================================================
FINE / END
================================================================================
