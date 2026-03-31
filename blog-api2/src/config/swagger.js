// ============================================================
// src/config/swagger.js
// Configuration de la documentation Swagger (OpenAPI 3.0)
// Swagger permet de visualiser et tester l'API dans le navigateur
// Interface disponible a l'adresse : http://localhost:3000/api-docs
// ============================================================

const swaggerJsdoc = require('swagger-jsdoc');

// -----------------------------------------------------------
// Options de configuration de swagger-jsdoc
// swagger-jsdoc va lire les commentaires de nos fichiers de routes
// et generer automatiquement le fichier de documentation JSON
// -----------------------------------------------------------
const options = {
  definition: {
    openapi: '3.0.0', // Version de la specification OpenAPI utilisee

    // Informations generales sur l'API (apparaissent en haut de la page Swagger)
    info: {
      title:       'API Blog INF222',
      version:     '1.0.0',
      description: 'API REST pour la gestion d\'un blog simple. ' +
                   'Permet de creer, lire, modifier et supprimer des articles. ' +
                   'Cours INF222 - Programmation Web.',
      contact: {
        name: 'INF222 - LE BORELIEN'
      }
    },

    // Serveurs sur lesquels l'API est disponible
    servers: [
      {
        url:         'http://localhost:3000',
        description: 'Serveur de developpement local'
      }
    ],

    // Definition des schemas reutilisables dans toute la documentation
    components: {
      schemas: {

        // Schema d'un article complet (tel que retourne par l'API)
        Article: {
          type: 'object',
          properties: {
            id:        { type: 'integer',  example: 1,               description: 'Identifiant unique auto-incremente' },
            titre:     { type: 'string',   example: 'Mon premier article', description: 'Titre de l\'article' },
            contenu:   { type: 'string',   example: 'Contenu de l\'article...', description: 'Corps de l\'article' },
            auteur:    { type: 'string',   example: 'Marie Dupont',  description: 'Nom de l\'auteur' },
            date:      { type: 'string',   example: '2026-03-29T10:00:00.000Z', description: 'Date de creation (ISO 8601)' },
            categorie: { type: 'string',   example: 'Technologie',   description: 'Categorie thematique' },
            tags:      { type: 'string',   example: 'web,api,rest',  description: 'Mots-cles separes par des virgules' }
          }
        },

        // Schema pour creer ou modifier un article (sans id ni date, generes automatiquement)
        ArticleInput: {
          type: 'object',
          required: ['titre', 'contenu', 'auteur'], // Champs obligatoires
          properties: {
            titre:     { type: 'string', example: 'Mon premier article' },
            contenu:   { type: 'string', example: 'Contenu de l\'article...' },
            auteur:    { type: 'string', example: 'Marie Dupont' },
            categorie: { type: 'string', example: 'Technologie' },
            tags:      { type: 'string', example: 'web,api,rest' }
          }
        },

        // Schema d'une reponse d'erreur standard
        Erreur: {
          type: 'object',
          properties: {
            erreur: { type: 'string', example: 'Le titre est obligatoire' }
          }
        }
      }
    }
  },

  // Swagger-jsdoc va scanner ces fichiers a la recherche de commentaires @swagger
  apis: ['./src/routes/*.js']
};

// Generer la specification Swagger a partir des options et des commentaires
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
