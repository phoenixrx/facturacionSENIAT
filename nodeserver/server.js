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
const PORT = 3000//process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, '..')));
app.get('/facturacion/', (req, res) => {
    res.redirect('/facturacion/facturador.html');
});

app.get('/api/tipo_admision', async (req, res) => {
    
  const { tipo,clinic_id, subemp } = req.query;
  
  if (!clinic_id) {
    return res.status(400).json({ error: 'Se requiere el parámetro clinic_id' });
  }
  var ident = '';
  var tipo_str = '';
  var subempresa = '';
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
      tipo_str = 'subempresas';
        if (subemp) {
            subempresa = ` and id_empresa = ${subemp}`;
        } else {
            return res.status(400).json({ error: 'Se requiere el parámetro subemp' });
        }
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
                  WHERE activo=1 and id_cli = ${subquery}${subempresa}
                  ORDER BY descripcion`;
    
    try {
        let listado = await retornar_query(query, [clinic_id]);
        res.json(listado);
    } catch (error) {
        res.json({ error: 'No data', details: error.message });
    }
});

app.post('/admisiones_admidet', async (req, res) => {
    try {
      const { id_cli, fecha_inicio, fecha_fin, tipos_consulta = [], status_cierre=null , activos = [], page = 1, perPage = 50, agrupado='s' } = req.body;
      const offset = (page - 1) * perPage;
      
      const tipoPlaceholders = tipos_consulta.map(() => '?').join(',');
      const activoPlaceholders = activos.map(() => '?').join(',');
      let status_cierre_simbol = null
      if(status_cierre){
        if(status_cierre=='cerrado'){
          status_cierre_simbol='AND admisiones.id_status_cierre > 1 '
        }else{
          status_cierre_simbol='AND admisiones.id_status_cierre = 1 '
        }
      }
          
      let sql_agrupado =`SELECT 
      admisiones.*,
      SUM(admisiones_det.precio * admisiones_det.cantidad) AS precio,
      SUM(admisiones_det.precio_usd * admisiones_det.cantidad) AS precio_usd,
      SUM(admisiones_det.cantidad) AS cantidad,
      CONCAT(pacientes.tipo_cedula, '-', pacientes.cedula) AS cedula_paciente,
      CONCAT(pacientes.nombres, ' ', pacientes.apellidos) AS nombre_completo_paciente,
      pacientes.telef1,
      pacientes.direccion,
      pacientes.fecha_nacimiento,
      seguros.descripcion AS seguro,
      empresas.descripcion AS empresa,
      tipos_interno.descripcion AS interno,
      'Estudios agrupados' AS estudio, -- Estudio siempre será "Estudios agrupados"
      CONCAT(medicos.nombre, ' ', medicos.apellido) AS medico,
      zonas.zona,
      CONCAT(titular.tipo_cedula, '-', titular.cedula) AS cedula_titular,
      CONCAT(titular.nombres, ' ', titular.apellidos) AS nombre_completo_titular,
      usuarios.usuario AS usuario,
      admisiones_cierres_tipo.descripcion AS tipo_cierre
  FROM 
      admisiones
  INNER JOIN 
      admisiones_det ON admisiones_det.id_admision = admisiones.id_admision
  INNER JOIN 
      pacientes ON admisiones.id_paciente = pacientes.id_paciente
  INNER JOIN 
      admisiones_cierres_tipo ON admisiones.id_status_cierre = admisiones_cierres_tipo.id
  INNER JOIN 
     usuarios ON admisiones.id_usuario = usuarios.id 
  LEFT JOIN 
      medicos ON admisiones_det.id_medico = medicos.id_medico
  LEFT JOIN 
      seguros ON admisiones.id_seguro = seguros.id_seguro
  LEFT JOIN 
      empresas ON admisiones.id_empresa = empresas.id_empresa
  LEFT JOIN 
      tipos_interno ON admisiones.id_tipo_interno = tipos_interno.id_tipo_interno
  LEFT JOIN 
      pacientes AS titular ON admisiones.id_representante = titular.id_paciente
  LEFT JOIN 
      zonas ON admisiones.id_zona = zonas.id_zona  `
        // Construir consulta
        let sql =`SELECT admisiones.*,
            admisiones_det.id_admidet,
            admisiones_det.precio,
            admisiones_det.precio_usd,
            admisiones_det.cantidad,
            CONCAT(pacientes.tipo_cedula, '-', pacientes.cedula) AS cedula_paciente,
            CONCAT(pacientes.nombres, ' ', pacientes.apellidos) AS nombre_completo_paciente,
            pacientes.telef1,
            pacientes.direccion,
            pacientes.fecha_nacimiento,
            seguros.descripcion AS seguro,
            empresas.descripcion AS empresa,
            tipos_interno.descripcion AS interno,
            estudios.descripcion as estudio,
            concat(medicos.nombre, ' ',medicos.apellido) as medico,
            zonas.zona,
            CONCAT(titular.tipo_cedula, '-', titular.cedula) AS cedula_titular,
            CONCAT(titular.nombres, ' ', titular.apellidos) AS nombre_completo_titular,
            usuarios.usuario AS usuario,
            admisiones_cierres_tipo.descripcion AS tipo_cierre,
            te.descripcion as tipo_estudio,
            gre.descripcion as grupo_estudio
        FROM 
            admisiones
        INNER JOIN 
            admisiones_det ON admisiones_det.id_admision = admisiones.id_admision
        INNER JOIN 
            pacientes ON admisiones.id_paciente = pacientes.id_paciente
        INNER JOIN 
          admisiones_cierres_tipo ON admisiones.id_status_cierre = admisiones_cierres_tipo.id
        INNER JOIN 
            usuarios ON admisiones.id_usuario = usuarios.id
        INNER JOIN 
            estudios ON admisiones_det.id_estudio = estudios.id_estudio
        INNER JOIN 
            medicos  ON admisiones_det.id_medico = medicos.id_medico
        INNER JOIN 
          tipo_estudio te ON estudios.id_tipo_estudio = te.id_tipo_estudio
        INNER JOIN 
          grupo_estudio gre ON estudios.id_grupo_estudio = gre.id_grupo_estudio
        LEFT JOIN 
            seguros ON admisiones.id_seguro = seguros.id_seguro
        LEFT JOIN 
            empresas ON admisiones.id_empresa = empresas.id_empresa
        LEFT JOIN 
            tipos_interno ON admisiones.id_tipo_interno = tipos_interno.id_tipo_interno
        LEFT JOIN 
            pacientes AS titular ON admisiones.id_representante = titular.id_paciente
        LEFT JOIN 
            zonas ON admisiones.id_zona = zonas.id_zona  `
        
    let wheres =   ` WHERE 
            admisiones.id_cli = ? 
            AND admisiones_det.activo=1 
            ${status_cierre_simbol}
            ${tipos_consulta.length ? `AND admisiones.tipo_consulta IN (${tipoPlaceholders})` : ''}
            ${activos.length ? `AND admisiones.activo IN (${activoPlaceholders})` : ''}
            AND admisiones.fecha_admision BETWEEN ? AND CONCAT(?, ' 23:59:59') 
            `;
  
        const params = [
        id_cli,
        ...tipos_consulta,
        ...activos,
        fecha_inicio,
        fecha_fin,
        perPage,
        offset
      ].filter(p => p !== undefined);
        
        // Ejecutar consulta de forma más segura
        if(agrupado=='n'){
          sql=sql+wheres+ " ORDER BY admisiones.id_admision DESC LIMIT ? OFFSET ?"
        }else{
          sql=sql_agrupado+ wheres + " GROUP BY     admisiones.id_admision  ORDER BY admisiones.id_admision DESC  LIMIT ? OFFSET ?"
        }
        
        const result = await retornar_query(sql, params);
        if(status_cierre){
          if(status_cierre=='cerrado'){
            status_cierre_simbol='AND adm.id_status_cierre != 1 '
          }else{
            status_cierre_simbol='AND adm.id_status_cierre = 1 '
          }
        }
        
        // Consulta de conteo
        const countResult = await retornar_query(
          `SELECT COUNT(adm.id_admision) as total,
                  COUNT(DISTINCT adm.id_admision) as total_admisiones,
                  count(admisiones_det.id_admision) as admidet,
                  COUNT(DISTINCT adm.id_paciente) AS total_pacientes,
                  sum(admisiones_det.precio*admisiones_det.cantidad) AS precio,
                  sum(admisiones_det.precio_usd*admisiones_det.cantidad) AS precio_usd
           FROM admisiones adm, admisiones_det
              WHERE admisiones_det.id_admision=adm.id_admision
              AND adm.id_cli = ?
              AND admisiones_det.activo=1 
              ${status_cierre_simbol}
              AND adm.fecha_admision BETWEEN ? AND CONCAT(?, ' 23:59:59')
              ${tipos_consulta.length ? `AND adm.tipo_consulta IN (${tipoPlaceholders})` : ''}
              ${activos.length ? `AND adm.activo IN (${activoPlaceholders})` : ''} `,
          [id_cli, fecha_inicio, fecha_fin, ...tipos_consulta, ...activos]
        );
        
        const pacientes = countResult[0]?.total_pacientes || 0;
        const precio = countResult[0]?.precio || 0;
        const precio_usd = countResult[0]?.precio_usd || 0;
        const total = countResult[0]?.total || 0;
        const total_admisiones = countResult[0]?.total_admisiones || 0;
        const totalPages=(agrupado=='n') ? Math.ceil(total / perPage):  Math.ceil(total_admisiones / perPage)
        res.json({ 
          success: true,
          resultados: result,
          pagination: {
            page,
            perPage,
            total,
            totalPages,
            pacientes,
            precio,
            precio_usd,total_admisiones
          }
        });
       
    } catch (error) {
      console.error('Error en endpoint /admisiones:', error);
      res.json({
        success: false,
        message: 'Error al procesar la solicitud',
        error: error.message
      });
    }
  });

  app.post('/detalles_admision', async (req, res) => {
    try {
        const {admisiones} = req.body;
        if (!admisiones || admisiones.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'El array admisiones debe contener al menos un elemento' 
            });
        }
        const admisionesPlaceholders = admisiones.map(() => '?').join(',');
        
        let sql =`SELECT admisiones.*,
            admisiones_det.id_admidet,
            admisiones_det.precio,
            admisiones_det.precio_usd,
            admisiones_det.cantidad,
            CONCAT(pacientes.tipo_cedula, '-', pacientes.cedula) AS cedula_paciente,
            CONCAT(pacientes.nombres, ' ', pacientes.apellidos) AS nombre_completo_paciente,
            pacientes.telef1,
            pacientes.direccion,
            pacientes.fecha_nacimiento,
            seguros.descripcion AS seguro,
            seguros.direccion AS seguro_direccion,
            seguros.RIF AS seguro_rif,
            empresas.descripcion AS empresa,
            empresas.direccion AS empresa_direccion,
            empresas.rif AS empresa_rif,
            tipos_interno.descripcion AS interno,
            estudios.descripcion as estudio,
            impuestos.valor as impuesto,
            concat(medicos.nombre, ' ',medicos.apellido) as medico,
            zonas.zona,
            CONCAT(titular.tipo_cedula,  titular.cedula) AS cedula_titular,
            CONCAT(titular.nombres, ' ', titular.apellidos) AS nombre_completo_titular,
            usuarios.usuario AS usuario,
            admisiones_cierres_tipo.descripcion AS tipo_cierre,
            te.descripcion as tipo_estudio,
            gre.descripcion as grupo_estudio
        FROM 
            admisiones
        INNER JOIN 
            admisiones_det ON admisiones_det.id_admision = admisiones.id_admision
        INNER JOIN 
            pacientes ON admisiones.id_paciente = pacientes.id_paciente
        INNER JOIN 
            admisiones_cierres_tipo ON admisiones.id_status_cierre = admisiones_cierres_tipo.id
        INNER JOIN 
            usuarios ON admisiones.id_usuario = usuarios.id
        INNER JOIN 
            estudios ON admisiones_det.id_estudio = estudios.id_estudio
        INNER JOIN 
            impuestos ON estudios.id_impuesto = impuestos.id_impuesto
        INNER JOIN 
            medicos  ON admisiones_det.id_medico = medicos.id_medico
        INNER JOIN 
            tipo_estudio te ON estudios.id_tipo_estudio = te.id_tipo_estudio
        INNER JOIN 
            grupo_estudio gre ON estudios.id_grupo_estudio = gre.id_grupo_estudio
        LEFT JOIN 
            seguros ON admisiones.id_seguro = seguros.id_seguro
        LEFT JOIN 
            empresas ON admisiones.id_empresa = empresas.id_empresa
        LEFT JOIN 
            tipos_interno ON admisiones.id_tipo_interno = tipos_interno.id_tipo_interno
        LEFT JOIN 
            pacientes AS titular ON admisiones.id_representante = titular.id_paciente
        LEFT JOIN 
            zonas ON admisiones.id_zona = zonas.id_zona   
        WHERE 
            admisiones_det.activo=1 
            ${admisiones.length ? `AND admisiones.id_admision IN (${admisionesPlaceholders})` : ''}
            AND admisiones.activo =1 
        ORDER BY admisiones.id_admision`;
        
        const result = await retornar_query(sql, admisiones);
            
        res.json({ 
            success: true,
            resultados: result          
        });
       
    } catch (error) {      
      res.json({
        success: false,
        message: 'Error al procesar la solicitud',
        error: error.message
      });
    }
  });  

  app.get('/api/opciones_factura', async (req, res) => {
    
      const { id_cli } = req.query;
      
      if (!id_cli){
        return res.status(400).json({
            success:false,
            message: 'Error OF02'
        })
      }
      if (isNaN(id_cli)){
        return res.status(400).json({
            success:false,
            message: 'Error OF03'
        })
      }
      let opciones = "";
      let formatos = "";
        let sql =`SELECT *
        FROM 
            facturas_formatos
        WHERE 
            id_cli = ? 
            AND activo=1 `;
  
        const params = [id_cli]
        try {
            formatos = await retornar_query(sql, params);
        } catch (error) {
            res.json({
                success: false,
                message: 'Error OF01',
                error: error.message
            });
        }
        try{     
        // Consulta de conteo
        opciones = await retornar_query(
          `SELECT *
            FROM 
                opt_factura
            WHERE   
                id_cli = ?`,
          params
        );       
               
    } catch (error) {
      
      res.json({
        success: false,
        message: 'Error OF05',
        error: error.message
      });
    }
    res.json({ 
        success: true,
        opciones: opciones,
        formatos: formatos
      });
  });

  app.get('/api/consecutivos', async (req, res) => {
    
    const { id_cli } = req.query;
    
    if (!id_cli){
      return res.status(400).json({
          success:false,
          message: 'Error CON01'
      })
    }
    if (isNaN(id_cli)){
      return res.status(400).json({
          success:false,
          message: 'Error CON03'
      })
    }
    let consecutivos = "";
    
      let sql =`
        SELECT 
            MAX(factura) as num_factura,
            MAX(num_control) as num_control
        FROM 
            facturas
        WHERE 
            id_cli = ?`;

      const params = [id_cli]
      try {
        consecutivos = await retornar_query(sql, params);
      } catch (error) {
          res.json({
              success: false,
              message: 'Error CON01',
              error: error.message
          });
      }
     res.json({ 
      success: true,
      consecutivos: consecutivos
    });
});

  app.post('/api/detalle_porcentual', async (req, res)=>{

    const { admisiones } = req.body;
    
    // Validate that all admisiones are numeric
    if (!admisiones || !Array.isArray(admisiones) || admisiones.some(isNaN)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Error DP02' 
        });
    }
    
    const admisionesPlaceholders = admisiones.map(() => '?').join(',');



    let query = `SELECT
    ad.id_admidet,
    ad.precio,
    ad.precio_usd,
    ad.cantidad,
    e.descripcion AS estudio_descripcion,
    e.id_estudio,
    e.id_impuesto,
    i.valor AS impuesto,
    dce.id_estudio AS desglose_estudio_id,
    dce.activo AS estudio_activo,
    dc.activo AS concepto_activo,
    dc.descripcion AS descripcion,
    ddc.descripcion AS detalle_descripcion,
    ddc.val_porcent,
    ddc.activo AS detalle_activo
FROM 
    admisiones_det ad
INNER JOIN 
    estudios e ON ad.id_estudio = e.id_estudio
INNER JOIN 
    impuestos i ON e.id_impuesto = i.id_impuesto
LEFT JOIN 
    desgloses_conceptos_estudios dce ON e.id_estudio = dce.id_estudio
LEFT JOIN 
    desgloses_conceptos dc ON dce.id_desgloses_conceptos = dc.id_desglose_concepto
LEFT JOIN 
    detalles_desgloses_conceptos ddc ON dc.id_desglose_concepto = ddc.id_desglose_concepto
WHERE
    ad.activo = 1
    AND ad.id_admidet IN (${admisionesPlaceholders});    `

    const params = [
      ...admisiones
    ].filter(p => p !== undefined);


  try{
    const result = await retornar_query(query, params);

    res.json({ 
      success: true,
      resultados: result
    });

  } catch (error) {
    res.json({
      success: false,
      message: 'Error al procesar la solicitud DP01',
      error: error.message
    });
  }
  })


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} `);
});
