    //const HOST = "https://facturacion.siac.historiaclinica.org";
    //const HOST2 = "https://pruebas.siac.historiaclinica.org";


    //const BASE_FORMATO = "https://siac.empresas.historiaclinica.org/"
    let STATUS_FACTURA =1
    const HOST = "http://localhost:3000";
    const HOST2 = "http://localhost:3001";
    const BASE_FORMATO = "http://localhost/historiaclinica/empresas/"
    let detalles = [];
    let opciones_formatos = [];
    let generada = false;
    const params = new URLSearchParams(window.location.search);
    //const token = params.get("token");
    let configs_token = [];
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXN1YXJpbyI6ImFndWVycmEiLCJjb3JyZW9lIjoiZ2VyZW5jaWEuY2VuaW1hdEBnbWFpbC5jb20iLCJmZWNoYV9jcmVhY2lvbiI6IjIwMjQtMDEtMjZUMTc6MzM6MzkuMDAwWiIsImZlY2hhX21vZGlmaWNhY2lvbiI6IjIwMjUtMDUtMDlUMTg6NTk6NTYuMDAwWiIsImVzdGFkbyI6ImFjdGl2byIsInVsdGltb19hY2Nlc28iOiIyMDI1LTA1LTE4VDAwOjE5OjIyLjAwMFoiLCJhY3Rpdm8iOiIxIiwibW9zdHJhcl9uZXdzIjoibiIsImFuaW1hY2lvbmVzIjoxLCJub3RhIjpudWxsLCJpZF91c3VhcmlvIjo0LCJpZF91c3VhcmlvX2VtcHJlc2EiOjMsIm5vbWJyZSI6IkFSR0VESVQiLCJhcGVsbGlkb3MiOiJHVUVSUkEiLCJmZWNoYV9uYWNpbWllbnRvIjoiMjAyNC0wMS0yNlQwNTowMDowMC4wMDBaIiwiY2VkdWxhIjoiMTIzOTIwMTciLCJ0aXBvX2NlZHVsYSI6IlYiLCJ0aXBvX3VzdWFyaW8iOiJFIiwiaWRfZXN0YWRvIjoxNCwiaWRfbXVuaWNpcGlvIjoyMzAsImlkX3BhcnJvcXVpYSI6NjIwLCJpZF9jaXVkYWQiOjI2NiwiZGlyZWNjaW9uIjoiIiwic3RhdHVzIjoiY29tcGxldG8iLCJwYWdpbmEiOiJodHRwczovL3NpYWMuZW1wcmVzYXMuaGlzdG9yaWFjbGluaWNhLm9yZy8iLCJmZWNoYV92YWxpZG8iOiIxODk5LTExLTMwVDA1OjAwOjAwLjAwMFoiLCJpZF9lc3BlY2lhbGlzdGEiOm51bGwsImlkX2dydXBvX3VzdWFyaW8iOjEzLCJncnVwb191IjoiQURNSU5JU1RSQURPUiIsImlkX2NsaSI6MywiZmVjaGFfdmVuY2ltaWVudG8iOiIyMDI1LTA2LTAzVDE2OjAxOjE0LjAwMFoiLCJsb2dvX2VtcHJlc2EiOiIuLi9pbWFnZXMvZW1wcmVzYXMvY2VuaW1hdC9sb2dvX2NlbmltYXQud2VicCIsImlkX3BsYW4iOjMsImlwX2ludGVybmV0IjoiMzguNDEuNS4yNTQiLCJpcF9sb2NhbCI6ImVycm9yIChXZWJSVEMpIiwicGVybWlzb3MiOlt7ImlkX3Blcm1pc28iOjEwNCwiaWRfdXN1YXJpbyI6MTMsImFicmlyIjoiMSIsImluc2VydGFyIjoiMSIsIm1vZGlmaWNhciI6IjEiLCJlbGltaW5hciI6IjEiLCJtb2R1bG8iOiJBZG1pc2lvbmVzIiwiZmVjaGFfY3JlYWNpb24iOiIyMDI0LTEwLTEwVDA4OjUxOjQ4LjAwMFoiLCJmZWNoYV9tb2RpZmljYWNpb24iOiIyMDI0LTEwLTEwVDA4OjUxOjQ4LjAwMFoifSx7ImlkX3Blcm1pc28iOjEwNSwiaWRfdXN1YXJpbyI6MTMsImFicmlyIjoiMSIsImluc2VydGFyIjoiMSIsIm1vZGlmaWNhciI6IjEiLCJlbGltaW5hciI6IjEiLCJtb2R1bG8iOiJBZ2VuZGEiLCJmZWNoYV9jcmVhY2lvbiI6IjIwMjQtMTAtMTBUMDg6NTE6NTEuMDAwWiIsImZlY2hhX21vZGlmaWNhY2lvbiI6IjIwMjQtMTAtMTBUMDg6NTE6NTEuMDAwWiJ9LHsiaWRfcGVybWlzbyI6MTA2LCJpZF91c3VhcmlvIjoxMywiYWJyaXIiOiIxIiwiaW5zZXJ0YXIiOiIxIiwibW9kaWZpY2FyIjoiMSIsImVsaW1pbmFyIjoiMSIsIm1vZHVsbyI6IkFQUyIsImZlY2hhX2NyZWFjaW9uIjoiMjAyNC0xMC0xMFQwODo1MTo1Ny4wMDBaIiwiZmVjaGFfbW9kaWZpY2FjaW9uIjoiMjAyNC0xMC0xMFQwODo1MTo1Ny4wMDBaIn0seyJpZF9wZXJtaXNvIjoxMDcsImlkX3VzdWFyaW8iOjEzLCJhYnJpciI6IjEiLCJpbnNlcnRhciI6IjEiLCJtb2RpZmljYXIiOiIxIiwiZWxpbWluYXIiOiIxIiwibW9kdWxvIjoiQ29uZmlndXJhY2lvbmVzIiwiZmVjaGFfY3JlYWNpb24iOiIyMDI0LTEwLTEwVDA4OjUyOjAxLjAwMFoiLCJmZWNoYV9tb2RpZmljYWNpb24iOiIyMDI0LTEwLTEwVDA4OjUyOjAxLjAwMFoifSx7ImlkX3Blcm1pc28iOjEwOCwiaWRfdXN1YXJpbyI6MTMsImFicmlyIjoiMSIsImluc2VydGFyIjoiMSIsIm1vZGlmaWNhciI6IjEiLCJlbGltaW5hciI6IjEiLCJtb2R1bG8iOiJjb25maWdfY2FsX21lZCIsImZlY2hhX2NyZWFjaW9uIjoiMjAyNC0xMC0xMFQwODo1MjowNS4wMDBaIiwiZmVjaGFfbW9kaWZpY2FjaW9uIjoiMjAyNC0xMC0xMFQwODo1MjowNS4wMDBaIn0seyJpZF9wZXJtaXNvIjoxMDksImlkX3VzdWFyaW8iOjEzLCJhYnJpciI6IjEiLCJpbnNlcnRhciI6IjEiLCJtb2RpZmljYXIiOiIxIiwiZWxpbWluYXIiOiIxIiwibW9kdWxvIjoiRE1PIiwiZmVjaGFfY3JlYWNpb24iOiIyMDI0LTEwLTEwVDA4OjUyOjA5LjAwMFoiLCJmZWNoYV9tb2RpZmljYWNpb24iOiIyMDI0LTEwLTEwVDA4OjUyOjA5LjAwMFoifSx7ImlkX3Blcm1pc28iOjExMCwiaWRfdXN1YXJpbyI6MTMsImFicmlyIjoiMSIsImluc2VydGFyIjoiMSIsIm1vZGlmaWNhciI6IjEiLCJlbGltaW5hciI6IjEiLCJtb2R1bG8iOiJGYWN0dXJhciIsImZlY2hhX2NyZWFjaW9uIjoiMjAyNC0xMC0xMFQwODo1MjoyNS4wMDBaIiwiZmVjaGFfbW9kaWZpY2FjaW9uIjoiMjAyNC0xMC0xMFQwODo1MjoyNS4wMDBaIn0seyJpZF9wZXJtaXNvIjoxMTEsImlkX3VzdWFyaW8iOjEzLCJhYnJpciI6IjEiLCJpbnNlcnRhciI6IjEiLCJtb2RpZmljYXIiOiIxIiwiZWxpbWluYXIiOiIxIiwibW9kdWxvIjoiRmFjdHVyYV9BUFMiLCJmZWNoYV9jcmVhY2lvbiI6IjIwMjQtMTAtMTBUMDg6NTI6MjkuMDAwWiIsImZlY2hhX21vZGlmaWNhY2lvbiI6IjIwMjQtMTAtMTBUMDg6NTI6MjkuMDAwWiJ9LHsiaWRfcGVybWlzbyI6MTEyLCJpZF91c3VhcmlvIjoxMywiYWJyaXIiOiIxIiwiaW5zZXJ0YXIiOiIxIiwibW9kaWZpY2FyIjoiMSIsImVsaW1pbmFyIjoiMSIsIm1vZHVsbyI6Ikhvbi1NZWQiLCJmZWNoYV9jcmVhY2lvbiI6IjIwMjQtMTAtMTBUMDg6NTI6MzQuMDAwWiIsImZlY2hhX21vZGlmaWNhY2lvbiI6IjIwMjQtMTAtMTBUMDg6NTI6MzQuMDAwWiJ9LHsiaWRfcGVybWlzbyI6MTEzLCJpZF91c3VhcmlvIjoxMywiYWJyaXIiOiIxIiwiaW5zZXJ0YXIiOiIxIiwibW9kaWZpY2FyIjoiMSIsImVsaW1pbmFyIjoiMSIsIm1vZHVsbyI6Im5vdGFzX2NvbnRhYmxlcyIsImZlY2hhX2NyZWFjaW9uIjoiMjAyNC0xMC0xMFQwODo1Mjo0MS4wMDBaIiwiZmVjaGFfbW9kaWZpY2FjaW9uIjoiMjAyNC0xMC0xMFQwODo1Mjo0MS4wMDBaIn0seyJpZF9wZXJtaXNvIjoxMTQsImlkX3VzdWFyaW8iOjEzLCJhYnJpciI6IjEiLCJpbnNlcnRhciI6IjEiLCJtb2RpZmljYXIiOiIxIiwiZWxpbWluYXIiOiIxIiwibW9kdWxvIjoiUmVwb3J0ZXMiLCJmZWNoYV9jcmVhY2lvbiI6IjIwMjQtMTAtMTBUMDg6NTI6NDQuMDAwWiIsImZlY2hhX21vZGlmaWNhY2lvbiI6IjIwMjQtMTAtMTBUMDg6NTI6NDQuMDAwWiJ9LHsiaWRfcGVybWlzbyI6MTE1LCJpZF91c3VhcmlvIjoxMywiYWJyaXIiOiIxIiwiaW5zZXJ0YXIiOiIxIiwibW9kaWZpY2FyIjoiMSIsImVsaW1pbmFyIjoiMSIsIm1vZHVsbyI6IlZhbG9yX0RpdmlzYSIsImZlY2hhX2NyZWFjaW9uIjoiMjAyNC0xMC0xMFQwODo1Mjo0OS4wMDBaIiwiZmVjaGFfbW9kaWZpY2FjaW9uIjoiMjAyNC0xMC0xMFQwODo1Mjo0OS4wMDBaIn0seyJpZF9wZXJtaXNvIjoxMjAsImlkX3VzdWFyaW8iOjEzLCJhYnJpciI6IjEiLCJpbnNlcnRhciI6IjEiLCJtb2RpZmljYXIiOiIxIiwiZWxpbWluYXIiOiIxIiwibW9kdWxvIjoiQ29pbmNpbF9BUFMiLCJmZWNoYV9jcmVhY2lvbiI6IjIwMjQtMTAtMTVUMDA6NTg6NTcuMDAwWiIsImZlY2hhX21vZGlmaWNhY2lvbiI6IjIwMjQtMTAtMTVUMDA6NTg6NTcuMDAwWiJ9LHsiaWRfcGVybWlzbyI6MTUxLCJpZF91c3VhcmlvIjoxMywiYWJyaXIiOiIxIiwiaW5zZXJ0YXIiOiIxIiwibW9kaWZpY2FyIjoiMSIsImVsaW1pbmFyIjoiMSIsIm1vZHVsbyI6IlJlY2lib3MiLCJmZWNoYV9jcmVhY2lvbiI6IjIwMjQtMDEtMjlUMTM6MjE6NDcuMDAwWiIsImZlY2hhX21vZGlmaWNhY2lvbiI6IjIwMjQtMDEtMjlUMTM6MjE6NDcuMDAwWiJ9LHsiaWRfcGVybWlzbyI6MTU0LCJpZF91c3VhcmlvIjoxMywiYWJyaXIiOiIxIiwiaW5zZXJ0YXIiOiIxIiwibW9kaWZpY2FyIjoiMSIsImVsaW1pbmFyIjoiMSIsIm1vZHVsbyI6IkNSTSIsImZlY2hhX2NyZWFjaW9uIjoiMjAyNC0xMC0yOFQwNzozMzo0My4wMDBaIiwiZmVjaGFfbW9kaWZpY2FjaW9uIjoiMjAyNC0xMC0yOFQwNzozMzo0My4wMDBaIn0seyJpZF9wZXJtaXNvIjoxNjMsImlkX3VzdWFyaW8iOjEzLCJhYnJpciI6IjEiLCJpbnNlcnRhciI6IjEiLCJtb2RpZmljYXIiOiIxIiwiZWxpbWluYXIiOiIxIiwibW9kdWxvIjoiVGFibGVyb19FbmZlcm1lIiwiZmVjaGFfY3JlYWNpb24iOiIyMDI0LTExLTA3VDIwOjU1OjEyLjAwMFoiLCJmZWNoYV9tb2RpZmljYWNpb24iOiIyMDI0LTExLTA3VDIwOjU1OjEyLjAwMFoifSx7ImlkX3Blcm1pc28iOjE3MSwiaWRfdXN1YXJpbyI6MTMsImFicmlyIjoiMSIsImluc2VydGFyIjoiMSIsIm1vZGlmaWNhciI6IjEiLCJlbGltaW5hciI6IjEiLCJtb2R1bG8iOiJmaW5hbnphcyIsImZlY2hhX2NyZWFjaW9uIjoiMjAyNC0xMi0xOFQxNzo1MzozMC4wMDBaIiwiZmVjaGFfbW9kaWZpY2FjaW9uIjoiMjAyNC0xMi0xOFQxNzo1MzozMC4wMDBaIn0seyJpZF9wZXJtaXNvIjoxOTYsImlkX3VzdWFyaW8iOjEzLCJhYnJpciI6IjEiLCJpbnNlcnRhciI6IjEiLCJtb2RpZmljYXIiOiIxIiwiZWxpbWluYXIiOiIxIiwibW9kdWxvIjoiQ3VvdGFzIiwiZmVjaGFfY3JlYWNpb24iOiIyMDI1LTAyLTEyVDIwOjMwOjUxLjAwMFoiLCJmZWNoYV9tb2RpZmljYWNpb24iOiIyMDI1LTAyLTEyVDIwOjMwOjUxLjAwMFoifSx7ImlkX3Blcm1pc28iOjE5OCwiaWRfdXN1YXJpbyI6MTMsImFicmlyIjoiMSIsImluc2VydGFyIjoiMSIsIm1vZGlmaWNhciI6IjEiLCJlbGltaW5hciI6IjEiLCJtb2R1bG8iOiJPQ1VQQUNJT05BTCIsImZlY2hhX2NyZWFjaW9uIjoiMjAyNS0wMi0xNFQwMTo0ODowOS4wMDBaIiwiZmVjaGFfbW9kaWZpY2FjaW9uIjoiMjAyNS0wMi0xNFQwMTo0ODowOS4wMDBaIn0seyJpZF9wZXJtaXNvIjoyMTksImlkX3VzdWFyaW8iOjEzLCJhYnJpciI6IjEiLCJpbnNlcnRhciI6IjEiLCJtb2RpZmljYXIiOiIxIiwiZWxpbWluYXIiOiIxIiwibW9kdWxvIjoiSW52ZW50YXJpb3MiLCJmZWNoYV9jcmVhY2lvbiI6IjIwMjUtMDUtMDlUMDI6MjE6MzUuMDAwWiIsImZlY2hhX21vZGlmaWNhY2lvbiI6IjIwMjUtMDUtMDlUMDI6MjE6MzUuMDAwWiJ9XSwiaWF0IjoxNzQ3NTk3NTk0LCJleHAiOjE3NDc2MTU1OTR9.xOOt4tz5y0u7Qy_X1oOgTmudkixy6Tv3hn6ogAt4IQU"
    if (token) {
      localStorage.setItem("token", token);
      get_config_token()
      
    }
    


    let arreglo_pacientes = [];
    function get_config_token () {
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
              console.log(buscarPermisoFacturar("abrir"))
              if(buscarPermisoFacturar("abrir")!="1"){
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

    const modif_otro =  buscarPermisoFacturar("modificar") ;
    const modif_numero =  buscarPermisoFacturar("insertar");
  
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
    var myModal = new bootstrap.Modal(document.getElementById('modal_pagos'), {keyboard: false});

function primera_carga(){
    opciones();
    tasa();
    fetchMoneda();
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.value = today;
    });
    const urlParams = new URLSearchParams(window.location.search);
    const admision = urlParams.get('admision');
    if (admision) {
       verif_admision(admision);
     
    }else{
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
      console.log(   configs_token.id_cli , configs_token.id_usuario,  modif_otro,  modif_numero )
    }

};

