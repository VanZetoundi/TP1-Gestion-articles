// ============================================================
// src/models/articleModel.js
// Modele Article : toutes les interactions avec la base de donnees
// Le modele est la seule couche qui "parle" a SQLite directement
// Le controleur appelle le modele, jamais la base directement
//
// Architecture en 3 couches :
//   Route -> Controleur -> Modele -> Base de donnees
// ============================================================

const { getDatabase, saveDatabase } = require('../config/database');

// -----------------------------------------------------------
// Recuperer tous les articles
// Parametres optionnels de filtrage : categorie, auteur, date
// -----------------------------------------------------------
function findAll(filtres = {}) {
  const db = getDatabase();

  // Construction dynamique de la requete SQL
  // On commence par la requete de base, puis on ajoute des conditions
  let sql    = 'SELECT * FROM articles';
  let params = []; // Tableau des valeurs a injecter (protection anti-injection SQL)
  let conditions = []; // Tableau des clauses WHERE

  // Filtrer par categorie si le parametre est fourni
  if (filtres.categorie) {
    conditions.push('categorie = ?'); // "?" est un placeholder remplace par la valeur reelle
    params.push(filtres.categorie);
  }

  // Filtrer par auteur si le parametre est fourni
  if (filtres.auteur) {
    conditions.push('auteur = ?');
    params.push(filtres.auteur);
  }

  // Filtrer par date (on compare seulement la partie date, pas l'heure)
  // "substr(date, 1, 10)" extrait les 10 premiers caracteres : "YYYY-MM-DD"
  if (filtres.date) {
    conditions.push("substr(date, 1, 10) = ?");
    params.push(filtres.date);
  }

  // Si on a des conditions, les ajouter a la requete avec WHERE
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // Trier par date decroissante : les articles les plus recents en premier
  sql += ' ORDER BY date DESC';

  // Executer la requete et retourner les resultats
  return execQuery(db, sql, params);
}

// -----------------------------------------------------------
// Rechercher des articles par mots-cles (dans titre ou contenu)
// Endpoint : GET /api/articles/search?query=texte
// -----------------------------------------------------------
function search(query) {
  const db = getDatabase();

  // LIKE '%?%' : cherche le texte n'importe ou dans la chaine
  // Le "%" est un joker SQL qui signifie "n'importe quels caracteres"
  const sql    = "SELECT * FROM articles WHERE titre LIKE ? OR contenu LIKE ? ORDER BY date DESC";
  const terme  = `%${query}%`; // Ex: "web" devient "%web%"
  const params = [terme, terme]; // Meme valeur pour titre et contenu

  return execQuery(db, sql, params);
}

// -----------------------------------------------------------
// Trouver un article par son ID
// Retourne null si l'article n'existe pas
// -----------------------------------------------------------
function findById(id) {
  const db = getDatabase();

  const sql    = 'SELECT * FROM articles WHERE id = ?';
  const params = [id];

  const resultats = execQuery(db, sql, params);

  // exec() retourne toujours un tableau ; on prend le premier element
  // Si le tableau est vide, l'article n'existe pas -> on retourne null
  return resultats.length > 0 ? resultats[0] : null;
}

