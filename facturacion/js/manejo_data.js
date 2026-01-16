function mostrarResultados(data, tipos) {

    const tabla = document.getElementById("tabla-admisiones");
    tabla.classList.add("table")
    tabla.classList.add("table-striped")
    tabla.classList.add("table-hover")
    tabla.innerHTML = ""; // Limpiar tabla

    if (
        !data.resultados ||
        data.resultados.error ||
        data.resultados.length === 0
    ) {
        const fila = document.createElement("tr");
        fila.innerHTML =
            '<td colspan="10" class="text-center">No hay registros que mostrar</td>';
        tabla.appendChild(fila);
        return;
    }

    const thead = document.createElement("thead");
    thead.innerHTML = `           
                <th>Selec.</th>
                <th>Ced.Pac.</th>
                <th>Paciente</th>
                <th>Titular</th>
                <th>Clave</th>
                <th class="text-end text-nowrap">Precio Bs</th>
                <th>Fecha</th>
        `;

    tabla.appendChild(thead);
    thead.classList.add("table-dark");
    const tbody = document.createElement("tbody");

    switch (tipos) {
        case 'S':
            data.resultados = data.resultados.filter(admision => admision.id_seguro == document.getElementById('empre-seg').value);
            break;
        case 'E':
            data.resultados = data.resultados.filter(admision => admision.id_empresa == document.getElementById('empre-seg').value);
            break;
        case 'I':
            data.resultados = data.resultados.filter(admision => admision.id_tipo_interno == document.getElementById('empre-seg').value);
            break;
        case 'sub':
            data.resultados = data.resultados.filter(admision => admision.id_subempresa == document.getElementById('sub_empresa').value);
            break;
        default:
            break;
    }

    if (data.resultados.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML =
            '<td></td><td></td><td></td><td class="text-center">No hay registros que mostrar</td><td></td><td></td><td></td>';
        tabla.appendChild(fila);

        return;
    }

    data.resultados.forEach((admision) => {

        const fila = document.createElement("tr");

        // Oculta las admisiones que son presupuestos
        fila.className = `${admision.solo_ppto == 1 ? "d-none" : ""
            }`;

        // Formatear fecha dd/mm/yyyy
        const fechaAdmision = new Date(admision.fecha_admision);
        const fechaFormateada = `${fechaAdmision
            .getDate()
            .toString()
            .padStart(2, "0")}/${(fechaAdmision.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${fechaAdmision.getFullYear()}`;
        // Formatear montos
        const precioBs = parseFloat(admision.precio || 0).toFixed(2);

        let switch_admision = `<div class='form-check form-switch'>
                                    <input class='form-check-input admisiones admisiones_switch'
                                    data-paciente='${admision.nombre_completo_paciente}'
                                    data-cedula='${admision.cedula_paciente}'
                                    data-titular='${admision.nombre_completo_titular}'
                                    data-cedtitular='${admision.cedula_titular}'
                                    data-tasa='${admision.tasa}'
                                    data-monto='${precioBs}'
                                    type='checkbox' role='switch' id='admision${admision.id_admision}'  
                                value='${admision.id_admision}'></div>`;

        fila.innerHTML = `
                <td>${switch_admision}</td>
                <td class="text-nowrap">${admision.cedula_paciente}</td>
                <td>${admision.nombre_completo_paciente}</td>
                <td>${admision.nombre_completo_titular}</td>
                <td>${admision.clave || ""}</td>
                <td class="text-nowrap text-end">Bs ${precioBs}</td>                
                <td>${fechaFormateada}</td>`;
        tbody.appendChild(fila);
    });

    tabla.appendChild(tbody);

    var switches = document.querySelectorAll('.admisiones_switch')
    var monto_total = 0;
    switches.forEach(switch_inp => {
        switch_inp.addEventListener('click', function () {
            const totalSum = Array.from(document.querySelectorAll('.admisiones_switch:checked'))
                .reduce((sum, switchElement) => sum + parseFloat(switchElement.getAttribute('data-monto')), 0);
            document.querySelector(".sumatoria").innerText = totalSum.toFixed(2)
        })
    })

}

