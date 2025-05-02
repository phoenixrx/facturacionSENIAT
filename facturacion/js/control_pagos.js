  $("#modal_pagos").on("shown.bs.modal", function () {
    $(this).find("#desglose_valor").focus();
  });
let IGFT  = 0.03
  
  function add_desgl() {
    let moneda_desg = document.getElementById("moneda_desglose");
    let forma_pag = document.getElementById("forma_de_pago");
    let lista = document.getElementById("tabla_desglose");
    let listaN = lista.childElementCount;
    let valor_desglose = document.getElementById("desglose_valor").value;
    let nota = document.getElementById("desglose_nota").value;
  
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
    
    var tasa = document.getElementById('tasa_actual').innerText
        if(document.getElementById('chk_tasa_admision').checked){
            tasa =document.getElementById('chk_tasa_admision').dataset.tasa
        }
    var igtf_val = (Number(valor_desglose) * Number(IGFT))*tasa;
    var base_igtf_bs = Number(valor_desglose)*tasa;
    var id_igtf = Math.floor(Math.random() * 100000) + 1;
    var igtf_chk =`<div class="form-check form-switch">
    <input class="form-check-input chk-igtf" type="checkbox" id="igtf_${id_igtf}"  data-toggle="tooltip" 
    data-placement="left" title="Calcular IGTF" value='${igtf_val}' data-base_igtf_bs='${base_igtf_bs}'  data-valorusd="${valor_desglose}" >
  </div>`;
    if (tipo_moneda != "Bs") {
          tipo_moneda ='pago-en-dolares';
      }else{
          tipo_moneda ='pago-en-bolivares';
          igtf_chk = `<div class="form-check form-switch">
            <input class="form-check-input chk-igtf d-none" type="checkbox" id="igtf_${id_igtf}"  value='0' >`;
     }
     
  var quitar =`<lord-icon src="../images/minus-circle.json" data-toggle="tooltip" data-placement="left" title="Quitar" id='quitar_${listaN}' trigger="hover" style="width:20px;height:20px" class="svg disk_save botonera" id=agregar_descuento>
                              </lord-icon>`;
  
    let row = `<tr class="rowdesg control row${tipo_moneda}" id="rowidesg${listaN}"><td><span>${
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
  
  document
    .getElementById("desglose_nota")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter" || e.key === "Intro") {
        add_desgl();
      }
    });
  
  
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
      var tasa = document.getElementById('tasa_actual').innerText
        if(document.getElementById('chk_tasa_admision').checked){
            tasa =document.getElementById('chk_tasa_admision').dataset.tasa
        }
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
      var valor= document.getElementById('total_modal').getAttribute('data-ph-valor');
      document.getElementById('total_modal').value=Number(Number(valor)+Number(valor_igtf)).toFixed(2)
      document.getElementById('total_factura').value=Number(Number(valor)+Number(valor_igtf)).toFixed(2)
      
      var tasa = document.getElementById('tasa_actual').innerText
        if(document.getElementById('chk_tasa_admision').checked){
            tasa =document.getElementById('chk_tasa_admision').dataset.tasa
        }
        document.getElementById('total_usd_modal').value = Number(Number(document.getElementById('total_modal').value)/Number(tasa)).toFixed(2)
      document.getElementById('desglose_valor').value=Number(valor_igtf).toFixed(2);
      document.getElementById('desglose_nota').value="IGTF aplica sobre $"+Number(valor_neto).toFixed(2);
      
      document.getElementById('desglose_nota').disabled=true;
      document.getElementById('moneda_desglose').value="2";
      document.getElementById('forma_de_pago').value="1";
      calcular_desglose()
      document.getElementById('desglose_nota').focus()
  }
  
function json_formas_pago(id_admision, tabla, tipo) {
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
    json_pagos.id_usuario = ID_USUARIO;
    json_pagos.id_cli = ID_CLI;
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
    let restante = document.getElementById('resto_pago_bs')
    let tabla = document.querySelectorAll('.rowdesg.control')
    let json_forma = json_formas_pago(ID_ADMISION, tabla, 'Factura ' + factura_modal.value)
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
    let row_detalle = document.querySelectorAll('.row_detalle');
        if (row_detalle.length == 0) {
            activar_modal('Nada que facturar', 'err');
            return
        }

    //validar en be factura duplicada o control duplicado
    
    let elementos = [];

    row_detalle.forEach((element) => {
        var json_detalle = {};
        json_detalle.id_factura = '?';
        json_detalle.descripcion = element.children[0].innerText;
        json_detalle.cantidad = element.children[1].innerText;            
        json_detalle.precio = element.children[2].innerText;
        json_detalle.precio_usd_tasa = element.children[3].innerText;
        json_detalle.impuesto = element.children[4].innerText;
        try {
            json_detalle.clase=element.dataset.clase
        } catch (error) {

        }
        elementos.push(json_detalle);
    });
    var igtf_chk = document.querySelectorAll('.chk-igtf')
    var base_igtf_bs =0
    igtf_chk.forEach(element =>{
        if(element.checked==true){  
            base_igtf_bs += Number(element.dataset.base_igtf_bs)
        }
    })

    var representante = document.getElementById('representante').value;
    if (representante==' C.I.' || representante == ''){
        representante = document.getElementById('paciente').value;
    }
    var razon_social = document.getElementById('razon_social').value.trim();
    if(razon_social==''){
        razon_social=representante;
    }
    var json_factura = {};
    
    json_factura.paciente = document.getElementById('paciente').value;
    representante=(representante=='')?document.getElementById('paciente').value:representante;
    json_factura.titular = representante;
    json_factura.razon_social = (razon_social=='')?representante:razon_social;
    json_factura.rif = document.getElementById('RIF').value;
    json_factura.direccion_f = document.getElementById('dir_fis').value;
    var numero_factura = factura_modal.value
    if (numero_factura.length <8) {
        numero_factura=numero_factura.slice(0, 8).padStart(8, '0');
    }
    json_factura.factura = numero_factura;
    json_factura.fecha_atencion = document.getElementById('fecha_atencion').value;
    json_factura.fecha_emision = document.getElementById('fecha_emision').value;
    json_factura.nota = document.getElementById('nota_factura').value;
    var exento =document.getElementById('exento').value;
    json_factura.exento = exento;
    var bi16 =document.getElementById('bi16').value;
    json_factura.bi16 = bi16;
    var igtf= document.getElementById('igtf').value;
    json_factura.igtf = igtf;
    var iva16 =document.getElementById('iva16').value;
    json_factura.iva16 = iva16;
    var total =document.getElementById('total').value;
    json_factura.total = total;
    json_factura.base_igtf =base_igtf_bs
    json_factura.id_usuario = ID_USUARIO;
    json_factura.id_admision = ID_ADMISION;
    json_factura.id_cli = ID_CLI;
    json_factura.num_control = document.getElementById('num_control').value;
    if(document.getElementById('chk_contado').checked==true){
        json_factura.contado='1';
        json_factura.cuotas='1';            
    }else{
        json_factura.contado='0';
        json_factura.cuotas=document.getElementById('cuotas').value;
        json_factura.fecha_vencimiento=document.getElementById('fecha_vencimiento').value;
        crear_cuotas()
    }

    guardar_dato_esperar_id(
        "../php/insertar_devolverid.php",
        "tabla=facturas&json=" + encodeURIComponent(JSON.stringify(json_factura)),
        "../php/guardar_datos_multiples.php",
        "tabla=factura_detalle&json=" +
        encodeURIComponent(JSON.stringify(elementos)),
        "id_factura",
        "factura_cambio",
        "application/x-www-form-urlencoded",
        "application/x-www-form-urlencoded",
        "id_factura"
    );

    var fecha_hoy = moment(new Date(Date.now()));
    var numero_factura = factura_modal.value
    if (numero_factura.length <8) {
        numero_factura=numero_factura.slice(0, 8).padStart(8, '0');
    }
    guardar_dato(
        "../php/actualizar_dato.php",
        "arg1=admisiones&arg2=solo_ppto=0, id_status_cierre=2,id_usuario_cierre=" +
        ID_USUARIO +
        ",fecha_cierre=now(),motivo_cierre='Factura " + numero_factura
        + "', factura='" + numero_factura
        + "'&arg3=WHERE id_admision='"
        + ID_ADMISION
        + "'", "factura"
    );
    guardar_dato(
  "../admisiones/actualizar_venta_almacn.php",
  "id_admision="+ID_ADMISION+"&id_reserva="+ALM_RES,
  "factura",
  "application/x-www-form-urlencoded"
);
  guardar_dato(
        "../php/guardar_datos_multiples.php",
        "tabla=control_pagos&campo_id=''&valor_id=''&json=" +
        encodeURIComponent(JSON.stringify(desglose_pago)),
        "factura",
        "application/x-www-form-urlencoded"
    );
    myModal.hide();
    STATUS_FACTURA = 2;
    activar_modal('Factura creada correctamente', 'ok')
    setTimeout(() => {
        var url = "<?= $archivo_detalle ?>?id_admision=" + ID_ADMISION + "&fact_num=" + factura_modal.value;
        var win = window.open(url, "_blank");

    var url = (formatos.value=="")?"<?= $archivo_factura ?>":formatos.value;
    var data ={ 'id_admision': ID_ADMISION, 'fact_num': factura_modal.value}
    var form = document.createElement("form");
    form.target = "_blank";
    form.method = "POST";
    form.action = url;
    form.style.display = "none";

    for (var key in data) {
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);


    }, 1000);
}