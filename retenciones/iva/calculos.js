document.querySelectorAll('.valores').forEach(item => {
    item.addEventListener('input', event => {
        item.value = item.value.replace(/[^0-9.]/g, '').replace(/,/g, '.');
    })
    item.addEventListener('blur', event => {
        validar_monto_bs(item);
    })
})

function recalcular() {
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

    let rowDetalles = document.querySelectorAll(".rowRetencion");

    if (rowDetalles.length > 0) {
        let totalIVAret = 0
        let totalDoc = 0
        let totalPag = 0
        rowDetalles.forEach(row => {
            let baseImponible = parseFloat(row.dataset.baseImponible) || 0;
            let alicuota = parseFloat(row.dataset.alicuota) || 0;
            let porcentajeRetener = parseFloat(row.dataset.porcentajeRetener) || 0;
            let totalIva = parseFloat(row.dataset.totalIva) || 0;
            let totalIvaRetenido = parseFloat(row.dataset.totalIvaRetenido) || 0;

            totalDoc += baseImponible + totalIva;
            totalIVAret += totalIvaRetenido

        })
        totalPag = (totalDoc + totalExento) - totalIVAret
        document.getElementById("totalDocumento").value = (totalDoc + totalExento).toFixed(2);
        document.getElementById("totalRetener").value = totalIVAret.toFixed(2);
        document.getElementById("totalPagado").value = totalPag.toFixed(2);
    }
}
