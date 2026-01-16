const HOST = "https://facturacion.siac.historiaclinica.org";
const HOST2 = "https://pruebas.siac.historiaclinica.org";
const BASE_FORMATO = "https://siac.empresas.historiaclinica.org/"
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
let STATUS_FACTURA = 1
let IDFACT = 0;
let IDUUID = '';
let tipo_consulta = '';
let detalles = [];
let opciones_formatos = [];
let generada = false;

let configs_token = [];

if (token) {

    localStorage.setItem("token", token);
    get_config_token()

}



let arreglo_pacientes = [];
function get_config_token() {
    const token = localStorage.getItem("token");

    fetch(`https://pruebas.siac.historiaclinica.org/decodifica`, {
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
            }

            if (buscarPermisoFacturar("abrir") != "1") {
                const botonera = document.querySelector('.botonera');
                if (botonera) {
                    botonera.remove();
                }
                Swal.fire({
                    title: "Permisos",
                    text: "No tienes permisos para facturar",
                    icon: "info",
                    confirmButtonColor: "#008b8b",
                    allowOutsideClick: false
                }).then(() => {
                    window.location.href = "https://siac.empresas.historiaclinica.org/index.php";
                })
                return;
            }
            primera_carga();
        })
    return configs_token;
}

const modif_otro = buscarPermisoFacturar("modificar");
const modif_numero = buscarPermisoFacturar("insertar");

function buscarPermisoFacturar(valor) {
    if (!configs_token || !Array.isArray(configs_token.permisos)) {
        return null;
    }
    const permisoFacturar = configs_token.permisos.find(permiso => permiso.modulo === "Facturar");

    switch (valor) {
        case "modificar":
            return permisoFacturar.modificar || 0;
            break;
        case "insertar":
            return permisoFacturar.insertar || 0;
            break;
        case "eliminar":
            return permisoFacturar.eliminar || 0;
            break;
        case "abrir":
            return permisoFacturar.abrir || 0;
            break;
    }


}
var myModal = new bootstrap.Modal(document.getElementById('modal_pagos'), { keyboard: false });

function primera_carga() {
    opciones();
    tasa();
    fetchFormaPagoMonedas()

    function getLocalDateWithoutTime() {
        const now = new Date();
        const offsetInMilliseconds = -4 * 60 * 60 * 1000; // Caracas GMT-4
        const localTime = new Date(now.getTime() + offsetInMilliseconds);

        const year = localTime.getFullYear();
        const month = String(localTime.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
        const day = String(localTime.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.value = getLocalDateWithoutTime();
    });
    const urlParams = new URLSearchParams(window.location.search);
    const admision = urlParams.get('admision');
    if (admision) {
        verif_admision(admision);

    } else {
        const myModal = document.getElementById('modal_admisiones')
        const myInput = document.getElementById('inp_part');
        const modalInstance = new bootstrap.Modal(myModal);

        // Escuchar evento 'shown.bs.modal' para enfocar el input
        myModal.addEventListener('shown.bs.modal', () => {
            const myInput = document.getElementById('inp_part');
            if (myInput) {
                myInput.focus();
            }
        });

        // Mostrar el modal usando la instancia
        modalInstance.show();

    }

};

document.getElementById('nueva_factura').addEventListener("click", function () {
    location.reload()
})

document.getElementById("chk_contado").addEventListener("change", function () {
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
                    document.getElementById('sub_empresa').innerHTML = "";
                    cargar_tipo(this.value);
                    break;
                case "S":
                    document.getElementById('empre-seg').disabled = false;
                    document.getElementById('empre-seg').classList.remove('d-none');
                    document.getElementById('sub_empresa').classList.add('d-none');
                    document.getElementById('empre-seg').innerHTML = "";
                    cargar_tipo(this.value);
                    break;
                case "I":
                    document.getElementById('empre-seg').disabled = false;
                    document.getElementById('empre-seg').classList.remove('d-none');
                    document.getElementById('sub_empresa').classList.add('d-none');
                    document.getElementById('empre-seg').innerHTML = "";
                    cargar_tipo(this.value);
                    break;
                default:
                    document.getElementById('empre-seg').disabled = true;
                    document.getElementById('empre-seg').classList.remove('d-none');
                    document.getElementById('sub_empresa').classList.add('d-none');
                    document.getElementById('empre-seg').innerHTML = "";
                    fetchAdmisiones(1, 1000, 'P')
                    break;
            }
        };
    });
});

document.getElementById('empre-seg').addEventListener('change', function () {
    document.querySelectorAll('input[name="tipo_admision"]').forEach((radio) => {
        if (radio.checked) {
            fetchAdmisiones(1, 1000, radio.value)
            if (radio.value == 'E') {
                cargar_tipo('sub', document.getElementById('sub_empresa'), this.value);
                return;
            }
        }
    })
})

