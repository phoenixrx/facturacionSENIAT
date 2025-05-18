  $("#modal_pagos").on("shown.bs.modal", function () {
    $(this).find("#desglose_valor").focus();
  });
let IGFT  = 0.03
  
  function add_desgl() {
    let moneda_desg = document.getElementById("moneda_desglose");
    let forma_pag = document.getElementById("forma_de_pago");

    let valor_desglose = document.getElementById("desglose_valor").value;
    let nota = document.getElementById("desglose_nota").value;
    let lista = document.getElementById("tabla_desglose");
    let listaN = lista.childElementCount;
    
    if (valor_desglose == "" || valor_desglose == "0") {
      document.getElementById("desglose_valor").focus()
      Swal.fire({
            text: "Indique el valor",
            icon: "error",
            allowOutsideClick: () => false,
        });
      return
    }
 
    if (forma_pag.value == "") {
      forma_pag.focus()
        Swal.fire({
            text: "Seleccione forma de pago",
            icon: "error",
            allowOutsideClick: () => false,
        });      
      return;
    }
  
    if ( validar_monto_bs(document.getElementById("desglose_valor")) == "invalido") {
      document.getElementById("desglose_valor").focus()
        Swal.fire({
            text: "Valor incorrecto",
            icon: "error",
            allowOutsideClick: () => false,
        });   
      return;
    }
  if (moneda_desg.value==''){
      moneda_desg.focus()
      Swal.fire({
            text: "Seleccione divisa",
            icon: "error",
            allowOutsideClick: () => false,
        });
      return;
  }
  
    if (listaN < 1) {
          listaN =  1;
    }else{
      listaN = listaN-1;
    }
    document.getElementById('desglose_nota').disabled=false;
    var clase_igtf ='';
    if(nota.startsWith('IGTF aplica sobre ')){
      clase_igtf ='impuesto_ig';
    }
    var tipo_moneda = moneda_desg.options[moneda_desg.selectedIndex].text;
    if(clase_igtf =='impuesto_ig' && tipo_moneda!='Bs'){
      moneda_desg.focus()
      Swal.fire({
            text: "El IGTF debe pagarse en BS",
            icon: "error",
            allowOutsideClick: () => false,
        });      
      return;
    }
    
    var tasa = document.getElementById('tasa_modal').value;
    var igtf_val = (Number(valor_desglose) * Number(IGFT))*tasa;
    var base_igtf_bs = Number(valor_desglose)*tasa;
    var id_igtf = Math.floor(Math.random() * 100000) + 1;
    var igtf_chk =`<div class="form-check form-switch">
    <input class="form-check-input chk-igtf" type="checkbox" id="igtf_${id_igtf}"  data-toggle="tooltip" 
    data-placement="left" title="Calcular IGTF" value='${igtf_val}' data-base_igtf_bs='${base_igtf_bs}'  data-valorusd="${valor_desglose}" >
  </div>`;
   let clase ="";
    if (tipo_moneda != "Bs") {
          tipo_moneda ='pago-en-dolares';
          clase = 'table-success';
      }else{
          tipo_moneda ='pago-en-bolivares';
          clase = 'table-info';
          igtf_chk = `<div class="form-check form-switch">
            <input class="form-check-input chk-igtf d-none" type="checkbox" id="igtf_${id_igtf}"  value='0' >`;
     }
     
  var quitar =`<lord-icon src="../images/minus-circle.json" data-toggle="tooltip" data-placement="left" title="Quitar" id='quitar_${listaN}' trigger="hover" style="width:20px;height:20px" class="svg disk_save botonera" id=agregar_descuento>
                              </lord-icon>`;
  
    let row = `<tr class="rowdesg control row${tipo_moneda} ${clase}" id="rowidesg${listaN}"><td><span>${
      moneda_desg.options[moneda_desg.selectedIndex].text
    }</span> <span class="${tipo_moneda} ${clase_igtf}" >${valor_desglose}</span><span id="id_moneda_pago_${listaN}" class="d-none">${
      moneda_desg.value
    }</span></td><td>${igtf_chk}</td><td>${
      forma_pag.options[forma_pag.selectedIndex].text
    }<span  class="d-none id_forma_pago_row">${
      forma_pag.value
    }</span></td><td><div class='d-flex' style="justify-content: space-between;"><span id="nota_${listaN}">${nota}</span>${quitar}</div></td></tr>`;
  
  
  
  
    lista.insertAdjacentHTML("beforeend", row);
  
  var  quitar_row = document.getElementById(`quitar_${listaN}`)
  document.getElementById('igtf_'+id_igtf).addEventListener('click', function(){
      calcular_igtf()
  })
  
  quitar_row.addEventListener('click', function (){
      document.getElementById(`rowidesg${listaN}`).remove()
      calcular_desglose();
      calcular_igtf();
      document.getElementById('desglose_nota').value = '';
      document.getElementById('desglose_nota').disabled = false;
  })
    calcular_desglose();
    document.getElementById('desglose_nota').value='';
    document.getElementById('desglose_valor').value='';
    document.getElementById('desglose_valor').focus();
  }
  document.getElementById('btn_agregar_fp').addEventListener('click',function () {
      add_desgl()
  })
  
  function calcular_desglose() {
      var lista_bolivares = document.querySelectorAll('.pago-en-bolivares');
      var lista_dolares = document.querySelectorAll('.pago-en-dolares');
      var total_bs_acum=0;
      var total_us_acum=0;
      lista_bolivares.forEach(element => {
          total_bs_acum +=Number(element.innerText);
      });
      lista_dolares.forEach(element => {
          total_us_acum +=Number(element.innerText)          
      });
      
      var total_bs_acum_2=0;
      var total_us_acum_2=0;
      var tasa = tasa_modal.value
      total_us_acum_2=Number(total_us_acum)*Number(tasa);
      total_bs_acum_2=Number(total_bs_acum)/Number(tasa);
  
      document.getElementById('total_modal_pago_bs').value =Number(Number(total_us_acum_2)+Number(total_bs_acum)).toFixed(2)
  
      document.getElementById('total_usd_modal_pago').value = Number(Number(total_bs_acum_2)+Number(total_us_acum)).toFixed(2)
      
      document.getElementById('resto_pago_us').value = Number(Number(document.getElementById('total_usd_modal').value) -Number(document.getElementById('total_usd_modal_pago').value)).toFixed(2) 
  
      document.getElementById('resto_pago_bs').value = Number(Number(document.getElementById('total_modal').value) -Number(document.getElementById('total_modal_pago_bs').value)).toFixed(2) 

      if(document.getElementById('resto_pago_bs').value >0){
          document.getElementById('resto_pago_bs').style.fontWeight = 'bold';
          document.getElementById('resto_pago_bs').style.color = 'red';
      }else{
          document.getElementById('resto_pago_bs').style.fontWeight = 'normal';
          document.getElementById('resto_pago_bs').style.color = 'green';
      }

      if(document.getElementById('resto_pago_us').value >0){
          document.getElementById('resto_pago_us').style.fontWeight = 'bold';
          document.getElementById('resto_pago_us').style.color = 'red';
      }else{
          document.getElementById('resto_pago_us').style.fontWeight = 'normal';
          document.getElementById('resto_pago_us').style.color = 'green';
      }


      document.getElementById('desglose_valor').focus()
  }
  function calcular_igtf() {

      var chkigtf =document.querySelectorAll('.chk-igtf')
      var valor_igtf =0
      var valor_neto=0
      chkigtf.forEach(element => {
              if(element.checked==true){
                  valor_igtf+=Number(element.value)
                  valor_neto+=Number(element.dataset.valorusd)
              }
          });
      document.getElementById('factura_igtf').value=Number(valor_igtf).toFixed(2);
      document.getElementById('igtf').value=Number(valor_igtf).toFixed(2);
      
      let descuentos = Number(document.getElementById('descuentos').value)
      let valor_total_sindescuento =  Number(Number(document.getElementById('exento').value) + 
                                      Number(document.getElementById('base_imponible').value) + 
                                      Number(document.getElementById('iva').value))
      let total_menos_descuento = valor_total_sindescuento -    descuentos;                               

      var tasa = document.getElementById('tasa_modal').value;
      
      document.getElementById('total_modal').value=Number(Number(total_menos_descuento)+Number(valor_igtf)).toFixed(2)
      document.getElementById('total_factura').value=Number(Number(total_menos_descuento)+Number(valor_igtf)).toFixed(2)

      document.getElementById('total_usd_modal').value = Number((Number(document.getElementById('total_modal').value))/Number(tasa)).toFixed(2)
      document.getElementById('desglose_valor').value=Number(valor_igtf).toFixed(2);
      
      document.getElementById('moneda_desglose').value=2 // BS
      fetchFormaPago() //carga forma de pago de Bs
      document.getElementById('desglose_nota').value="IGTF aplica sobre $"+Number(valor_neto).toFixed(2);            
      document.getElementById('desglose_nota').disabled=true;
      
      calcular_desglose()
      document.getElementById('desglose_nota').focus()
      if(Number(document.getElementById('descuentos').value).toFixed(2) == 0.00){
        document.querySelector('.descuento_div').classList.add('d-none')
      }else{
          document.querySelector('.descuento_div').classList.remove('d-none')
      }
  }
  