document.getElementById('nueva_factura').addEventListener("click", function () {
    location.reload()
})

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
    })
    

    const pacientesMap = [];
    selectedAdmisiones.forEach((admision, idx) => {
        const cedula = selectedCedulas[idx];
        const paciente = selectedPacientes[idx];
        pacientesMap.push({ cedula, paciente });
    });
    arreglo_pacientes = pacientesMap;
    

    fetchDetalles(selectedIds);

    if(obtenerPrimerValorNoVacio(selectedTitulares)!='Vacio'){
        var titular = obtenerPrimerValorNoVacio(selectedTitulares);
        var cedula_tit =obtenerPrimerValorNoVacio(selectedCedTitulars);
        document.getElementById('titular').value=`${titular} C.I. ${cedula_tit}`;
    }else{
        let primer_paciente =obtenerPrimerValorNoVacio(selectedPacientes);        
        let primera_cedula = obtenerPrimerValorNoVacio(selectedCedulas);        
        document.getElementById('titular').value=primer_paciente + " " +primera_cedula
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
            case "porcentual":
                agruparPorcentual(detalles)
                break;  
            default:
                detalles_fatura(detalles)
                break;
        }
    });
});

document.querySelectorAll('.encabezado_modif').forEach((input)=>{
    input.addEventListener("dblclick", function() {        
        if(Number(buscarPermisoFacturar("modificar"))==1){
            this.readOnly = !this.readOnly;
        }else{
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

document.querySelectorAll('.numeros_p').forEach((input)=>{
    input.addEventListener("dblclick", function() {        
        if(Number(buscarPermisoFacturar("insertar"))==1){
            this.readOnly = !this.readOnly;
        }else{
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
                    this.dataset.tasa= document.getElementById('tasa_pers').value;
                    if(this.dataset.tasa <=0){
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
                    if(validar_monto(this.dataset.tasa)){
                        cambiar_tasa_personalizada(nuevaTasaPerso)
                    }else{
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

async function pagar_factura (){
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
    
     if(document.getElementById('dir_fiscal').value.trim()==""){
            const { value: direccion } = await Swal.fire({
                title:"Facturación",
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
                    if (value.length < 6 ) {
                        return "La dirección fiscal esta muy corta!";
                    }
                }
                
            });
            if (direccion) {
                document.getElementById('dir_fiscal').value=direccion          
            }else{
                return 
            };
        }
    
    if(STATUS_FACTURA!=1){
        Swal.fire({
            title: "Factura",
            text: "La factura ya esta cerrada",
            icon: "info",
            confirmButtonColor: "#008b8b",
        })
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
                   confirmButtonColor: "#008b8b",
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
               document.getElementById('total_modal').value =document.getElementById('total_factura').value 
                document.getElementById('total_usd_modal').value =Number(Number(document.getElementById('total_modal').value)/Number(document.getElementById('tasa_modal').value)).toFixed(2)
                myModal.show()
        } else if (result.isDenied) {
            return;
        }
    })

    } else {
           document.getElementById('total_modal').value =document.getElementById('total_factura').value 
            document.getElementById('total_usd_modal').value =Number(Number(document.getElementById('total_modal').value)/Number(document.getElementById('tasa_modal').value)).toFixed(2)

        myModal.show()
    }

}

document.getElementById('div_fact_factura').addEventListener('click', pagar_factura)

document.getElementById('div_anular').addEventListener('click', function(){
    
    if(buscarPermisoFacturar("eliminar")!="1"){
        Swal.fire({
            title: "Permisos",
            text: "No tiene el permiso para anular facturas",
            icon: "error",
            confirmButtonColor: "#008b8b",
            allowOutsideClick: () => false,
        });
        return;
    }
    if(!generada){
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
            title: "Esta accion anulalara la factura y todos los pagos relacionados",
            text: "Tambien se devolveran los productos al inventario",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonColor: "#008b8b",
            confirmButtonText: "Anular",
            denyButtonText: `Cancelar`
        }).then((result) => {
            if (result.isConfirmed) {
                anular_factura();
            } else if (result.isDenied) {
                Swal.fire("No se anulo la factura", "", "info");
                return;
            }
        })
})

function imprimirFactura (){
    if(!generada){
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
          let selectedOption = formatos.options[formatos.selectedIndex];
          let url = selectedOption.getAttribute('data-path_formato') ;
          if (url.startsWith("../")) {
            url = url.replace(/^(\.\.\/)+/, "");
          }
          let form = document.createElement("form");
          form.target = "_blank";
          form.method = "POST";
          form.action = BASE_FORMATO + url;
          form.style.display = "none";
          for (let key in data) {
            let input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = data[key];
            form.appendChild(input);
          }
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);


          url = opciones_formatos.opciones[0].detalle_factura+ "?id_admision=" + admisiones + "&fact_num=" + document.getElementById('factura_modal').value;
          if (url.startsWith("../")) {
            url = url.replace(/^(\.\.\/)+/, "");
          }
          window.open(BASE_FORMATO + url, "_blank");
}

document.getElementById('moneda_desglose').addEventListener('change', fetchFormaPago)

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
            }        
        });
        
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
document.getElementById('btn_regresar').addEventListener('click', function(){
    window.close();
})


