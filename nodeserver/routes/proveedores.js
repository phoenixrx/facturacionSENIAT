// routes/caja.js
const express = require('express');
const router = express.Router();
const { retornar_query } = require('../middlewares/retornarQuery');
const { authenticateToken } = require('../middlewares/autenticarToken');

// GET /api/retenciones 
router.get('/proveedores/:rif',  async (req, res) => {
    const {rif} = req.params;
    const {id_cli} = req.query;

    if(!rif || isNaN(id_cli)){
        return res.status(400).json({
            success: false,
            error: 'Faltan datos para procesar la solicitud'
        });
    }

    try {
        const query = `
        SELECT * FROM proveedores WHERE RIF=? AND id_cli=?;`
        
        const resultado = await retornar_query(query,[rif,id_cli]);

        let acumulados_iva_query =`
            SELECT 
                SUM(base_imponible) AS base_imponible,
                SUM(total_iva) AS total_iva,
                SUM(total_iva_retenido) AS total_iva_retenido 
            FROM retenciones_iva
            WHERE id_proveedor=? AND id_cli=?
            AND fecha_retencion <= DATE_FORMAT(NOW(), '%Y-12-31');
        `

        let acumulados_iva = await retornar_query(acumulados_iva_query,[resultado[0].id_proveedor,id_cli]);

        let acumulados_islr_query =`
            SELECT 
                SUM(monto_sujeto) AS base_imponible,
                SUM(total_retener) AS retenido                
            FROM retenciones_islr
            WHERE id_proveedor=? AND id_cli=?
            AND fecha_operacion <= DATE_FORMAT(NOW(), '%Y-12-31');`

        let acumulados_islr = await retornar_query(acumulados_islr_query,[resultado[0].id_proveedor,id_cli]);

        return res.json({
            success: true,
            data: resultado,
            iva: acumulados_iva,
            islr: acumulados_islr
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.put('/proveedores/:id', authenticateToken, async (req, res) => {
    const {id} = req.params;    
    const {c,v} = req.body;

    if(isNaN(id)){
        return res.status(400).json({
            success: false,
            error: 'Faltan datos para procesar la solicitud'
        });
    }

    let camposValidos=['porcentaje_retencion','is_residente','is_agente','is_contribuyente', 'is_juridico'];

    if (!camposValidos.includes(c)) {
        return res.status(400).json({
            success: false,
            error: 'Campo no válido para actualizar.'
        });
    }

    try {
        
        const query = `UPDATE proveedores SET ${c} = ? WHERE id_proveedor=?;`
        
        const resultado = await retornar_query(query,[ v, id]);

        return res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/proveedores', authenticateToken, async (req, res) => {    
    const {rif, razonsocial, telefono, correo, direccion, id_cli, 
        contacto, telefcontact, porcentaje_retencion, is_residente, 
        is_agente, is_contribuyente, is_juridico} = req.body;
        
    if(!rif || !razonsocial || !id_cli || !porcentaje_retencion || !telefono || !direccion){
        return res.status(400).json({
            success: false,
            error: 'Faltan datos obligatorios para crear el proveedor (rif, Razon social, Porcentaje retencion, telefono, direccion)'
        });
    }

    if(Number(porcentaje_retencion)<75 || Number(porcentaje_retencion)>100){
        return res.status(400).json({
            success: false,
            error: 'El porcentaje de retención debe estar entre 75 y 100.'
        });        
    }

    if(rif.length < 5 || rif.length > 20){
        return res.status(400).json({
            success: false,
            error: 'El RIF debe tener entre 5 y 20 caracteres.'
        });        
    }

    if(razonsocial.length < 5 || razonsocial.length > 50){
        return res.status(400).json({
            success: false,
            error: 'La razón social debe tener entre 5 y 50 caracteres.'
        });        
    }
    
    let is_residenteVar = is_residente ? 1 : 0;
    let is_agenteVar = is_agente ? 1 : 0;
    let is_contribuyenteVar = is_contribuyente ? 1 : 0;
    let is_juridicoVar = is_juridico ? 1 : 0;
    /*const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (correo && !emailRegex.test(correo)) {
        return res.status(400).json({
            success: false,
            error: 'El formato del correo electrónico no es válido.'
        });
    }*/

    try {
        const query = `
        INSERT INTO proveedores 
        (RIF, nombre, telefono, correo, direccion, id_cli, contacto_nombre, contacto_telefono, porcentaje_retencion, is_residente, is_agente, is_contribuyente, is_juridico, tipo_proveedor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SERVICIOS');`
        
        const resultado = await retornar_query(query,[
            rif.toUpperCase(), razonsocial.toUpperCase(), telefono, correo.toLowerCase(), direccion, id_cli, 
            contacto.toUpperCase(), telefcontact, porcentaje_retencion, is_residenteVar, 
            is_agenteVar, is_contribuyenteVar, is_juridicoVar
        ]);

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

router.get('/lista-proveedores/:id_cli',  async (req, res) => {
    const {id_cli} = req.params;

    if(isNaN(id_cli)){
        return res.status(400).json({
            success: false,
            error: 'Faltan datos para procesar la solicitud'
        });
    }

    try {
        const query = `SELECT * FROM proveedores WHERE id_cli=?;`
        
        const resultado = await retornar_query(query,[id_cli]);

        return res.json({
            success: true,
            data: resultado,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;