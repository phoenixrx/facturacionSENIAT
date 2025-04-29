

    //const HOST = "https://facturacion.siac.historiaclinica.org";
    const HOST = "http://localhost:3001";
    const id_cli = 3;
    let detalles = [];
    let opciones_formatos = [];
    document.addEventListener("DOMContentLoaded", function(){
        opciones();
        tasa()
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('input[type="date"]').forEach(input => {
            input.value = today;
        });
    });
    async function tasa(){
        Swal.fire({
            title: `Consultando tasa...`,
            icon: 'info',
            allowOutsideClick: () => false,
        }); 
        Swal.showLoading()
        var url = `https://pruebas.siac.historiaclinica.org/api/bcv`;
        try {
            let data = await fetch(url);
            let tasas = await data.json();
            
            if (tasas.error) { 
                Swal.update({
                    title: `Error consultando tasa...`,
                    icon: 'info',
                    allowOutsideClick: () => false,
                }); 
                Swal.hideLoading()
                               
            } else {
                document.getElementById('chk_tasa_actual').dataset.tasa = Number(tasas.data.tasas.USD).toFixed(2);
                document.getElementById('tasa_actual').textContent = Number(tasas.data.tasas.USD).toFixed(2);
                
                Swal.close()
            }
            
            } catch (error) {
                Swal.update({
                    title: `Error consultando tasa...`,
                    icon: 'info',
                    allowOutsideClick: () => false,
                }); 
                Swal.hideLoading()
                console.log(error)
            } 
    }

async function opciones(){
    //cargar las opciones y los formatos
    let sel_formatos = document.getElementById("sel_formato");
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Cargando...";                                
            sel_formatos.appendChild(option);
    Swal.fire({
        title: `Espere mientras cargan las opciones`,
        icon: 'info',
        allowOutsideClick: () => false,
    }); 
    Swal.showLoading()
    var url = `${HOST}/api/opciones_factura/?id_cli=${id_cli}`;
    try {
        let op = await fetch(url);
        opciones_formatos = await op.json();
        console.log(opciones_formatos)
        if (opciones_formatos.opciones.error || isNaN(opciones_formatos.opciones.length)) { 
            Swal.close();
            sel_formatos.innerHTML = "";
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No hay formatos disponibles";                                
            sel_formatos.appendChild(option);
            
        } else {
            sel_formatos.innerHTML = "";
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Seleccione...";                                
            sel_formatos.appendChild(option);
            opciones_formatos.formatos.forEach(formato => {
                    const option = document.createElement("option");
                    option.value = formato[Object.keys(formato)[0]];
                    option.textContent = decodeHtml(formato[Object.keys(formato)[1]]);
                    option.dataset.path_formato = formato[Object.keys(formato)[2]];                                
                    sel_formatos.appendChild(option);
                });
                if (sel_formatos.options.length > 1) {
                    sel_formatos.selectedIndex = 1; // Selecciona el primer ítem después de "Seleccione..."
                }
            let consec = await consecutivos();
            document.getElementById("num_control").value = consec.consecutivos[0].num_control;
            document.getElementById("num_factura").value = consec.consecutivos[0].num_factura;
            Swal.close()
        }
        
        } catch (error) {
            console.log(error)
        } 
}

async function consecutivos(){
    Swal.fire({
        title: `Revisando consecutivos...`,
        icon: 'info',
        allowOutsideClick: () => false,
    }); 
    Swal.showLoading()
    var url = `${HOST}/api/consecutivos/?id_cli=${id_cli}`;
    try {
        let consecutivos = await fetch(url);
        consecutivos = await consecutivos.json();
        
        if (consecutivos.error || consecutivos.success==false) { 
            Swal.update({
                title: `Error al cargar los consecutivos`,
                text: "Debe cargar los consecutivos manualmente",
                icon: 'error',
                allowOutsideClick: () => false,
            });
            console.log(consecutivos.message)
            Swal.hideLoading()
            document.getElementById("num_control").readOnly = false;
            document.getElementById("num_factura").readOnly = false;            
        } else {
            Swal.close()
            return consecutivos;
        }
        
        } catch (error) {
            console.log(error)
        } 
}

