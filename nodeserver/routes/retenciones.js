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

module.exports = router;