## Keskkonna seadistamine

```
cd backend
npm i

cd frontend
npm i

npm run test (testib kuidas server reageerib kui JSON impordis on valed andmed ja või duplikaadid ja testib ka /api/readings vastust kui on vale date input)
```

## Andmebaasi migratsioonide käivitamine
```
sudo docker compose up -d
sudo docker compose exec -e NODE_ENV=docker backend npx sequelize-cli db:migrate
```
## JSON-andmete importimine

JSON andmeid saab importida labi /api/import/json endpointi kasutades naiteks postmani raw JSON formaadis
```
{
    "timestamp": "2026-01-03T04:00:00Z",
    "location": "LV",
    "price_eur_mwh": 121.55,
    "price": 121.55
}
```

# Backend’i ja frontend’i käivitamine
frontend jookseb localhost:5173 ja backend localhost:3001
```
cd frontend
npm run dev

cd backend
node server.js
```
# Testide kaivitamine
Testideks on kasutusel Jest
```
npm run test
```

# 6. Lühike arhitektuuri kirjeldus

## Ülesehitus

Projekt koosneb kolmest peamisest komponendist:

### 1. Frontend (React + Vite)
frontend
Peamised komponendid:

- Dashboard.jsx - elektrihinnade visualiseerimine graafikutena (joonistegraafik, tulpdiagramm, piirkondade võrdlus)

- SyncPrices.jsx - elektrihinnade sünkroonimine Eleringi API-st ja JSON-andmete haldamine

Funktsioonid:
  - Elektrihinnade kuvamine graafikute abil
  - Ajavahemiku valimine ja andmete filtreerimine piirkonniti (EE, LV, FI)
  - JSON-andmete üleslaadimine
  - Eleringi API-st hinnade automaatne sünkroonimine

### 2. Backend (Node.js + Express)
backend
Peamised API-endpointid:
  - `POST /api/import/json` - JSON-andmete importimine andmebaasi
  - `GET /api/readings` - elektrihinnade toomine andmebaasist (kuupäevavahemiku ja piirkonna järgi)
  - `POST /api/sync/prices` - Eleringi API-st hinnade sünkroonimine
  - `DELETE /api/readings?source=UPLOAD` - üleslaaditud andmete kustutamine
Arhitektuur:
  - Controllers - HTTP päringute töötlemine ja äriloogika
  - Services - Eleringi API integratsioon, andmete pärimine ja teisendamine
  - Models - Sequelize ORM abil andmebaasi skeemide defineerimine
  - Middleware - globaalne veakaitse ja validatsioon
  - Routes - API marsruutide defineerimine

### 3. Andmebaas (MySQL)
- Andmebaas: naidisprojekt
- Peamine tabel: EnergyReadings
  - `id` - ühiku identifikaator
  - `timestamp` - ajamoment
  - `location` - piirkond (EE, LV, FI)
  - `price_eur_mwh` - elektri hind eurot megavattunnist
  - `source` - andmete allikas (API - Eleringist või UPLOAD - käsitsi üleslaaditud)
  - `createdAt`, `updatedAt` - ajalõpud

## Komponentide omavaheline suhtlus

```
Frontend (React/Vite)
    ↓ HTTP päringud (fetch API)
    ↓
Backend (Express.js)
    ↓ SQL päringud (Sequelize ORM)
    ↓
Andmebaas (MySQL)

Samuti:
Backend → Eleringi API (https://dashboard.elering.ee/api/nps/price)
         ↓
      Saadud hinnad salvestatakse andmebaasi
```

Andmete voog:
1. Frontend saadab HTTP POST/GET päringuid backendile
2. Backend valideerib päringuid, töötleb andmeid ja teostab andmebaasi operatsioone
3. Backend võib pärida andmeid Eleringi API-st, teisendada neid ja salvestada andmebaasi
4. Backend tagastab JSON-andmeid frontendile
5. Frontend visualiseerib andmeid graafikutena

## Kasutatavad tehnoloogiad
Express
React
Vite
MUI X Charts
MySQL
Docker
Sequelize

# 7. API sisemised endpoint’id

| Meetod | URL | Kirjeldus |
|--------|-----|----------|
| GET | `/api/health` | Serveri ja andmebaasi tervisekontroll |
| GET | `/api/readings` | Elektrihinnad kuupäevavahemikus ja piirkonnast |
| POST | `/api/import/json` | JSON-andmete importimine |
| POST | `/api/sync/prices` | Eleringi API-st hinnade sünkroonimine |
| DELETE | `/api/readings` | Üleslaaditud andmete kustutamine |

Näited:
- `GET /api/readings?start=2026-04-01T00:00:00.000Z&end=2026-04-02T00:00:00.000Z&location=EE`
- `POST /api/sync/prices` → `{"start": "2026-04-01", "end": "2026-04-02"}`

# 8. Peamised sõltuvused ja nende eesmärk

Backend (`/backend/package.json`):
- express – HTTP serveri raamistik
- sequelize – ORM andmebaasi töötlemiseks
- mysql2 – MySQL andmebaasi draiver
- cors – CORS nõuete käitamine
- jest – automatiseeritud testimine

Frontend (`/frontend/package.json`):
- react – kasutajaliidese komponentide raamistik
- vite – kiire ehitamise tööriist
- @mui/x-charts – graafikud ja diagrammid
