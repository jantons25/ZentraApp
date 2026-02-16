import mongoose from "mongoose";
import Espacio from "../models/espacio.model.js";

const normText = (v) => (v?.trim() ? v.trim() : "");
const normArr = (v) => (Array.isArray(v) ? v : []);

export const createEspacio = async (data) => {
  try {
    if (!data?.nombre?.trim())
      throw new Error("El nombre del espacio es obligatorio.");

    const nombre = data.nombre.trim();

    // Evitar duplicados por nombre (OK porque el schema ya tiene unique,
    // esto solo mejora el mensaje)
    const espacioExistente = await Espacio.findOne({ nombre });
    if (espacioExistente)
      throw new Error("Ya existe un espacio con ese nombre.");

    const nuevoEspacio = new Espacio({
      nombre,
      sede: normText(data.sede) || "Nexus Cowork",
      piso: data.piso ?? null,

      tipo: data.tipo || "oficina",
      capacidad: Number(data.capacidad ?? 1),
      precio_por_hora: Number(data.precio_por_hora ?? 0),

      // ✅ reemplazo de disponibilidad
      habilitado_reservas: data.habilitado_reservas ?? true,

      estado: data.estado || "disponible",
      descripcion: normText(data.descripcion),

      servicios: normArr(data.servicios),
      tarifas: normArr(data.tarifas),

      equipamiento: normArr(data.equipamiento),
      imagenes: normArr(data.imagenes),
      color_tag: normText(data.color_tag),
    });
    
    const espacioGuardado = await nuevoEspacio.save();

    return {
      message: "Espacio creado correctamente.",
      espacio: espacioGuardado,
    };
  } catch (error) {
    throw new Error(`Error al crear espacio: ${error.message}`);
  }
};

export const getEspacios = async ({ soloActivos = false } = {}) => {
  try {
    const query = soloActivos ? { estado: "activo" } : {};
    const espacios = await Espacio.find(query).sort({ nombre: 1 });
    return espacios; // devuelve []
  } catch (error) {
    throw new Error(`Error al obtener espacios: ${error.message}`);
  }
};

export const getEspacioById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido.");

    const espacio = await Espacio.findById(id);
    if (!espacio) throw new Error("Espacio no encontrado.");

    return espacio;
  } catch (error) {
    throw new Error(`Error al obtener espacio por ID: ${error.message}`);
  }
};

export const updateEspacio = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido.");

    const espacio = await Espacio.findById(id);
    if (!espacio) throw new Error("Espacio no encontrado.");

    // Evitar duplicados por nombre
    if (data.nombre?.trim()) {
      const nombre = data.nombre.trim();
      const espacioExistente = await Espacio.findOne({
        nombre,
        _id: { $ne: id },
      });
      if (espacioExistente)
        throw new Error("Ya existe un espacio con ese nombre.");
    }

    // Patch controlado (evita meter campos no deseados)
    const patch = {};

    if (data.nombre !== undefined) patch.nombre = normText(data.nombre);
    if (data.sede !== undefined)
      patch.sede = normText(data.sede) || "Nexus Cowork";
    if (data.piso !== undefined) patch.piso = data.piso ?? null;

    if (data.tipo !== undefined) patch.tipo = data.tipo;
    if (data.capacidad !== undefined) patch.capacidad = Number(data.capacidad);
    if (data.precio_por_hora !== undefined)
      patch.precio_por_hora = Number(data.precio_por_hora);

    if (data.habilitado_reservas !== undefined)
      patch.habilitado_reservas = !!data.habilitado_reservas;
    if (data.estado !== undefined) patch.estado = data.estado;

    if (data.descripcion !== undefined)
      patch.descripcion = normText(data.descripcion);
    if (data.servicios !== undefined) patch.servicios = normArr(data.servicios);
    if (data.tarifas !== undefined) patch.tarifas = normArr(data.tarifas);

    if (data.equipamiento !== undefined)
      patch.equipamiento = normArr(data.equipamiento);
    if (data.imagenes !== undefined) patch.imagenes = normArr(data.imagenes);
    if (data.color_tag !== undefined)
      patch.color_tag = normText(data.color_tag);

    const espacioActualizado = await Espacio.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true }
    );

    return {
      message: "Espacio actualizado correctamente.",
      espacio: espacioActualizado,
    };
  } catch (error) {
    throw new Error(`Error al actualizar espacio: ${error.message}`);
  }
};

export const deleteEspacio = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido.");

    const espacio = await Espacio.findById(id);
    if (!espacio) throw new Error("Espacio no encontrado.");

    // Soft delete
    espacio.estado = "inactivo";
    espacio.habilitado_reservas = false;

    await espacio.save();

    return { message: "Espacio desactivado correctamente." };
  } catch (error) {
    throw new Error(`Error al eliminar espacio: ${error.message}`);
  }
};