function detalles_fatura(data) {
    const table = document.getElementById("table_detalle");
    const tbody = document.createElement("tbody");
    table.innerHTML = "";
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
        <th>Descripcion</th>
        <th class="text-center">Cantidad</th>
        <th class="text-end">Precio</th>
        <th class="text-end">Precio USD</th>
        <th class="text-center">Impuesto</th>
        </tr>
    `;
    table.appendChild(thead);

    if (document.getElementById('chk_ocultar_ceros').checked == true) {
        data = data.filter(detalle => Number(detalle.precio_bs_cant) !== 0);
    }

    data.forEach(detalle => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${detalle.estudio}</td>
        <td class="text-center">${detalle.cantidad}</td>
        <td class="text-end">${Number(Number(detalle.precio).toFixed(2) * Number(detalle.cantidad).toFixed(2)).toFixed(2)}</td>
        <td class="text-end">${Number(Number(detalle.precio_usd).toFixed(2) * Number(detalle.cantidad).toFixed(2)).toFixed(2)}</td>
        <td class="text-center">${(Number(detalle.impuesto).toFixed(2) == 0.00) ? "E" : Number(detalle.impuesto).toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    const selectedAdmisiones = Array.from(document.querySelectorAll('.admisiones_switch:checked'));
    const admisiones = selectedAdmisiones.map(admision => admision.value);
    if (admisiones.length == 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const admision = urlParams.get('admision');
        if (admision && !isNaN(admision)) {
            fetchDescuentos([admision]);
        }
    } else {
        fetchDescuentos(admisiones);
    }


    marcar_max_lines()
}

function agruparPorTipo(data, formato = "tipo") {
    const resultado = {};
    if (document.getElementById('chk_ocultar_ceros').checked == true) {
        data = data.filter(detalle => detalle.precio_bs_cant !== 0);
    }

    data.forEach(item => {

        const tipo = (formato == "tipo") ? item.tipo : item.grupo;

        // Si el tipo no existe en el resultado, inicializamos su estructura
        if (!resultado[tipo]) {
            resultado[tipo] = {
                tipo: tipo,
                cantidad_total: 0,
                precio_total: 0,
                precio_usd_total: 0,
                impuesto_total: 0,
                detalles: []
            };
        }

        // Sumamos los valores correspondientes
        resultado[tipo].cantidad_total += item.cantidad;
        resultado[tipo].precio_total += parseFloat(item.precio) * parseFloat(item.cantidad);
        resultado[tipo].precio_usd_total += parseFloat(item.precio_usd) * parseFloat(item.cantidad);
        resultado[tipo].impuesto_total = parseFloat(item.impuesto);

        // Agregamos el detalle del registro al grupo
        resultado[tipo].detalles.push({
            id_admision: item.id_admision,
            id_detalle: item.id_detalle,
            estudio: item.estudio,
            precio: parseFloat(item.precio),
            precio_usd: parseFloat(item.precio_usd),
            cantidad: item.cantidad,
            impuesto: parseFloat(item.impuesto)
        });
    });

    // Convertimos el objeto a un array para facilitar su uso
    let detalles = Object.values(resultado);

    const table = document.getElementById("table_detalle");
    const tbody = document.createElement("tbody");
    table.innerHTML = "";
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
        <th>Descripcion</th>
        <th class="text-center">Cantidad</th>
        <th class="text-end">Precio</th>
        <th class="text-end">Precio USD</th>
        <th class="text-center">Impuesto</th>
        </tr>
    `;
    table.appendChild(thead);

    detalles.forEach(detalle => {

        const row = document.createElement("tr");
        if (Number(detalle.precio_total).toFixed(2) == 0.00 && document.getElementById('chk_ocultar_ceros').checked == true) {
            row.classList.add("d-none");
        }
        row.classList.add("row_puntero");
        row.innerHTML = `<td>${detalle.tipo}</td>
            <td class="text-center">${detalle.cantidad_total}</td>
            <td class="text-end">${Number(detalle.precio_total).toFixed(2)}</td>
            <td class="text-end">${Number(detalle.precio_usd_total).toFixed(2)}</td>
            <td class="text-center">${(Number(detalle.impuesto_total).toFixed(2) == 0.00) ? "E" : Number(detalle.impuesto_total).toFixed(2)}</td>`;
        row.addEventListener('click', function () {
            const detallesEstudio = detalle.detalles.map(det => {
                return `
                <tr>
                    <td>${det.estudio}</td>
                    <td class="text-center">${det.cantidad}</td>
                    <td class="text-end">${Number(det.precio * det.cantidad).toFixed(2)}</td>
                    <td class="text-end">${Number(det.precio_usd * det.cantidad).toFixed(2)}</td>
                    <td class="text-center">${(Number(det.impuesto).toFixed(2) == 0.00) ? "E" : Number(det.impuesto).toFixed(2)}</td>
                </tr>`;
            }).join('');
            const detallesModal = document.querySelector(".card_detalle-table");
            document.querySelector(".card_detalle").classList.remove('d-none');
            document.querySelector(".card_detalle-header").innerHTML = detalle.tipo;
            detallesModal.innerHTML = ""; // Limpiar tabla  
            const thead = `<thead><tr>
                <th>Descripcion</th>
                <th class="text-center">Cantidad</th>
                <th class="text-end">Precio</th>
                <th class="text-end text-nowrap">Precio USD</th>
                <th class="text-center">Impuesto</th>
                </tr></thead>`;
            detallesModal.innerHTML = thead + detallesEstudio;
        })
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    const selectedAdmisiones = Array.from(document.querySelectorAll('.admisiones_switch:checked'));
    const admisiones = selectedAdmisiones.map(admision => admision.value);
    fetchDescuentos(admisiones);
    marcar_max_lines()
}
document.getElementById('chk_ocultar_ceros').addEventListener('change', function () {

    let tipoAgrupamiento = document.querySelector('input[name="rad_tipo_agrupamiento"]:checked').value;

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
})

async function agruparPorcentual(data) {
    const resultado = {};
    if (document.getElementById('chk_ocultar_ceros').checked == true) {
        data = data.filter(detalle => detalle.precio_bs_cant !== 0);
    }
    const admisiones = data.map(item => item.id_detalle);

    try {
        Swal.fire({
            title: "Generando la data",
            allowOutsideClick: () => false,
        });

        Swal.showLoading();
        const response = await fetch(`${HOST}/api/detalle_porcentual`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                admisiones: admisiones
            }),
        });
        Swal.close();
        if (!response.ok) {
            throw new Error("Error al obtener admisiones");
        }

        const data = await response.json();
        if (data.success == false) {
            Swal.fire({
                title: "La admision no ha sido encontrada",
                allowOutsideClick: () => false,
            });
            Swal.hideLoading()
            alert("La admision no ha sido encontrada")
            return;
        }


        const table = document.getElementById("table_detalle");
        const tbody = document.createElement("tbody");
        table.innerHTML = "";
        const thead = document.createElement("thead");
        thead.innerHTML = `
                <tr>
                <th>Descripcion</th>
                <th class="text-center">Cantidad</th>
                <th class="text-end">Precio</th>
                <th class="text-end">Precio USD</th>
                <th class="text-center">Impuesto</th>
                </tr>
            `;
        table.appendChild(thead);

        tbody.innerHTML = generarTabla(data.resultados)
        table.appendChild(tbody);
        const selectedAdmisiones = Array.from(document.querySelectorAll('.admisiones_switch:checked'));
        const admisionesid = selectedAdmisiones.map(admision => admision.value);
        fetchDescuentos(admisionesid);
        marcar_max_lines()

    } catch (error) {
        Swal.fire({
            title: "Error",
            text: error,
            icon: "error",
            confirmButtonColor: "#008b8b",
            allowOutsideClick: () => false,
        });
        Swal.hideLoading();
    }
}