document.getElementById("chk_contado").addEventListener("change", function() {
        
        if (this.checked) {
            document.querySelector(".row_credito").classList.add('d-none');            
        } else {
            document.querySelector(".row_credito").classList.remove('d-none');
        }
    });
    
async function cargar_tipo(tipo, select = document.getElementById("empre-seg"), subemp=null ){
    Swal.fire({
        title: `Espere mientras carga la data de Seguro/empresa/interno`,
        icon: 'info',
        allowOutsideClick: () => false,
    }); 
    Swal.showLoading()
    var url = `${HOST}/api/tipo_admision/?tipo=${tipo}&clinic_id=${id_cli}&subemp=${subemp}`;
    try {
        let parroquias = await fetch(url);
        const data = await parroquias.json();
        
        if (data.error || isNaN(data.length)) { 
            Swal.close();
            select.innerHTML = "";
            select.classList.add('d-none');
            
        } else {
            select.innerHTML = "";
            select.classList.remove('d-none');
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "Seleccione...";                                
                select.appendChild(option);
            data.forEach(parroquia => {
                const option = document.createElement("option");
                option.value = parroquia[Object.keys(parroquia)[0]];
                option.textContent = decodeHtml(parroquia[Object.keys(parroquia)[1]]);                                
                select.appendChild(option);
            });
            Swal.close()
        }
        
        } catch (error) {
            console.log(error)
        } 
}

function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

document.querySelectorAll('input[name="tipo_admision"]').forEach((radio) => {
    radio.addEventListener('change', function () {
        document.getElementById("tabla-admisiones").innerHTML = '';
        document.querySelector(".sumatoria").innerText = "0,00"
        if (this.checked) {
            switch (this.value) {
                case "E":
                    document.getElementById('empre-seg').disabled = false;
                    document.getElementById('empre-seg').classList.remove('d-none');
                    document.getElementById('sub_empresa').classList.add('d-none');
                    document.getElementById('sub_empresa').innerHTML= "";
                    cargar_tipo(this.value);                    
                    break;
                case "S":
                    document.getElementById('empre-seg').disabled = false;
                    document.getElementById('empre-seg').classList.remove('d-none');
                    document.getElementById('sub_empresa').classList.add('d-none');
                    document.getElementById('empre-seg').innerHTML= "";
                    cargar_tipo(this.value);
                    break;
                case "I":
                    document.getElementById('empre-seg').disabled = false;
                    document.getElementById('empre-seg').classList.remove('d-none');
                    document.getElementById('sub_empresa').classList.add('d-none');
                    document.getElementById('empre-seg').innerHTML= "";
                    cargar_tipo(this.value);
                    break;                                    
                default:
                    document.getElementById('empre-seg').disabled = true;
                    document.getElementById('empre-seg').classList.remove('d-none');
                    document.getElementById('sub_empresa').classList.add('d-none');
                    document.getElementById('empre-seg').innerHTML= "";
                    fetchAdmisiones(1,1000,'P')
                    break;
            }
       }
    });
});

document.getElementById('empre-seg').addEventListener('change', function () {
    document.querySelectorAll('input[name="tipo_admision"]').forEach((radio) => {        
        if(radio.checked){
            fetchAdmisiones(1,1000,radio.value)
            if(radio.value =='E'){
                cargar_tipo('sub',document.getElementById('sub_empresa'),this.value);
                return;
            }            
        }
    })
})

