require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { retornar_query } = require('./middlewares/retornarQuery');
const { validateFactura } = require('./schemas/facturas');
const { authenticateToken, registrarInicioPeticion, registrarErrorPeticion, registrarFinPeticion } = require('./middlewares/autenticarToken');
const retencionesRoutes = require('./routes/retenciones');
const proveedoresRoutes = require('./routes/proveedores');
const app = express();

exports.app = app;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '..')));
app.get('/facturacion/', (req, res) => {
  res.redirect('/facturacion/facturador.html');
});

app.use('/api/retenciones', retencionesRoutes);
app.use('/api/proveedores', proveedoresRoutes);

app.get('/api/tipo_admision', async (req, res) => {

  const { tipo, clinic_id, subemp } = req.query;

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
  let subquery = (isNaN(clinic_id)) ? `(SELECT id_usuario_empresa FROM perfil_usuario_basico WHERE apellidos = '${clinic_id}')` : clinic_id

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

app.post('/admisiones_admidet', authenticateToken, async (req, res) => {
  try {
    const { id_cli, fecha_inicio, fecha_fin, tipos_consulta = [], status_cierre = null, activos = [], page = 1, perPage = 50, agrupado = 's' } = req.body;
    const offset = (page - 1) * perPage;

    const tipoPlaceholders = tipos_consulta.map(() => '?').join(',');
    const activoPlaceholders = activos.map(() => '?').join(',');
    let status_cierre_simbol = null
    if (status_cierre) {
      if (status_cierre == 'cerrado') {
        status_cierre_simbol = 'AND admisiones.id_status_cierre > 1 '
      } else {
        status_cierre_simbol = 'AND admisiones.id_status_cierre = 1 '
      }
    }

    let sql_agrupado = `SELECT 
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
    let sql = `SELECT admisiones.*,
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

    let wheres = ` WHERE 
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
    if (agrupado == 'n') {
      sql = sql + wheres + " ORDER BY admisiones.id_admision DESC LIMIT ? OFFSET ?"
    } else {
      sql = sql_agrupado + wheres + " GROUP BY admisiones.id_admision  ORDER BY admisiones.id_admision DESC  LIMIT ? OFFSET ?"
    }

    const result = await retornar_query(sql, params);
    if (status_cierre) {
      if (status_cierre == 'cerrado') {
        status_cierre_simbol = 'AND adm.id_status_cierre != 1 '
      } else {
        status_cierre_simbol = 'AND adm.id_status_cierre = 1 '
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
    const totalPages = (agrupado == 'n') ? Math.ceil(total / perPage) : Math.ceil(total_admisiones / perPage)
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
        precio_usd, total_admisiones
      }
    });

  } catch (error) {

    res.json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
});

app.post('/detalles_admision', authenticateToken, async (req, res) => {
  try {
    const { admisiones } = req.body;
    if (!admisiones || admisiones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El array admisiones debe contener al menos un elemento'
      });
    }
    const admisionesPlaceholders = admisiones.map(() => '?').join(',');

    let sql = `SELECT admisiones.*,
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
            estudios.insumo as inventario,
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

  if (!id_cli) {
    return res.status(400).json({
      success: false,
      message: 'Error OF02'
    })
  }
  if (isNaN(id_cli)) {
    return res.status(400).json({
      success: false,
      message: 'Error OF03'
    })
  }
  let opciones = "";
  let formatos = "";
  let sql = `SELECT *
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
  try {
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
app.get('/api/factura_admision', async (req, res) => {

  const { id_admision } = req.query;

  if (!id_admision) {
    return res.status(400).json({
      success: false,
      message: 'Error FA02'
    })
  }
  if (isNaN(id_admision)) {
    return res.status(400).json({
      success: false,
      message: `Admision mal formateada ${id_admision}`
    })
  }
  let datos_factura = "";
  let sql = `SELECT factura, activo, motivo_cierre, consec_recibo, fecha_cierre
        FROM 
            admisiones
        WHERE 
            id_admision=?`;

  const params = [id_admision]
  try {
    datos_factura = await retornar_query(sql, params);
  } catch (error) {
    return res.json({
      success: false,
      message: `Admision invalida ${id_admision}`,
      error: error.message
    });
  }
  res.json({
    success: true,
    results: datos_factura
  });
});

app.get('/api/consecutivos', async (req, res) => {

  const { id_cli } = req.query;

  if (!id_cli) {
    return res.status(400).json({
      success: false,
      message: 'Error CON01'
    })
  }
  if (isNaN(id_cli)) {
    return res.status(400).json({
      success: false,
      message: 'Error CON03'
    })
  }
  let consecutivos = "";

  let sql = `
        SELECT 
            fc.*,
            ct.actual,
            ct.hasta,
            c.descripcion as caja
        FROM 
            facturas_controles fc
        INNER JOIN 
            cajas c ON fc.id_caja = c.id
            INNER JOIN 
            controles_talonarios ct ON ct.id_caja = c.id
        WHERE 
            fc.id_cli = ? and ct.activo=1 and ct.actual<=ct.hasta`;

  const params = [id_cli]
  try {
    consecutivos = await retornar_query(sql, params);
    if (consecutivos.error) {
      return res.json({
        success: false,
        message: 'Error CON02 consecutivos agotados'

      })
    }
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

app.post('/api/detalle_porcentual', async (req, res) => {

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


  try {
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

app.post('/api/facturar', authenticateToken, async (req, res) => {

  const { desglose_pago, json_cuotas, json_factura, json_detalle, items_inventario, caja } = req.body;

  let admisiones = desglose_pago[0].id_externa
  admisiones = admisiones.replace(/\s+/g, '');
  if (typeof admisiones !== 'string' || !/^\d+(,\d+)*$/.test(admisiones)) {
    registrarErrorPeticion(req, 'El campo admisiones esta mal formateado')
    return res.status(400).json({
      success: false,
      message: 'El campo admisiones esta mal formateado'
    });
  }

  const result_factura = await validateFactura(json_factura);

  if (result_factura.error) {
    registrarErrorPeticion(req, result_factura.error.message)
    return res.status(422).json({ error: JSON.parse(result_factura.error.message) })
  }

  let data = result_factura.data;

  let query_comprobacion = `SELECT id_factura 
                            FROM facturas
                            WHERE factura=?
                                  AND id_cli=?
                                  AND activo=1
                            limit 1`
  let params_compr = [data.factura, data.id_cli]

  try {
    let json_compr = await retornar_query(query_comprobacion, params_compr);

    if (json_compr[0].id_factura) {
      registrarErrorPeticion(req, 'Ya existe esta factura')
      return res.json({
        success: false,
        resultados: "Ya existe esta factura"
      });
    }
  } catch (error) {

  }
  let errorImpuesto = false;
  let errorImpuestoDetalle = false;
  let tasa = 0;
  let id_usuarioF = req.logData.id_usuario;
  const valoresPermitidosImpuesto = ["Exento", "0.16", "0.08"];
  for (const detalleCI of json_detalle) {
    tasa = Number(detalleCI.precio) / Number(detalleCI.precio_usd_tasa);
    const impuestoValueCI = detalleCI.impuesto === "E" ? "Exento" : detalleCI.impuesto;

    if (!valoresPermitidosImpuesto.includes(impuestoValueCI)) {
      errorImpuesto = true;
      errorImpuestoDetalle = { descripcion: detalleCI.descripcion, impuesto: detalleCI.impuesto };
    }
  }

  if (errorImpuesto) {
    registrarErrorPeticion(req, 'Error IP01FA  ' + JSON.stringify(errorImpuestoDetalle))
    return res.json({
      success: false,
      resultados: "Error IP01FA  " + JSON.stringify(errorImpuestoDetalle)
    });
  }

  if (Number(tasa) == 0) {
    registrarErrorPeticion(req, 'Error IP02FA  ' + JSON.stringify(errorImpuestoDetalle))
    return res.json({
      success: false,
      resultados: `Error IP02FA (${tasa})`
    });
  }

  try {
    let query_comprobacion = `SELECT id_factura 
                              FROM facturas
                              WHERE num_control=?
                                    AND id_cli=?
                              limit 1`
    let params_compr = [data.num_control, data.id_cli]

    let json_compr = await retornar_query(query_comprobacion, params_compr);

    if (json_compr[0].id_factura) {
      registrarErrorPeticion(req, 'Ya existe este numero de control')
      return res.json({
        success: false,
        resultados: "Ya existe este numero de control"
      });
    }
  } catch (error) {

  }

  let query = `INSERT INTO
                    facturas
                      (paciente, 
                      titular, 
                      razon_social, 
                      rif, 
                      direccion_f, 
                      factura, 
                      fecha_atencion, 
                      fecha_emision, 
                      nota, 
                      exento, 
                      bi16, 
                      iva16, 
                      igtf, 
                      total, 
                      id_usuario, 
                      id_admision,      
                      id_cli, 
                      base_igtf, 
                      num_control, 
                      contado, 
                      fecha_vencimiento, 
                      cuotas,
                      formato_factura,
                      tipo_agrupamiento,
                      descuentos, bi8, iva8, id_caja) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

  const params = [
    data.paciente,
    data.titular,
    data.razon_social,
    data.rif,
    data.direccion_f,
    data.factura,
    data.fecha_atencion,
    data.fecha_emision,
    data.nota,
    data.exento,
    data.bi16,
    data.iva16,
    data.igtf,
    data.total,
    data.id_usuario,
    data.id_admision,
    data.id_cli,
    data.base_igtf,
    data.num_control,
    data.contado,
    data.fecha_vencimiento,
    data.cuotas,
    data.formato_factura,
    data.tipo_agrupamiento,
    data.descuentos,
    data.bi8,
    data.iva8,
    req.user.caja_usuario
  ];

  let result = ""
  result = await retornar_query(query, params);

  const id_factura = result.insertId;

  let result_detalles = [];
  try {

    query = `
    INSERT INTO
      factura_detalle 
      (id_factura, 
      descripcion, 
      precio, 
      precio_usd_tasa, 
      impuesto, 
      clase, 
      cantidad) VALUES (${id_factura}, ?,?,?,?,'none',?)
    ;`


    for (const detalle of json_detalle) {

      const impuestoValue = detalle.impuesto === "E" ? "Exento" : detalle.impuesto;
      const detalleParams = [
        detalle.descripcion,
        detalle.precio,
        detalle.precio_usd_tasa,
        impuestoValue,
        detalle.cantidad
      ];
      result_detalles.push(await retornar_query(query, detalleParams))
    }

  } catch (error) {
    eliminar_factura(id_factura)
    registrarErrorPeticion(req, 'Error al procesar la solicitud FA03')
    return res.json({
      success: false,
      message: 'Error al procesar la solicitud FA03',
      error: error.message, factura: id_factura, query: query, detalleParams: json_detalle
    });
  }



  const factura = data.factura;
  let admisiones_res = '';

  try {
    query = `
    UPDATE 
      admisiones
    SET
      factura=?, id_status_cierre=2, id_usuario_cierre=${data.id_usuario}, fecha_cierre=NOW(), motivo_cierre='Factura', consec_recibo=NULL, solo_ppto=0
    WHERE
      id_admision in (${admisiones});
    `
    admisiones_res = await retornar_query(query, [factura])
  } catch (error) {
    eliminar_factura(id_factura)
    registrarErrorPeticion(req, error.message)
    return res.json({
      success: false,
      message: 'Error al procesar la solicitud FA02',
      error: error.message
    });
  }
  let id_admision = data.id_admision;
  let result_pagos = [];
  try {

    query = `
    INSERT INTO
      control_pagos 
      (id_externa, 
      tipo, 
      id_forma_pago, 
      monto, 
      monto_bs, 
      id_moneda, 
      nota, 
      activo, 
      id_cli, 
      id_usuario, 
      base_igtf) VALUES (${id_admision}, "Factura ${factura}",?,?,0,?,?,1,?,?,?)
    ;`


    for (const pago of desglose_pago) {
      const pagoParams = [
        pago.id_forma_pago,
        pago.monto,
        pago.id_moneda,
        pago.nota,
        pago.id_cli,
        pago.id_usuario,
        pago.base_igtf_bs || 0
      ];
      result_pagos.push(await retornar_query(query, pagoParams))
    }
  } catch (error) {
    eliminar_factura(id_factura)
    eliminar_factura_admision(factura, data.id_cli)
    registrarErrorPeticion(req, error.message)
    return res.json({
      success: false,
      message: 'Error al procesar la solicitud FA02',
      error: error.message
    });
  }

  //trabajar los inventarios
  const query_almacenes = `SELECT 
                          consultorios.id_consultorio
                          FROM consultorios
                          WHERE consultorios.descripcion = 'RESERVA'
                              and consultorios.id_cli=?`

  if (items_inventario.trim() != "") {
    try {
      let almacen_reserva = '';
      let almacen_reserva_query = await retornar_query(query_almacenes, data.id_cli);
      almacen_reserva = almacen_reserva_query[0].id_consultorio;

      query = `INSERT INTO 
                      almacen_movimientos 
                      (id_almacen,id_insumo,id_entrega,id_responsable,cantidad,descripcion,id_admidet)
              SELECT 
                      id_almacen,id_insumo,id_entrega,?,cantidad*-1,'Venta',id_admidet 
              FROM 
                      almacen_movimientos 
              WHERE id_almacen =? and id_admidet in (?)`;

      let mover_inventario = await retornar_query(query, [data.id_usuario, almacen_reserva, items_inventario]);

    } catch (error) {
      console.log(error)
    }
  }

  //manejo de las cuotas

  if (data.contado == 0) {
    let result_cuotas = [];
    query = `
      INSERT INTO
        cuotas_pagar 
        (id_admision, 
        numero_cuota, 
        id_moneda, 
        monto_pago, 
        estado, 
        factura, 
        fecha_vencimiento, id_factura, id_cli) VALUES (?,?,?,?,?,?,?,${id_factura},${data.id_cli})
      ;`


    for (const cuotas of json_cuotas) {
      const pagoParams = [
        cuotas.id_admision,
        cuotas.numero_cuota,
        cuotas.id_moneda,
        cuotas.monto_pago,
        cuotas.estado,
        cuotas.factura,
        cuotas.fecha_vencimiento
      ];
      try {
        result_cuotas.push(await retornar_query(query, pagoParams))
      } catch (error) {
        return res.json({
          success: false,
          message: 'Error al procesar la solicitud FA04',
          error: error.message,
          result_cuotas,
          pagoParams
        });
      }


    }
  }

  try {
    let query = `INSERT INTO historico_tasa(valor, id_usuario, origen, fuente) VALUES (?, ?, 'Factura', ?);`
    let factura_elim = await retornar_query(query, [tasa, id_usuarioF, `Factura: [${id_factura}] ${factura}`])
  } catch (error) {
    registrarErrorPeticion(req, error.message)

  }
  let idUuid = '';
  try {
    let query = `SELECT uuid FROM facturas WHERE id_factura = ?;`
    let factura_uuid = await retornar_query(query, [id_factura])
    idUuid = factura_uuid[0].uuid;
  } catch (error) {
    registrarErrorPeticion(req, error.message)

  }

  try {

    let query_actualizar_controles = `UPDATE facturas_controles 
                                      SET 
                                        num_factura=?
                                      WHERE id_caja=?`
    let params_compr = [data.factura, caja]
    let query_actualizar_talonario = `UPDATE controles_talonarios 
                                      SET 
                                        actual=actual+1
                                      WHERE id_caja=?`
    let params_talonario = [caja]


    let controles_act = await retornar_query(query_actualizar_controles, params_compr);
    controles_act = await retornar_query(query_actualizar_talonario, params_talonario);

  } catch (error) {
    registrarErrorPeticion(req, 'Error al procesar la solicitud FA01')
    return res.json({
      success: false,
      message: 'Error al procesar la solicitud FA01',
      error: error.message
    });
  }

  res.json({
    success: true,
    id_factura: id_factura,
    idUuid
  });

})

async function eliminar_factura_admision(factura, id_cli) {
  try {
    let query = `
      UPDATE 
        admisiones
      SET
        factura='', id_status_cierre=1, id_usuario_cierre=NULL, fecha_cierre=NULL, motivo_cierre=NULL, consec_recibo=NULL, solo_ppto=0
      WHERE
        factura =? AND id_cli=?;
    `
    let factura_elim = await retornar_query(query, [factura.toString().padStart(8, '0'), id_cli])

    return factura_elim;
  } catch (error) {
    return error;
  }
}
async function eliminar_factura(id_factura) {
  try {
    let query = `
    DELETE FROM
      facturas
    WHERE
      id_factura =?;
    `
    let factura_elim = await retornar_query(query, [id_factura])
    console.log(factura_elim)
    return factura_elim;
  } catch (error) {
    console.log(factura_elim)
    return error;
  }
}

app.post('/api/anular_factura', authenticateToken, async (req, res) => {

  const { factura, usuario, id_cli, id_usuario, id_admision } = req.query;

  if (isNaN(factura)) {
    return res.json({
      success: false,
      message: 'Error AnF01'
    });
  }

  let query = `UPDATE
      facturas
    SET
      activo='0', nota = CONCAT(nota, ' ANULADA por ${usuario}'), fecha_anulada=NOW()
    WHERE
      factura =? AND activo=1 AND id_cli=?;`;

  const params = [factura.toString().padStart(8, '0'), id_cli];

  let result = "";
  try {
    result = await retornar_query(query, params);
  } catch (error) {
    res.json({
      success: false,
      message: 'Error al procesar la solicitud AnF02',
      error: error.message
    });
  }

  if (result.affectedRows === 0) {
    return res.json({
      success: false,
      message: 'La factura no existe o ya ha sido anulada'
    });
  }

  query = `
    UPDATE 
      control_pagos
    SET
      nota='PAGO ANULADO por ${usuario}', activo='0', tipo='Factura Anulado', id_usuario_elimina=? 
    WHERE 
      id_externa=? AND tipo=? AND id_cli=?`

  let params_control = [id_usuario, id_admision, `Factura ${factura.toString().padStart(8, '0')}`, id_cli]

  result = await retornar_query(query, params_control);

  query = `
    SELECT 
      id_admision
    FROM
      admisiones
    WHERE 
      factura=?`;

  let params_admidet = [factura.toString().padStart(8, '0')];
  let id_admisiones = "";
  try {

    let admisiones = await retornar_query(query, params_admidet);

    id_admisiones = admisiones.map(admision => admision.id_admision).join(',');

  } catch (error) {

  }

  query = `
    SELECT 
      id_admidet
    FROM
      admisiones_det
    WHERE 
      id_admision in (?)`;

  params_admidet = [id_admisiones];

  let admidets = await retornar_query(query, params_admidet);

  let id_admidet = admidets.map(admidet => admidet.id_admidet).join(',');

  query = `
    UPDATE 
      cuotas_pagar
    SET  
      activo='0'
    WHERE id_admision=?`;

  let params_cuotas = [id_admision];

  result = await retornar_query(query, params_cuotas);

  query = `
    UPDATE
      almacen_movimientos
    SET
      cantidad=0,  descripcion='Venta anulada'
    WHERE id_admidet=? and descripcion='Venta'`;

  let params_almacen = [id_admision];

  result = await retornar_query(query, params_almacen);
  eliminar_factura_admision(factura, id_cli);

  return res.json({
    success: true,
    resultados: result
  });
})

app.post('/api/examinar-facturas', authenticateToken, async (req, res) => {
  const { id_cli, razon_social, rif, factura, pagina = 1, limite = 5 } = req.query;

  if (!id_cli) {
    return res.status(400).json({
      success: false,
      message: 'Error EF01'
    });
  }

  if (isNaN(id_cli)) {
    return res.status(400).json({
      success: false,
      message: 'Error EF03'
    });
  }

  // Validar que los valores de paginación sean números válidos
  const pageNum = parseInt(pagina);
  const limitNum = parseInt(limite);
  if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros de paginación inválidos'
    });
  }

  let query = `
    SELECT 
      id_factura, factura, fecha_emision, fecha_atencion, rif, razon_social, total
    FROM 
      facturas
    WHERE 
      activo = 1 AND id_cli = ?
  `;

  const params = [id_cli];

  if (factura) {
    query += ' AND factura = ?';
    params.push(factura);
  }
  if (rif) {
    query += ' AND rif LIKE ?';
    params.push(rif);
  }
  if (razon_social) {
    query += ' AND razon_social LIKE ?';
    params.push(razon_social);
  }

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM facturas 
    WHERE activo = 1 AND id_cli = ?
    ${factura ? 'AND factura = ?' : ''}
    ${rif ? 'AND rif LIKE ?' : ''}
    ${razon_social ? 'AND razon_social LIKE ?' : ''}
  `;

  try {
    // Obtener total de resultados
    const [{ total }] = await retornar_query(countQuery, params);

    // Agregar paginación a la consulta original
    const offset = (pageNum - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const facturas = await retornar_query(query, params);

    res.json({
      success: true,
      result: facturas,
      pagination: {
        total,
        pagina: pageNum,
        limite: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error CON01',
      error: error.message
    });
  }
});

app.post('/api/devolver-factura', authenticateToken, async (req, res) => {
  const { id_factura, uuid_factura, factura } = req.query;

  if (!id_factura && !uuid_factura && !factura) {
    return res.status(400).json({
      success: false,
      message: 'Error DF01'
    });
  }

  if (isNaN(id_factura) && !uuid_factura && !factura) {
    return res.status(400).json({
      success: false,
      message: 'Error DF03'
    });
  }

  let query = `
    SELECT 
      f.*,
      fd.*,
      u.usuario,
      a.tipo_consulta
    FROM 
      facturas f
    INNER JOIN
      factura_detalle fd ON f.id_factura = fd.id_factura
    INNER JOIN
      admisiones a ON f.id_admision = a.id_admision
    INNER JOIN
      usuarios u ON f.id_usuario = u.id
    WHERE `;

  let whereClause = '';

  const params = [];

  if (id_factura) {
    whereClause += ' f.id_factura = ?';
    params.push(id_factura);
  }
  if (uuid_factura) {
    whereClause += ' f.uuid = ?';
    params.push(uuid_factura);
  }

  if (factura) {
    whereClause += ' f.factura = ? AND f.id_cli = ?';
    let id_cli = req.id_cli;
    params.push(factura, id_cli);
  }

  query += whereClause;
  let facturas = [];
  let pagos = [];
  let clave = [];

  try {
    facturas = await retornar_query(query, params);
    if (facturas.error) {
      return res.status(400).json({
        success: false,
        message: 'Error DF04a',
        query: query,
        params: params
      });
    }
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Error DF02a',
      error: error.message,
      facturas: facturas,
      pagos: pagos,
      clave: clave

    });
  }
  let queryPagos = `
     SELECT cp.monto,
     cp.nota,
     fp.descripcion as formaPago,
     m.simbolo
      FROM control_pagos cp 
      INNER JOIN  formas_pago fp ON fp.id_forma_pago = cp.id_forma_pago
      INNER JOIN monedas m ON m.id_moneda = cp.id_moneda
      where cp.id_externa = ? AND cp.activo='1' order by cp.id_control_pago desc;
     `;
  try {
    pagos = await retornar_query(queryPagos, [facturas[0].id_admision]);
    if (pagos.error) {
      return res.status(400).json({
        success: false,
        message: 'Error DF04b'
      });
    }
  } catch (error) {


  }
  let queryClave = `
    SELECT clave FROM admisiones WHERE id_admision=?
    `
  try {
    clave = await retornar_query(queryClave, [facturas[0].id_admision]);
    if (clave.error) {
      return res.status(400).json({
        success: false,
        message: 'Error DF04c'
      });
    }
  } catch (error) {


  }
  await retornar_query(`
    UPDATE logs_peticiones 
    SET request_body = ?
    WHERE id_log_acceso = ?
  `, [JSON.stringify(facturas[0]), req.logData.id_log_acceso]);
  res.json({
    success: true,
    result: facturas,
    iporigen: req.logData.ip_origen,
    pagos: pagos,
    clave: clave
  });

});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} `);
});