function json_formas_pago(tabla, tipo) {

  if (
    Number(document.getElementById("resto_pago_bs").value) > 0 ||
    document.getElementById("resto_pago_bs").value == ""
  ) {
    Swal.fire({
        text: "El monto pagado de la factura no es suficiente para crearla",
        icon: "error",
        allowOutsideClick: () => false,
    }); 
    return;
  }

  var igtf = document.querySelectorAll(".chk-igtf");
  let has_igtf = false;
  igtf.forEach((element) => {
    if (element.checked == true) {
      has_igtf = true;
    }
  });

  let elementos = [];
  let igtf_pay = false;
  let por_pagar =false;
  const ID_ADMISION = new Set();
    detalles.forEach((element) => {
      ID_ADMISION.add(element.id_admision);    
    });
    let id_admision = Array.from(ID_ADMISION).join(','); 
    tabla.forEach((element) => {
      let tipo_p = tipo;
      var json_pagos = {};
      json_pagos.id_externa = id_admision;
      json_pagos.monto = element.children[0].children[1].innerText;
      json_pagos.nota = element.children[3].innerText;
    if (has_igtf && igtf_pay == false) {
      igtf_pay = element.children[3].innerText.startsWith("IGTF");
    }
    if (element.children[3].innerText.startsWith("IGTF")){
        tipo_p = "IGTF";
    }
    json_pagos.tipo = tipo_p;
    var id_moneda = element.children[0].children[0].innerText;
    if (id_moneda == "Bs") {
      id_moneda = "2";
    } else {
      id_moneda = "1";
    }
    if(element.children[2].innerText=='Por cobrar' || element.children[2].innerText=='Cashea'){
      por_pagar=true;
      var monto_cred = element.children[0].children[1].innerText;
      var moneda_cred = id_moneda;
      document.getElementById('moneda_credito').value=moneda_cred;
      document.getElementById('monto_credito').value=monto_cred;
    }
    json_pagos.id_moneda = id_moneda;
    json_pagos.id_forma_pago = element.children[2].children[0].innerText;
    json_pagos.id_usuario = id_usuario;
    json_pagos.id_cli = id_cli;
    let base_igtf_bs = !!element.querySelector('.chk-igtf').dataset.base_igtf_bs;
    if(base_igtf_bs==true){
      var base = element.querySelector('.chk-igtf').dataset.base_igtf_bs;      
      json_pagos.base_igtf=base
    }else{
            json_pagos.base_igtf=0
    }

    elementos.push(json_pagos);
  });
  if (has_igtf && igtf_pay == false) {
    return "No igtf";
  }
  if (por_pagar==false && document.getElementById('chk_contado').checked==false) {
    return "credito error";
  }
  
  return elementos;
}
let aceptar_modal = document.getElementById('aceptar_modal')

