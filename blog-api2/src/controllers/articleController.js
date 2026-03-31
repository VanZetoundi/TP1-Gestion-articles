// ============================================================
// src/controllers/articleController.js
// Controleur Article : logique metier de chaque endpoint
// Le controleur fait le lien entre la route (HTTP) et le modele (BDD)
//
// Responsabilites du controleur :
//   1. Lire les donnees de la requete (req.body, req.params, req.query)
//   2. Valider les donnees recues
//   3. Appeler le modele pour interagir avec la base de donnees
//   4. Envoyer la reponse HTTP appropriee (res.status(...).json(...))
// ============================================================

// On importe le modele : c'est la couche qui parle a la base de donnees
const articleModel = require('../models/articleModel');

// -----------------------------------------------------------
// GET /api/articles
// Retourner la liste de tous les articles
// Supporte les filtres : ?categorie=Tech&auteur=Alice&date=2026-03-29
// -----------------------------------------------------------
const listerArticles = (req, res) => {
  try {
    // req.query contient les parametres de l'URL apres le "?"
    // Ex: /api/articles?categorie=Tech -> req.query = { categorie: 'Tech' }
    const { categorie, auteur, date } = req.query;

    // Passer les filtres au modele (les valeurs undefined sont ignorees)
    const articles = articleModel.findAll({ categorie, auteur, date });

    // 200 OK : requete traitee avec succes
    res.status(200).json({
      succes:   true,
      total:    articles.length, // Nombre d'articles retournes
      articles: articles
    });
  } catch (erreur) {
    // 500 : erreur interne non prevue (ex: base de donnees inaccessible)
    console.error('[ERREUR] listerArticles :', erreur.message);
    res.status(500).json({ erreur: 'Erreur serveur lors de la recuperation des articles' });
  }
};

// -----------------------------------------------------------
// GET /api/articles/search?query=texte
// Rechercher des articles par mots-cles (dans titre et contenu)
// IMPORTANT : cette route doit etre definie AVANT /api/articles/:id
// sinon Express interpreterait "search" comme un ID numerique
// -----------------------------------------------------------
const rechercherArticles = (req, res) => {
  try {
    const { query } = req.query; // Le mot-cle de recherche

    // Verifier que le parametre "query" est bien fourni et non vide
    if (!query || query.trim() === '') {
      return res.status(400).json({
        erreur: 'Le parametre "query" est obligatoire. Ex: /api/articles/search?query=javascript'
      });
    }

    const articles = articleModel.search(query.trim());

    res.status(200).json({
      succes:   true,
      query:    query,           // Renvoyer le terme recherche pour confirmation
      total:    articles.length,
      articles: articles
    });
  } catch (erreur) {
    console.error('[ERREUR] rechercherArticles :', erreur.message);
    res.status(500).json({ erreur: 'Erreur serveur lors de la recherche' });
  }
};

// -----------------------------------------------------------
// GET /api/articles/:id
// Retourner un article unique par son ID
// :id est un parametre dynamique dans l'URL -> req.params.id
// -----------------------------------------------------------
const lireArticle = (req, res) => {
  try {
    // req.params.id est une CHAINE de caracteres, on la convertit en entier
    const id = parseInt(req.params.id);

    // Verifier que l'ID est bien un nombre valide
    if (isNaN(id)) {
      return res.status(400).json({ erreur: 'L\'ID doit etre un nombre entier' });
    }

    const article = articleModel.findById(id);

    // Si le modele retourne null, l'article n'existe pas en base
    if (!article) {
      return res.status(404).json({
        erreur: `Article avec l'ID ${id} introuvable`
      });
    }

    // 200 OK : article trouve et retourne
    res.status(200).json({ succes: true, article: article });
  } catch (erreur) {
    console.error('[ERREUR] lireArticle :', erreur.message);
    res.status(500).json({ erreur: 'Erreur serveur lors de la recuperation de l\'article' });
  }
};

