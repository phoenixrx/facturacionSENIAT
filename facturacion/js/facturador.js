    //const HOST = "https://facturacion.siac.historiaclinica.org";
    const HOST = "http://localhost:3001";
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    if (token) {
      localStorage.setItem("token", token);
      get_config_token()
    }
    let configs_token = [];
    
    function get_config_token () {
        const token = localStorage.getItem("token");

        fetch("https://pruebas.siac.historiaclinica.org/decodifica", {
          method: "GET",
          headers: {
              Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => response.json())
        .then((data) => {
            configs_token = data;
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            const expirationTime = configs_token.exp; // Expiration time in seconds
            const timeRemaining = expirationTime - currentTime;
      
            if (timeRemaining <= 0) {
                console.log("Token has already expired.");
                window.location.href = 'https://siac.empresas.historiaclinica.org/login.php'
                return;
          }})
            return configs_token;
    }

    const id_cli = configs_token.id_cli || 3;
    const id_usuario = configs_token.id_usuario || 1;
    let detalles = [];
    let opciones_formatos = [];
    let generada = false;

    var myModal = new bootstrap.Modal(document.getElementById('modal_pagos'), {keyboard: false});

document.addEventListener("DOMContentLoaded", function(){
    opciones();
    tasa();
    fetchMoneda();
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.value = today;
    });
    const urlParams = new URLSearchParams(window.location.search);
    const admision = urlParams.get('admision');
    if (admision && !isNaN(admision)) {
        fetchDetalles([admision]);
    }
});

document.getElementById("chk_contado").addEventListener("change", function() {        
    if (this.checked) {
        document.querySelector(".row_credito").classList.add('d-none');            
    } else {
        document.querySelector(".row_credito").classList.remove('d-none');
    }
});