async function fetchAdmisiones(pagina = 1, porPagina = 1000, tipos) {
    
    document.querySelector(".sumatoria").innerText = "0,00";
    document.getElementById("tabla-admisiones").innerHTML = '';
    try {
        document.getElementById("tabla-admisiones").innerHTML =
        '<tr><td colspan="3" class="text-center">Cargando...</td></tr>';
        const fechaInicio = '2024-01-01'; // fecha anterior al inicio del sistema
        const fechaFin = new Date().toISOString().split('T')[0];
        const activos =[1];
        const agrupado = "s";
        // Obtener tipos de consulta seleccionados
        const tiposConsulta = [];

        if (tipos == 'sub'){
            tiposConsulta.push('E');
        }else{
            tiposConsulta.push(tipos);    
        }
        
        Swal.fire({
        title: "Generando la data",
        allowOutsideClick: () => false,
        });
        Swal.showLoading();
        const response = await fetch(`${HOST}/admisiones_admidet`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id_cli: id_cli,
            status_cierre: "abiertas",
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            tipos_consulta: tiposConsulta,
            activos: activos,
            page: pagina,
            perPage: porPagina,
            agrupado: agrupado,
        }),
        });

        if (!response.ok) {
        throw new Error("Error al obtener admisiones");
        }

        const data = await response.json();
        Swal.close();

        mostrarResultados(data, tipos);

    } catch (error) {
        Swal.fire({
        title: "Error",
        text: error,
        icon: "error",
        allowOutsideClick: () => false,
        });
        Swal.hideLoading();
        
        document.getElementById("tabla-admisiones").innerHTML =
        '<tr><td colspan="3" class="text-center text-danger">Error al cargar los datos</td></tr>';
    }
}

