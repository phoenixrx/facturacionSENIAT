const codigos_retenciones = [];

cargar_codigos()
async function cargar_codigos() {
    fetch('https://facturacion.siac.historiaclinica.org/api/retenciones/codigos-islr', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }        
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            console.log(result.error)
            Swal.fire({
                title: 'Error',
                text: 'No se han cargado los codigos de retenciones',
                icon: 'error',
                allowOutsideClick: false,                
            });
        }else{
            result.data.forEach(codigo => {
                codigos_retenciones.push(codigo)                
            })
            cargarSelect()
        }
    })
}

function cargarSelect(){
    const is_juridico = document.querySelector('input[name="tipoContribuyenteIsrl"]:checked').value;
    
    const is_residente = document.getElementById('contribuyenteResidente').checked ? 1 : 0;

    const juridicoNum = parseInt(is_juridico);
    const residenteNum = parseInt(is_residente);
    
    const primerFiltro = codigos_retenciones.filter(codigo => 
        codigo.is_juridico === juridicoNum 
    );
    
    const segundoFiltro = primerFiltro.filter(codigo => 
        codigo.is_residente === residenteNum
    );

    const codigosISLR =segundoFiltro;
   
    const selectConcepto = document.getElementById('conceptoIslr');
        selectConcepto.innerHTML = ''; 
        if (codigosISLR.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay conceptos disponibles para esta selección';
            selectConcepto.appendChild(option);
            selectConcepto.disabled = true;
            return;
        }

        selectConcepto.disabled = false;
        const option = document.createElement('option');
            option.value = "";
            option.textContent = `--SELECCIONE--`;
            selectConcepto.appendChild(option);
        codigosISLR.forEach(codigo => {
            const option = document.createElement('option');
            option.value = codigo.id;
            option.textContent = `${codigo.codigo_seniat_isrl} - ${codigo.descripcion}`;
            selectConcepto.appendChild(option);
        });
        
        if (selectConcepto.options.length > 0) {
            selectConcepto.selectedIndex = 0;
        }
    
}

document.querySelectorAll('.filtro_select').forEach(element => {
    element.addEventListener('change', () => {
        document.getElementById('btn_savIslr').classList.add('pe-none');
        cargarSelect();                 
    });
})

function limpiarTodo(){
    contribuyente=0;
    retencionIslr=0;

    document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        input.value = '';
    });
 
    document.getElementById('juridico').checked = true;
    document.getElementById('natural').checked = false;
    document.getElementById('contribuyenteResidente').checked = true;    
    document.getElementById('totalBaseImponible').dataset.bsTitle="Monto de la factura SIN iva";
    document.getElementById('conceptoIslr').dataset.bsToggle=""; 
    document.getElementById('conceptoIslr').dataset.bsTitle="";
    tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    // Restablecer valores por defecto
    document.getElementById('porcentAplicable').value = '0';
    document.getElementById('porcentajeBaseImponible').value = '0';
    document.getElementById('totalBaseImponible').value = '0';
    document.getElementById('numeroDocumento').value = '0';
    document.getElementById('numeroControl').value = '0';
    document.getElementById('totalUT').value = '0';
    document.getElementById('menosSustraendo').value = '0';
    document.getElementById('fecha_operacion').value = toDateInputValue(new Date());

    // Limpiar campos de solo lectura
    document.getElementById("num_comprobante").classList.remove("is-valid");
    recalcular();
}

document.getElementById('conceptoIslr').addEventListener('change', function(e) {
    
    if(this.value==''){
        document.getElementById('btn_savIslr').classList.add('pe-none');
    }else{
        document.getElementById('btn_savIslr').classList.remove('pe-none');
    }   
    if(contribuyente==0){        
        document.getElementById('conceptoIslr').value = '';
        document.getElementById('btn_savIslr').classList.add('pe-none');
        document.getElementById('rif_iva').focus();
        Swal.fire({
            title: 'Primero seleccione un proveedor',
            icon: 'info',
            allowOutsideClick: false,
        });
        
        return;
    }
    
})

document.getElementById('totalBaseImponible').addEventListener('change', function () {
    recalcular()
})

document.getElementById('btn_newIslr').addEventListener('click', function () {
    limpiarTodo()
})