function generarTabla(json_data) {

    // Paso 1: Filtrar los datos donde estudio_activo sea null o "1"
    const datosFiltrados = json_data.filter(item =>
        item.estudio_activo === null || item.estudio_activo === "1" || item.estudio_activo === "0"
    );

    // Paso 2: Agrupar por estudio_descripcion
    const grupos = {};
    datosFiltrados.forEach(item => {
        if (!grupos[item.estudio_descripcion]) {
            grupos[item.estudio_descripcion] = [];
        }
        grupos[item.estudio_descripcion].push(item);
    });

    // Paso 3: Generar la tabla HTML
    let tablaHTML = "";
    for (const estudioDescripcion in grupos) {
        const grupo = grupos[estudioDescripcion];

        // Si el primer elemento del grupo tiene descripcion null, insertar directamente
        if (grupo[0].descripcion === null) {
            const item = grupo[0];
            const cantidad = item.cantidad || 1; // Asegurar que cantidad no sea null
            const precio = parseFloat(item.precio) || 0;
            const precioUSD = parseFloat(item.precio_usd) || 0;
            const valPorcent = parseFloat(item.val_porcent) / 100 || 1; // Convertir a decimal

            const precioCalculado = (precio * cantidad) * valPorcent;
            const precioUSDCalculado = (precioUSD * cantidad) * valPorcent;
            let impuesto = (item.impuesto == 0.00) ? "E" : item.impuesto;
            tablaHTML += `
                <tr>
                    <td>${estudioDescripcion}</td>
                    <td class='text-center'>${cantidad}</td>
                    <td class='text-end'>${precioCalculado.toFixed(2)}</td>
                    <td class='text-end'>${precioUSDCalculado.toFixed(2)}</td>
                    <td class='text-center'>${impuesto}</td>
                </tr>
            `;
        } else {
            // Agregar fila para el nombre del estudio
            tablaHTML += `<tr><td class='' colspan="6">${estudioDescripcion}</td></tr>`;

            // Iterar sobre los detalles del grupo
            grupo.forEach(detalle => {
                const cantidad = detalle.cantidad || 1; // Asegurar que cantidad no sea null
                const precio = parseFloat(detalle.precio) || 0;
                const precioUSD = parseFloat(detalle.precio_usd) || 0;
                const valPorcent = parseFloat(detalle.val_porcent) / 100 || 1; // Convertir a decimal

                const precioCalculado = (precio * cantidad) * valPorcent;
                const precioUSDCalculado = (precioUSD * cantidad) * valPorcent;
                let impuesto = (detalle.impuesto == 0.00) ? "E" : item.impuesto;
                tablaHTML += `
                    <tr>
                        <td class='text-end fw-bold' style="font-size:small">${detalle.detalle_descripcion || "N/A"}</td>
                        <td class='text-center'>${cantidad}</td>
                        <td class='text-end'>${precioCalculado.toFixed(2)}</td>
                        <td class='text-end'>${precioUSDCalculado.toFixed(2)}</td>
                        <td class='text-center'>${impuesto}</td>
                    </tr>
                `;
            });
        }
    }
    tablaHTML += "</table>";

    return tablaHTML;
}
function clasificarMontosImpuestos(data) {

    const resultados = {};

    data.forEach(item => {
        const impuesto = item.impuesto; // Obtenemos el valor de impuesto
        const precioBsCant = parseFloat(item.precio_bs_cant); // Convertimos a número
        const precioUsdCant = parseFloat(item.precio_usd_cant); // Convertimos a número


        if (!resultados[impuesto]) {
            resultados[impuesto] = {
                total_precio_bs_cant: 0,
                total_precio_usd_cant: 0
            };
        }


        resultados[impuesto].total_precio_bs_cant += precioBsCant;
        resultados[impuesto].total_precio_usd_cant += precioUsdCant;
    });

    return Object.keys(resultados).map(impuesto => ({
        impuesto: impuesto,
        total_precio_bs_cant: resultados[impuesto].total_precio_bs_cant,
        total_precio_usd_cant: resultados[impuesto].total_precio_usd_cant
    }));
}

function obtenerTotalPrecioBsCantPorImpuesto(resultados, impuesto) {
    // Buscamos el objeto en el array que coincida con el impuesto dado
    const resultado = resultados.find(item => item.impuesto === impuesto);

    // Si encontramos un resultado, devolvemos el total_precio_bs_cant
    if (resultado) {
        return resultado.total_precio_bs_cant;
    }

    // Si no encontramos ningún resultado, devolvemos 0 
    return 0; // O puedes lanzar un error o devolver null según tus necesidades
}