# BAZAR TAFRAOUT HABIB LKENS - Vetrina Digitale Ufficiale

Benvenuto nel repository ufficiale del sito web per **Bazar Tafraout Habib Lkens**, situato a Torino.
Il sito è una vetrina digitale professionale ad alto impatto visivo, moderna, fluida e reattiva su tutti i dispositivi (PC desktop, tablet e smartphone).

---

## 🌟 Caratteristiche Principali del Progetto

1. **Grafica Premium & Palette Colori**:
   - Design moderno scuro con sfumature eleganti e dettagli oro/ambra.
   - Effetti visivi accattivanti (glassmorphism, animazioni micro-interattive, hover glow).
2. **Splash Screen Emozionale**:
   - Schermata di benvenuto con scritta centrata *"BENVENUTO SU BAZAR TAFRAOUT"* della durata di **esattamente 2 secondi**, che svanisce dolcemente rivelando la homepage.
3. **Navbar & Hamburger Sidebar**:
   - Menu ad hamburger in alto a sinistra con apertura laterale (drawer):
     - **Home**
     - **Info Negozio & Dove Siamo**
     - **Accesso Moderatori (Riservato)**
4. **Vetrina Prodotti (I 6 Riquadri / Quadratini)**:
   - Immagini reali in alta qualità divise in categorie chiare con zoom ed effetti al passaggio del mouse:
     1. *Tappeti raffinati di qualità*
     2. *Bicchieri e oggettistica marocchina*
     3. *Servizi per il tè e accessori cucina*
     4. *Coperte morbide e calde*
     5. *Piatti, padelle, forni e articoli per la casa*
     6. *Abbigliamento e giubbotti*
   - Cliccando su ogni riquadro si apre un elegante modal di anteprima con descrizione approfondita.
5. **Sezione Info Negozio & Dove Siamo**:
   - **Indirizzo**: *Via S. Giovanni Battista la Salle 9/F, 10152 Torino TO* (cliccabile direttamente con collegamento geolocalizzato Google Maps).
   - **Contatti Ufficiali**:
     - Principale: **366 538 0287** (*"Se non risponde, chiama il secondo numero"*)
     - Secondario: **351 852 3194**
   - **Orari di Apertura**:
     - Da Lunedì a Venerdì: 08:30 – 20:50
     - Sabato: 09:00 – 20:30
     - Domenica: Chiuso
   - **Politica Cambi e Rimborsi**: Dettagliata nei termini di legge (richiesta restituzione prodotti puliti, originali e con confezione integra).
   - **Disclaimer Legale (Privacy Policy)**: Chiarimento esplicito che il sito è una vetrina a solo scopo illustrativo (non e-commerce, niente pagamenti online).
   - **Footer**: Dati riservati, *"Creato dal team Rayane Lkens"*, email: `brayan.pastore8@gmail.com`.
6. **Sistema Dinamico dello Stato del Negozio (Live 24/7)**:
   - **Luce Verde (Lampeggiante)**: Negozio aperto.
   - **Luce Arancione**: Mancano 10 minuti alla chiusura (*"Il negozio è in fase di chiusura, passa domani mattina"*).
   - **Luce Rossa**: Negozio chiuso.
   - **Widget Fluttuante in Basso a Destra**: Pallino colorato lampeggiante, orologio digitale sincronizzato in tempo reale (hh:mm:ss) e giorno corrente.
7. **Pannello Segreto "Accesso Moderatori"**:
   - **Password d'accesso**: `Torino_2026`
   - **Avviso obbligatorio in cima**: *"Attenzione: questa categoria è riservata solo al titolare del negozio e non per i clienti"*.
   - **Protezione Anti-Ispezione / Anti-Hack**: Blocco del tasto destro e delle scorciatoie da tastiera (F12, Ctrl+Shift+I, Ctrl+U).
   - **Contatore Visite**: Statistiche delle visite di Oggi, Questa Settimana, Questo Mese e Totali con **grafico interattivo Chart.js**.
   - **Override Manuale dello Stato**: Modulo per applicare uno stato straordinario (es. chiusure anticipate, ferie) con scelta della luce (Verde, Arancione, Rosso), data/ora di inizio, data/ora di scadenza e testo avviso personalizzato. **Il sistema rimuove l'avviso e ripristina gli orari ordinari in automatico appena scade la data impostata!**

---

## 📁 Struttura dei File

```
bazar-tafraout/
├── app.py                   # Server Flask con logica orari, visite e override
├── requirements.txt         # Dipendenze Python
├── Procfile                 # File di avvio per Render (Gunicorn)
├── render.yaml              # Configurazione Infrastructure as Code per Render
├── start.bat                # Avvio rapido locale su Windows con doppio click
├── .gitignore               # Esclusioni file temporanei per Git
├── README.md                # Questa guida
├── data/                    # Directory dati persistenti (JSON)
│   ├── analytics.json       # Storico conteggio visite
│   └── status_override.json # Stato override straordinario
├── static/
│   ├── css/
│   │   └── style.css        # Design System moderno, dark theme e responsive
│   ├── js/
│   │   ├── main.js          # Splash screen, drawer hamburger, modali
│   │   ├── status.js        # Orologio live e calcolo stato negozio 24/7
│   │   ├── admin.js         # Grafico Chart.js e gestione override orari
│   │   └── security.js      # Protezione anti-ispezione e anti-tamper
│   └── images/
│       ├── tappeti.jpg       # Foto reale categoria tappeti
│       ├── bicchieri.jpg     # Foto reale oggettistica marocchina
│       ├── teiere.jpg        # Foto reale servizi per il tè
│       ├── coperte.jpg       # Foto reale coperte morbide
│       ├── cucina.jpg        # Foto reale piatti, tagine e cucina
│       ├── abbigliamento.jpg # Foto reale abbigliamento e giubbotti
│       └── hero-bg.jpg       # Sfondo atmosferico hero
└── templates/
    ├── index.html           # Homepage con tutte le sezioni richieste
    └── admin.html           # Dashboard riservata del titolare
```

