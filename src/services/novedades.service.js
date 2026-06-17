import Novedad from "../models/novedades.model.js";

const POPULATE_USUARIO = { path: "usuario", select: "username name role sede" };

const crearError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Solo el creador de la novedad o un administrador pueden modificarla/eliminarla
const puedeGestionar = (novedad, usuario) =>
  ["admin", "superadmin"].includes(usuario.role) ||
  String(novedad.usuario?._id ?? novedad.usuario) === String(usuario.id);

export const obtenerNovedades = async (sede, filtros = {}) => {
  const query = { sede: sede || "", activo: true };

  if (filtros.tipo) query.tipo = filtros.tipo;
  if (filtros.estado) query.estado = filtros.estado;
  if (filtros.usuario) query.usuario = filtros.usuario;

  if (filtros.busqueda) {
    const regex = new RegExp(filtros.busqueda.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ titulo: regex }, { descripcion: regex }];
  }

  return Novedad.find(query)
    .populate(POPULATE_USUARIO)
    .sort({ fechaRegistro: -1 });
};

export const obtenerNovedadPorId = async (novedadId) => {
  const novedad = await Novedad.findOne({ _id: novedadId, activo: true }).populate(POPULATE_USUARIO);
  if (!novedad) throw crearError("Novedad no encontrada", 404);
  return novedad;
};

export const crearNovedad = async (datos, userId, sede) => {
  const { titulo, descripcion, tipo, estado } = datos;

  if (!titulo?.trim() || !descripcion?.trim()) {
    throw crearError("Datos inválidos para la novedad.");
  }

  const nuevaNovedad = new Novedad({
    titulo: titulo.trim(),
    descripcion: descripcion.trim(),
    ...(tipo ? { tipo } : {}),
    ...(estado ? { estado } : {}),
    usuario: userId,
    sede: sede || "",
  });

  const novedadGuardada = await nuevaNovedad.save();
  await novedadGuardada.populate(POPULATE_USUARIO);

  return { message: "Novedad registrada exitosamente", novedad: novedadGuardada };
};

export const actualizarNovedad = async (novedadId, nuevosDatos, usuario) => {
  const novedad = await Novedad.findOne({ _id: novedadId, activo: true });
  if (!novedad) throw crearError("Novedad no encontrada", 404);

  if (!puedeGestionar(novedad, usuario)) {
    throw crearError("No tienes permisos para modificar esta novedad", 403);
  }

  if (nuevosDatos.titulo != null) novedad.titulo = String(nuevosDatos.titulo).trim();
  if (nuevosDatos.descripcion != null) novedad.descripcion = String(nuevosDatos.descripcion).trim();
  if (nuevosDatos.tipo != null) novedad.tipo = nuevosDatos.tipo;
  if (nuevosDatos.estado != null) novedad.estado = nuevosDatos.estado;

  const guardada = await novedad.save();
  await guardada.populate(POPULATE_USUARIO);

  return { message: "Novedad actualizada correctamente", novedad: guardada };
};

export const eliminarNovedad = async (novedadId, usuario) => {
  const novedad = await Novedad.findOne({ _id: novedadId, activo: true });
  if (!novedad) throw crearError("Novedad no encontrada", 404);

  if (!puedeGestionar(novedad, usuario)) {
    throw crearError("No tienes permisos para eliminar esta novedad", 403);
  }

  // Eliminación lógica para conservar la trazabilidad del turno
  novedad.activo = false;
  await novedad.save();

  return { message: "Novedad eliminada correctamente" };
};
