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
            document.getElementById("num_control").value = Number(consec.consecutivos[0].num_control) + 1;
            let num_factura = consec.consecutivos[0].num_factura;
            
            let originalLength = num_factura.length;
            num_factura = Number(num_factura) + 1;
            num_factura = num_factura.toString();
            let num_factura_formateado = num_factura.padStart(originalLength, '0');
  
            document.getElementById("num_factura").value = num_factura_formateado;
            document.getElementById("factura_modal").value = num_factura_formateado;
            factura_modal
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
        console.log(data)
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
        console.log(error)
        document.getElementById("tabla-admisiones").innerHTML =
        '<tr><td colspan="3" class="text-center text-danger">Error al cargar los datos</td></tr>';
    }
}

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
        if (data.success == false){
            Swal.fire({
                title: "La admision no ha sido encontrada",
                allowOutsideClick: () => false,
            });
            alert("La admision no ha sido encontrada")
            return;
        }
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
            document.getElementById('tasa_admi').textContent = Number(uniqueTasa[0]).toFixed(2);
        }
        let tasa_promedio = detalles.reduce((sum, detalle) => sum + Number(detalle.tasa), 0) / detalles.length; 

        document.getElementById('chk_tasa_admision').dataset.tasa =tasa_promedio.toFixed(2);
        
        let tipoAgrupamiento = document.querySelector('input[name="rad_tipo_agrupamiento"]:checked').value; 

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

async function fetchMoneda() {
    document.getElementById('moneda_desglose').innerHTML = '<option value="">Cargando...</option>';
    const response = await fetch(
        "https://pruebas.siac.historiaclinica.org/cargar_query",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filtros: [id_cli], id_query: 14 }),
        }
    );     
    const monedas = await response.json();
    var opciones = `<option value="">...</option>`;
    
    monedas.forEach(moneda=>{
        opciones += `<option value=${moneda.id_moneda}>${moneda.simbolo}</option>`
    })
    document.getElementById('moneda_desglose').innerHTML = opciones;
}

async function fetchFormaPago() {
    document.getElementById('forma_de_pago').innerHTML = '<option value="">Cargando...</option>';
    let id_moneda =document.getElementById('moneda_desglose').value;
    if(id_moneda == ""){
        document.getElementById('forma_de_pago').innerHTML = '<option value="">Seleccione moneda...</option>';
        return;
    }
    const response = await fetch(
        "https://pruebas.siac.historiaclinica.org/cargar_query",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filtros: [id_cli, id_moneda], id_query: 15 }),
        }
    );     
    let formas_pago = await response.json();
    formas_pago.sort((a, b) => a.credito - b.credito);

    if(id_moneda == 1){
        formas_pago = formas_pago.filter(fp => fp.credito !== 1);
    }

    var opciones = `<option value="">...</option>`;
    
    formas_pago.forEach(fp=>{
        opciones += `<option value=${fp.id_forma_pago}>${fp.descripcion}</option>`
    })
    document.getElementById('forma_de_pago').innerHTML = opciones;
}