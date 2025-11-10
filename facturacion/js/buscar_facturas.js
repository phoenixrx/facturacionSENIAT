let debounceTimer;

async function buscarFacturas() {
    
    const factura = document.getElementById('factura_buscar').value.trim();
    const razon_social = document.getElementById('razon_buscar').value.trim() + "%";
    const rif = document.getElementById('rif_buscar').value.trim() + "%";
    if (
      (factura == "") &&
      (razon_social=="%") && 
      (rif=="%") 
    ) {
      document.getElementById('tabla-buscar').innerHTML='';
      document.getElementById('paginacion').innerHTML='';
      
    }
    if (
      (factura.length < 5) &&
      (razon_social.length < 6) && // +1 por el %
      (rif.length < 6) // +1 por el %
    ) {
      return;
    }

    // Construir la URL con parámetros
    let url = `/api/examinar-facturas?id_cli=${encodeURIComponent(configs_token.id_cli)}`;
    if (factura) url += `&factura=${encodeURIComponent(factura)}`;
    if (razon_social) url += `&razon_social=${encodeURIComponent(razon_social)}`;
    if (rif) url += `&rif=${encodeURIComponent(rif)}`;
    Swal.fire({
          
          title: 'Buscando...',
          text: 'Espere mientras buscamos.',
        });
      Swal.showLoading();
    // Hacer la petición fetch
   try{
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }        
        });
        const data = await response.json();
        Swal.close();
      mostrarResultadosBusqueda(data);
    }
    catch(error) {
      console.error('Error al obtener facturas:', error);
    };
}


function mostrarResultadosBusqueda(data) {
  const tabla = document.getElementById('tabla-buscar');
  tabla.innerHTML = ''; // Limpiar tabla

  if (!data.result || data.result.length === 0) {
    tabla.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron facturas.</td></tr>';
    return;
  }

  // Crear encabezado de la tabla
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = ['', 'Factura', 'Fecha Emisión', 'RIF', 'Razón Social', 'Total'];
  headers.forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.classList.add('table-dark')
  thead.appendChild(headerRow);
  tabla.appendChild(thead);

  // Crear cuerpo de la tabla
  const tbody = document.createElement('tbody');

  data.result.forEach((factura, index) => {
    const row = document.createElement('tr');

    // Columna 1: Radio Button
    const td1 = document.createElement('td');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'seleccion_factura';
    radio.value = factura.id_factura;
    radio.className = 'id_facturas';
    if (index === 0) radio.checked = true; // Seleccionar el primero por defecto
    td1.appendChild(radio);
    row.appendChild(td1);

    // Columna 2: Número de factura
    const td2 = document.createElement('td');
    td2.textContent = factura.factura;
    row.appendChild(td2);

    // Columna 3: Fecha de emisión (formateada)
    const td3 = document.createElement('td');
    td3.textContent = formatDate(factura.fecha_emision);
    row.appendChild(td3);

    // Columna 4: RIF
    const td4 = document.createElement('td');
    td4.textContent = factura.rif;
    row.appendChild(td4);

    // Columna 5: Razón Social
    const td5 = document.createElement('td');
    td5.textContent = factura.razon_social;
    row.appendChild(td5);

    // Columna 6: Total
    const td6 = document.createElement('td');
    td6.textContent = parseFloat(factura.total).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    row.appendChild(td6);

    tbody.appendChild(row);
  });

  tabla.appendChild(tbody);

  // Mostrar paginación si hay más de una página
  if (data.pagination && data.pagination.totalPages > 1) {
    generarPaginacionBusqueda(data.pagination);
  } else {
    document.getElementById('paginacion').innerHTML = '';
  }
}



document.getElementById('factura_buscar').addEventListener('input', () => {
  reiniciarDebounce();
});
document.getElementById('razon_buscar').addEventListener('input', () => {
  reiniciarDebounce();
});
document.getElementById('rif_buscar').addEventListener('input', () => {
  reiniciarDebounce();
});

['factura_buscar', 'razon_buscar', 'rif_buscar'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarFacturas();
    }
  });
});

// Función que reinicia el temporizador
function reiniciarDebounce() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(buscarFacturas, 2000); // 2 segundos
}

