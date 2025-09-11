
document.getElementById('btn_new_iva').addEventListener('click', function() {
    contribuyente=0;

    document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        input.value = '';
    });

    // Restablecer checkboxes y radios a su estado predeterminado
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
    recalcular();
    document.getElementById("rif_iva").focus()
})
