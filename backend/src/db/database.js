const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../config/env');

const db = new sqlite3.Database(DB_PATH);

// Helper para parsear arrays JSON
const parseArr = (v) => {
  if (!v) return [];
  try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return []; }
};

const toJson = (arr) => JSON.stringify(Array.isArray(arr) ? arr : []);

module.exports = { db, parseArr, toJson };