// Función para generar la paginación con Bootstrap
function generarPaginacionBusqueda(pagination) {
  const container = document.getElementById('paginacion');
  container.innerHTML = '';

  const paginationEl = document.createElement('ul');
  paginationEl.className = 'pagination';

  // Botón Anterior
  const prevLi = document.createElement('li');
  prevLi.className = 'page-item' + (pagination.pagina === 1 ? ' disabled' : '');
  const prevLink = document.createElement('a');
  prevLink.className = 'page-link';
  prevLink.href = '#';
  prevLink.textContent = 'Anterior';
  prevLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (pagination.pagina > 1) {
      cargarPagina(pagination.pagina - 1);
    }
  });
  prevLi.appendChild(prevLink);
  paginationEl.appendChild(prevLi);

  let paginas_total = Math.min(pagination.totalPages, 15);
  // Páginas
  for (let i = 1; i <= paginas_total; i++) {
    const li = document.createElement('li');
    li.className = 'page-item' + (i === pagination.pagina ? ' active' : '');
    const link = document.createElement('a');
    link.className = 'page-link';
    link.href = '#';
    link.textContent = i;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      cargarPagina(i);
    });
    li.appendChild(link);
    paginationEl.appendChild(li);
  }

  // Botón Siguiente
  const nextLi = document.createElement('li');
  nextLi.className = 'page-item' + (pagination.pagina === pagination.totalPages ? ' disabled' : '');
  const nextLink = document.createElement('a');
  nextLink.className = 'page-link';
  nextLink.href = '#';
  nextLink.textContent = 'Siguiente';
  nextLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (pagination.pagina < pagination.totalPages) {
      cargarPagina(i);
    }
  });
  nextLi.appendChild(nextLink);
  paginationEl.appendChild(nextLi);

  container.appendChild(paginationEl);
}

// Función para recargar una página específica
async function cargarPagina(numeroPagina) {
  
  const factura = document.getElementById('factura_buscar').value.trim();
  const razon_social = document.getElementById('razon_buscar').value.trim() +"%";
  const rif = document.getElementById('rif_buscar').value.trim() +"%";

  let url = `/api/examinar-facturas?id_cli=${encodeURIComponent(configs_token.id_cli)}&pagina=${numeroPagina}`;
  if (factura) url += `&factura=${encodeURIComponent(factura)}`;
  if (razon_social) url += `&razon_social=${encodeURIComponent(razon_social)}`;
  if (rif) url += `&rif=${encodeURIComponent(rif)}`;
    try{
      Swal.fire({
          
          title: 'Buscando...',
          text: 'Espere mientras buscamos.',
        });
      Swal.showLoading();
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }        
        });
        const data = await response.json();
      Swal.close();
      mostrarResultadosBusqueda(data);
    }
    catch(error) {
      console.error('Error al obtener facturas:', error);
    };
}

