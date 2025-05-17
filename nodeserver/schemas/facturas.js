const z = require('zod')
const facturaSchema = z.object({
  paciente: z.string().min(6, { message: "El campo paciente debe tener al menos 6 caracteres" }),
  titular: z.string().optional(),
  razon_social: z.string().min(6, { message: "El campo razón social debe tener al menos 6 caracteres" }),
  rif: z.string().min(6, { message: "El campo RIF debe tener al menos 6 caracteres" }),
  direccion_f: z.string().min(6, { message: "El campo dirección debe tener al menos 6 caracteres" }),
  factura: z.string().min(6, { message: "El número de factura debe tener al menos 6 caracteres" }).max(12, { message: "El número de factura no debe exceder 12 caracteres" }),
  fecha_atencion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha de atención debe tener el formato YYYY-MM-DD" }),
  fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha de emisión debe tener el formato YYYY-MM-DD" }),
  fecha_vencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha de vencimiento debe tener el formato YYYY-MM-DD" }),
  nota: z.string().min(4, { message: "La nota debe tener al menos 4 caracteres" }),
  exento: z.coerce.number().nonnegative({ message: "El campo exento debe ser un número no negativo" }),
  bi16: z.coerce.number().nonnegative({ message: "El campo base imponible debe ser un número no negativo" }),
  iva16: z.coerce.number().nonnegative({ message: "El campo iva debe ser un número no negativo" }),
  igtf: z.coerce.number().nonnegative({ message: "El campo IGTF debe ser un número no negativo" }),
  total: z.coerce.number().nonnegative({ message: "El campo total debe ser un número no negativo" }),
  base_igtf: z.coerce.number().nonnegative({ message: "El campo base IGTF debe ser un número no negativo" }),
  descuentos: z.coerce.number().nonnegative({ message: "El campo descuentos debe ser un número no negativo" }),
  num_control: z.coerce.number().int({ message: "El número de control debe ser un número entero" }),
  id_usuario: z.coerce.number().int({ message: "El ID de usuario no se capturo" }).min(1, { message: "El ID de usuario debe ser mayor o igual a 1" }).max(9999, { message: "El ID de usuario no debe exceder 9999" }),
  id_admision: z.coerce.number().int({ message: "El ID de admisión no se capturo" }).min(1, { message: "El ID de admisión debe ser mayor o igual a 1" }).max(999999, { message: "El ID de admisión no debe exceder 999999" }),
  id_cli: z.coerce.number().int({ message: "El ID de cliente dno se capturo" }).min(1, { message: "El ID de cliente debe ser mayor o igual a 1" }).max(999, { message: "El ID de cliente no debe exceder 999" }),
  contado: z.coerce.number().int({ message: "El campo contado debe ser un número entero" }).min(0, { message: "El campo contado debe ser 0 o 1" }).max(1, { message: "El campo contado debe ser 0 o 1" }),
  cuotas: z.coerce.number().int({ message: "El campo cuotas debe ser un número entero" }).min(1, { message: "El campo cuotas debe ser mayor o igual a 1" }).max(99, { message: "El campo cuotas no debe exceder 99" }),
  formato_factura: z.coerce.number().int({ message: "El campo formato de factura debe ser un número entero" }).min(1, { message: "El campo formato de factura debe ser mayor o igual a 1" }).max(99, { message: "El campo formato de factura no debe exceder 99" }),
  tipo_agrupamiento: z.string().min(3, { message: "El tipo de agrupamiento debe tener al menos 3 caracteres" }),
})

    function validateFactura(object){
        return facturaSchema.safeParseAsync(object)  
    }

  module.exports = {validateFactura}