---

## 🚀 Come Avviare il Progetto in Locale (Windows)

1. Vai nella cartella `bazar-tafraout` sul tuo Desktop:
   ```
   C:\Users\habib\Desktop\bazar-tafraout
   ```
2. Fai semplicemente doppio click sul file **`start.bat`**.
3. Il terminale si aprirà e avvierà il server locale.
4. Apri il tuo browser preferito (Chrome, Edge, Firefox) all'indirizzo:
   👉 **`http://127.0.0.1:5000`**

---

## ☁️ Guida al Caricamento su GitHub e Deploy su Render (Piano Gratuito)

### Passo 1: Caricamento del Codice su GitHub

1. Installa [Git](https://git-scm.com/) se non lo hai già sul tuo computer.
2. Crea un account su [GitHub](https://github.com/) (se non ne hai già uno).
3. Crea un nuovo repository su GitHub:
   - Clicca sul pulsante verde **"New"** in alto a destra.
   - Dai un nome al repository, ad esempio: `bazar-tafraout`.
   - Impostalo su **Public** o **Private**.
   - Non selezionare "Add a README" (abbiamo già il nostro file). Clicca su **"Create repository"**.
4. Apri il terminale (Prompt dei comandi o PowerShell) dentro la cartella del progetto `C:\Users\habib\Desktop\bazar-tafraout`:
   ```bash
   git init
   git add .
   git commit -m "Primo commit: Bazar Tafraout Habib Lkens completo"
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/bazar-tafraout.git
   git push -u origin main
   ```
   *(Sostituisci `TUO-USERNAME` con il tuo effettivo nome utente di GitHub).*

---

### Passo 2: Pubblicazione Gratuita su Render

1. Vai su [Render.com](https://render.com/) e accedi (puoi accedere comodamente con il tuo account GitHub).
2. Nella dashboard di Render, clicca sul pulsante in alto a destra **"New +"** e seleziona **"Web Service"**.
3. Seleziona **"Build and deploy from a Git repository"** e connettiti al repository `bazar-tafraout` appena caricato su GitHub.
4. Compila le impostazioni di base:
   - **Name**: `bazar-tafraout` (o un nome a tua scelta)
   - **Region**: `Frankfurt (EU)` (ideale per la vicinanza a Torino)
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Seleziona **Free** ($0/month)
5. Nelle **Environment Variables** (sezione variabili d'ambiente in basso):
   - Aggiungi: `ADMIN_PASSWORD` = `Torino_2026`
   - Aggiungi: `SECRET_KEY` = `una_chiave_segreta_a_tua_scelta`
6. Clicca su **"Create Web Service"**.
7. In pochi istanti Render compilerà e pubblicherà il sito fornendoti un URL pubblico HTTPS del tipo:
   👉 `https://bazar-tafraout.onrender.com`

---

### Passo 3: Come Evitare che il Server Vada in Pausa / Addormentamento (Anti-Sleep)

I piani gratuiti di Render mettono in pausa l'istanza dopo circa 15 minuti di inattività per risparmiare risorse.
Abbiamo già preparato nel codice l'endpoint di keep-alive:
👉 `https://tuo-sito.onrender.com/api/ping`

Per mantenere il server **SEMPRE ATTIVO 24 ore su 24 a costo zero**, basta usare un servizio gratuito di monitoraggio/ping esterno (richiede 1 minuto di configurazione):

1. Vai su uno di questi servizi gratuiti (consigliato **UptimeRobot** oppure **cron-job.org**):
   - [UptimeRobot.com](https://uptimerobot.com/) (Gratuito per sempre fino a 50 monitor)
   - oppure [cron-job.org](https://cron-job.org/)
2. Registrati gratuitamente e clicca su **"Add New Monitor"**:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Bazar Tafraout Keep-Alive`
   - **URL**: inserisci l'indirizzo del tuo sito: `https://tuo-sito.onrender.com/api/ping`
   - **Monitoring Interval**: `Every 10 minutes` (o ogni 5 minuti)
3. Clicca su **"Create Monitor"**.
4. **Fatto!** UptimeRobot invierà un ping leggero ogni 10 minuti all'endpoint `/api/ping`. In questo modo il server Render rimarrà costantemente sveglio e risponderà istantaneamente a tutti i tuoi clienti senza alcuna attesa!

---

## 🔒 Credenziali Pannello Moderatori

- **URL Diretto**: `/admin` (oppure clicca su "Accesso Moderatori (Riservato)" dal menu hamburger laterale).
- **Password**: `Torino_2026`