aceptar_modal.addEventListener('click', function () {
  let lista = document.getElementById("tabla_desglose");
    let listaN = lista.childElementCount;
    if(listaN==1){
      Swal.fire({
            text: "No hay desgloses, añadalos antes de aceptar",
            icon: "error",
            allowOutsideClick: () => false,
        });
      return
    }

    let restante = document.getElementById('resto_pago_bs')
    let tabla = document.querySelectorAll('.rowdesg.control')
   
  const ID_ADMISION = new Set();
    detalles.forEach((element) => {
      ID_ADMISION.add(element.id_admision);    
    });
    
    let json_forma = json_formas_pago(tabla, 'Factura ' + factura_modal.value)
 
    let lista_impuesto = document.querySelectorAll('.impuesto_ig');
    let total_impuesto = 0
    lista_impuesto.forEach(element =>{
      total_impuesto+=Number(element.innerText)
    })
var total_cant_igtf_row =0
var igtf_chk = document.querySelectorAll('.impuesto_ig')
igtf_chk.forEach(element =>{
    total_cant_igtf_row+=1
})
if(total_cant_igtf_row>1){
    Swal.fire({
        text: "Solo debe haber un monto cobrando el IGTF",
        icon: "error",
        allowOutsideClick: () => false,
    });  
  return;
}
var total_cant_igtf_chk =0
var igtf_chk = document.querySelectorAll('.chk-igtf')
var base_igtf_bs =0
igtf_chk.forEach(element =>{
  if(element.checked==true){  
   total_cant_igtf_chk+=1
   base_igtf_bs += Number(element.dataset.base_igtf_bs)
  }
})
if(total_cant_igtf_chk>=1 && total_cant_igtf_row==0){
    Swal.fire({
        text: "No se a cobrando el IGTF",
        icon: "error",
        allowOutsideClick: () => false,
    });  
  
  return;
}

    if(Number(document.getElementById('factura_igtf').value)!= Number(total_impuesto)){
        Swal.fire({
            text: "El monto pagado del IGTF esta incorrecto",
            icon: "error",
            allowOutsideClick: () => false,
        });  
      
      return;
    }

    if (Number(restante.value) > 0 || restante.value == '') {
        Swal.fire({
            text: "El monto pagado de la factura no es suficiente para crearla",
            icon: "error",
            allowOutsideClick: () => false,
        });         
        return;
    }
    if (json_forma == 'No igtf') {
        Swal.fire({
            title: "No se detecto el pago del IGTF",
            text: "Debe especificar al inicio de la nota el pago del mismo, en mayusculas y debe hacerse separado del resto de pagos",
            icon: "error",
            allowOutsideClick: () => false,
        });  
        
        return;
    }
    if (json_forma == 'credito error') {
        Swal.fire({
            title: "Por cobrar",
            text: "No hay ninguna cuenta Por cobrar y la factura es a credito, debe registrar el monto Por cobrar",
            icon: "error",
            allowOutsideClick: () => false,
        });        
      return;
  } 
    if (Number(restante.value) < 0) {
        document.getElementById('forma_de_pago').focus();
                
        Swal.fire({
            title: "El monto a pagar supera la factura, desea registrar el vuelto?",
            showDenyButton: true,
            showCancelButton: false,
                   confirmButtonColor: "#008b8b",
            confirmButtonText: "Dar vuelto",
            denyButtonText: `Continuar`
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById('desglose_valor').value = restante.value;
                document.getElementById('desglose_nota').value = 'VUELTO';
                document.getElementById('forma_de_pago').value = '';
                return;
            } else if (result.isDenied) {
                json_principal(json_forma);            }
        });
        return;
    }
    json_principal(json_forma);
})

