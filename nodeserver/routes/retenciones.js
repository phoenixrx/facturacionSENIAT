// routes/caja.js
const express = require('express');
const router = express.Router();
const { retornar_query } = require('../middlewares/retornarQuery');
const { authenticateToken } = require('../middlewares/autenticarToken');
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// GET /api/retenciones 
router.post('/iva', async (req, res) => {    
    const {
        id_proveedor, fecha_retencion, tipo, id_tipo_documento, numero_documento,
        numero_control, numero_afectado, numero_expediente, total_exento,
        total_documento, total_iva, total_iva_retenido, porcent_retencion,
        base_imponible, alicuota, total_pagado, id_usuario, id_cli
    } = req.body;
    
    // Validación de campos obligatorios
    const camposObligatorios = [
        'id_proveedor', 'fecha_retencion', 'tipo', 'id_tipo_documento', 
        'numero_documento', 'numero_control', 'numero_afectado', 'numero_expediente',
        'total_documento', 'total_iva', 'total_iva_retenido', 'porcent_retencion',
        'base_imponible', 'alicuota', 'id_usuario', 'id_cli'
    ];
    
    const camposFaltantes = camposObligatorios.filter(campo => !req.body[campo]);
    
    if (camposFaltantes.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Faltan datos obligatorios: ${camposFaltantes.join(', ')}`
        });
    }

    // Validación de tipo
    if (!['C', 'V'].includes(tipo.toUpperCase())) {
        return res.status(400).json({
            success: false,
            error: 'El tipo debe ser  Compra o Venta'
        });
    }

    if (Number(porcent_retencion) < 0 || Number(porcent_retencion) > 100) {
        return res.status(400).json({
            success: false,
            error: 'El porcentaje de retención debe estar entre 0 y 100.'
        });        
    }
 
    if (Number(alicuota) < 0 || Number(alicuota) > 100) {
        return res.status(400).json({
            success: false,
            error: 'La alícuota debe estar entre 0 y 100.'
        });        
    }
 
    const montos = ['total_exento', 'total_documento', 'total_iva', 'total_iva_retenido', 'base_imponible', 'total_pagado', 'id_usuario'];
    const montosNegativos = montos.filter(campo => req.body[campo] && Number(req.body[campo]) < 0);
    
    if (montosNegativos.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Los siguientes montos no pueden ser negativos: ${montosNegativos.join(', ')}`
        });
    }

    // Validación de fechas
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha_retencion)) {
        return res.status(400).json({
            success: false,
            error: 'El formato de fecha debe ser YYYY-MM-DD'
        });
    }

    const enteros = ['id_proveedor', 'id_tipo_documento', 'id_cli'];
    const enterosInvalidos = enteros.filter(campo => {
        const valor = req.body[campo];
        return valor && (!Number.isInteger(Number(valor)) || Number(valor) < 0);
    });
    
    if (enterosInvalidos.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Los siguientes campos deben ser números enteros positivos: ${enterosInvalidos.join(', ')}`
        });
    }

    try {

        let query_buscar_id = `
        SELECT numero_comprobante_iva
        FROM opt_retenciones
        WHERE id_cli=?        
        LIMIT 1
        `;

        const resultado_buscar = await retornar_query(query_buscar_id,[id_cli]);
        if(resultado_buscar.length<1){
            return res.status(400).json({
                success: false,
                error: 'No se ha configurado el número de comprobante para retenciones de IVA. Por favor, configurelo en Opciones > Retenciones.'
            });
        }

        let numero_comprobante_iva = resultado_buscar[0].numero_comprobante_iva;

        const fecha = new Date();
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const formattedId = String(numero_comprobante_iva).padStart(8, '0');
        const numeroComprobante = `${year}-${month}-${formattedId}`
        
        const query = `
        INSERT INTO retenciones_iva 
        (id_proveedor, fecha_retencion, tipo, id_tipo_documento, numero_documento, 
         numero_control, numero_afectado, numero_expediente, total_exento, 
         total_documento, total_iva, total_iva_retenido, porcent_retencion, 
         base_imponible, alicuota, total_pagado,  
         id_usuario, id_cli, numero_comprobante, numero_comprobante_plano )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  ?, ?, ?,?)`;
        
        const valores = [
            id_proveedor, fecha_retencion, tipo.toUpperCase(), id_tipo_documento, numero_documento,
            numero_control, numero_afectado, numero_expediente, total_exento,
            total_documento, total_iva, total_iva_retenido, porcent_retencion,
            base_imponible, alicuota, total_pagado,id_usuario, id_cli,
            numeroComprobante, numero_comprobante_iva
        ];

        const resultado = await retornar_query(query, valores);

        const query_actualizar = `
        UPDATE opt_retenciones 
        SET numero_comprobante_iva = numero_comprobante_iva+1
        WHERE id_cli=?`;

        await retornar_query(query_actualizar, [id_cli]);

        let dia = String(fecha.getDate()).padStart(2, '0');
        return res.json({
            success: true,
            data: resultado,
            numeroComprobante:numeroComprobante,
            fechaEmision: `${dia}/${month}/${year}`,         
            message: 'Retención de IVA creada exitosamente'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.put('/iva/:id', async (req, res) => {    
    const {id} = req.params;    
    const {c,v} = req.body;
    
    if(isNaN(id)){
        return res.status(400).json({
            success: false,
            error: 'Faltan datos para procesar la solicitud'
        });
    }

    let camposValidos=['numero_expediente','numero_afectado','numero_control',
        'numero_documento', 'id_tipo_documento', 'tipo', 'fecha_retencion',];

    if (!camposValidos.includes(c)) {
        return res.status(400).json({
            success: false,
            error: 'Campo no válido para actualizar.'
        });
    }

    try {
        
        const query = `UPDATE retenciones_iva SET ${c} = ? WHERE id=?;`
        
        const resultado = await retornar_query(query,[ v, id]);

        return res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.delete('/iva/:id', async (req, res) => {    
    const {id} = req.params;    
    
    if(isNaN(id)){
        return res.status(400).json({
            success: false,
            error: 'Faltan datos para procesar la solicitud'
        });
    }

    try {
        
        const query = `UPDATE retenciones_iva SET activo=0 WHERE id=?;`
        
        const resultado = await retornar_query(query,[id]);

        return res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/iva', async (req, res) => {
    try {
        const {
            numero_comprobante,
            proveedor_nombre,
            proveedor_rif,
            proveedor_id,
            id,
            id_cli,
            fecha_desde,
            fecha_hasta,
            page = 1,
            limit = 5
        } = req.query;

        if (!numero_comprobante && !proveedor_nombre && !proveedor_rif && !fecha_desde && !fecha_hasta && !id) {
            return res.status(400).json({
                success: false,
                error: 'Debe proporcionar al menos un criterio de búsqueda: numero_comprobante, proveedor_nombre, proveedor_rif, fecha_desde o fecha_hasta'
            });
        }

        if (fecha_desde && !isValidDate(fecha_desde)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de fecha_desde inválido. Use YYYY-MM-DD'
            });
        }

        if (fecha_hasta && !isValidDate(fecha_hasta)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de fecha_hasta inválido. Use YYYY-MM-DD'
            });
        }

        if (fecha_desde && fecha_hasta && new Date(fecha_desde) > new Date(fecha_hasta)) {
            return res.status(400).json({
                success: false,
                error: 'fecha_desde no puede ser mayor a fecha_hasta'
            });
        }

        // Construir la consulta dinámica
        let query = `
            SELECT 
                ri.*,
                p.nombre as proveedor_nombre,
                p.RIF as proveedor_rif,
                p.telefono as proveedor_telefono,
                p.id_proveedor as proveedor_id
            FROM retenciones_iva ri
            INNER JOIN proveedores p ON ri.id_proveedor = p.id_proveedor
            WHERE ri.activo IN (0,1)
        `;

        const params = [];
        let paramCount = 0;

        // Agregar condiciones de búsqueda
        if (numero_comprobante) {
            query += ` AND ri.numero_comprobante LIKE ?`;
            params.push(`%${numero_comprobante}%`);
        }

        if (id_cli) {
            query += ` AND ri.id_cli = ?`;
            params.push(`${id_cli}`);
        }

        if (id) {
            query += ` AND ri.id = ?`;
            params.push(`${id}`);
        }

        if(proveedor_id){
            query += ` AND p.id_proveedor = ?`;
            params.push(`${proveedor_id}`);
        }

        if (proveedor_nombre) {
            query += ` AND p.nombre LIKE ?`;
            params.push(`%${proveedor_nombre}%`);
        }

        if (proveedor_rif) {
            query += ` AND p.RIF LIKE ?`;
            params.push(`%${proveedor_rif}%`);
        }

        if (fecha_desde) {
            query += ` AND ri.fecha_retencion >= ?`;
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            query += ` AND ri.fecha_retencion <= ?`;
            params.push(fecha_hasta);
        }

        // Ordenar por fecha más reciente primero
        query += ` ORDER BY ri.fecha_retencion DESC, ri.id DESC`;

        // Contar total de registros para paginación
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as count_table`;
        let countResult;
        try {
            countResult = await retornar_query(countQuery, params);
        } catch (error) {
            // Si hay error en count, asumir 0 resultados
            countResult = [{ total: 0 }];
        }
        
        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        // Si no hay resultados, retornar éxito con array vacío
        if (total === 0) {
            return res.json({
                success: true,
                data: [],
                query,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                },
                filters: {
                    numero_comprobante,
                    proveedor_nombre,
                    proveedor_rif,
                    fecha_desde,
                    fecha_hasta,
                    id
                }
            });
        }

        // Agregar paginación a la consulta principal
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        // Ejecutar consulta principal
        let resultados;
        try {
            resultados = await retornar_query(query, params);
        } catch (error) {
            // Si hay error en la consulta principal, retornar array vacío
            resultados = [];
        }

        return res.json({
            success: true,
            data: resultados,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filters: {
                numero_comprobante,
                proveedor_nombre,
                proveedor_rif,
                fecha_desde,
                fecha_hasta
            }
        });

    } catch (error) {
        console.error('Error en búsqueda de comprobantes:', error);
       
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor al buscar comprobantes'
        });
    }
});

