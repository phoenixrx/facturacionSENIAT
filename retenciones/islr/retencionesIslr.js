const codigos_retenciones = [];

cargar_codigos()
async function cargar_codigos() {
    fetch('https://facturacion.siac.historiaclinica.org/api/retenciones/codigos-islr', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }        
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            console.log(result.error)
            Swal.fire({
                title: 'Error',
                text: 'No se han cargado los codigos de retenciones',
                icon: 'error',
                allowOutsideClick: false,                
            });
        }else{
            result.data.forEach(codigo => {
                codigos_retenciones.push(codigo)                
            })
            cargarSelect()
        }
    })
}

function cargarSelect(){
    const is_juridico = document.querySelector('input[name="tipoContribuyenteIsrl"]:checked').value;
    
    const is_residente = document.getElementById('contribuyenteResidente').checked ? 1 : 0;

    const juridicoNum = parseInt(is_juridico);
    const residenteNum = parseInt(is_residente);
    
    const primerFiltro = codigos_retenciones.filter(codigo => 
        codigo.is_juridico === juridicoNum 
    );
    
    const segundoFiltro = primerFiltro.filter(codigo => 
        codigo.is_residente === residenteNum
    );

    const codigosISLR =segundoFiltro;
   
    const selectConcepto = document.getElementById('conceptoIslr');
        selectConcepto.innerHTML = ''; 
        if (codigosISLR.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay conceptos disponibles para esta selección';
            selectConcepto.appendChild(option);
            selectConcepto.disabled = true;
            return;
        }

        selectConcepto.disabled = false;
        const option = document.createElement('option');
            option.value = "";
            option.textContent = `--SELECCIONE--`;
            selectConcepto.appendChild(option);
        codigosISLR.forEach(codigo => {
            const option = document.createElement('option');
            option.value = codigo.id;
            option.textContent = `${codigo.codigo_seniat_isrl} - ${codigo.descripcion}`;
            selectConcepto.appendChild(option);
        });
        
        if (selectConcepto.options.length > 0) {
            selectConcepto.selectedIndex = 0;
        }
    
}

document.querySelectorAll('.filtro_select').forEach(element => {
    element.addEventListener('change', () => {
        document.getElementById('btn_savIslr').classList.add('pe-none');
        cargarSelect();                 
    });
})

function limpiarTodo(){
    contribuyente=0;
    retencionIslr=0;

    document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        input.value = '';
    });
 
    document.getElementById('juridico').checked = true;
    document.getElementById('natural').checked = false;
    document.getElementById('contribuyenteResidente').checked = true;
    

    // Restablecer valores por defecto
    document.getElementById('porcentAplicable').value = '0';
    document.getElementById('porcentajeBaseImponible').value = '0';
    document.getElementById('totalBaseImponible').value = '0';
    document.getElementById('numeroDocumento').value = '0';
    document.getElementById('numeroControl').value = '0';
    document.getElementById('totalUT').value = '0';
    document.getElementById('menosSustraendo').value = '0';
    document.getElementById('fecha_operacion').value = toDateInputValue(new Date());

    // Limpiar campos de solo lectura
    document.getElementById("num_comprobante").classList.remove("is-valid");
    //recalcular();
}

document.getElementById('conceptoIslr').addEventListener('change', function() {
    if(this.value==''){
        document.getElementById('btn_savIslr').classList.add('pe-none');
    }else{
        document.getElementById('btn_savIslr').classList.remove('pe-none');
    }    
})