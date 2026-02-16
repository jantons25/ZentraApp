import {
  crearReserva,
  getReservas,
  getReservaById,
  actualizarReserva,
  eliminarReserva,
} from "../services/reserva.service.js";

// Crear una nueva reserva
export const registrarReserva = async (req, res) => {
  try {
    // Si usas auth, conviene forzar usuario desde token:
    // const usuarioId = req.user?.id;
    // const payload = { ...req.body, usuario: usuarioId || req.body.usuario };

    const resultado = await crearReserva(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener todas las reservas con detalle (paginación + filtros)
export const obtenerReservas = async (req, res) => {
  try {
    const {
      desde,
      hasta,
      estado,
      espacio,
      tipo,
      cliente,
      page = 1,
      limit = 50,
    } = req.query;

    const opts = {
      filtros: {
        ...(desde ? { desde } : {}),
        ...(hasta ? { hasta } : {}),
        ...(estado ? { estado } : {}),
        ...(espacio ? { espacio } : {}),
        ...(tipo ? { tipo } : {}),
        ...(cliente ? { cliente } : {}),
      },
      page: Number(page),
      limit: Number(limit),
      sort: { inicio: -1 },
    };

    const reservas = await getReservas(opts);
    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener reserva por ID con detalle
export const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await getReservaById(id);
    res.status(200).json(resultado);
  } catch (error) {
    // Si quieres distinguir 400 vs 404, lo ideal es lanzar errores tipados en service.
    // Por ahora, devolvemos 404 si el mensaje sugiere no encontrado, sino 400.
    const status = error.message.includes("no encontrada") ? 404 : 400;
    res.status(status).json({ mensaje: error.message });
  }
};

// Actualizar reserva y su detalle
export const editarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    // Si usas auth, conviene forzar usuario desde token:
    // const payload = { ...req.body, usuario: req.user?.id };

    const resultado = await actualizarReserva(id, req.body);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Cancelar reserva (soft delete)
export const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    // Ideal: viene del middleware de auth
    const usuarioId = req.user?.id || req.body.usuario || null;

    // Motivo opcional
    const motivo = req.body?.motivo_cancelacion || req.body?.motivo || "";

    const resultado = await eliminarReserva(id, usuarioId, motivo);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};
