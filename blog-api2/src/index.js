// ============================================================
// src/index.js
// Point d'entree principal de l'application
// C'est ce fichier qui est execute quand on lance : node src/index.js
//
// Ce fichier :
//   1. Charge les variables d'environnement (.env)
//   2. Cree l'application Express
//   3. Configure les middlewares globaux
//   4. Monte les routes
//   5. Initialise la base de donnees
//   6. Demarre le serveur HTTP
// ============================================================

// --- Chargement des variables d'environnement ---
// DOIT etre la premiere instruction pour que process.env soit disponible partout
require('dotenv').config();

// --- Imports des modules ---
const express      = require('express');       // Framework web
const cors         = require('cors');          // Middleware pour autoriser les requetes croisees
const swaggerUi    = require('swagger-ui-express'); // Interface Swagger
const swaggerSpec  = require('./config/swagger');   // Notre configuration Swagger
const { initDatabase } = require('./config/database'); // Initialisation BDD

// Import des fichiers de routes
const articleRoutes = require('./routes/articleRoutes');

// --- Creation de l'application Express ---
const app  = express();
const PORT = process.env.PORT || 3000; // Utilise la valeur du .env, ou 3000 par defaut

// ============================================================
// MIDDLEWARES GLOBAUX
// Un middleware est une fonction executee a chaque requete,
// avant d'arriver a la fonction de route.
// L'ordre des middlewares est important !
// ============================================================

// --- CORS (Cross-Origin Resource Sharing) ---
// Permet au navigateur d'appeler cette API depuis un domaine different
// Ex: votre frontend sur http://localhost:5500 peut appeler http://localhost:3000
app.use(cors({
  origin: '*',         // Accepter toutes les origines (ok en developpement)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Methodes HTTP autorisees
}));

// --- Parsing du JSON ---
// Sans ce middleware, req.body serait "undefined" pour les requetes POST/PUT
// Il lit le corps de la requete et le convertit en objet JavaScript
app.use(express.json());

// --- Logging simple des requetes ---
// Affiche dans le terminal chaque requete recue avec sa methode et son URL
// Utile pour le debogage pendant le developpement
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // "next()" passe la main au prochain middleware ou a la route
});

// ============================================================
// DOCUMENTATION SWAGGER
// Disponible a : http://localhost:3000/api-docs
// swagger-ui-express sert l'interface graphique Swagger UI
// ============================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Blog API - INF222', // Titre de l'onglet navigateur
  explorer: true                         // Affiche la barre de recherche
}));

// ============================================================
// ROUTES DE L'API
// On "monte" le routeur des articles sur le prefixe /api/articles
// Toutes les routes definies dans articleRoutes seront prefixees par /api/articles
// Ex: router.get('/') devient GET /api/articles
// Ex: router.get('/:id') devient GET /api/articles/:id
// ============================================================
app.use('/api/articles', articleRoutes);

// --- Route d'accueil ---
// Une route simple pour verifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({
    message:       'Bienvenue sur l\'API Blog INF222',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      articles: `http://localhost:${PORT}/api/articles`
    }
  });
});

// --- Middleware de gestion des routes inexistantes (404) ---
// Si aucune route n'a repondu, on arrive ici
// Ce middleware doit etre APRES toutes les routes
app.use((req, res) => {
  res.status(404).json({
    erreur: `Route introuvable : ${req.method} ${req.url}`
  });
});

// --- Middleware de gestion des erreurs globales (500) ---
// Attrape toutes les erreurs non gerees dans les routes
// Les middlewares d'erreur ont 4 parametres : (err, req, res, next)
app.use((err, req, res, next) => {
  console.error('[ERREUR GLOBALE]', err.stack);
  res.status(500).json({
    erreur: 'Une erreur interne est survenue',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    // En production, on cache le detail de l'erreur pour la securite
  });
});

// ============================================================
// DEMARRAGE DU SERVEUR
// On initialise la base de donnees en premier (asynchrone),
// puis on lance le serveur HTTP.
// ============================================================
async function demarrerServeur() {
  try {
    // 1. Initialiser la base de donnees (cree les tables si necessaire)
    await initDatabase();
    console.log('[BDD] Base de donnees initialisee avec succes');

    // 2. Demarrer le serveur HTTP sur le port defini
    app.listen(PORT, () => {
      console.log('');
      console.log('==============================================');
      console.log(`  Serveur demarre sur http://localhost:${PORT}`);
      console.log(`  Documentation : http://localhost:${PORT}/api-docs`);
      console.log(`  API Articles  : http://localhost:${PORT}/api/articles`);
      console.log('==============================================');
      console.log('');
    });
  } catch (erreur) {
    // Si la BDD ne s'initialise pas, on arrete tout
    console.error('[FATAL] Impossible de demarrer le serveur :', erreur.message);
    process.exit(1); // Code de sortie 1 = erreur
  }
}

// Appel de la fonction de demarrage
demarrerServeur();