// -----------------------------------------------------------
// Creer un nouvel article en base de donnees
// Retourne l'article cree avec son ID genere automatiquement
// -----------------------------------------------------------
function create(donnees) {
  const db = getDatabase();

  // La date de creation est generee automatiquement par le serveur
  // On utilise le format ISO 8601 : "2026-03-29T10:00:00.000Z"
  const maintenant = new Date().toISOString();

  const sql = `
    INSERT INTO articles (titre, contenu, auteur, date, categorie, tags)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Executer l'insertion
  db.run(sql, [
    donnees.titre,
    donnees.contenu,
    donnees.auteur,
    maintenant,
    donnees.categorie || null, // Si non fourni, on stocke NULL en base
    donnees.tags      || null
  ]);

  // Recuperer l'ID du dernier article insere avant de sauvegarder
  // "last_insert_rowid()" est une fonction SQLite integree, disponible
  // immediatement apres le INSERT, dans la meme session en memoire
  const resultatId = db.exec('SELECT last_insert_rowid() AS id');
  const nouvelId   = resultatId[0].values[0][0];

  // Construire et retourner l'objet article directement
  // (plus fiable que de refaire un SELECT apres la sauvegarde sur disque)
  const articleCree = {
    id:        nouvelId,
    titre:     donnees.titre,
    contenu:   donnees.contenu,
    auteur:    donnees.auteur,
    date:      maintenant,
    categorie: donnees.categorie || null,
    tags:      donnees.tags      || null
  };

  // Sauvegarder la base sur le disque apres l'insertion
  saveDatabase();

  return articleCree;
}

// -----------------------------------------------------------
// Modifier un article existant
// Seuls les champs fournis sont mis a jour (mise a jour partielle)
// Retourne l'article mis a jour, ou null si l'ID n'existe pas
// -----------------------------------------------------------
function update(id, donnees) {
  const db = getDatabase();

  // Verifier que l'article existe avant de tenter de le modifier
  const articleExistant = findById(id);
  if (!articleExistant) return null; // Signale au controleur que l'article est introuvable

  // Construction dynamique : on ne met a jour que les champs envoyes
  // Si l'utilisateur n'envoie que le titre, on ne touche pas au reste
  const champsAMettreAJour = [];
  const valeurs            = [];

  if (donnees.titre     !== undefined) { champsAMettreAJour.push('titre = ?');     valeurs.push(donnees.titre);     }
  if (donnees.contenu   !== undefined) { champsAMettreAJour.push('contenu = ?');   valeurs.push(donnees.contenu);   }
  if (donnees.auteur    !== undefined) { champsAMettreAJour.push('auteur = ?');    valeurs.push(donnees.auteur);    }
  if (donnees.categorie !== undefined) { champsAMettreAJour.push('categorie = ?'); valeurs.push(donnees.categorie); }
  if (donnees.tags      !== undefined) { champsAMettreAJour.push('tags = ?');      valeurs.push(donnees.tags);      }

  // Si aucun champ n'est fourni, retourner l'article tel quel (rien a faire)
  if (champsAMettreAJour.length === 0) return articleExistant;

  // Ajouter l'ID a la fin des valeurs (pour la clause WHERE)
  valeurs.push(id);

  const sql = `UPDATE articles SET ${champsAMettreAJour.join(', ')} WHERE id = ?`;
  db.run(sql, valeurs);

  // Sauvegarder apres modification
  saveDatabase();

  // Retourner l'article mis a jour depuis la base
  return findById(id);
}

// -----------------------------------------------------------
// Supprimer un article par son ID
// Retourne true si supprime, false si l'article n'existait pas
// -----------------------------------------------------------
function remove(id) {
  const db = getDatabase();

  // Verifier que l'article existe avant de supprimer
  const articleExistant = findById(id);
  if (!articleExistant) return false;

  db.run('DELETE FROM articles WHERE id = ?', [id]);

  // Sauvegarder apres suppression
  saveDatabase();

  return true; // Suppression reussie
}

// -----------------------------------------------------------
// Fonction utilitaire PRIVEE (non exportee)
// sql.js retourne les resultats dans un format peu pratique :
//   { columns: ['id','titre',...], values: [[1,'Mon titre',...]] }
// Cette fonction convertit ce format en tableau d'objets JavaScript :
//   [{ id: 1, titre: 'Mon titre', ... }]
// -----------------------------------------------------------
function execQuery(db, sql, params = []) {
  const resultats = db.exec(sql, params);

  // Si aucun resultat, retourner un tableau vide
  if (!resultats || resultats.length === 0) return [];

  const { columns, values } = resultats[0];

  // Pour chaque ligne, creer un objet { nomColonne: valeur }
  return values.map(ligne => {
    const objet = {};
    columns.forEach((colonne, index) => {
      objet[colonne] = ligne[index];
    });
    return objet;
  });
}

// Exporter toutes les fonctions du modele
module.exports = { findAll, findById, create, update, remove, search };