router.get('/comprobante-iva/:id', async (req, res) => {
    const {id} = req.params;       
    if(isNaN(id)){
        return res.status(400).json({
            success: false,
            error: 'Faltan datos para procesar la solicitud'
        });
    }
    try {       

        let query = `
            SELECT 
                ri.*,
                p.nombre as proveedor_nombre,
                p.RIF as proveedor_rif,
                p.telefono as proveedor_telefono,
                p.direccion as proveedor_direccion,
                a.logo_empresa as logo,
                CONCAT(ab.tipo_cedula, ab.cedula) as agente_rif,
                ab.direccion as agente_direccion,
                ab.nombre as agente_nombre
            FROM retenciones_iva ri
            INNER JOIN proveedores p ON ri.id_proveedor = p.id_proveedor
            INNER JOIN perfil_usuario_empresa a ON ri.id_cli = a.id_usuario
            INNER JOIN perfil_usuario_basico ab ON ri.id_cli = ab.id_usuario
            WHERE ri.id =?
        `;
        
        let resultados;
        try {
            resultados = await retornar_query(query, [id]);
        } catch (error) {
            return res.json({
            success: false,
            data: error
        });
        }

        return res.json({
            success: true,
            data: resultados
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor al buscar comprobantes'
        });
    }
});

router.get('/codigos-islr', async (req, res) => {    
    try {       

        let query = `
            SELECT * FROM retenciones_codigos_isrl WHERE activo=?
        `;
        
        let resultados;
        try {
            resultados = await retornar_query(query, [1]);
        } catch (error) {
            return res.json({
            success: false,
            data: error
        });
        }

        return res.json({
            success: true,
            data: resultados
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor al buscar comprobantes'
        });
    }
});

