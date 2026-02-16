import {
  crearDetalleReserva,
  agregarPagoDetalleReserva,
} from "../services/detalleReserva.service.js";

// Crear un nuevo detalle de reserva
export const registrarDetalleReserva = async (req, res) => {
  try {
    // Si tu ruta incluye reservaId, úsalo (más limpio)
    const reservaId = req.params.reservaId || req.body.reservaId;

    const payload = {
      ...req.body,
      reservaId,
      // Si tienes auth:
      registrado_por: req.user?.id || req.body.registrado_por || null,
    };

    const resultado = await crearDetalleReserva(payload);
    res.status(201).json(resultado);
  } catch (error) {
    const status = error.message.includes("inválido")
      ? 400
      : error.message.includes("no encontrada")
      ? 404
      : 400;

    res.status(status).json({ mensaje: error.message });
  }
};

// Agregar un pago al detalle de reserva
export const registrarPagoDetalleReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;

    const {
      monto_pago,
      metodo_pago,
      observacion_pago,
      referencia,
      comprobante_url,
      fecha_pago,
    } = req.body;

    if (!monto_pago || Number(monto_pago) <= 0) {
      return res
        .status(400)
        .json({ mensaje: "El monto_pago debe ser un número positivo." });
    }

    const resultado = await agregarPagoDetalleReserva({
      reservaId,
      monto_pago: Number(monto_pago),
      metodo_pago,
      observacion_pago,
      referencia,
      comprobante_url,
      fecha_pago,
      registrado_por: req.user?.id || null, // mejor desde auth
    });

    res.status(200).json(resultado);
  } catch (error) {
    const status = error.message.includes("inválido")
      ? 400
      : error.message.includes("no encontrado")
      ? 404
      : 400;

    res.status(status).json({ mensaje: error.message });
  }
};
