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

router.put('/proveedores/:id',  async (req, res) => {
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

router.post('/proveedores',  async (req, res) => {    
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
    
    is_residente = is_residente ? 1 : 0;
    is_agente = is_agente ? 1 : 0;
    is_contribuyente = is_contribuyente ? 1 : 0;
    is_juridico = is_juridico ? 1 : 0;
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
        (RIF, nombre, telefono, correo, direccion, id_cli, persona_contacto, telefono_contacto, porcentaje_retencion, is_residente, is_agente, is_contribuyente, is_juridico)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
        
        const resultado = await retornar_query(query,[
            rif, razonsocial, telefono, correo, direccion, id_cli, 
            contacto, telefcontact, porcentaje_retencion, is_residente, 
            is_agente, is_contribuyente, is_juridico
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


module.exports = router;