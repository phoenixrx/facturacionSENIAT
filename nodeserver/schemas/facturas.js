const z = require('zod')
const facturaSchema = z.object({
  paciente: z.string().min(6),
  titular: z.string().min(6),
  razon_social: z.string().min(6),
  rif: z.string().min(6),
  direccion_f: z.string().min(6),
  factura: z.string().min(6).max(12),
  fecha_atencion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date fecha_admision",
  }),
  fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date fecha_admision",
  }),
   fecha_vencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date fecha_vencimiento",
  }),
  nota: z.string().min(4),
  exento: z.coerce.number().nonnegative(),
  bi16: z.coerce.number().nonnegative(),
  iva16: z.coerce.number().nonnegative(),
  igtf: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative(),
  base_igtf: z.coerce.number().nonnegative(),
  descuentos: z.coerce.number().nonnegative(),
  num_control: z.coerce.number().int(),
  id_usuario: z.coerce.number().int().min(1).max(9999),
  id_admision: z.coerce.number().int().min(1).max(999999),
  id_cli: z.coerce.number().int().min(1).max(999),
  contado: z.coerce.number().int().min(0).max(1),
  cuotas: z.coerce.number().int().min(1).max(99),
    formato_factura:z.coerce.number().int().min(1).max(99),
    tipo_agrupamiento:z.string().min(3),
  })

    function validateFactura(object){
        return facturaSchema.safeParseAsync(object)  
    }

  module.exports = {validateFactura}