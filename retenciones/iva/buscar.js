// Variables globales
let timeoutBusqueda = null;
let paginaActual = 1;
let terminoActual = '';
let filtroActual = 'proveedor_nombre';
let comprobanteSeleccionado = null;

// Inicializar la modal
document.addEventListener('DOMContentLoaded', function () {
    inicializarModalBusqueda();
});

function inicializarModalBusqueda() {
    const modal = document.getElementById('modalBuscarComprobante');
    const filtroSelect = document.getElementById('filtroBusqueda');
    const terminoInput = document.getElementById('terminoBusqueda');

    if (!modal || !filtroSelect || !terminoInput) return;

    // Evento cuando se muestra la modal
    modal.addEventListener('show.bs.modal', function () {
        resetearBusqueda();
        const radios = document.querySelectorAll('input[name="comprobanteSeleccionado"]');
        radios.forEach(radio => radio.checked = false);
        actualizarBotonSeleccion();
    });

    // Evento cuando cambia el tipo de filtro
    filtroSelect.addEventListener('change', function () {
        filtroActual = this.value;
        actualizarTextoAyuda();
        // Si hay término de búsqueda, realizar nueva búsqueda
        if (terminoActual.trim()) {
            realizarBusqueda();
        }
    });

    // Evento input con debounce
    terminoInput.addEventListener('input', function (e) {
        terminoActual = e.target.value.trim();
        actualizarContador(0); // Resetear contador

        // Mostrar mensaje inicial si está vacío
        if (!terminoActual) {
            mostrarMensajeInicial();
            return;
        }

        // Debounce: esperar 500ms después de que el usuario deje de escribir
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(() => {
            paginaActual = 1; // Resetear a primera página
            realizarBusqueda();
        }, 500);
    });

    // Evento para permitir búsqueda con Enter
    terminoInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(timeoutBusqueda);
            paginaActual = 1;
            realizarBusqueda();
        }
    });
}

function actualizarTextoAyuda() {
    const textoAyuda = document.getElementById('textoAyuda');
    if (!textoAyuda) return;

    const textos = {
        'proveedor_nombre': 'Buscar por nombre del proveedor',
        'proveedor_rif': 'Buscar por RIF del proveedor (Ej: J-123456789)',
        'numero_comprobante': 'Buscar por número de comprobante (Ej: 2025-05-00000001)'
    };

    textoAyuda.textContent = textos[filtroActual] || 'Buscar...';
}

function actualizarContador(total) {
    const contador = document.getElementById('contadorBusqueda');
    if (contador) {
        contador.textContent = `${total} resultado${total !== 1 ? 's' : ''}`;
    }
}
function resetearBusqueda() {
    paginaActual = 1;
    terminoActual = '';
    filtroActual = 'proveedor_nombre';
    comprobanteSeleccionado = null;

    // Resetear UI
    document.getElementById('terminoBusqueda').value = '';
    document.getElementById('filtroBusqueda').value = 'proveedor_nombre';
    actualizarTextoAyuda();
    actualizarContador(0);
    mostrarMensajeInicial();

    // Limpiar selección visual
    const todasLasFilas = document.querySelectorAll('#cuerpoTablaResultados tr');
    todasLasFilas.forEach(fila => fila.classList.remove('selected'));
}



function mostrarMensajeInicial() {
    document.getElementById('loadingBusqueda').classList.add('d-none');
    document.getElementById('sinResultados').classList.add('d-none');
    document.getElementById('contenedorTabla').classList.add('d-none');
    document.getElementById('contenedorPaginacion').classList.add('d-none');
    document.getElementById('mensajeInicial').classList.remove('d-none');
    document.getElementById('btnSeleccionarComprobante').classList.add('d-none');
}

function mostrarLoading() {
    document.getElementById('mensajeInicial').classList.add('d-none');
    document.getElementById('sinResultados').classList.add('d-none');
    document.getElementById('contenedorTabla').classList.add('d-none');
    document.getElementById('contenedorPaginacion').classList.add('d-none');
    document.getElementById('loadingBusqueda').classList.remove('d-none');
}

function mostrarResultados() {
    document.getElementById('loadingBusqueda').classList.add('d-none');
    document.getElementById('mensajeInicial').classList.add('d-none');
    document.getElementById('contenedorTabla').classList.remove('d-none');
    document.getElementById('contenedorPaginacion').classList.remove('d-none');
}

function mostrarSinResultados() {
    document.getElementById('loadingBusqueda').classList.add('d-none');
    document.getElementById('mensajeInicial').classList.add('d-none');
    document.getElementById('contenedorTabla').classList.add('d-none');
    document.getElementById('contenedorPaginacion').classList.add('d-none');
    document.getElementById('sinResultados').classList.remove('d-none');
}