document.getElementById('sub_empresa').addEventListener('change', function () {
    if (this.value == "") {
        fetchAdmisiones(1, 1000, 'E', document.getElementById('empre-seg').value)
    } else {
        fetchAdmisiones(1, 1000, 'sub', this.value)
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
    })


    const pacientesMap = [];
    selectedAdmisiones.forEach((admision, idx) => {
        const cedula = selectedCedulas[idx];
        const paciente = selectedPacientes[idx];
        pacientesMap.push({ cedula, paciente });
    });
    arreglo_pacientes = pacientesMap;


    fetchDetalles(selectedIds);

    if (obtenerPrimerValorNoVacio(selectedTitulares) != 'Vacio') {
        var titular = obtenerPrimerValorNoVacio(selectedTitulares);
        var cedula_tit = obtenerPrimerValorNoVacio(selectedCedTitulars);
        document.getElementById('titular').value = `${titular} C.I. ${cedula_tit}`;
    } else {
        let primer_paciente = obtenerPrimerValorNoVacio(selectedPacientes);
        let primera_cedula = obtenerPrimerValorNoVacio(selectedCedulas);
        document.getElementById('titular').value = primer_paciente + " " + primera_cedula
    }
})

document.querySelector('.card_detalle-close').addEventListener('click', function () {
    document.querySelector(".card_detalle").classList.add('d-none');
})
document.querySelectorAll('input[name="rad_tipo_agrupamiento"]').forEach((radio) => {
    radio.addEventListener('click', function () {

        if (detalles.length == 0) {
            return;
        }
        switch (this.value) {
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
    });
});

document.querySelectorAll('.encabezado_modif').forEach((input) => {
    input.addEventListener("dblclick", function () {
        if (Number(buscarPermisoFacturar("modificar")) == 1) {
            this.readOnly = !this.readOnly;
        } else {
            Swal.fire({
                title: "Permisos",
                text: "No tienes permisos para modificar estos datos",
                icon: "info",
                confirmButtonColor: "#008b8b",
                allowOutsideClick: false
            })
        }

    })
})

document.querySelectorAll('.numeros_p').forEach((input) => {
    input.addEventListener("dblclick", function () {
        if (Number(buscarPermisoFacturar("insertar")) == 1) {
            this.readOnly = !this.readOnly;
        } else {
            Swal.fire({
                title: "Permisos",
                text: "No tienes permisos para modificar el número de la factura o el control",
                icon: "info",
                confirmButtonColor: "#008b8b",
                allowOutsideClick: false
            })
        }

    })
})

document.getElementById("num_factura").addEventListener("change", function () {
    document.getElementById('factura_modal').value = this.value
});
document.getElementById("factura_modal").addEventListener("change", function () {
    document.getElementById('num_factura').value = this.value
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
                    this.dataset.tasa = document.getElementById('tasa_pers').value;
                    if (this.dataset.tasa <= 0) {
                        Swal.fire({
                            title: "Tasa invalida",
                            text: "La tasa personalizada no es valida",
                            icon: "info",
                            confirmButtonColor: "#008b8b",
                            allowOutsideClick: () => false,
                        });
                        document.getElementById('tasa_pers').focus();
                        document.getElementById("chk_tasa_perso").checked = false;
                        return;
                    }
                    const nuevaTasaPerso = parseFloat(this.dataset.tasa);
                    if (validar_monto(this.dataset.tasa)) {
                        cambiar_tasa_personalizada(nuevaTasaPerso)
                    } else {
                        Swal.fire({
                            title: "Tasa invalida",
                            text: `La tasa personalizada no es valida (${this.dataset.tasa})`,
                            icon: "info",
                            confirmButtonColor: "#008b8b",
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

async function pagar_factura() {
    const tableDetalle = document.querySelector('#table_detalle tbody');
    if (!tableDetalle || tableDetalle.querySelectorAll('tr').length === 0) {
        Swal.fire({
            title: "Error",
            text: "No hay detalles para facturar",
            icon: "error",
            confirmButtonColor: "#008b8b",
            allowOutsideClick: () => false,
        });
        return;
    }

    if (document.getElementById('dir_fiscal').value.trim() == "") {
        const { value: direccion } = await Swal.fire({
            title: "Facturación",
            text: "Direccion Fiscal no puede estar vacio, ingrese dirección",
            icon: 'error',
            confirmButtonColor: "#008b8b",
            input: "text",
            inputAttributes: {
                autocapitalize: "on"
            },
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            inputValidator: (value) => {
                if (!value) {
                    return "La dirección fiscal es necesaria!";
                }
                if (value.length < 6) {
                    return "La dirección fiscal esta muy corta!";
                }
            }

        });
        if (direccion) {
            document.getElementById('dir_fiscal').value = direccion
        } else {
            return
        };
    }

    if (STATUS_FACTURA != 1) {
        Swal.fire({
            title: "Factura",
            text: "La factura ya esta cerrada",
            icon: "info",
            confirmButtonColor: "#008b8b",
        })
        return
    }



    if (document.getElementById('chk_tasa_admision').checked == true && document.getElementById('tasa_admi').textContent.trim() == "Tasas varias") {
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
                document.getElementById('chk_tasa_perso').checked = true;
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
            confirmButtonColor: "#008b8b",
            allowOutsideClick: () => false,
        });
        return;
    }

    tasa_modal.value = tasa;

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
                document.getElementById('total_modal').value = document.getElementById('total_factura').value
                document.getElementById('total_usd_modal').value = Number(Number(document.getElementById('total_modal').value) / Number(document.getElementById('tasa_modal').value)).toFixed(2)
                myModal.show()
            } else if (result.isDenied) {
                return;
            }
        })

    } else {
        document.getElementById('total_modal').value = document.getElementById('total_factura').value
        document.getElementById('total_usd_modal').value = Number(Number(document.getElementById('total_modal').value) / Number(document.getElementById('tasa_modal').value)).toFixed(2)

        myModal.show()
    }

}