function mostrarResultados(data, tipos){
    
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

        if (data.resultados.length ===0){
          const fila = document.createElement("tr");
          fila.innerHTML =
            '<td></td><td></td><td></td><td class="text-center">No hay registros que mostrar</td><td></td><td></td><td></td>';
          tabla.appendChild(fila);
          
            return;
        }        

        data.resultados.forEach((admision) => {

            const fila = document.createElement("tr");

            // Oculta las admisiones que son presupuestos
            fila.className = `${
                admision.solo_ppto == 1 ? "d-none" : ""
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

            let switch_admision =`<div class='form-check form-switch'>
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
        switches.forEach(switch_inp=>{            
            switch_inp.addEventListener('click', function(){
                const totalSum = Array.from(document.querySelectorAll('.admisiones_switch:checked'))
                .reduce((sum, switchElement) => sum + parseFloat(switchElement.getAttribute('data-monto')), 0);
                document.querySelector(".sumatoria").innerText = totalSum.toFixed(2)
            // document.getElementById('row_'+switch_inp.id).remove()
            })
        })
    
}

document.getElementById('sub_empresa').addEventListener('change', function () {
    if (this.value == "") {
        fetchAdmisiones(1,1000,'E', document.getElementById('empre-seg').value)
    }else{
        fetchAdmisiones(1,1000,'sub', this.value)
    }
    
})

document.getElementById('aceptar_lista').addEventListener('click', function () {
    const selectedAdmisiones = Array.from(document.querySelectorAll('.admisiones_switch:checked'));
    const selectedIds = selectedAdmisiones.map(admision => admision.value);
    const selectedPacientes = selectedAdmisiones.map(admision => admision.getAttribute('data-paciente'));
    const selectedCedulas = selectedAdmisiones.map(admision => admision.getAttribute('data-cedula'));
    const selectedTitulares = selectedAdmisiones.map(admision => admision.getAttribute('data-titular'));
    const selectedCedTitulars = selectedAdmisiones.map(admision => admision.getAttribute('data-cedtitular'));
    const selectedMontos = selectedAdmisiones.map(admision => admision.getAttribute('data-monto'));
    const selectedTasa = selectedAdmisiones.map(admision => admision.getAttribute('data-tasa'));
    fetchDetalles(selectedIds)
    
})

async function fetchDetalles(admisiones) {    
    if(admisiones.length == 0){
        Swal.fire({
            title: "Error",
            text: "No hay admisiones seleccionadas",
            icon: "error",
            allowOutsideClick: () => false,
        });
        return;
    }
    try {
                        
        Swal.fire({
            title: "Generando la data",
            allowOutsideClick: () => false,
        });
        
        Swal.showLoading();
        const response = await fetch(`${HOST}/detalles_admision`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                admisiones: admisiones
            }),
        });

        if (!response.ok) {
        throw new Error("Error al obtener admisiones");
        }

        const data = await response.json();
        Swal.close();

        detalles = data.resultados.map((detalle) => {
            return {
                id_admision: detalle.id_admision,
                id_detalle: detalle.id_admidet,
                grupo: detalle.grupo_estudio,
                tipo: detalle.tipo_estudio,
                direccion: detalle.direccion,
                fecha_admision: detalle.fecha_admision,
                direccion_join: detalle.empresa_direccion || detalle.seguro_direccion,
                precio: detalle.precio,
                rif: detalle.empresa_rif || detalle.seguro_rif ||detalle.cedula_titular,
                precio_usd: detalle.precio_usd,
                precio_usd_cant: Number(detalle.precio_usd)*Number(detalle.cantidad),
                precio_bs_cant: Number(detalle.precio)*Number(detalle.cantidad),
                cantidad: detalle.cantidad,                
                cedula_paciente: detalle.cedula_paciente,
                nombre_paciente: detalle.nombre_completo_paciente,
                cedula_titular: detalle.cedula_titular.trim(), 
                nombre_titular: detalle.nombre_completo_titular,
                seguro_empresa:detalle.empresa || detalle.seguro,
                tasa: detalle.tasa,
                estudio: detalle.estudio,
                impuesto: detalle.impuesto
            };
        });

        //ordenamos los detalles para que el primero sea el mas reciente
        detalles.sort((a, b) => {
            const idA = Number(a.id_admision);
            const idB = Number(b.id_admision);

            if (idA < idB) return 1; 
            if (idA > idB) return -1;
            return 0; 
        });
        
        document.getElementById("dir_fiscal").value = detalles[0].direccion_join || detalles[0].direccion;
        document.getElementById("rif").value = detalles[0].rif.trim() || detalles[0].cedula_titular.trim() ||detalles[0].cedula_paciente.trim();
        document.getElementById("razon_social").value = detalles[0].seguro_empresa || detalles[0].nombre_titular.trim() || detalles[0].nombre_paciente.trim();
        document.getElementById("fecha_atencion").value = new Date(detalles[0].fecha_admision).toISOString().split('T')[0];
        const pacientes = detalles.map(detalle => detalle.nombre_paciente);
        const uniquePacientes = [...new Set(pacientes)];

        const primerosCinco = uniquePacientes.slice(0, 5).join(", ");
        const resto = uniquePacientes.length > 5 ? "..." : "";
        document.getElementById("pacientes").value = `${primerosCinco} ${resto}`;
        document.getElementById("pacientes").style.height = "33px";
        if(uniquePacientes.length >3){
            document.getElementById("pacientes").style.height = "auto";
        }
        const tasas = detalles.map(detalle => detalle.tasa);
        const uniqueTasa = [...new Set(tasas)];
        if(uniqueTasa.length > 1){
            document.getElementById('tasa_admi').textContent = "Tasas varias";
        }else{
            document.getElementById('tasa_admi').textContent = uniqueTasa[0];
        }

        const tipoAgrupamiento = document.querySelector('input[name="rad_tipo_agrupamiento"]:checked').value; 

        const table = document.getElementById("table_detalle");
        table.innerHTML = ""; // Limpiar tabla  
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
        
        calcularTotales(document.getElementById('tasa_admi').textContent)

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
   
    } catch (error) {
        Swal.fire({
        title: "Error",
        text: error,
        icon: "error",
        allowOutsideClick: () => false,
        });
        Swal.hideLoading();
    }
}

