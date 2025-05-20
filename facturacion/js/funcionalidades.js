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
                   confirmButtonColor: "#008b8b",
            allowOutsideClick: () => false,
        });
        document.getElementById("chk_tasa_actual").checked = false;
        document.getElementById("chk_tasa_admision").checked = true;
        document.getElementById("chk_tasa_perso").checked = false;
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
                case "porcentual":
                    agruparPorcentual(detalles)
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
                   confirmButtonColor: "#008b8b",
            allowOutsideClick: () => false,
        });
        document.getElementById("chk_tasa_actual").checked = false;
        document.getElementById("chk_tasa_admision").checked = true;
        document.getElementById("chk_tasa_perso").checked = false;
         
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
                detalle.tasa = Number(detalle.tasa_admision);
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
                case "porcentual":
                    agruparPorcentual(detalles)
                    break;  
                default:
                    detalles_fatura(detalles)
                    break;
            }
            calcularTotales(nuevaTasa)

        }
    });
};

function cambiar_tasa_personalizada(nuevaTasa) {
    const table = document.getElementById("table_detalle");
    const rowCount = table.getElementsByTagName("tr").length;
    if(rowCount ===0){
        Swal.fire({
            title: "Error",
            text: "No hay detalles para cambiar la tasa",
            icon: "error",
                   confirmButtonColor: "#008b8b",
            allowOutsideClick: () => false,
        });
        document.getElementById("chk_tasa_actual").checked = false;
        document.getElementById("chk_tasa_admision").checked = true;
        document.getElementById("chk_tasa_perso").checked = false;
         
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
                let tasa =  nuevaTasa;
                detalle.tasa = Number(tasa); 
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
                case "porcentual":
                    agruparPorcentual(detalles)
                    break;   
                default:
                    detalles_fatura(detalles)
                    break;
            }
            calcularTotales(nuevaTasa)

        }else{
            document.getElementById('chk_tasa_perso').checked =false;
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

    let descuentos = Number(document.getElementById("descuentos").value).toFixed(2);
    let valor = Number(Number(exento + bi16 + iva16)-Number(descuentos)).toFixed(2);

    document.getElementById("total_factura").value = valor;
    
    document.getElementById("total_modal").setAttribute("data-ph-valor", valor);

    

    let total_usd = "0,00";
    total_usd = totales.reduce((sum, item) => sum + item.total_precio_usd_cant, 0).toFixed(2);
    let nota = `El valor total representa USD ${total_usd} calculados en base a ${tasa_final} BS/USD `

    document.getElementById('total_modal').value = Number(exento + bi16 + iva16).toFixed(2);
    document.getElementById('total_usd_modal').value=Number(total_usd).toFixed(2);
    
    document.getElementById("nota").value = nota
}

function validar_monto_bs(objeto) {
    
    var objeto_objetivo = objeto;
    var monto = objeto.value;
    
    if (!validar_monto(monto)) {
        objeto.classList.add('is-invalid')
        objeto.focus();
        const quitar_validacion = setTimeout(() => {
                objeto_objetivo.classList.remove('is-invalid')
                clearTimeout(quitar_validacion);
            }, "5000");
            return "invalido";
    }
    objeto_objetivo.classList.remove('is-invalid')
    
    return true;
}

function validar_monto(monto) {
    // Expresión regular para validar números con un punto decimal opcional
    var filter = /^-?\d+(\.\d+)?$/;
    return filter.test(monto);
}

function obtenerPrimerValorNoVacio(array) {
    
    for (let i = 0; i < array.length; i++) {
    
        if (array[i].trim() !== "") {
            return array[i].trim(); 
        }
    }
    
    return "Vacio";
}

function generarStringPacientes(pacientes) {
    cantidad_pacientes= opciones_formatos.opciones[0].cantidad_pacientes;
    mostrar_cedula = (opciones_formatos.opciones[0].mostrar_cedulas==1)?true:false;
    // Limitamos la cantidad de pacientes al tamaño del array si es necesario


    const limite = Math.min(cantidad_pacientes, pacientes.length);

    // Mapeamos los primeros 'n' pacientes según el formato deseado
    const resultado = pacientes.slice(0, limite).map(paciente => {
        let texto = paciente.paciente;
        if (mostrar_cedula) {
            const soloNumero = paciente.cedula.replace(/[^0-9]/g, '');
            texto += ` C.I.${paciente.cedula}`;
        }
        return texto;
    });

    let pacientes_join = resultado.join('; ')

    if(resultado.length<pacientes.length){
        pacientes_join+="; ..."
    }

    return pacientes_join;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
