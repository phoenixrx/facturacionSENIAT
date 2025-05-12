function crear_cuotas() {
    
    var cuotas = Number(document.getElementById('cuotas').value);
    var montoTotal = Number(document.getElementById('monto_credito').value);
    var moneda_credito = Number(document.getElementById('moneda_credito').value);
    var fechaUltimaCuota = document.getElementById('fecha_vencimiento').value;
    
    try {
    // Validate inputs
    const montoTotalNum = Number(montoTotal);
    const cuotasNum = Number(cuotas);

    if (isNaN(montoTotalNum) || isNaN(cuotasNum) || cuotasNum <= 0) {
         Swal.fire({
            title: "Cuotas",
            text: "Invalid: Monto Total y cuotas deben ser nuemros positivos",
            icon: 'error',
            confirmButtonColor: "#008b8b",
          });
          return 'Error Cuotas';

    }

    const pagosPorCuota = montoTotalNum / cuotasNum;
    const fechaActual = new Date();
    const fechaFinal = new Date(fechaUltimaCuota);

    if (isNaN(fechaFinal.getTime())) {
         Swal.fire({
            title: "Cuotas",
            text: "Error en las fechas",
            icon: 'error',
            confirmButtonColor: "#008b8b",
          });
          return 'Error Cuotas';
    }

    const diferenciaTiempo = fechaFinal - fechaActual;

    if (diferenciaTiempo <= 0) {
         Swal.fire({
            title: "Cuotas",
            text: "Fecha de la ultima cuota debe ser ",
            icon: 'error',
            confirmButtonColor: "#008b8b",
          });
          return 'Error Cuotas';
    }

    const intervalo = diferenciaTiempo / cuotasNum;

    // Ensure factura element exists
    const facturaElement = document.getElementById('factura');
    if (!facturaElement) {
        Swal.fire({
            title: "Cuotas",
            text: "No se encuentra la factura",
            icon: 'error',
            confirmButtonColor: "#008b8b",
          });
        return 'Error Cuotas';
    }
    const facturaValue = facturaElement.value;

    const pagos = [];
    for (let i = 1; i <= cuotasNum; i++) { // Include the last installment
        const fechaPago = new Date(fechaActual.getTime() + (intervalo * i));
        pagos.push({
            id_admision: ID_ADMISION,
            numero_cuota: i,
            id_moneda: moneda_credito,
            monto_pago: pagosPorCuota,
            estado: 'Pendiente',
            factura: facturaValue,
            fecha_vencimiento: fechaPago.toISOString().split('T')[0]
        });
    }
        return pagos;    
    } catch (error) {
        Swal.fire({
            title: "Cuotas",
            text: "Problema de creacion de cuota <br>" + error.message,
            icon: 'error',
            confirmButtonColor: "#008b8b",
          });        
        
        return 'Error Cuotas';
    }
}