function detalles_fatura(data) {
    const table = document.getElementById("table_detalle");
    const tbody = document.createElement("tbody");
    table.innerHTML="";
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
        row.innerHTML = `
        <td>${detalle.estudio}</td>
        <td class="text-center">${detalle.cantidad}</td>
        <td class="text-end">${Number(Number(detalle.precio).toFixed(2)*Number(detalle.cantidad).toFixed(2)).toFixed(2)}</td>
        <td class="text-end">${Number(Number(detalle.precio_usd).toFixed(2)*Number(detalle.cantidad).toFixed(2)).toFixed(2)}</td>
        <td class="text-center">${(Number(detalle.impuesto).toFixed(2)==0.00)?"E":Number(detalle.impuesto).toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
        
        table.appendChild(tbody);

        marcar_max_lines()
}

function agruparPorTipo(data, formato ="tipo") {
    const resultado = {};

    data.forEach(item => {
        
        const tipo = (formato=="tipo") ? item.tipo: item.grupo;

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
        resultado[tipo].precio_total += parseFloat(item.precio);
        resultado[tipo].precio_usd_total += parseFloat(item.precio_usd);
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
    table.innerHTML="";
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
        row.classList.add("row_puntero");
        row.innerHTML = `<td>${detalle.tipo}</td>
            <td class="text-center">${detalle.cantidad_total}</td>
            <td class="text-end">${Number(detalle.precio_total).toFixed(2)}</td>
            <td class="text-end">${Number(detalle.precio_usd_total).toFixed(2)}</td>
            <td class="text-center">${(Number(detalle.impuesto_total).toFixed(2)==0.00)?"E":Number(detalle.impuesto).toFixed(2)}</td>`;
        row.addEventListener('click', function(){
            const detallesEstudio = detalle.detalles.map(det => {
                return `
                <tr>
                    <td>${det.estudio}</td>
                    <td class="text-center">${det.cantidad}</td>
                    <td class="text-end">${Number(det.precio).toFixed(2)}</td>
                    <td class="text-end">${Number(det.precio_usd).toFixed(2)}</td>
                    <td class="text-center">${(Number(det.impuesto).toFixed(2)==0.00)?"E":Number(det.impuesto).toFixed(2)}</td>
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

    marcar_max_lines()
}

document.querySelector('.card_detalle-close').addEventListener('click', function (){
    document.querySelector(".card_detalle").classList.add('d-none');    
})
document.querySelectorAll('input[name="rad_tipo_agrupamiento"]').forEach((radio) => {
    radio.addEventListener('click', function () {
        
        if(detalles.length==0){
            return;
        }
        switch (this.value) {
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
    });
});

function clasificarMontosImpuestos(data) {
    // Creamos un objeto para almacenar los resultados agrupados por impuesto
    const resultados = {};

    // Iteramos sobre cada elemento del JSON
    data.forEach(item => {
        const impuesto = item.impuesto; // Obtenemos el valor de impuesto
        const precioBsCant = parseFloat(item.precio_bs_cant); // Convertimos a número
        const precioUsdCant = parseFloat(item.precio_usd_cant); // Convertimos a número

        // Si el impuesto no existe en el objeto de resultados, lo inicializamos
        if (!resultados[impuesto]) {
            resultados[impuesto] = {
                total_precio_bs_cant: 0,
                total_precio_usd_cant: 0
            };
        }

        // Sumamos los valores al grupo correspondiente
        resultados[impuesto].total_precio_bs_cant += precioBsCant;
        resultados[impuesto].total_precio_usd_cant += precioUsdCant;
    });

    // Convertimos el objeto de resultados a un array para facilitar su uso
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

document.getElementById("dir_fiscal").addEventListener("dblclick", function () {
    this.readOnly = !this.readOnly;
});

document.getElementById("pacientes").addEventListener("dblclick", function () {
    this.readOnly = !this.readOnly;
});

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

document.querySelectorAll('input[name="tasa_chk"]').forEach((switchElement) => {
    switchElement.addEventListener('change', function () {
        if (this.checked) {
            switch (this.id) {
                case "chk_tasa_actual":
                    const nuevaTasa = parseFloat(this.dataset.tasa);
                    cambiar_tasa_actual(nuevaTasa)
                    break;            
                default:
                    cambiar_tasa_admision(document.getElementById('tasa_admi').textContent)
                    break;
            }
            
        }
    });
});

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
    console.log(nuevaTasa)
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
    document.getElementById("total_factura").value = (exento + bi16 + iva16).toFixed(2);
    let total_usd = "0,00";
    total_usd = totales.reduce((sum, item) => sum + item.total_precio_usd_cant, 0).toFixed(2);
    var nota = `El valor total representa USD ${total_usd} calculados en base a ${tasa_final} BS/USD `
    document.getElementById("nota").value = nota
}