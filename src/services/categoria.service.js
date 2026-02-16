import Categoria from "../models/categoria.model.js";

export const crearCategoria = async (data) => {
  try {
    // 1. Validación: evitar duplicados por nombre
    const categoriaExistente = await Categoria.findOne({
      nombre: data.nombre.trim(),
    });
    if (categoriaExistente) {
      throw new Error("Ya existe una categoría con ese nombre.");
    }

    // 2. Validación: verificar que el nombre no esté vacío
    if (!data.nombre || data.nombre.trim() === "") {
      throw new Error("El nombre de la categoría es obligatorio.");
    }

    // 3. Crear y guardar la nueva categoría
    const nuevaCategoria = new Categoria({
      nombre: data.nombre.trim(),
      descripcion: data.descripcion || "",
      estado: data.estado !== undefined ? data.estado : "activo",
      user: data.user, // Asumiendo que 'user' es un ID de usuario válido
    });
    await nuevaCategoria.save();

    // 4. Retornar el mensaje de categoría creada
    return { message: "Categoría creada correctamente." };
  } catch (error) {
    throw new Error(`Error al crear categoría: ${error.message}`);
  }
};

export const getCategorias = async () => {
  try {
    // 1. Obtener todas las categorías ordenadas por nombre
    const categorias = await Categoria.find().sort({ nombre: 1 });

    // 2. Verificar si se encontraron categorías
    if (!categorias.length) {
      throw new Error("No se encontraron categorías.");
    }

    // 3. Retornar las categorías encontradas
    return {
      mensaje: "Categorías obtenidas correctamente.",
      categorias: categorias,
    };
  } catch (error) {
    throw new Error(`Error al obtener categorías: ${error.message}`);
  }
};

export const getCategoriaById = async (id) => {
  try {
    // 1. Validación: verificar que el ID sea válido
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      throw new Error("Categoría no encontrada.");
    }

    // 2. Retornar la categoría encontrada
    return {
      mensaje: "Categoría obtenida correctamente.",
      categoria: categoria,
    };
  } catch (error) {
    throw new Error(`Error al obtener categoría por ID: ${error.message}`);
  }
};

export const updateCategoria = async (id, data) => {
  try {
    // 1. Validación: verificar que el ID sea válido y que la categoría exista
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      throw new Error("Categoría no encontrada.");
    }
    // 2. Validación: verificar que el nombre no esté vacío
    if (!data.nombre || data.nombre.trim() === "") {
      throw new Error("El nombre de la categoría es obligatorio.");
    }
    // 3. Validación: evitar duplicados por nombre
    if (data.nombre) {
      const categoriaExistente = await Categoria.findOne({
        nombre: data.nombre.trim(),
        _id: { $ne: id }, // Excluir la categoría actual
      });
      if (categoriaExistente) {
        throw new Error("Ya existe una categoría con ese nombre.");
      }
    }
    // 4. Actualizar la categoría
    await Categoria.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    // 5. Retornar el mensaje de categoría actualizada
    return { message: "Categoría actualizada correctamente." };
  } catch (error) {
    throw new Error(`Error al actualizar categoría: ${error.message}`);
  }
};

export const deleteCategoria = async (id) => {
  try {
    // 1. Validación: verificar que el ID sea válido y que la categoría exista
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      throw new Error("Categoría no encontrada.");
    }
    // 2. Cambiar de estado a "inactivo" en lugar de eliminar
    categoria.estado = "inactivo";
    await categoria.save();
    // 3. Retornar el mensaje de categoría eliminada
    return {
      message:
        "Categoría eliminada correctamente (estado cambiado a inactivo).",
    };
  } catch (error) {
    throw new Error(`Error al eliminar categoría: ${error.message}`);
  }
};
