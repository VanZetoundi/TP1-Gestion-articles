# TP1-Gestion-articles
Code pédagogique dédiée à l'initiation à la programmation Backend pour les étudiants du Niveau L2 Informatique avec le framework Express Js

Voici un **README simple, propre et professionnel** pour ton projet Express.js 👇

---

````md
# Blog API - Express.js

API REST simple pour la gestion d’articles (CRUD) avec Node.js, Express et SQLite (sql.js).

## Installation

```bash
git clone https://github.com/ton-username/blog-api.git
cd blog-api
npm install
````

## Démarrage

```bash
node index.js
```

Le serveur démarre par défaut sur :

```
http://localhost:3000
```

---

## Structure du projet

```
blog-api/
├── src/
│   ├── index.js
│   ├── config/
│   │   ├── database.js
│   │   └── swagger.js
│   ├── routes/
│   │   └── articleRoutes.js
│   ├── controllers/
│   │   └── articleController.js
│   └── models/
│       └── articleModel.js
├── .env
├── .gitignore
├── README.md
└── package.json
```

Architecture en 3 couches :

* Routes
* Contrôleurs
* Modèles

---

## Endpoints

### Créer un article

```
POST /api/articles
```

### Récupérer tous les articles

```
GET /api/articles
```

Filtres possibles :

```
GET /api/articles?categorie=X&auteur=Y&date=Z
```

### Récupérer un article par ID

```
GET /api/articles/:id
```

### Mettre à jour un article

```
PUT /api/articles/:id
```

### Supprimer un article

```
DELETE /api/articles/:id
```

### Rechercher un article

```
GET /api/articles/search?query=texte
```

---

## Technologies utilisées

* Node.js
* Express.js
* SQLite via sql.js
* Swagger (documentation API)

---

## Points importants

* Architecture claire en 3 couches (Route → Controller → Model)
* Utilisation de sql.js (pas de compilation native requise)
* Sauvegarde de la base après chaque écriture
* Protection contre les injections SQL avec des requêtes paramétrées
* Gestion centralisée des erreurs
* Ordre des routes respecté (`/search` avant `/:id`)

---

---

## Auteur

Van Zetoundi

```

---

