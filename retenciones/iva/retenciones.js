document.getElementById('btn_new_iva').addEventListener('click', function() {    
    limpiarTodo();
    document.getElementById("rif_iva").focus()
    document.getElementById('btn_sav_iva').classList.remove('pe-none')
    document.getElementById("num_comprobante").classList.remove("is-valid");
})

document.getElementById('btn_sav_iva').addEventListener('click', function() {
    
    if(contribuyente == 0){
        Swal.fire({
            title: 'Debe seleccionar un proveedor',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        return;
    }

    if(retencionIva != 0){
        Swal.fire({
            title: 'Esta retención ya fue creada',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        return;
    }
    
    recalcular();

    let baseImponible = parseFloat(document.getElementById("totalBaseImponible").value) || 0;
    let totalExento = parseFloat(document.getElementById("totalExento").value) || 0;
    let alicuota = parseFloat(document.getElementById("alicuota").value) || 0;
    let porcentajeRetener = parseFloat(document.getElementById("porcentajeRetener").value) || 0;
    let totalIvaRetenido = parseFloat(document.getElementById("totalIvaRetenido").value) || 0;
    let totalIva = parseFloat(document.getElementById("totalIva").value) || 0;
    let totalDocumento = parseFloat(document.getElementById("totalDocumento").value) || 0;

    // Validaciones
    if(baseImponible < 1){
        Swal.fire({
            title: 'Debe ingresar una base imponible',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        document.getElementById("totalBaseImponible").focus();
        document.getElementById("totalBaseImponible").classList.add("is-invalid");
        return;
    }    

    if(document.getElementById("numeroDocumento").value.length < 3){
        Swal.fire({
            title: 'Debe ingresar un número de documento',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        document.getElementById("numeroDocumento").focus();
        document.getElementById("numeroDocumento").classList.add("is-invalid");
        return;
    }

    if(document.getElementById("numeroControl").value.length < 3){
        Swal.fire({
            title: 'Debe ingresar un número de control',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        document.getElementById("numeroControl").focus();
        document.getElementById("numeroControl").classList.add("is-invalid");
        return;
    }
    
    if(totalIva < 1){
        Swal.fire({
            title: 'El documento no posee IVA',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        document.getElementById("totalBaseImponible").focus();
        document.getElementById("totalBaseImponible").classList.add("is-invalid");
        return;
    }
    if(totalDocumento < 1){
        Swal.fire({
            title: 'El documento no posee un total válido',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        document.getElementById("totalBaseImponible").focus();
        document.getElementById("totalBaseImponible").classList.add("is-invalid");
        return;
    }

    // Preparar datos según la estructura del endpoint
    let data = {
        id_proveedor: contribuyente,
        fecha_retencion: document.getElementById("fecha_operacion").value,
        tipo: document.getElementById("tipoRetencion").value,
        id_tipo_documento: document.getElementById("documentoRetencion").value,
        numero_documento: document.getElementById("numeroDocumento").value,
        numero_control: document.getElementById("numeroControl").value,
        numero_afectado: document.getElementById("numeroDocumentoAf").value,
        numero_expediente: document.getElementById("numeroExpediente").value,
        total_exento: totalExento,
        total_documento: totalDocumento,
        total_iva: totalIva,
        total_iva_retenido: totalIvaRetenido,
        porcent_retencion: porcentajeRetener,
        base_imponible: baseImponible,
        alicuota: alicuota,
        id_usuario:  parent.configs_token.id_usuario,        
        total_pagado: totalDocumento, // Asumiendo que el total pagado es igual al total del documento
        id_cli:  parent.configs_token.id_cli
    };
    this.classList.add('pe-none')
    Swal.fire({
        title: 'Guardando retención...',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch('https://facturacion.siac.historiaclinica.org/api/retenciones/iva', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        Swal.close();
        if (result.success) {
            Swal.fire({
                title: 'Éxito',
                text: 'Retención guardada correctamente',
                icon: 'success',
                allowOutsideClick: false,
            });
            // Si el endpoint retorna algún número de comprobante
            if (result.data && result.data.insertId && result.numeroComprobante) {   
                retencionIva = result.data.insertId;                
                document.getElementById("num_comprobante").value = result.numeroComprobante;
                document.getElementById("fechaEmision").value = result.fechaEmision;
                let invalidos = document.querySelectorAll('.is-invalid');
                invalidos.forEach(input => {
                    input.classList.remove('is-invalid');
                });
                document.getElementById("num_comprobante").classList.add("is-valid");

            }
        } else {
            Swal.fire({
                title: 'Error',
                text: result.error || 'Error al guardar la retención',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            this.classList.remove('pe-none')
        }
    })
    .catch(error => {
        Swal.close();
        Swal.fire({
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        this.classList.remove('pe-none')
        console.error('Error:', error);
    });
});

document.querySelectorAll('.retencionInput').forEach(item => {
    item.addEventListener('change', event => {
        if(retencionIva == 0){
            return;
        }
        let c = item.dataset.campo;
        let v = null;
        v = item.value;
        actualizarRetencion(c,v, item)

    })
})

async function actualizarRetencion(c,v, elemento) {  
    Swal.fire({
        title: 'Actualizando...',
        icon:'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    const response = await fetch(
        `https://facturacion.siac.historiaclinica.org/api/retenciones/iva/${retencionIva}`,
        {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ c: c, v: v })
        }
    );
    const retencion = await response.json();  
    Swal.close()
    if (retencion.error) {
        Swal.fire({
                title: 'Error',
                text: retencion.error,
                icon:'info',
                allowOutsideClick: false,                
            });            
            elemento.classList.add("is-invalid");        
            return;
    }
    elemento.classList.add("is-valid");
    return;   
}

function limpiarTodo(){
    contribuyente=0;
    retencionIva=0;
    document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        input.value = '';
    });
 
    document.getElementById('juridico').checked = true;
    document.getElementById('natural').checked = false;
    document.getElementById('contribuyenteResidente').checked = true;
    document.getElementById('agenteRetencion').checked = false;
    document.getElementById('contribuyenteRetencion').checked = true;

    // Restablecer valores por defecto
    document.getElementById('retencion_iva').value = '100';
    document.getElementById('porcentajeRetener').value = '100';
    document.getElementById('totalExento').value = '0';
    document.getElementById('numeroDocumentoAf').value = '0';
    document.getElementById('numeroExpediente').value = '0';
    document.getElementById('alicuota').value = '16';
    document.getElementById('fecha_operacion').value = toDateInputValue(new Date());

    // Limpiar campos de solo lectura
    document.getElementById("num_comprobante").classList.remove("is-valid");
    recalcular();
}

document.getElementById('btn_delete_iva').addEventListener('click', async function() {
    if(retencionIva == 0){
        Swal.fire({
            title: 'Debe seleccionar una retención',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        return;
    }
    Swal.fire({
        title: '¿Está seguro de anular esta retención?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#576069ff',
        confirmButtonText: 'Sí, anularla!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`https://facturacion.siac.historiaclinica.org/api/retenciones/iva/${retencionIva}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    Swal.fire(
                        '¡Anulada!',
                        'La retención ha sido anulada.',
                        'success'
                    );
                    limpiarTodo();
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: result.error || 'Error al anular la retención',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
                console.error('Error:', error);
            });
        }
    });
});
document.getElementById('btn_print_iva').addEventListener('click', function() {
    if(retencionIva == 0){
        Swal.fire({
            title: 'Debe seleccionar una retención',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        return;
    }
    window.open(`https://facturacion.siac.historiaclinica.org/retenciones/iva/comprobante.html?id=${retencionIva}`, '_blank');
});

