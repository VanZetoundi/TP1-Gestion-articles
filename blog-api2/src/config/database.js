// ============================================================
// src/config/database.js
// Configuration et initialisation de la base de donnees SQLite
// On utilise sql.js : une implementation pure JavaScript de SQLite
// Avantage : aucune compilation C++ requise, fonctionne partout
// ============================================================

const initSqlJs = require('sql.js'); // Librairie SQLite en JS pur
const fs        = require('fs');      // Module Node.js pour lire/ecrire des fichiers
const path      = require('path');    // Module Node.js pour manipuler les chemins

// Chemin vers le fichier .db sur le disque
// process.env.DB_PATH est defini dans le fichier .env
const DB_PATH = path.resolve(process.env.DB_PATH || './database.db');

// Variable qui contiendra l'instance de la base de donnees
// On la declare ici pour pouvoir l'exporter et la reutiliser
let db = null;

// -----------------------------------------------------------
// Fonction : initialiser la base de donnees
// Elle est asynchrone car sql.js a besoin de charger du WebAssembly
// -----------------------------------------------------------
async function initDatabase() {
  // Charger le moteur sql.js (WebAssembly)
  const SQL = await initSqlJs();

  // Si un fichier .db existe deja sur le disque, on le charge
  // Sinon, on cree une base de donnees vide en memoire
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH); // Lire le fichier binaire
    db = new SQL.Database(fileBuffer);           // Charger la base existante
    console.log(`[DB] Base de donnees chargee depuis : ${DB_PATH}`);
  } else {
    db = new SQL.Database(); // Nouvelle base vide en memoire
    console.log('[DB] Nouvelle base de donnees creee en memoire');
  }

  // Creer la table "articles" si elle n'existe pas encore
  // "IF NOT EXISTS" evite une erreur si la table est deja la
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      titre     TEXT    NOT NULL,
      contenu   TEXT    NOT NULL,
      auteur    TEXT    NOT NULL,
      date      TEXT    NOT NULL,
      categorie TEXT,
      tags      TEXT
    )
  `);

  // Sauvegarder immediatement le schema sur le disque
  saveDatabase();

  console.log('[DB] Table "articles" prete');
  return db;
}

// -----------------------------------------------------------
// Fonction : sauvegarder la base en memoire sur le disque
// sql.js travaille EN MEMOIRE, il faut donc appeler cette
// fonction apres chaque modification (INSERT, UPDATE, DELETE)
// -----------------------------------------------------------
function saveDatabase() {
  if (!db) return; // Securite : ne rien faire si db n'est pas initialisee

  // Exporter la base en memoire sous forme de tableau d'octets (Uint8Array)
  const data = db.export();

  // Convertir en Buffer Node.js puis ecrire sur le disque
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// -----------------------------------------------------------
// Fonction : retourner l'instance de la base de donnees
// Toutes les autres parties du code appelleront cette fonction
// pour obtenir la connexion a la base
// -----------------------------------------------------------
function getDatabase() {
  if (!db) {
    // Si on appelle getDatabase() avant initDatabase(), c'est une erreur de programmation
    throw new Error('Base de donnees non initialisee. Appeler initDatabase() au demarrage.');
  }
  return db;
}

// Exporter les fonctions pour les utiliser ailleurs dans le projet
module.exports = { initDatabase, getDatabase, saveDatabase };