document.getElementById('buscar_modal').addEventListener('click', async () => {
  
  const radioSeleccionado = document.querySelector('input[name="seleccion_factura"]:checked');

  if (!radioSeleccionado) {
    Swal.fire({
      icon: 'warning',
      title: 'Seleccione una factura',
      text: 'Por favor, seleccione una factura.',
      confirmButtonColor: "#008b8b",
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const id_factura = radioSeleccionado.value;
        Swal.fire({          
          title: 'Generando...',
          text: 'Reconstruyendo la factura.',
        });
      Swal.showLoading();
  try {
    // Llamar al endpoint con el id_factura seleccionado
    const response = await fetch(`/api/devolver-factura?id_factura=${encodeURIComponent(id_factura)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }        
        });
    Swal.close();
    if (!response.ok) {
      throw new Error('Error en la solicitud');
    }

    const data = await response.json();

    if (data.success) {
      mostrarFacturaSeleccionada(data.result);
      IDFACT=id_factura
    } else {
       Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener la factura.',
          confirmButtonColor: "#008b8b",
          confirmButtonText: 'Aceptar'
        });
    }
  } catch (error) {
    console.error('Error al obtener la factura:', error);
    
  }
});
function mostrarFacturaSeleccionada(factura){
      STATUS_FACTURA = 2;
      generada= true;
      if(document.getElementById('agregar_admi')){
      document.getElementById('agregar_admi').remove()
      document.getElementById('nueva_factura').classList.remove('d-none')
          let divFactFactura = document.getElementById('div_fact_factura');
          if (divFactFactura) {
            let newDiv = divFactFactura.cloneNode(true);
            divFactFactura.parentNode.replaceChild(newDiv, divFactFactura);
            if (newDiv.firstElementChild) {
              newDiv.firstElementChild.classList.add('mascara-gris');
            }
            
          }}
  detalles = "";
  detalles = [{
    id_admision:factura[0].id_admision,
    factura:factura[0].factura
  }]
  document.querySelector('.btn-group').classList.add('d-none');
  document.getElementById('factura_modal').value = factura[0].factura;
  document.getElementById('num_factura').value = factura[0].factura;
  document.getElementById('num_control').value = factura[0].num_control;
  document.getElementById('pacientes').value = factura[0].paciente;
  document.getElementById('titular').value = factura[0].paciente;
  document.getElementById('nota').textContent = factura[0].nota;
  document.getElementById('rif').value = factura[0].rif;
  document.getElementById('razon_social').value = factura[0].razon_social;
  document.getElementById('dir_fiscal').textContent = factura[0].direccion_f;
  document.getElementById('fecha_atencion').value = factura[0].fecha_atencion ? factura[0].fecha_atencion.split('T')[0] : '';
  document.getElementById('fecha_emision').value = factura[0].fecha_emision ? factura[0].fecha_emision.split('T')[0] : '';
  document.getElementById('sel_formato').value = factura[0].formato_factura;
  document.getElementById('exento').value = factura[0].exento;
  document.getElementById('base_imponible').value = factura[0].bi16;
  document.getElementById('iva').value = factura[0].iva16;
  document.getElementById('igtf').value = factura[0].igtf;
  document.getElementById('descuentos').value = factura[0].descuentos;
  if(Number(factura[0].descuentos)>0){
      document.querySelector('.descuento_div').classList.remove('d-none');
  }
  document.getElementById('total_factura').value = factura[0].total;
document.getElementById('table_detalle').innerHTML='';
  generarTablaDetallesBusqueda(factura)
  
}
function generarTablaDetallesBusqueda(data) {
  // Crear thead
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = ['Descripción', 'Cantidad', 'Precio', 'Precio USD', 'Impuesto'];

  headers.forEach(text => {
    const th = document.createElement('th');
    if (text === 'Cantidad') th.classList.add('text-center');
    if (text === 'Precio' || text === 'Precio USD') th.classList.add('text-end');
    if (text === 'Impuesto') th.classList.add('text-center');
    th.textContent = text;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  document.getElementById('table_detalle').appendChild(thead);

  // Crear tbody
  const tbody = document.createElement('tbody');

  data.forEach(item => {
    const row = document.createElement('tr');

    // Descripción
    const tdDescripcion = document.createElement('td');
    tdDescripcion.textContent = item.descripcion;
    row.appendChild(tdDescripcion);

    // Cantidad
    const tdCantidad = document.createElement('td');
    tdCantidad.textContent = item.cantidad;
    tdCantidad.classList.add('text-center');
    row.appendChild(tdCantidad);

    // Precio
    const tdPrecio = document.createElement('td');
    tdPrecio.textContent = parseFloat(item.precio).toLocaleString('es-VE', { minimumFractionDigits: 2 });
    tdPrecio.classList.add('text-end');
    row.appendChild(tdPrecio);

    // Precio USD
    const tdPrecioUSD = document.createElement('td');
    tdPrecioUSD.textContent = parseFloat(item.precio_usd_tasa).toLocaleString('en-US', { minimumFractionDigits: 2 });
    tdPrecioUSD.classList.add('text-end');
    row.appendChild(tdPrecioUSD);

    // Impuesto (solo letra inicial)
    const tdImpuesto = document.createElement('td');
    tdImpuesto.textContent = item.impuesto.charAt(0).toUpperCase(); // 'Exento' -> 'E'
    tdImpuesto.classList.add('text-center');
    row.appendChild(tdImpuesto);

    tbody.appendChild(row);
  });
document.getElementById('table_detalle').appendChild(tbody);
  
}