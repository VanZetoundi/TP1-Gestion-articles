# API Blog — INF222 Programmation Web

API REST backend pour la gestion d'un blog simple, développée avec **Node.js**, **Express** et **SQLite**.

## Technologies utilisées

- **Node.js** — Environnement d'exécution JavaScript côté serveur
- **Express** — Framework web pour Node.js
- **sql.js** — SQLite en JavaScript pur (aucune compilation requise)
- **swagger-ui-express** + **swagger-jsdoc** — Documentation interactive
- **cors** — Gestion des requêtes cross-origin
- **dotenv** — Variables d'environnement

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-user/blog-api.git
cd blog-api

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
cp .env.example .env

# 4. Lancer le serveur
npm start
```

Le serveur démarre sur **http://localhost:3000**

## Documentation Swagger

Interface interactive disponible sur : **http://localhost:3000/api-docs**

## Structure du projet

```
blog-api/
├── src/
│   ├── index.js                  # Point d'entrée
│   ├── config/
│   │   ├── database.js           # Initialisation SQLite
│   │   └── swagger.js            # Configuration Swagger
│   ├── routes/
│   │   └── articleRoutes.js      # Définition des URLs
│   ├── controllers/
│   │   └── articleController.js  # Logique métier
│   └── models/
│       └── articleModel.js       # Requêtes SQL
├── .env                          # Variables d'environnement
├── .gitignore
├── package.json
└── README.md
```

## Endpoints de l'API

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/articles` | Lister tous les articles |
| GET | `/api/articles?categorie=Tech` | Filtrer par catégorie |
| GET | `/api/articles?auteur=Alice&date=2026-03-29` | Filtrer par auteur et date |
| POST | `/api/articles` | Créer un article |
| GET | `/api/articles/:id` | Lire un article |
| PUT | `/api/articles/:id` | Modifier un article |
| DELETE | `/api/articles/:id` | Supprimer un article |
| GET | `/api/articles/search?query=texte` | Rechercher |

## Exemples d'utilisation

### Créer un article
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Introduction à Node.js",
    "contenu": "Node.js est un environnement d execution JavaScript...",
    "auteur": "Marie Dupont",
    "categorie": "Technologie",
    "tags": "nodejs,javascript,backend"
  }'
```

### Lister tous les articles
```bash
curl http://localhost:3000/api/articles
```

### Lire un article
```bash
curl http://localhost:3000/api/articles/1
```

### Modifier un article
```bash
curl -X PUT http://localhost:3000/api/articles/1 \
  -H "Content-Type: application/json" \
  -d '{"titre": "Nouveau titre"}'
```

### Supprimer un article
```bash
curl -X DELETE http://localhost:3000/api/articles/1
```

### Rechercher
```bash
curl "http://localhost:3000/api/articles/search?query=javascript"
```

## Codes HTTP utilisés

| Code | Signification |
|------|--------------|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Requête invalide (données manquantes) |
| 404 | Article introuvable |
| 500 | Erreur serveur interne |
