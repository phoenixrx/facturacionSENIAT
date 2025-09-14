document.getElementById('conceptoIslr').addEventListener('change',  function() {
    const selectedId = parseInt(this.value);
     conceptoSeleccionado = codigos_retenciones.find(codigo => codigo.id === selectedId);
    
    if (conceptoSeleccionado) {
        is_acumulable= conceptoSeleccionado.acum;
        console.log(is_acumulable)
        minimoIslr = conceptoSeleccionado.minimo        
        document.getElementById('porcentajeBaseImponible').value = conceptoSeleccionado.base;
        document.getElementById('porcentAplicable').value = conceptoSeleccionado.tarifa;
        document.getElementById('menosSustraendo').value = conceptoSeleccionado.sustraendo;
        if(conceptoSeleccionado.acum==1){
            const total_uts = Number(document.getElementById('totalUT').value)
            let porcent_acum = 15;
            switch (total_uts) {
                case total_uts>2000 && total_uts<=3000:
                    porcent_acum = 22;
                    document.getElementById('menosSustraendo').value = 140 * UT[0].valor
                    break;
                case total_uts>3000:
                    porcent_acum = 34;
                    document.getElementById('menosSustraendo').value = 500 * UT[0].valor
                    break;
            
                default:
                    break;
            }
            document.getElementById('porcentAplicable').value = porcent_acum;
        }
    } else {
        document.getElementById('porcentajeBaseImponible').value = '';
        document.getElementById('porcentAplicable').value = '';
        document.getElementById('menosSustraendo').value = '';
    }
    recalcular();
})

function recalcular(){
    const porcentajeBaseImponible = parseFloat(document.getElementById('porcentajeBaseImponible').value);
    const porcentAplicable = parseFloat(document.getElementById('porcentAplicable').value);
    const menosSustraendo = parseFloat(document.getElementById('menosSustraendo').value);
    const totalBaseImponible = parseFloat(document.getElementById('totalBaseImponible').value);
    const totalUT = parseFloat(document.getElementById('totalUT').value);
    document.getElementById('btn_savIslr').classList.add('pe-none');
    if(totalBaseImponible<1){
        return;
    }

    if(totalBaseImponible<minimoIslr){
        Swal.fire({
            title: 'No supera el minimo',
            text: 'La cantidad no supera el minimo necesario para aplicar el ISLR ('+minimoIslr+')',
            icon: 'info',
            allowOutsideClick: false,
        })
        return;
    }

    document.getElementById('btn_savIslr').classList.remove('pe-none');

    if(is_acumulable!=1){
        let total_retener = 0;
        total_retener = totalBaseImponible*(porcentajeBaseImponible/100);

        total_retener = total_retener *(porcentAplicable/100)

        document.getElementById('totalRetener').value = total_retener.toFixed(2);

    }else{
        let total_retener = 0;

        let acumulado = proveedor_info.total_pagos || 0; //cantidades pagadas en fechas anteriores dentro del ejercicio

        total_retener = acumulado+totalBaseImponible;   // se le suma el pago actual
        
        total_retener = total_retener*(porcentAplicable/100); //le aplicamos el porcentaje q depende del acumulado 15/22/34
        
        total_retener=total_retener-menosSustraendo; //se le resta en caso que aplique 140ut/500ut
         
        let retenido_acumulado = proveedor_info.total_retenido || 0; //retenciones hechas anteriormente en el periodo de ejercicio
        
        total_retener=total_retener-retenido_acumulado;
         
        document.getElementById('totalRetener').value = total_retener.toFixed(2);

    }

}