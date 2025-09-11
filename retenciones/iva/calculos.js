document.querySelectorAll('.valores').forEach(item => {
        item.addEventListener('input', event => {
            item.value = item.value.replace(/[^0-9.]/g, '').replace(/,/g, '.');
        })
        item.addEventListener('blur', event => {
            validar_monto_bs(item);
        })
    })

function validar_monto(monto) {
    var filter = /^-?(\d{0,9}[.\s]?|)\d{0,3}$/;

    if (filter.test(monto)) {
        return true;
        } else {
        return false;
    }
}

function validar_monto_bs(objeto) {
    
    var objeto_objetivo = objeto;
    objeto_objetivo.classList.remove('is-invalid')
    
    var monto = objeto_objetivo.value;
    if (!validar_monto(monto)) {
        objeto_objetivo.classList.add('is-invalid')
        objeto_objetivo.focus();
        const quitar_validacion = setTimeout(() => {
                objeto_objetivo.classList.remove('is-invalid')
                clearTimeout(quitar_validacion);
            }, "5000");
        return "invalido";
    }
    recalcular();
    return true;
}

function recalcular(){
    let baseImponible = parseFloat(document.getElementById("totalBaseImponible").value) || 0;
    let totalExento = parseFloat(document.getElementById("totalExento").value) || 0;
    let alicuota = parseFloat(document.getElementById("alicuota").value) || 0;
    let porcentajeRetener = parseFloat(document.getElementById("porcentajeRetener").value) || 0;

    let totalIva = baseImponible * (alicuota / 100);
    document.getElementById("totalIva").value = totalIva.toFixed(2);

    document.getElementById("totalDocumento").value = (totalIva + baseImponible + totalExento).toFixed(2);


    let totalIvaRetenido = totalIva * (porcentajeRetener / 100);
    document.getElementById("totalIvaRetenido").value = totalIvaRetenido.toFixed(2);

    let totalDocumento = (parseFloat(document.getElementById("totalDocumento").value) || 0);
    
    document.getElementById("totalPagado").value = (totalDocumento - totalIvaRetenido).toFixed(2);
    document.getElementById("totalRetener").value = totalIvaRetenido.toFixed(2);
}