async function guardarRetencionISLR() {
    try {
        // Obtener valores del formulario
        const rif = document.getElementById('rif_iva').value;
        const razonSocial = document.getElementById('razon_social').value;
        const tipoRetencion = document.querySelector('input[name="tipoRetencion"]:checked').value;
        const isJuridico = document.querySelector('input[name="tipoContribuyenteIsrl"]:checked').value;
        const isResidente = document.getElementById('contribuyenteResidente').checked ? 1 : 0;
        const conceptoIslr = document.getElementById('conceptoIslr').value;
        const fechaOperacion = document.getElementById('fecha_operacion').value;
        const numeroDocumento = document.getElementById('numeroDocumento').value;
        const numeroControl = document.getElementById('numeroControl').value;
        const montoSujeto = document.getElementById('totalBaseImponible').value;
        const porcentImponible = document.getElementById('porcentajeBaseImponible').value;
        const totalUT = document.getElementById('totalUT').value;
        const porcentAplicable = document.getElementById('porcentAplicable').value;
        const sustraendo = document.getElementById('menosSustraendo').value;
        const totalRetener = document.getElementById('totalRetener').value;
        const totalPagar = document.getElementById('totalPagado').value;
                
        const conceptoSeleccionado = codigos_retenciones.find(codigo => codigo.id === parseInt(conceptoIslr));
        const idRetencionesDecretos = conceptoSeleccionado ? conceptoSeleccionado.id_decreto : null;
        const idRetencionesUt = UT[0].id || 1;         
        const idProveedor = contribuyente; 
        const idConcepto = conceptoIslr;

        // Validar campos obligatorios
        if (!rif || !razonSocial || !fechaOperacion || !numeroDocumento || 
            !montoSujeto || !totalRetener || !totalPagar) {
                Swal.fire({
                    title: 'Primero complete todos los campos obligatorios',
                    icon: 'info',
                    allowOutsideClick: false,
                });
            return;
          
        }

        // Preparar datos para enviar
        const datosISLR = {
            id_retenciones_ut: idRetencionesUt,
            id_retenciones_decretos: idRetencionesDecretos,
            id_proveedor: idProveedor,
            id_concepto: idConcepto,
            doc_num: numeroDocumento,
            control_num: numeroControl,
            fecha_operacion: fechaOperacion,
            monto_sujeto: parseFloat(montoSujeto),
            porcent_imponible: parseFloat(porcentImponible),
            total_ut: parseFloat(totalUT),
            porcent_aplicable: parseFloat(porcentAplicable),
            sustraendo: parseFloat(sustraendo),
            total_retener: parseFloat(totalRetener),
            total_pagar: parseFloat(totalPagar),
            id_cli:  parent.configs_token.id_cli,
            id_usuario:  parent.configs_token.id_usuario,
            tipo_retencion:tipoRetencion
        };
        Swal.fire({
            title: 'Guardando',
            text: 'Se esta guardando la retención, espere...',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        // Ejecutar el endpoint
        const respuesta = await fetch('https://facturacion.siac.historiaclinica.org/api/retenciones/islr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(datosISLR)
        });

        const resultado = await respuesta.json();
        Swal.close()
        if (resultado.success) {
            // Actualizar la interfaz con los datos de respuesta
            document.getElementById('num_comprobante').value = resultado.numeroComprobante;
            document.getElementById('fechaEmision').value = resultado.fechaEmision;
            document.getElementById('num_comprobante').classList.add('is-valid')
                Swal.fire({
                    title: 'Retención de ISLR guardada exitosamente',
                    icon: 'success',
                    allowOutsideClick: false,
                });
            retencionIslr= resultado.data.insertId;
            document.getElementById('btn_savIslr').classList.add('pe-none');
        } else {
            
            Swal.fire({
                    title: 'Error',
                    text: resultado.error,
                    icon: 'error',
                    allowOutsideClick: false,
                });
            
        }
    } catch (error) {
        console.error('Error al guardar la retención ISLR:', error);
        
        Swal.close()
         Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error',
                    allowOutsideClick: false,
                });
        
    }
}

document.getElementById('btn_savIslr').addEventListener('click', function () {
    if(contribuyente==0){
        document.getElementById('rif_iva').focus();
        Swal.fire({
            title: 'Primero seleccione un proveedor',
            icon: 'info',
            allowOutsideClick: false,
        });
        return;    
    }

    if(document.getElementById('numeroDocumento').value==0||document.getElementById('numeroDocumento').value==''){
        document.getElementById('numeroDocumento').focus();
        Swal.fire({
            title: 'Primero indique numero de factura',
            icon: 'info',
            allowOutsideClick: false,
        });
        return;    
    }
    recalcular();

    if(Number(document.getElementById('totalBaseImponible').value)==0||document.getElementById('totalBaseImponible').value==''){
        document.getElementById('totalBaseImponible').focus();
        Swal.fire({
            title: 'Primero indique monto de la factura',
            icon: 'info',
            allowOutsideClick: false,
        });
        return;    
    }

     if(Number(document.getElementById('conceptoIslr').value)==0||document.getElementById('conceptoIslr').value==''){
        document.getElementById('conceptoIslr').focus();
        Swal.fire({
            title: 'Primero indique concepto de retención',
            icon: 'info',
            allowOutsideClick: false,
        });
        return;    
    }
    
    guardarRetencionISLR();
})

function limpiarTodo(){
    contribuyente=0;
    retencionIslr=0;
    
    minimoIslr =0;
    is_acumulable =0;

    document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        input.value = '';
    });
 
    document.getElementById('juridico').checked = true;
    document.getElementById('natural').checked = false;
    document.getElementById('contribuyenteResidente').checked = true;

    document.getElementById('fecha_operacion').value = toDateInputValue(new Date());

    // Limpiar campos de solo lectura
    document.getElementById("num_comprobante").classList.remove("is-valid");
    document.getElementById('conceptoIslr').value = '';
    recalcular();
}

async function actualizarRetencionIslr(c,v, elemento) {  
    Swal.fire({
        title: 'Actualizando...',
        icon:'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const response = await fetch(
        `https://facturacion.siac.historiaclinica.org/api/retenciones/islr/${retencionIslr}`,
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

document.querySelectorAll('.input_modif').forEach(item => {
    item.addEventListener('change', event => {
        if(retencionIslr == 0){
            return;
        }
        let c = item.dataset.campo;
        let v = null;
        if (item.type === 'radio') {
            v = item.checked ? item.value : null;
            if (v === null) return; // Only send update for the checked radio button
        }        
        v = item.value;
        actualizarRetencionIslr(c,v, item)

    })
})

document.getElementById('btn_deleteIslr').addEventListener('click', async function() {
    if(retencionIslr == 0){
        Swal.fire({
            title: 'Debe seleccionar o guardar la retención',
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
            fetch(`https://facturacion.siac.historiaclinica.org/api/retenciones/islr/${retencionIslr}`, {
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
})

document.getElementById('btn_printIslr').addEventListener('click', function() {
    if(retencionIslr == 0){
        Swal.fire({
            title: 'Debe seleccionar una retención',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        return;
    }
    window.open(`https://facturacion.siac.historiaclinica.org/retenciones/islr/comprobanteIslr.html?id=${retencionIslr}`, '_blank');
});