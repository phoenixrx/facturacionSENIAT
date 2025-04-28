require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
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
  const mysql = require('mysql2/promise')
const app = express();
const pool =  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
exports.app = app;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, '..')));

app.get('/api/tipo_admision', async (req, res) => {
    
  const { tipo,clinic_id } = req.query;
  
  if (!clinic_id) {
    return res.status(400).json({ error: 'Se requiere el parámetro clinic_id' });
  }
  var ident = ''
  var tipo_str = ''
  switch (tipo) {
    case 'S':
      ident = 'id_seguro';
      tipo_str = 'seguros'
      break;
    case 'E':
      ident = 'id_empresa';
      tipo_str = 'empresas'
      break;
    case 'I':
      ident = 'id_tipo_interno';
      tipo_str = 'tipos_interno'
      break;
    case 'sub':
      ident = 'id_subempresa';
      tipo_str = 'subempresas'
      break;  
    default:
      res.status(400).json({ error: 'tipo incorrecto' });
      break;
  }
  let subquery = (isNaN(clinic_id)) ?  `(SELECT id_usuario_empresa FROM perfil_usuario_basico WHERE apellidos = '${clinic_id}')` : clinic_id

  let query = `SELECT ${ident},
                      descripcion, 
                      activo
                  FROM ${tipo_str} 
                  WHERE activo=1 and id_cli = ${subquery}
                  ORDER BY descripcion`;
                  
    try {
    let listado = await retornar_query(query, [clinic_id]);
    res.json(listado);
    } catch (error) {
    console.error(error); // Registra el error para depuración
    res.status(500).json({ error: 'Error en la consulta', details: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} `);
});
