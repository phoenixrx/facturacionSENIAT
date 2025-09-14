function formatearFechaDDMMYYYY(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatearFechaUsa(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    let dia = date.getDate().toString().padStart(2, '0');
    let mes = (date.getMonth() + 1).toString().padStart(2, '0');
    let anio = date.getFullYear();
    return `${anio}-${mes}-${dia}`;
    
}
function formatearMonto(monto) {
    if (!monto) return '0,00';
    return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(monto);
}

function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES');
}


function validar_monto(monto) {
    var filter = /^-?(\d{0,9}[.\s]?|)\d{0,3}$/;

    if (filter.test(monto)) {
        return true;
        } else {
        return false;
    }
}

function validar_monto_bs(objeto) {
    
    var objeto_objetivo = objeto;
    objeto_objetivo.classList.remove('is-invalid')
    
    var monto = objeto_objetivo.value;
    if (!validar_monto(monto)) {
        objeto_objetivo.classList.add('is-invalid')
        objeto_objetivo.focus();
        const quitar_validacion = setTimeout(() => {
                objeto_objetivo.classList.remove('is-invalid')
                clearTimeout(quitar_validacion);
            }, "5000");
        return "invalido";
    }
    recalcular();
    return true;
}