router.post('/islr', async (req, res) => {    
    const {
        id_retenciones_ut, id_retenciones_decretos, id_proveedor, id_concepto,
        doc_num, control_num, fecha_operacion, monto_sujeto, porcent_imponible,
        total_ut, porcent_aplicable, sustraendo, total_retener, total_pagar, id_cli, id_usuario, tipo_retencion
    } = req.body;
    
    // Validación de campos obligatorios
    const camposObligatorios = [
        'id_retenciones_ut', 'id_retenciones_decretos', 'id_proveedor', 'id_concepto',
        'doc_num', 'fecha_operacion', 'monto_sujeto', 'porcent_imponible',
        'total_ut', 'porcent_aplicable', 'total_retener', 'total_pagar',
        'id_cli', 'id_usuario'
    ];
    
    const camposFaltantes = camposObligatorios.filter(campo => !req.body[campo]);
    
    if (camposFaltantes.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Faltan datos obligatorios: ${camposFaltantes.join(', ')}`
        });
    }

    // Validación de porcentajes
    if (Number(porcent_imponible) < 0 || Number(porcent_imponible) > 100) {
        return res.status(400).json({
            success: false,
            error: 'El porcentaje imponible debe estar entre 0 y 100.'
        });        
    }
 
    if (Number(porcent_aplicable) < 0 || Number(porcent_aplicable) > 100) {
        return res.status(400).json({
            success: false,
            error: 'El porcentaje aplicable debe estar entre 0 y 100.'
        });        
    }

    // Validación de montos no negativos
    const montos = ['monto_sujeto', 'total_ut', 'sustraendo', 'total_retener', 'total_pagar'];
    const montosNegativos = montos.filter(campo => req.body[campo] && Number(req.body[campo]) < 0);
    
    if (montosNegativos.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Los siguientes montos no pueden ser negativos: ${montosNegativos.join(', ')}`
        });
    }

    // Validación de fechas
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha_operacion)) {
        return res.status(400).json({
            success: false,
            error: 'El formato de fecha debe ser YYYY-MM-DD'
        });
    }

    // Validación de enteros positivos
    const enteros = ['id_retenciones_ut', 'id_retenciones_decretos', 'id_proveedor', 'id_concepto', 'id_cli'];
    const enterosInvalidos = enteros.filter(campo => {
        const valor = req.body[campo];
        return valor && (!Number.isInteger(Number(valor)) || Number(valor) < 0);
    });
    
    if (enterosInvalidos.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Los siguientes campos deben ser números enteros positivos: ${enterosInvalidos.join(', ')}`
        });
    }

    try {
        // Buscar el número de comprobante para ISLR
        let query_buscar_id = `
        SELECT numero_comprobante_islr
        FROM opt_retenciones
        WHERE id_cli=?        
        LIMIT 1
        `;

        const resultado_buscar = await retornar_query(query_buscar_id, [id_cli]);
        if(resultado_buscar.length < 1) {
            return res.status(400).json({
                success: false,
                error: 'No se ha configurado el número de comprobante para retenciones de ISLR. Por favor, configurelo en Opciones > Retenciones.'
            });
        }

        let numero_comprobante_islr = resultado_buscar[0].numero_comprobante_islr;

        // Formatear número de comprobante
        const fecha = new Date();
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const formattedId = String(numero_comprobante_islr).padStart(8, '0');
        const numeroComprobante = `${year}-${month}-${formattedId}`;
        
        // Query para insertar la retención ISLR
        const query = `
        INSERT INTO retenciones_islr 
        (id_retenciones_ut, id_retenciones_decretos, id_proveedor, id_concepto, 
         doc_num, control_num, fecha_operacion, monto_sujeto, porcent_imponible, 
         total_ut, porcent_aplicable, sustraendo, total_retener, total_pagar, 
         numero_comprobante, id_cli, id_usuario, numero_comprobante_plano, tipo_retencion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
        
        const valores = [
            id_retenciones_ut, id_retenciones_decretos, id_proveedor, id_concepto,
            doc_num, control_num, fecha_operacion, monto_sujeto, porcent_imponible,
            total_ut, porcent_aplicable, sustraendo, total_retener, total_pagar,
            numeroComprobante, id_cli, id_usuario, numero_comprobante_islr, tipo_retencion
        ];

        const resultado = await retornar_query(query, valores);

        // Actualizar el número de comprobante
        const query_actualizar = `
        UPDATE opt_retenciones 
        SET numero_comprobante_islr = numero_comprobante_islr + 1
        WHERE id_cli = ?`;

        await retornar_query(query_actualizar, [id_cli]);

        // Formatear fecha de emisión
        let dia = String(fecha.getDate()).padStart(2, '0');
        
        return res.json({
            success: true,
            data: resultado,
            numeroComprobante: numeroComprobante,
            fechaEmision: `${dia}/${month}/${year}`,         
            message: 'Retención de ISLR creada exitosamente'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.put('/islr/:id', async (req, res) => {    
    const {id} = req.params;    
    const {c,v} = req.body;
    
    if(isNaN(id)){
        return res.status(400).json({
            success: false,
            error: 'Faltan datos para procesar la solicitud'
        });
    }

    let camposValidos=['doc_num','control_num','tipo_retencion',
        'fecha_operacion'];

    if (!camposValidos.includes(c)) {
        return res.status(400).json({
            success: false,
            error: 'Campo no válido para actualizar.'
        });
    }

    try {
        
        const query = `UPDATE retenciones_islr SET ${c} = ? WHERE id=?;`
        
        const resultado = await retornar_query(query,[ v, id]);

        return res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.delete('/islr/:id', async (req, res) => {    
    const {id} = req.params;    
    
    if(isNaN(id)){
        return res.status(400).json({
            success: false,
            error: 'Faltan datos para procesar la solicitud'
        });
    }

    try {
        
        const query = `UPDATE retenciones_islr SET activo=0 WHERE id=?;`
        
        const resultado = await retornar_query(query,[id]);

        return res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/islr', async (req, res) => {
    try {
        const {
            numero_comprobante,
            proveedor_nombre,
            proveedor_rif,
            proveedor_id,
            id,
            id_cli,
            fecha_desde,
            fecha_hasta,
            page = 1,
            limit = 5
        } = req.query;

        // Validar que al menos un parámetro de búsqueda esté presente
        if (!numero_comprobante && !proveedor_nombre && !proveedor_rif && !fecha_desde && !fecha_hasta && !id) {
            return res.status(400).json({
                success: false,
                error: 'Debe proporcionar al menos un criterio de búsqueda: numero_comprobante, proveedor_nombre, proveedor_rif, fecha_desde o fecha_hasta'
            });
        }

        // Validar formato de fechas
        if (fecha_desde && !isValidDate(fecha_desde)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de fecha_desde inválido. Use YYYY-MM-DD'
            });
        }

        if (fecha_hasta && !isValidDate(fecha_hasta)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de fecha_hasta inválido. Use YYYY-MM-DD'
            });
        }

        // Validar que fecha_desde no sea mayor a fecha_hasta
        if (fecha_desde && fecha_hasta && new Date(fecha_desde) > new Date(fecha_hasta)) {
            return res.status(400).json({
                success: false,
                error: 'fecha_desde no puede ser mayor a fecha_hasta'
            });
        }

        // Construir la consulta dinámica
        let query = `
            SELECT 
                ri.*,
                p.nombre as proveedor_nombre,
                p.RIF as proveedor_rif,
                p.telefono as proveedor_telefono,
                p.id_proveedor as proveedor_id
            FROM retenciones_islr ri
            INNER JOIN proveedores p ON ri.id_proveedor = p.id_proveedor
            WHERE ri.activo IN (0,1)
        `;

        const params = [];
        let paramCount = 0;

        // Agregar condiciones de búsqueda
        if (numero_comprobante) {
            query += ` AND ri.numero_comprobante LIKE ?`;
            params.push(`%${numero_comprobante}%`);
        }

        if (id) {
            query += ` AND ri.id = ?`;
            params.push(`${id}`);
        }

        if (id_cli) {
            query += ` AND ri.id_cli = ?`;
            params.push(`${id_cli}`);
        }

        if(proveedor_id){
            query += ` AND p.id_proveedor = ?`;
            params.push(`${proveedor_id}`);
        }

        if (proveedor_nombre) {
            query += ` AND p.nombre LIKE ?`;
            params.push(`%${proveedor_nombre}%`);
        }

        if (proveedor_rif) {
            query += ` AND p.RIF LIKE ?`;
            params.push(`%${proveedor_rif}%`);
        }

        if (fecha_desde) {
            query += ` AND ri.fecha_operacion >= ?`;
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            query += ` AND ri.fecha_operacion <= ?`;
            params.push(fecha_hasta);
        }

        // Ordenar por fecha más reciente primero
        query += ` ORDER BY ri.fecha_operacion DESC, ri.id DESC`;

        // Contar total de registros para paginación
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as count_table`;
        let countResult;
        try {
            countResult = await retornar_query(countQuery, params);
        } catch (error) {
            // Si hay error en count, asumir 0 resultados
            countResult = [{ total: 0 }];
        }
        
        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        // Si no hay resultados, retornar éxito con array vacío
        if (total === 0) {
            return res.json({
                success: true,
                data: [],
                query,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                },
                filters: {
                    numero_comprobante,
                    proveedor_nombre,
                    proveedor_rif,
                    fecha_desde,
                    fecha_hasta,
                    id
                }
            });
        }

        // Agregar paginación a la consulta principal
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        // Ejecutar consulta principal
        let resultados;
        try {
            resultados = await retornar_query(query, params);
        } catch (error) {
            // Si hay error en la consulta principal, retornar array vacío
            resultados = [];
        }

        return res.json({
            success: true,
            data: resultados,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filters: {
                numero_comprobante,
                proveedor_nombre,
                proveedor_rif,
                fecha_desde,
                fecha_hasta
            }
        });

    } catch (error) {
        console.error('Error en búsqueda de comprobantes:', error);
       
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor al buscar comprobantes'
        });
    }
});

router.get('/comprobante-islr/:id', async (req, res) => {
    const {id} = req.params;       
    if(isNaN(id)){
        return res.status(400).json({
            success: false,
            error: 'Faltan datos para procesar la solicitud'
        });
    }
    try {       

        let query = `
            SELECT 
                ri.*,
                CONCAT(icr.codigo_seniat_isrl, ' ', icr.descripcion) as concepto,
                p.nombre as proveedor_nombre,
                p.RIF as proveedor_rif,
                p.telefono as proveedor_telefono,
                p.direccion as proveedor_direccion,
                a.logo_empresa as logo,
                CONCAT(ab.tipo_cedula, ab.cedula) as agente_rif,
                ab.direccion as agente_direccion,
                ab.nombre as agente_nombre
            FROM retenciones_islr ri
            INNER JOIN proveedores p ON ri.id_proveedor = p.id_proveedor
            INNER JOIN perfil_usuario_empresa a ON ri.id_cli = a.id_usuario
            INNER JOIN perfil_usuario_basico ab ON ri.id_cli = ab.id_usuario
            INNER JOIN retenciones_codigos_isrl icr ON ri.id_concepto = icr.id
            WHERE ri.id =?
        `;
        
        let resultados;
        try {
            resultados = await retornar_query(query, [id]);
        } catch (error) {
            return res.json({
            success: false,
            data: error
        });
        }

        return res.json({
            success: true,
            data: resultados
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor al buscar comprobantes'
        });
    }
});

module.exports = router;