async function json_principal(desglose_pago) {


  let table_detalle = document.getElementById('table_detalle');
  let rows = table_detalle.querySelectorAll('tr');
  let json_detalle = [];

  rows.forEach(row => {
    let cells = row.querySelectorAll('td');
    if (cells.length > 0) {
      let row_data = {
        descripcion: cells[0].innerText.trim(),
        cantidad: cells[1].innerText.trim(),
        precio: cells[2].innerText.trim(),
        precio_usd_tasa: cells[3].innerText.trim(),
        impuesto: cells[4].innerText.trim()
      };
      json_detalle.push(row_data);
    }
  });
    
    if (json_detalle.length == 0) {
        Swal.fire({
          title:"Facturación",
          text: "Nada que facturar",
          icon: 'error',
          confirmButtonColor: "#008b8b",
        });
        return 
    }

    if(document.getElementById('razon_social').value.trim()==""){
      Swal.fire({
        title:"Facturación",
        text: "Razon social no puede estar vacio",
        icon: 'error',
        confirmButtonColor: "#008b8b",
      });
      return 
    }

    if(document.getElementById('rif').value.trim()==""){
      Swal.fire({
        title:"Facturación",
        text: "RIF no puede estar vacio",
        icon: 'error',
        confirmButtonColor: "#008b8b",
      });
      return 
    }

    if(document.getElementById('dir_fiscal').value.trim()==""){
      Swal.fire({
        title:"Facturación",
        text: "Direccion Fiscal no puede estar vacio",
        icon: 'error',
        confirmButtonColor: "#008b8b",
      });
      return 
    }
    if(document.getElementById('num_control').value.trim()==""){
      Swal.fire({
        title:"Facturación",
        text: "Numero de control no puede estar vacio",
        icon: 'error',
        confirmButtonColor: "#008b8b",
      });
      return 
    }
    if(document.getElementById('num_factura').value.trim()==""){
      Swal.fire({
        title:"Facturación",
        text: "Numero de factura no puede estar vacia",
        icon: 'error',
        confirmButtonColor: "#008b8b",
      });
      return 
    }
    if(isNaN(document.getElementById('total_factura').value)||document.getElementById('total_factura').value==0||document.getElementById('total_factura').value==""){
      Swal.fire({
        title:"Facturación",
        text: "Error en el monto de facturacion",
        icon: 'error',
        confirmButtonColor: "#008b8b",
      });
      return 
    }

    if(document.getElementById('chk_contado').checked!=true){
      if(isNaN(document.getElementById('cuotas').value) || Number(document.getElementById('cuotas').value)<1){
        Swal.fire({
          title:"Cuotas",
          text: "Numero de cuotas invalidas",
          icon: 'error',
          confirmButtonColor: "#008b8b",
        });
        return 
      }
      if (document.getElementById('fecha_vencimiento').value) {
        let fechaVencimiento = new Date(document.getElementById('fecha_vencimiento').value);
        let fechaHoy = new Date();
        if (fechaVencimiento < fechaHoy) {
          Swal.fire({
            title: "Cuotas",
            text: "La fecha de vencimiento no puede ser menor a la fecha actual",
            icon: 'error',
            confirmButtonColor: "#008b8b",
          });
          return;
        }
      }
    }
   
    var igtf_chk = document.querySelectorAll('.chk-igtf')
    var base_igtf_bs =0
    igtf_chk.forEach(element =>{
        if(element.checked==true){  
            base_igtf_bs += Number(element.dataset.base_igtf_bs)
        }
    })

    let json_cuotas ={};

    let json_factura = {};

    json_factura.formato_factura =document.getElementById('sel_formato').value;
    json_factura.tipo_agrupamiento = document.querySelector('input[name="rad_tipo_agrupamiento"]:checked').value; 
    json_factura.base_igtf =base_igtf_bs
    json_factura.id_usuario = id_usuario;
    const ID_ADMISION = new Set();
      detalles.forEach((element) => {
        ID_ADMISION.add(element.id_admision);    
      });
    json_factura.paciente = document.getElementById('pacientes').value;
    json_factura.titular = document.getElementById('titular').value;
    json_factura.razon_social  = document.getElementById('razon_social').value;
    json_factura.rif  = document.getElementById('rif').value;
    json_factura.direccion_f  = document.getElementById('dir_fiscal').value;
    json_factura.nota  = document.getElementById('nota').value;
    json_factura.fecha_atencion  = document.getElementById('fecha_atencion').value;
    json_factura.fecha_emision  = document.getElementById('fecha_emision').value;
    json_factura.fecha_vencimiento  = document.getElementById('fecha_vencimiento').value;
    json_factura.id_admision = ID_ADMISION.values().next().value;
    json_factura.id_cli = id_cli;
    json_factura.num_control = document.getElementById('num_control').value;
    if(document.getElementById('chk_contado').checked==true){
        json_factura.contado='1';
        json_factura.cuotas='1';            
    }else{
        json_factura.contado='0';
        json_factura.cuotas=document.getElementById('cuotas').value;
        json_cuotas = crear_cuotas(ID_ADMISION.values().next().value)
    }
    var numero_factura = document.getElementById('factura_modal').value
    if (numero_factura.length <8) {
        numero_factura=numero_factura.slice(0, 8).padStart(8, '0');
    }
    json_factura.factura =numero_factura
    json_factura.tasa = document.getElementById('tasa_modal').value;
    json_factura.exento = document.getElementById('exento').value;
    json_factura.bi16 = document.getElementById('base_imponible').value;
    json_factura.iva16 = document.getElementById('iva').value;
    json_factura.igtf = document.getElementById('igtf').value;
    json_factura.total = document.getElementById('total_factura').value;
    json_factura.descuentos = document.getElementById('descuentos').value;

    facturar(desglose_pago,json_cuotas,json_factura,json_detalle)
    
    myModal.hide();

}
 
