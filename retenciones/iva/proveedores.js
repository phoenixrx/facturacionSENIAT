let buscandoProveedor = false;
let proveedor_info = {};
let proveedor_iva =0;
let proveedor_islr =0;

document.getElementById('rif_iva').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        document.getElementById("numeroDocumento").focus()
        buscarProveedor(this.value);
    }
});
document.getElementById('rif_iva').addEventListener('blur', function(event) {   
        buscarProveedor(this.value);
});

async function buscarProveedor(rif) {  
    if (buscandoProveedor) {
        return;
    }
    limpiarTodo();
    buscandoProveedor = true;
    if (rif.length < 5) {
        buscandoProveedor = false;
        return;
    }
    Swal.fire({
        title: 'Buscando...',
        icon:'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    contribuyente=0;

    const response = await fetch(
        `https://facturacion.siac.historiaclinica.org/api/proveedores/proveedores/${rif}?id_cli=${id_cli}`,
        {
            method: "GET",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
        }
    );
    const proveedor = await response.json();  
    buscandoProveedor=false;
    Swal.close()
    if (proveedor.error == "No data") {
            Swal.fire({
                    title: 'Proveedor no encontrado',
                    text: '¿Desea crearlo?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí',
                    cancelButtonText: 'No',
                }).then((result) => {
                    if (result.isConfirmed) {
                     crearProveedor(rif);
                    }else{
                        document.getElementById("rif_iva").value=""
                    }
                });
            return;
                }
    if (proveedor.error) {
        Swal.fire({
                title: 'Error',
                text: proveedor.error,
                icon:'info',
                allowOutsideClick: false,                
            });
            return;
    }    
    proveedor_iva = proveedor.iva[0];
    proveedor_islr = proveedor.islr[0];
    proveedor_info = proveedor.data[0];
    document.getElementById("razon_social").value = proveedor.data[0].nombre;
    if(proveedor.data[0].is_juridico){
        document.querySelector(".tipoContribuyenteJ").checked = true;
    }else{
        document.querySelector(".tipoContribuyenteN").checked = true;
    }
    
    contribuyente= proveedor.data[0].id_proveedor;
    document.getElementById('rif_iva').value = proveedor.data[0].RIF;
    document.getElementById('retencion_iva').value = proveedor.data[0].porcentaje_retencion;
    document.getElementById('porcentajeRetener').value = proveedor.data[0].porcentaje_retencion;
    document.getElementById('contribuyenteResidente').checked = proveedor.data[0].is_residente;
    document.getElementById('agenteRetencion').checked = proveedor.data[0].is_agente;
    document.getElementById('contribuyenteRetencion').checked = proveedor.data[0].is_contribuyente;
    document.getElementById("numeroDocumento").focus()
}

document.querySelectorAll('.contribuyenteInput').forEach(item => {
    item.addEventListener('change', event => {
        let c = item.dataset.campo;
        let v = null;
        if (item.type === "checkbox") {
            v = item.checked ? 1 : 0;
        } else if (item.type === "radio") {
            v = document.querySelector('input[name="tipoContribuyente"]:checked').value;
        } else {
            v = item.value;
        }
        actualizarProveedor(c,v);
    })
})

async function actualizarProveedor(c,v) {
    if (contribuyente==0) {
        return;
    }
    console.log(contribuyente)
    Swal.fire({
        title: 'Actualizando...',
        icon:'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    const response = await fetch(
        `https://facturacion.siac.historiaclinica.org/api/proveedores/proveedores/${contribuyente}`,
        {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ c: c, v: v })
        }
    );
    const proveedor = await response.json();  
    Swal.close()
    if (proveedor.error) {
        Swal.fire({
                title: 'Error',
                text: proveedor.error,
                icon:'info',
                allowOutsideClick: false,                
            });
            return;
    }    
}

async function crearProveedor(rif) {
    const myModalProveedor = new bootstrap.Modal('#modalProveedor', {
        keyboard: false
    })    
    myModalProveedor.show();
    document.getElementById('rifProveedor').value= rif;
    document.getElementById('retencion_ivaProveedor').value = 100;
    document.getElementById('razonSocialProveedor').focus();
}

document.getElementById("btnCancelarProveedor").addEventListener("click", function(event) {
    event.preventDefault();
    console.log(contribuyente)
    contribuyente=0;
    document.getElementById("rif_iva").value="";
    document.getElementById("razon_social").value="";
    document.getElementById("rif_iva").focus()
});

document.getElementById("btnGuardarProveedor").addEventListener("click", async function(event) {
    event.preventDefault();
    document.getElementById("rif_iva").value="";
    const rif = document.getElementById('rifProveedor').value;
    const razonsocial = document.getElementById('razonSocialProveedor').value;
    const telefono = document.getElementById('telefonoProveedor').value;
    const correo = document.getElementById('correoProveedor').value;
    const direccion = document.getElementById('direccionProveedor').value;
    const contacto = document.getElementById('contactoProveedor').value;
    const telefcontact = document.getElementById('telefonoContactoProveedor').value;
    const porcentaje_retencion = document.getElementById('retencion_ivaProveedor').value;
    const is_residente = document.getElementById('proveedorResidente').checked ? 1 : 0;
    const is_agente = document.getElementById('proveedorAgenteRetencion').checked ? 1 : 0;
    const is_contribuyente = document.getElementById('proveedorRetencion').checked ? 1 : 0;
    const is_juridico = document.querySelector('input[name="tipoContribuyenteCrear"]:checked').value;

    Swal.fire({
        title: 'Creando proveedor...',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const response = await fetch(
        `https://facturacion.siac.historiaclinica.org/api/proveedores/proveedores`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                rif,
                razonsocial,
                telefono,
                correo,
                direccion,
                id_cli,
                contacto,
                telefcontact,
                porcentaje_retencion,
                is_residente,
                is_agente,
                is_contribuyente,
                is_juridico
            })
        }
    );
    const nuevoProveedor = await response.json();
    Swal.close();

    if (nuevoProveedor.success) {
        Swal.fire({
            title: 'Éxito',
            text: 'Proveedor creado correctamente',
            icon: 'success',
            allowOutsideClick: false,
        });
        document.getElementById("rif_iva").value=rif;
        buscarProveedor(rif);
    }else {
        Swal.fire({
            title: 'Error',
            text: nuevoProveedor.error,
            icon: 'error',
            allowOutsideClick: false,
        });
    }
        
    });

