async function cargar_tipo(tipo, select = document.getElementById("empre-seg"), subemp=null ){
    Swal.fire({
        title: `Espere mientras carga la data de Seguro/empresa/interno`,
        icon: 'info',
        allowOutsideClick: () => false,
    }); 
    Swal.showLoading()
    var url = `${HOST}/api/tipo_admision/?tipo=${tipo}&clinic_id=${id_cli}&subemp=${subemp}`;
    try {
        let parroquias = await fetch(url);
        const data = await parroquias.json();
        
        if (data.error || isNaN(data.length)) { 
            Swal.close();
            select.innerHTML = "";
            select.classList.add('d-none');
            
        } else {
            select.innerHTML = "";
            select.classList.remove('d-none');
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "Seleccione...";                                
                select.appendChild(option);
            data.forEach(parroquia => {
                const option = document.createElement("option");
                option.value = parroquia[Object.keys(parroquia)[0]];
                option.textContent = decodeHtml(parroquia[Object.keys(parroquia)[1]]);                                
                select.appendChild(option);
            });
            Swal.close()
        }
        
        } catch (error) {
            console.log(error)
        } 
}