async function facturar(desglose_pago,json_cuotas,json_factura,json_detalle) {
  
    const items_inventario = detalles
        .filter(item => item.inventario == 1)         // Filtramos por inventario > 0
        .map(item => item.id_detalle)                // Obtenemos solo id_detalle
        .join(', ');  

  Swal.fire({
    title: "Facturando",
    text: "Creando la factura",
    icon: "info"
  })
  Swal.showLoading()
  const datosAEnviar = {
    desglose_pago: desglose_pago,
    json_cuotas: json_cuotas,
    json_factura: json_factura,
    json_detalle: json_detalle,
    items_inventario:items_inventario
};
   const response = await fetch(
        `${HOST}/api/facturar`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosAEnviar),
        }
    );     
    let factura = await response.json();
    if(factura.error){
      console.log(factura)
      Swal.update({
        text: factura.error[0].message ,
        icon: "error",
        confirmButtonColor: "#008b8b",
      })
      Swal.hideLoading()
      return
    }
    if(factura.success==false){
      console.log(factura)
      Swal.update({
        text: factura.resultados ,
        icon: "error",
        confirmButtonColor: "#008b8b",
      })
      Swal.hideLoading()
      return
    }
    
    if(factura.success==true){
      STATUS_FACTURA = 2
      document.getElementById('agregar_admi').remove()
      document.getElementById('nueva_factura').classList.remove('d-none')
          let divFactFactura = document.getElementById('div_fact_factura');
          if (divFactFactura) {
            let newDiv = divFactFactura.cloneNode(true);
            divFactFactura.parentNode.replaceChild(newDiv, divFactFactura);
            if (newDiv.firstElementChild) {
              newDiv.firstElementChild.classList.add('mascara-gris');
            }
            
          }
      Swal.update({
        icon: "success",      
      })
      Swal.hideLoading()
      
    Swal.fire({
      title: "Facturando",
      text: "Creada correctamente" ,
      icon: "success",
        confirmButtonColor: "#008b8b",
    }).then(() => {
      generada=true;      
      
      Swal.fire({
        title: "¿Qué desea hacer?",
        text: "La factura fue creada correctamente.",
        icon: "success",
        showCancelButton: true,
        confirmButtonColor: "#008b8b",
        confirmButtonText: "Imprimir factura",
        cancelButtonText: "Crear otra factura",
        allowOutsideClick: true
      }).then((result) => {
        if (result.isConfirmed) {
          imprimirFactura()
        } else {
          location.reload();
        }
      });
    });
      
   }
}