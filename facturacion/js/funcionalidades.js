function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function marcar_max_lines(){
    const table = document.getElementById("table_detalle");
    const rowCount = table.getElementsByTagName("tr").length;
    const maxRowsOptions = parseInt(opciones_formatos.opciones[0].max_lines)+1;
    if (rowCount > maxRowsOptions) {
        const rows = table.getElementsByTagName("tr");
        for (let i = maxRowsOptions; i < rowCount; i++) {
            rows[i].setAttribute("data-bs-toggle", "tooltip");
            rows[i].setAttribute("data-bs-placement", "top");
            rows[i].setAttribute("title", "Advertencia: Estas líneas no se imprimirán.");
            new bootstrap.Tooltip(rows[i]);
            rows[i].classList.add("table-danger");
        }
    }
    
}

function cambiar_tasa_actual(nuevaTasa) {
    const table = document.getElementById("table_detalle");
    const rowCount = table.getElementsByTagName("tr").length;
    if(rowCount ===0){
        Swal.fire({
            title: "Error",
            text: "No hay detalles para cambiar la tasa",
            icon: "error",
            allowOutsideClick: () => false,
        });
        document.getElementById("chk_tasa_actual").checked = false;
        document.getElementById("chk_tasa_admision").checked = true;
        return;
    }

    if(nuevaTasa ===0 || isNaN(nuevaTasa) ){
        Swal.fire({            
            title: "La tasa actual no se actualizo correctamente",
            text: "¿Desea reintentar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Reintentar",
            cancelButtonText: "Cancelar",
            allowOutsideClick: () => false,
        }).then((result) => {
            if (result.isConfirmed) {
                tasa();
            }
        })
        document.getElementById("chk_tasa_actual").checked = false;
        document.getElementById("chk_tasa_admision").checked = true;
        return;
    }
    Swal.fire({
        title: "¿Desea cambiar la tasa de las admisiones?",
        text: "Esto actualizará la tasa de todas las admisiones seleccionadas.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {

            detalles.forEach((detalle) => {
                detalle.tasa_anterior = Number(detalle.tasa);
                detalle.tasa = Number(nuevaTasa);
                detalle.precio = Number(Number(detalle.precio_usd) * Number(nuevaTasa)).toFixed(2);
                detalle.precio_bs_cant = Number(Number(detalle.precio_usd_cant) * Number(nuevaTasa)).toFixed(2);
            });
            Swal.fire({
                title: "Tasa actualizada",
                text: "La tasa de las admisiones ha sido actualizada correctamente.",
                icon: "success",
            });
            const tipoAgrupamiento = document.querySelector('input[name="rad_tipo_agrupamiento"]:checked').value; 
            switch (tipoAgrupamiento) {
                case "tipo":
                    agruparPorTipo(detalles)
                    break;               
                case "agrupada":
                    agruparPorTipo(detalles, "agrupada")
                    break;    
                default:
                    detalles_fatura(detalles)
                    break;
            }
            calcularTotales(nuevaTasa)

        }
    });
};

function cambiar_tasa_admision(nuevaTasa) {
    const table = document.getElementById("table_detalle");
    const rowCount = table.getElementsByTagName("tr").length;
    if(rowCount ===0){
        Swal.fire({
            title: "Error",
            text: "No hay detalles para cambiar la tasa",
            icon: "error",
            allowOutsideClick: () => false,
        });
        document.getElementById("chk_tasa_actual").checked = false;
        document.getElementById("chk_tasa_admision").checked = true;
        return;
    }
    Swal.fire({
        title: "¿Desea cambiar la tasa de las admisiones?",
        text: "Esto actualizará la tasa de todas las admisiones seleccionadas.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {

            detalles.forEach((detalle) => {
                detalle.tasa = Number(detalle.tasa_anterior);
                detalle.tasa_anterior = Number(0);                
                detalle.precio = Number(Number(detalle.precio_usd) * Number(detalle.tasa)).toFixed(2);
                detalle.precio_bs_cant = Number(Number(detalle.precio_usd_cant) * Number(detalle.tasa)).toFixed(2);
            });
            Swal.fire({
                title: "Tasa actualizada",
                text: "La tasa de las admisiones ha sido actualizada correctamente.",
                icon: "success",
            });
            const tipoAgrupamiento = document.querySelector('input[name="rad_tipo_agrupamiento"]:checked').value; 
            switch (tipoAgrupamiento) {
                case "tipo":
                    agruparPorTipo(detalles)
                    break;               
                case "agrupada":
                    agruparPorTipo(detalles, "agrupada")
                    break;    
                default:
                    detalles_fatura(detalles)
                    break;
            }
            calcularTotales(nuevaTasa)

        }
    });
};

function calcularTotales (tasa_final){
    let totales = clasificarMontosImpuestos(detalles)

    let exento = obtenerTotalPrecioBsCantPorImpuesto(totales, "0.00");
    let bi16 = obtenerTotalPrecioBsCantPorImpuesto(totales, "0.16");
    let iva16 = bi16 * 0.16;

    document.getElementById("exento").value = exento.toFixed(2);
    document.getElementById("base_imponible").value = bi16.toFixed(2);
    document.getElementById("iva").value = iva16.toFixed(2);
    document.getElementById("igtf").value = "0.00";
    document.getElementById("total_factura").value = Number(exento + bi16 + iva16).toFixed(2);
    let total_usd = "0,00";
    total_usd = totales.reduce((sum, item) => sum + item.total_precio_usd_cant, 0).toFixed(2);
    let nota = `El valor total representa USD ${total_usd} calculados en base a ${tasa_final} BS/USD `

    document.getElementById('total_modal').value = Number(exento + bi16 + iva16).toFixed(2);
    document.getElementById('total_usd_modal').value=Number(total_usd).toFixed(2);
    
    document.getElementById("nota").value = nota
}

function validar_monto_bs(objeto) {
    var objeto_objetivo = objeto;
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
    return true;
}

function validar_monto(monto) {
    var filter = /^-?(\d{0,9}[.\s]?|)\d{0,3}$/;
    
    if (filter.test(monto)) {
        return true;
    } else {
        return false;
    }
}