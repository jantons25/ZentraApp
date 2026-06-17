import * as Yup from "yup";

export const ventaItemSchema = Yup.object().shape({
  producto: Yup.string().required("Seleccione un producto"),
  cantidad: Yup.number()
    .typeError("Digite un número válido")
    .integer("Debe ser entero")
    .positive("Debe ser mayor a cero")
    .required("Cantidad obligatoria"),
  precio_venta: Yup.number()
    .typeError("Digite un número válido")
    .positive("Debe ser mayor a cero")
    .required("Precio obligatorio"),
  pago_registrado: Yup.string().required("Seleccione si está pagado"),
  habitacion: Yup.string().when("pago_registrado", {
    is: "No",
    then: (schema) => schema.required("Seleccione una habitación")
  })
});
