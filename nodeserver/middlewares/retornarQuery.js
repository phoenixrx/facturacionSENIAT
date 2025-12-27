require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise')
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const retornar_query = async (query, ids) => {
  try {
    const [rows] = await pool.query(query, ids);
    if (rows.length === 0) {
      throw new Error('No data');
    }
    return rows;
  } catch (error) {
    throw error; // Lanza el error para manejarlo en el controlador
  }
};

module.exports = { retornar_query };