// -----------------------------------------------------------
// POST /api/articles
// Creer un nouvel article
// Les donnees sont dans le corps de la requete (req.body)
// -----------------------------------------------------------
const creerArticle = (req, res) => {
  try {
    // req.body contient les donnees JSON envoyees par le client
    // Ex: { "titre": "Mon article", "auteur": "Marie", "contenu": "..." }
    const { titre, contenu, auteur, categorie, tags } = req.body;

    // --- VALIDATION DES DONNEES ---
    // On verifie que les champs obligatoires sont bien presents et non vides
    const erreursValidation = [];

    if (!titre   || titre.trim()   === '') erreursValidation.push('Le titre est obligatoire');
    if (!contenu || contenu.trim() === '') erreursValidation.push('Le contenu est obligatoire');
    if (!auteur  || auteur.trim()  === '') erreursValidation.push('L\'auteur est obligatoire');

    // S'il y a des erreurs de validation, on repond 400 avec tous les problemes
    if (erreursValidation.length > 0) {
      return res.status(400).json({
        erreur:  'Donnees invalides',
        details: erreursValidation // Liste de tous les champs manquants
      });
    }

    // Passer les donnees validees au modele pour insertion en base
    const nouvelArticle = articleModel.create({
      titre:     titre.trim(),
      contenu:   contenu.trim(),
      auteur:    auteur.trim(),
      categorie: categorie ? categorie.trim() : null,
      tags:      tags      ? tags.trim()      : null
    });

    // 201 Created : ressource creee avec succes
    res.status(201).json({
      succes:  true,
      message: 'Article cree avec succes',
      article: nouvelArticle
    });
  } catch (erreur) {
    console.error('[ERREUR] creerArticle :', erreur.message);
    res.status(500).json({ erreur: 'Erreur serveur lors de la creation de l\'article' });
  }
};

// -----------------------------------------------------------
// PUT /api/articles/:id
// Modifier un article existant (mise a jour partielle possible)
// Seuls les champs envoyes dans req.body sont modifies
// -----------------------------------------------------------
const modifierArticle = (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ erreur: 'L\'ID doit etre un nombre entier' });
    }

    // Validation : si le titre est envoye, il ne peut pas etre vide
    if (req.body.titre !== undefined && req.body.titre.trim() === '') {
      return res.status(400).json({ erreur: 'Le titre ne peut pas etre vide' });
    }
    if (req.body.auteur !== undefined && req.body.auteur.trim() === '') {
      return res.status(400).json({ erreur: 'L\'auteur ne peut pas etre vide' });
    }

    // Le modele retourne null si l'article n'existe pas
    const articleMisAJour = articleModel.update(id, req.body);

    if (!articleMisAJour) {
      return res.status(404).json({
        erreur: `Article avec l'ID ${id} introuvable`
      });
    }

    res.status(200).json({
      succes:  true,
      message: 'Article mis a jour avec succes',
      article: articleMisAJour
    });
  } catch (erreur) {
    console.error('[ERREUR] modifierArticle :', erreur.message);
    res.status(500).json({ erreur: 'Erreur serveur lors de la modification de l\'article' });
  }
};

// -----------------------------------------------------------
// DELETE /api/articles/:id
// Supprimer un article par son ID
// -----------------------------------------------------------
const supprimerArticle = (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ erreur: 'L\'ID doit etre un nombre entier' });
    }

    // Le modele retourne false si l'article n'existe pas
    const supprime = articleModel.remove(id);

    if (!supprime) {
      return res.status(404).json({
        erreur: `Article avec l'ID ${id} introuvable`
      });
    }

    res.status(200).json({
      succes:  true,
      message: `Article ${id} supprime avec succes`
    });
  } catch (erreur) {
    console.error('[ERREUR] supprimerArticle :', erreur.message);
    res.status(500).json({ erreur: 'Erreur serveur lors de la suppression de l\'article' });
  }
};

// Exporter toutes les fonctions pour les utiliser dans le fichier de routes
module.exports = {
  listerArticles,
  rechercherArticles,
  lireArticle,
  creerArticle,
  modifierArticle,
  supprimerArticle
};
