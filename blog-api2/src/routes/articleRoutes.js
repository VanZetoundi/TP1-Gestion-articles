// ============================================================
// src/routes/articleRoutes.js
// Definition des routes de l'API pour les articles
// Une route = une URL + une methode HTTP + une fonction controleur
//
// Les commentaires @swagger sont lus par swagger-jsdoc pour generer
// automatiquement la documentation interactive a /api-docs
// ============================================================

const express    = require('express');
const router     = express.Router(); // Sous-routeur Express pour les articles
const controller = require('../controllers/articleController');

// -----------------------------------------------------------
// ORDRE IMPORTANT DES ROUTES
// Express teste les routes dans l'ordre ou elles sont definies.
// La route /search doit etre AVANT la route /:id,
// sinon Express interprete "search" comme un ID et retourne une erreur.
// -----------------------------------------------------------

/**
 * @swagger
 * /api/articles/search:
 *   get:
 *     summary: Rechercher des articles
 *     description: Recherche des articles dont le titre ou le contenu contient le texte donne.
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Texte a rechercher dans le titre et le contenu
 *         example: javascript
 *     responses:
 *       200:
 *         description: Liste des articles correspondants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succes:   { type: boolean, example: true }
 *                 query:    { type: string,  example: javascript }
 *                 total:    { type: integer, example: 2 }
 *                 articles:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Article' }
 *       400:
 *         description: Parametre "query" manquant
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erreur' }
 */
router.get('/search', controller.rechercherArticles);

// ----

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Lister tous les articles
 *     description: Retourne la liste de tous les articles, avec filtres optionnels.
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: categorie
 *         schema:   { type: string }
 *         description: Filtrer par categorie
 *         example: Technologie
 *       - in: query
 *         name: auteur
 *         schema:   { type: string }
 *         description: Filtrer par auteur
 *         example: Marie Dupont
 *       - in: query
 *         name: date
 *         schema:   { type: string, format: date }
 *         description: Filtrer par date de creation (format YYYY-MM-DD)
 *         example: "2026-03-29"
 *     responses:
 *       200:
 *         description: Liste des articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succes:   { type: boolean, example: true }
 *                 total:    { type: integer, example: 3 }
 *                 articles:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Article' }
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erreur' }
 */
router.get('/', controller.listerArticles);

// ----

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Creer un nouvel article
 *     description: Cree un article avec les donnees fournies. Le titre, le contenu et l'auteur sont obligatoires.
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ArticleInput' }
 *           example:
 *             titre: Introduction a Node.js
 *             contenu: Node.js est un environnement d'execution JavaScript cote serveur...
 *             auteur: Marie Dupont
 *             categorie: Technologie
 *             tags: "nodejs,javascript,backend"
 *     responses:
 *       201:
 *         description: Article cree avec succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succes:  { type: boolean, example: true }
 *                 message: { type: string,  example: Article cree avec succes }
 *                 article: { $ref: '#/components/schemas/Article' }
 *       400:
 *         description: Donnees invalides (champ obligatoire manquant)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erreur:  { type: string }
 *                 details: { type: array, items: { type: string } }
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erreur' }
 */
router.post('/', controller.creerArticle);

// ----

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Lire un article par son ID
 *     description: Retourne toutes les informations d'un article specifique.
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:    { type: integer }
 *         description: Identifiant unique de l'article
 *         example: 1
 *     responses:
 *       200:
 *         description: Article trouve
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succes:  { type: boolean }
 *                 article: { $ref: '#/components/schemas/Article' }
 *       404:
 *         description: Article introuvable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erreur' }
 *       400:
 *         description: ID invalide (non numerique)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erreur' }
 */
router.get('/:id', controller.lireArticle);

// ----

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: Modifier un article
 *     description: Met a jour un ou plusieurs champs d'un article existant. Seuls les champs envoyes sont modifies.
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:    { type: integer }
 *         description: ID de l'article a modifier
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:     { type: string, example: Nouveau titre }
 *               contenu:   { type: string, example: Nouveau contenu mis a jour }
 *               categorie: { type: string, example: Education }
 *               tags:      { type: string, example: "cours,web" }
 *     responses:
 *       200:
 *         description: Article mis a jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succes:  { type: boolean }
 *                 message: { type: string }
 *                 article: { $ref: '#/components/schemas/Article' }
 *       404:
 *         description: Article introuvable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erreur' }
 *       400:
 *         description: Donnees invalides
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erreur' }
 */
router.put('/:id', controller.modifierArticle);

// ----

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Supprimer un article
 *     description: Supprime definitivement un article de la base de donnees.
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:    { type: integer }
 *         description: ID de l'article a supprimer
 *         example: 1
 *     responses:
 *       200:
 *         description: Article supprime avec succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succes:  { type: boolean, example: true }
 *                 message: { type: string,  example: Article 1 supprime avec succes }
 *       404:
 *         description: Article introuvable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erreur' }
 */
router.delete('/:id', controller.supprimerArticle);

// Exporter le routeur pour le monter dans src/index.js
module.exports = router;