document.querySelectorAll('input[name="tipo_admision"]').forEach((radio) => {
    radio.addEventListener('change', function () {
        document.getElementById("tabla-admisiones").innerHTML = '';
        document.querySelector(".sumatoria").innerText = "0,00";
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
        };
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
    document.querySelectorAll('.rowdesg').forEach(element => {
        element.remove();
    });
    calcular_desglose()
    document.querySelectorAll('.totalizables_modal').forEach(input => {
        input.value = "0.00";
    });

    fetchDetalles(selectedIds);

    if(obtenerPrimerValorNoVacio(selectedTitulares)!='Vacio'){
        document.getElementById('titular').value=obtenerPrimerValorNoVacio(selectedTitulares);
    }else{
        document.getElementById('titular').value="";        
    }

})

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

document.getElementById("dir_fiscal").addEventListener("dblclick", function () {
    this.readOnly = !this.readOnly;
});

document.getElementById("pacientes").addEventListener("dblclick", function () {
    this.readOnly = !this.readOnly;
});
document.getElementById("titular").addEventListener("dblclick", function () {
    this.readOnly = !this.readOnly;
});

document.querySelectorAll('input[name="tasa_chk"]').forEach((switchElement) => {
    
    switchElement.addEventListener('change', function () {
        document.querySelectorAll('.rowdesg').forEach(element => {
            element.remove();
        });
        calcular_desglose()
        document.querySelectorAll('.totalizables_modal').forEach(input => {
            input.value = "0.00";
        });
        if (this.checked) {
            switch (this.id) {
                case "chk_tasa_actual":
                    const nuevaTasa = parseFloat(this.dataset.tasa);
                    cambiar_tasa_actual(nuevaTasa)
                    break;     
                case "chk_tasa_perso":
                    this.dataset.tasa= document.getElementById('tasa_pers').value;
                    if(this.dataset.tasa <=0){
                        Swal.fire({
                            title: "Tasa invalida",
                            text: "La tasa personalizada no es valida",
                            icon: "info",
                            allowOutsideClick: () => false,
                        });
                        document.getElementById('tasa_pers').focus();
                        document.getElementById("chk_tasa_perso").checked = false;
                        return;
                    }
                    const nuevaTasaPerso = parseFloat(this.dataset.tasa);
                    if(validar_monto(this.dataset.tasa)){
                        cambiar_tasa_personalizada(nuevaTasaPerso)
                    }else{
                        Swal.fire({
                            title: "Tasa invalida",
                            text: `La tasa personalizada no es valida (${this.dataset.tasa})`,
                            icon: "info",
                            allowOutsideClick: () => false,
                        });
                        document.getElementById('tasa_pers').focus();
                        document.getElementById("chk_tasa_perso").checked = false;
                        return;
                    }
                    break    
                       
                default:
                    cambiar_tasa_admision(document.getElementById('tasa_admi').textContent)
                    break;
            }
            
        }
    });
});

document.getElementById('div_imprimir').addEventListener('click', imprimirFactura)

function pagar_factura (){
    /*const table = document.getElementById("table_detalle");
    const rowCount = table.getElementsByTagName("tr").length;
    if(rowCount ===0){
        Swal.fire({
            title: "Error",
            text: "Seleccione al menos una admision",
            icon: "error",
            allowOutsideClick: () => false,
        });
        return;
    }*/
    const STATUS_FACTURA =1
    switch (STATUS_FACTURA) {
        case '2' || 2:
            activar_modal('Factura cerrada, no puede modificar los pagos', 'info');

            return;
        case 2:
            activar_modal('Factura cerrada, no puede modificar los pagos', 'info');
            return;
        default:
            break;
    }
    if (STATUS_FACTURA == 2) {
        return
    }

    if(document.getElementById('chk_tasa_admision').checked==true && document.getElementById('tasa_admi').textContent.trim()== "Tasas varias"){
        let tasa_prom = document.getElementById('chk_tasa_admision').dataset.tasa;
        Swal.fire({
            title: "Tasas",
            text: "Las tasas debe unificarse con la tasa del dia o con una tasa personalizada, el promedio de las admisiones actualmente seleccionadas es de " +
                    tasa_prom + ", pero las admisiones tienen tasas diferentes, ¿desea usar este promedio como tasa de cobro?",
            showCancelButton: true,
            confirmButtonColor: "#008b8b",
            confirmButtonText: "Usar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById('tasa_pers').value = tasa_prom;
                document.getElementById('chk_tasa_perso').dataset.tasa = tasa_prom;
                document.getElementById('chk_tasa_perso').checked=true;
                cambiar_tasa_personalizada(tasa_prom);
            } else if (result.isDenied) {
              Swal.fire("Seleccione la tasa de la factura", "", "info");
              return;
            }
        });     
        return;            
    }
    
    let tasa = Array.from(document.querySelectorAll('input[name="tasa_chk"]'))
        .find(input => input.checked)?.dataset.tasa;

    if (!tasa) {
        Swal.fire({
            title: "Error",
            text: "Debe seleccionar una tasa válida",
            icon: "error",
            allowOutsideClick: () => false,
        });
        return;
    }

    tasa_modal.value=tasa;
    
    const max_lines = document.querySelector('.table-danger');
    if (max_lines) {        
        Swal.fire({
        title: "Cuidado!",
        text: "Hay mas items que el maximo posible en su formato de facturacion, ¿desea continuar?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Continuar",
        denyButtonText: `Cancelar`
    }).then((result) => {
        if (result.isConfirmed) {
            myModal.show()
        } else if (result.isDenied) {
            return;
        }
    })

    } else {
        myModal.show()
    }

}

document.getElementById('div_fact_factura').addEventListener('click', pagar_factura)

document.getElementById('div_anular').addEventListener('click', anular_factura)

function imprimirFactura (){
    if(!generada){
        Swal.fire({
            title: "Error",
            text: "No se ha generado la factura",
            icon: "error",
            allowOutsideClick: () => false,
        });
        return;
    }
    let factura_path = document.getElementById("sel_formato").selectedOptions[0].dataset.path_formato;
    let detalles_path = opciones_formatos.opciones[0].detalle_factura;
    console.log("detalles: " + detalles_path, "factura: "+ factura_path );
}

document.getElementById('moneda_desglose').addEventListener('change', fetchFormaPago)

function anular_factura (){
    if(!generada){
        Swal.fire({
            title: "Error",
            text: "No se ha generado la factura",
            icon: "error",
            allowOutsideClick: () => false,
        });
        return;
    }
   
}

document.getElementById('tasa_pers').addEventListener('change', function () {    
    document.getElementById('chk_tasa_perso').dataset.tasa = this.value;    
});

document.querySelectorAll('.desgloses').forEach((element) => {
    element.addEventListener('keypress', function (e) {
        if (e.key === "Enter" || e.key === "Intro") {
            e.preventDefault;
            add_desgl();
          }
    });
});