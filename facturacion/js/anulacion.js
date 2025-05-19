

async function anular_factura (){

    let factura=document.getElementById('factura_modal').value;
    let id_admision = detalles[0].id_admision;

    Swal.fire({
        title: `Anulando Factura...`,
        icon: 'info',
        allowOutsideClick: false,
    }); 
    Swal.showLoading()
    var url = `${HOST}/api/anular_factura?id_cli=${configs_token.id_cli}&factura=${factura}&usuario=${configs_token.usuario}&id_usuario=${configs_token.id_usuario}&id_admision=${id_admision}`;
    try {
        let result = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }        
        });
        if (result.status===401) {
            Swal.fire({
                title: "Error",
                text: "El token ha expirado o no es válido, vuelva a iniciar sessión",
                icon: "error",
                confirmButtonColor: "#008b8b",
                allowOutsideClick: false,
            });
            return;
        }
        let factura = await result.json();
        
        if (factura.error || factura.success==false) { 
            
            Swal.update({
                title: `Error al anular la factura`,
                text: factura.message || "Error desconocido",
                icon: 'error',
                allowOutsideClick: false,
            });
            Swal.hideLoading()        
        } else {
            let divFactFactura = document.getElementById('div_imprimir');
            if (divFactFactura) {
                let newDiv = divFactFactura.cloneNode(true);
                divFactFactura.parentNode.replaceChild(newDiv, divFactFactura);
                if (newDiv.firstElementChild) {
                newDiv.firstElementChild.classList.add('mascara-gris');
                }
                
            } 
           Swal.update({
                title: `Anulada`,
                text: "La factura ha sido anulada correctamente",
                icon: 'success',
                confirmButtonColor: "#008b8b",
                allowOutsideClick: false,
            });
            Swal.hideLoading() 
            generada=false;
            return ;
        }
        
        } catch (error) {
            console.log(error)
        }    
}