async function tasa(){
    Swal.fire({
        title: `Consultando tasa...`,
        icon: 'info',
        allowOutsideClick: () => false,
    }); 
    Swal.showLoading()
    var url = `${HOST2}/api/bcv`;
    try {
        let data = await fetch(url);
        let tasas = await data.json();
        let opciones = await opciones_tasa()
        
        if (tasas.error) { 
            Swal.update({
                title: `Error consultando tasa...`,
                icon: 'info',
                allowOutsideClick: () => false,
            }); 
            Swal.hideLoading()
                            
        } else {
            var tasa =(opciones[0].USD_EUR=='USD') ? tasas.data.tasas.USD: tasas.data.tasas.EUR
            document.getElementById('chk_tasa_actual').dataset.tasa = Number(tasa).toFixed(2);
            document.getElementById('tasa_actual').textContent = Number(tasa).toFixed(2);
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

async function opciones_tasa() {  
  try {
          const response = await fetch(
          "https://pruebas.siac.historiaclinica.org/cargar_query",
          {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filtros: [configs_token.id_cli], id_query: 18, id_contenedor:0 }),
          }
      );
      const opciones = await response.json();         
      return opciones;
    }catch(error){
      return error;
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
    var url = `${HOST}/api/opciones_factura/?id_cli=${configs_token.id_cli}`;
    try {
        let op = await fetch(url);
        opciones_formatos = await op.json();
        
        if (opciones_formatos.opciones.error || isNaN(opciones_formatos.opciones.length)) { 
            
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
    var url = `${HOST}/api/consecutivos/?id_cli=${configs_token.id_cli}`;
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
            Authorization: `Bearer ${token}`
        }, 
        body: JSON.stringify({
            id_cli: configs_token.id_cli,
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
        Swal.close()
         
        if (response.status===401) {
            Swal.fire({
                title: "Error",
                text: "El token ha expirado o no es válido, vuelva a iniciar sessión",
                icon: "error",
                confirmButtonColor: "#008b8b",
                allowOutsideClick: false,
            });
            return;
        }
        if (!response.ok) {
            throw new Error("Error al obtener admisiones");
        }

        const data = await response.json();
        mostrarResultados(data, tipos);
    } catch (error) {
        Swal.fire({
        title: "Error1",
        text: error,
        icon: "error",
        confirmButtonColor: "#008b8b",
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
            title: "Error2",
            text: "No hay admisiones seleccionadas",
            icon: "error",
                   confirmButtonColor: "#008b8b",
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
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                admisiones: admisiones
            }),
        });
        Swal.close()
        if (response.status===401) {
            Swal.fire({
                title: "Error",
                text: "El token ha expirado o no es válido, vuelva a iniciar sessión",
                icon: "error",
                confirmButtonColor: "#008b8b",
                allowOutsideClick: false,
            });
            return;
        }
        if (!response.ok) {
        throw new Error("Error al obtener admisiones");
        }

        const data = await response.json();

        

        if (data.success == false){
            Swal.fire({
                title: "La admision no ha sido encontrada",
                allowOutsideClick: () => false,
            });
            Swal.hideLoading();
            //alert("La admision no ha sido encontrada")
            return error;
        }
       

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
                tasa_admision: detalle.tasa,
                estudio: detalle.estudio,
                impuesto: detalle.impuesto,
                inventario: detalle.inventario
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
        const Titulares = detalles.map(detalle => detalle.nombre_titular.trim());
         
        let titular=obtenerPrimerValorNoVacio(Titulares)
        if (titular =='Vacio'){
            titular="";
        }
        document.getElementById("dir_fiscal").value = detalles[0].direccion_join || detalles[0].direccion;
        document.getElementById("rif").value = detalles[0].rif.trim() || detalles[0].cedula_titular.trim() ||detalles[0].cedula_paciente.trim();
        document.getElementById("razon_social").value = detalles[0].seguro_empresa || titular || detalles[0].nombre_paciente.trim();
        document.getElementById("fecha_atencion").value = new Date(detalles[0].fecha_admision).toISOString().split('T')[0];
        document.getElementById("pacientes").style.height = "33px";

        if (arreglo_pacientes.length<1){
            arreglo_pacientes=[{cedula: detalles[0].cedula_paciente, paciente: detalles[0].nombre_paciente}]            
        }
        
        const pacientes = generarStringPacientes(arreglo_pacientes);
        const uniquePacientes = [...arreglo_pacientes];

        document.getElementById("pacientes").value = `${pacientes}`;
     
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
            case "porcentual":
                    agruparPorcentual(detalles)
                    break;   
            default:
                detalles_fatura(detalles)
                break;
        }

    } catch (error) {
        console.log(error)
        
    }
}

async function fetchMoneda() {
    document.getElementById('moneda_desglose').innerHTML = '<option value="">Cargando...</option>';
    const response = await fetch(
        `${HOST2}/cargar_query`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filtros: [configs_token.id_cli], id_query: 14 }),
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
        `${HOST2}/cargar_query`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filtros: [configs_token.id_cli, id_moneda], id_query: 15 }),
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

async function fetchDescuentos(admisiones) {
    
    const response = await fetch(
        `${HOST2}/api/promociones_admi/?admisiones=${admisiones}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },            
        }
    );     
    let formas_pago = await response.json();
    
    if(formas_pago.success==false){
        document.querySelector('.descuento_div').classList.add('d-none')
        return
    }
    
    let detalles=formas_pago.resultados;

    const filtrados = detalles.filter(item => item.activo === 1);
    if (filtrados.length === 0) {
      return;
    }
    const total = filtrados.reduce((suma, item) => {
        return suma + parseFloat(item.promo_monto);
    }, 0);
    const table = document.getElementById("table_detalle");
    const tbody = document.createElement("tbody");

    filtrados.forEach(detalle => {
        const row = document.createElement("tr");
        row.classList.add('table-info')
        row.innerHTML = `<td>${detalle.promo}</td>
            <td class="text-center">1</td>
            <td class="text-end">-${Number(detalle.promo_monto).toFixed(2)}</td>
            <td class="text-end">-</td>
            <td class="text-center">-</td>`;
        tbody.appendChild(row);    
        })
        
    table.appendChild(tbody);
    document.getElementById('descuentos').value=Number(total).toFixed(2);
    document.getElementById('total_factura').value =Number((
        Number(document.getElementById('exento').value)+
        Number(document.getElementById('base_imponible').value)+
        Number(document.getElementById('igtf').value)+
        Number(document.getElementById('iva').value))-total).toFixed(2)
    document.getElementById('total_modal').value =document.getElementById('total_factura').value 
    document.getElementById('total_usd_modal').value =Number(Number(document.getElementById('total_modal').value)/Number(document.getElementById('tasa_modal').value)).toFixed(2)
    document.querySelector('.descuento_div').classList.remove('d-none')
    

}

async function verif_admision(admision) {
    var url = `${HOST}/api/factura_admision/?id_admision=${admision}`;
    try {
        let factura_admision = await fetch(url);
        let datas = await factura_admision.json();
         console.log(datas)
        if(datas.success==false ){
                 Swal.fire({
                    title: "Facturacion",
                    text: datas.message,
                    icon: "error",
                    confirmButtonColor: "#008b8b",
                })
                Swal.hideLoading();    
                return;
        }
       
        
        } catch (error) {
            console.log(error)
        } 
        fetchDetalles([admision]);
}