document.getElementById('div_fact_factura').addEventListener('click', pagar_factura)

document.getElementById('div_anular').addEventListener('click', function () {

    if (buscarPermisoFacturar("eliminar") != "1") {
        Swal.fire({
            title: "Permisos",
            text: "No tiene el permiso para anular facturas",
            icon: "error",
            confirmButtonColor: "#008b8b",
            allowOutsideClick: () => false,
        });
        return;
    }
    if (!generada) {
        Swal.fire({
            title: "Error",
            text: "No se ha generado la factura",
            icon: "error",
            confirmButtonColor: "#008b8b",
            allowOutsideClick: () => false,
        });
        return;
    }

    Swal.fire({
        title: "Esta accion anulalara la factura",
        text: "Desea continuar",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonColor: "#008b8b",
        confirmButtonText: "Anular",
        denyButtonText: `Cancelar`
    }).then((result) => {
        if (result.isConfirmed) {

            Swal.fire({
                title: "Anulacion",
                text: "Como desea anular la factura?",
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonColor: "#008b8b",
                confirmButtonText: "Anulacion directa",
                denyButtonText: `Nota de Credito`
            }).then((resultado) => {
                if (resultado.isConfirmed) {
                    anular_factura();
                } else if (resultado.isDenied) {

                    const facturaValue = document.getElementById('factura_modal').value;
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = 'https://siac.empresas.historiaclinica.org/notas_contables/crear_nota_factura.php';
                    form.style.display = 'none';

                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'bill_number';
                    input.value = facturaValue.toString().padStart(8, '0');
                    form.appendChild(input);

                    document.body.appendChild(form);
                    form.submit(); return;
                }
            })


        } else if (result.isDenied) {
            Swal.fire("No se anulo la factura", "", "info");
            return;
        }
    })
})

function imprimirFactura() {
    if (!generada) {
        Swal.fire({
            title: "Error",
            text: "No se ha generado la factura",
            icon: "error",
            confirmButtonColor: "#008b8b",
            allowOutsideClick: () => false,
        });
        return;
    }


    let admisiones = detalles.map(item => item.id_admision).join(',');

    var data = { 'id_admision': admisiones, 'fact_num': document.getElementById('factura_modal').value };
    let formatos = document.getElementById('sel_formato');
    if (formatos.value == "") {
        Swal.fire({
            title: "Error",
            text: "Seleccione un formato de impresión",
            icon: "error",
            confirmButtonColor: "#008b8b",
            allowOutsideClick: false,
        });
        formatos.focus();
        return;
    }
    let urlNew = "";
    switch (tipo_consulta) {
        case "P":
            urlNew = opciones_formatos.formatos[0].base_url + opciones_formatos.formatos[0].path;
            break;
        case "S":
            urlNew = opciones_formatos.formatos[1].base_url + opciones_formatos.formatos[0].factura_seguros;
            break;
        case "E":
            urlNew = opciones_formatos.formatos[2].base_url + opciones_formatos.formatos[0].factura_empresas;
            break;
        case "I":
            urlNew = opciones_formatos.formatos[2].base_url + opciones_formatos.formatos[0].factura_internos;
            break;
        default:
            urlNew = opciones_formatos.formatos[0].base_url + opciones_formatos.formatos[0].path;
            break;
    }

    url = opciones_formatos.opciones[0].detalle_factura + "?id_admision=" + admisiones + "&fact_num=" + document.getElementById('factura_modal').value;
    if (url.startsWith("../")) {
        url = url.replace(/^(\.\.\/)+/, "");
    }
    window.open(BASE_FORMATO + url, "_blank");
    window.open(urlNew + "?id=" + IDUUID, "_blank");
}

document.getElementById('moneda_desglose').addEventListener('change', fetchFormaPago)



document.getElementById('tasa_pers').addEventListener('change', function () {
    document.getElementById('chk_tasa_perso').dataset.tasa = this.value;
});

document.querySelectorAll('.desgloses').forEach((element) => {
    element.addEventListener('keydown', function (e) {
        if (e.key === "Enter" || e.key === "Intro") {
            e.preventDefault();
            add_desgl();
        }
    });
});
document.getElementById('btn_regresar').addEventListener('click', function () {
    window.close();
})


document.getElementById('forma_de_pago').addEventListener('keypress', function (e) {
    if (e.key === "Enter" || e.key === "Intro") {
        e.preventDefault;

    }
})