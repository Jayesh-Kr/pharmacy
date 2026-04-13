const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mysql = require('mysql2');

const DB_NAME = process.env.DB_NAME || 'pharmacy_db';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let promisePool = null;
let initPromise = null;

function logConnectionError(err) {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused. Is MySQL server running?');
  } else {
    console.error('Database connection failed:', err.message);
  }
}

function getPoolOrThrow() {
  if (!promisePool) {
    throw new Error('Database is not initialized. Call initializeDatabase() before handling requests.');
  }

  return promisePool;
}

async function initializeDatabase() {
  if (promisePool) {
    return promisePool;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const setupConnection = mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      port: DB_CONFIG.port
    });

    try {
      const createDbSQL = `CREATE DATABASE IF NOT EXISTS ${mysql.escapeId(DB_NAME)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
      await setupConnection.promise().query(createDbSQL);
    } catch (err) {
      logConnectionError(err);
      throw err;
    } finally {
      await setupConnection.promise().end().catch(() => {});
    }

    pool = mysql.createPool({
      ...DB_CONFIG,
      database: DB_NAME
    });

    promisePool = pool.promise();

    try {
      await promisePool.query('SELECT 1');
      console.log(`Successfully connected to MySQL database "${DB_NAME}".`);
      return promisePool;
    } catch (err) {
      logConnectionError(err);
      throw err;
    }
  })();

  try {
    return await initPromise;
  } catch (err) {
    initPromise = null;
    promisePool = null;
    pool = null;
    throw err;
  }
}

module.exports = {
  initializeDatabase,
  query(sql, values) {
    return getPoolOrThrow().query(sql, values);
  },
  execute(sql, values) {
    return getPoolOrThrow().execute(sql, values);
  },
  getConnection() {
    return getPoolOrThrow().getConnection();
  }
};