async function realizarBusqueda() {
    if (!terminoActual) {
        mostrarMensajeInicial();
        return;
    }

    switch (filtroActual) {
        case 'numero_comprobante':
            if (!terminoActual.match(/^\d{4}-\d{2}-\d{8}$/)) {
                mostrarMensajeInicial();
                return;
            }
            break;
        default:
            if (terminoActual.length < 3) {
                mostrarMensajeInicial();
                return;
            }
            break;
    }
    mostrarLoading();

    try {
        // Construir parámetros de búsqueda
        const params = new URLSearchParams();
        params.append(filtroActual, terminoActual);
        params.append('page', paginaActual);
        params.append('limit', 5);
        params.append('id_cli', parent.configs_token.id_cli);


        const response = await fetch(`https://facturacion.siac.historiaclinica.org/api/retenciones/iva?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await response.json();

        if (data.success) {
            actualizarContador(data.pagination.total);
            renderizarResultados(data.data, data.pagination);

            if (data.data.length > 0) {
                mostrarResultados();
                document.getElementById('btnSeleccionarComprobante').classList.remove('d-none');
            } else {
                mostrarSinResultados();
                document.getElementById('btnSeleccionarComprobante').classList.add('d-none');
            }
        } else {
            throw new Error(data.error || 'Error en la búsqueda');
        }

    } catch (error) {
        console.error('Error en búsqueda:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo realizar la búsqueda: ' + error.message,
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        mostrarMensajeInicial();
    }
}

function renderizarResultados(resultados, pagination) {
    const tbody = document.getElementById('cuerpoTablaResultados');
    tbody.innerHTML = '';

    resultados.forEach(comprobante => {
        const tr = document.createElement('tr');

        // Agregar clase de danger si está anulado
        if (comprobante.activo === 0 || comprobante.activo === false) {
            tr.classList.add('table-danger');
        }

        // Hacer la fila clickeable
        tr.style.cursor = 'pointer';
        tr.onclick = function (e) {
            // No seleccionar si se hace clic en el radio directamente
            if (e.target.type !== 'radio') {
                const radio = this.querySelector('input[type="radio"]');
                if (radio && !radio.disabled) {
                    radio.checked = true;
                    actualizarSeleccion(parseInt(radio.value));
                }
            }
        };

        tr.innerHTML = `
            <td>
                <div class="">
                    <input class="form-check-input" type="radio" name="comprobanteSeleccionado" 
                           value="${comprobante.id}" id="comp${comprobante.id}"
                           onchange="actualizarSeleccion(${comprobante.id})">                    
                </div>
            </td>
            <td>${comprobante.numero_comprobante || 'N/A'}</td>
            <td>${comprobante.proveedor_nombre || 'N/A'}</td>
            <td>${comprobante.proveedor_rif || 'N/A'}</td>
            <td>${formatearFecha(comprobante.fecha_retencion)}</td>
            <td>${formatearMonto(comprobante.total_documento)}</td>
            <td>
                <span class="badge ${comprobante.activo ? 'bg-success' : 'bg-danger'}">
                    ${comprobante.activo ? 'Activo' : 'Anulado'}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderizarPaginacion(pagination);

    // Actualizar estado del botón de selección
    actualizarBotonSeleccion();
}

function actualizarBotonSeleccion() {
    const btnSeleccionar = document.getElementById('btnSeleccionarComprobante');
    const radioSeleccionado = document.querySelector('input[name="comprobanteSeleccionado"]:checked');

    if (btnSeleccionar) {
        if (radioSeleccionado) {
            btnSeleccionar.classList.remove('d-none');
            btnSeleccionar.disabled = false;

            // Verificar si el comprobante seleccionado está anulado
            const comprobanteId = parseInt(radioSeleccionado.value);
            const fila = radioSeleccionado.closest('tr');
            btnSeleccionar.dataset.radioseleccionado = comprobanteId;
            if (fila && fila.classList.contains('table-danger')) {
                btnSeleccionar.disabled = true;
            } else {
                btnSeleccionar.disabled = false;
            }

        } else {
            btnSeleccionar.classList.add('d-none');
            btnSeleccionar.dataset.radioseleccionado = "";
            btnSeleccionar.disabled = true;
        }
    }
}


function actualizarSeleccion(idComprobante) {
    comprobanteSeleccionado = idComprobante;

    // Remover clase selected de todas las filas
    const todasLasFilas = document.querySelectorAll('#cuerpoTablaResultados tr');
    todasLasFilas.forEach(fila => fila.classList.remove('selected'));

    // Agregar clase selected a la fila seleccionada
    const radioSeleccionado = document.querySelector(`input[value="${idComprobante}"]:checked`);
    if (radioSeleccionado) {
        const filaSeleccionada = radioSeleccionado.closest('tr');
        if (filaSeleccionada) {
            filaSeleccionada.classList.add('selected');
        }
    }

    actualizarBotonSeleccion();
}

function renderizarPaginacion(pagination) {
    const paginacionContainer = document.getElementById('paginacionResultados');
    paginacionContainer.innerHTML = '';

    const { page, totalPages, hasNext, hasPrev } = pagination;

    // Botón Anterior
    const liPrev = document.createElement('li');
    liPrev.className = `page-item ${hasPrev ? '' : 'disabled'}`;
    liPrev.innerHTML = `
        <a class="page-link" href="#" ${hasPrev ? `onclick="cambiarPagina(${page - 1})"` : ''}>
            &laquo; Anterior
        </a>
    `;
    paginacionContainer.appendChild(liPrev);

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === page ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>`;
        paginacionContainer.appendChild(li);
    }

    // Botón Siguiente
    const liNext = document.createElement('li');
    liNext.className = `page-item ${hasNext ? '' : 'disabled'}`;
    liNext.innerHTML = `
        <a class="page-link" href="#" ${hasNext ? `onclick="cambiarPagina(${page + 1})"` : ''}>
            Siguiente &raquo;
        </a>
    `;
    paginacionContainer.appendChild(liNext);
}

function cambiarPagina(pagina) {
    paginaActual = pagina;
    realizarBusqueda();
    // Scroll to top de la tabla
    document.getElementById('contenedorTabla').scrollTop = 0;
}

function seleccionarComprobante() {
    if (!comprobanteSeleccionado) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor seleccione un comprobante',
            icon: 'warning',
            confirmButtonText: 'Ok'
        });
        return;
    }

    // Verificar si está anulado
    const radioSeleccionado = document.querySelector(`input[value="${comprobanteSeleccionado}"]`);
    if (radioSeleccionado) {
        const fila = radioSeleccionado.closest('tr');
        if (fila && fila.classList.contains('table-danger')) {
            Swal.fire({
                title: 'No permitido',
                text: 'No se puede seleccionar un comprobante anulado',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            return;
        }
    }

    const bootstrapModal = bootstrap.Modal.getInstance(document.getElementById('modalBuscarComprobante'));
    bootstrapModal.hide();

    devolverComprobanteSeleccionado(comprobanteSeleccionado);
}

document.getElementById('btnSeleccionarComprobante').addEventListener('click', function () {
    seleccionarComprobante();
})

document.getElementById('modalBuscarComprobante').addEventListener('shown.bs.modal', function () {
    setTimeout(() => {
        document.getElementById('terminoBusqueda').focus();
    }, 100);
});

async function devolverComprobanteSeleccionado(comprobante) {
    Swal.fire({
        title: 'Buscando comprobante...',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    const response = await fetch(`https://facturacion.siac.historiaclinica.org/api/retenciones/iva?id=${comprobante}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    const data = await response.json();
    Swal.close()
    if (data.success) {
        buscarProveedor(data.data[0].proveedor_rif)

        document.getElementById("num_comprobante").value = data.data[0].numero_comprobante; // Assuming this is already in the desired format from the API
        document.getElementById("fechaEmision").value = formatearFechaDDMMYYYY(data.data[0].fecha_retencion); // YYYY-MM-DD
        document.getElementById("fecha_operacion").value = formatearFechaUsa(data.data[0].fecha_creacion); // DD/MM/YYYY
        document.getElementById("tipoRetencion").value = data.data[0].tipo;
        document.getElementById("documentoRetencion").value = data.data[0].id_tipo_documento;
        document.getElementById("numeroDocumento").value = data.data[0].numero_documento;
        document.getElementById("numeroControl").value = data.data[0].numero_control;
        document.getElementById("numeroDocumentoAf").value = data.data[0].numero_afectado;
        document.getElementById("numeroExpediente").value = data.data[0].numero_expediente;
        document.getElementById("totalBaseImponible").value = data.data[0].base_imponible;
        document.getElementById("totalExento").value = data.data[0].total_exento;
        document.getElementById("totalIva").value = data.data[0].total_iva;
        document.getElementById("totalDocumento").value = data.data[0].total_documento;
        document.getElementById("alicuota").value = data.data[0].alicuota;
        document.getElementById("porcentajeRetener").value = data.data[0].porcent_retencion;
        document.getElementById("totalIvaRetenido").value = data.data[0].total_iva_retenido;
        document.getElementById("totalPagado").value = Number(data.data[0].base_imponible) + Number(data.data[0].total_exento);
        document.getElementById("totalRetener").value = data.data[0].total_iva_retenido;


        retencionIva = data.data[0].id;
        document.getElementById('btn_sav_iva').classList.add('pe-none');
        document.getElementById("num_comprobante").classList.add("is-valid");
        setTimeout(() => {
            document.getElementById("fecha_operacion").focus();
        }, 500);


    } else {
        Swal.fire({
            title: 'Error',
            text: data.error || 'Error al cargar el comprobante',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    }
}
