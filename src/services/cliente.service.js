import Cliente from "../models/cliente.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Helpers
const normEmail = (v) => (v?.trim() ? v.trim().toLowerCase() : undefined);
const normText = (v) => (v?.trim() ? v.trim() : "");
const normDni = (v) => (v?.trim() ? v.trim() : undefined);

export const crearCliente = async (data) => {
  try {
    if (!data?.nombre?.trim()) throw new Error("El nombre es obligatorio.");

    const correo = normEmail(data.correo);
    const dni = normDni(data.dni);
    const telefono = normText(data.telefono);

    // Alineado a la validación del schema: correo o teléfono
    if (!correo && !telefono) {
      throw new Error("El cliente debe tener al menos un correo o teléfono.");
    }

    // ✅ Deduplicación real (dni/correo). Nombre NO.
    if (dni) {
      const existeDni = await Cliente.findOne({ dni });
      if (existeDni) throw new Error("Ya existe un cliente con ese DNI.");
    }
    if (correo) {
      const existeCorreo = await Cliente.findOne({ correo });
      if (existeCorreo) throw new Error("Ya existe un cliente con ese correo.");
    }

    // Hashear contraseña si viene
    let hashedPassword = null;
    if (data.password?.trim()) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(data.password, salt);
    }

    // ✅ Rol: si no controlas permisos aquí, no aceptes rol desde el request
    const rolSeguro =
      data.rol && ["cliente", "admin", "superadmin"].includes(data.rol)
        ? data.rol
        : "cliente";

    const nuevoCliente = new Cliente({
      nombre: data.nombre.trim(),
      correo, // undefined si no hay
      password: hashedPassword,
      rol: rolSeguro,
      telefono,
      dni, // undefined si no hay
      estado: "activo",
      origen_registro: data.origen_registro || "interno",
    });

    const clienteGuardado = await nuevoCliente.save();

    return {
      message: "Cliente creado correctamente.",
      cliente: clienteGuardado,
    };
  } catch (error) {
    throw new Error(`Error al crear cliente: ${error.message}`);
  }
};

export const getClientes = async ({ soloActivos = true } = {}) => {
  try {
    const query = soloActivos ? { estado: "activo" } : {};
    const clientes = await Cliente.find(query).sort({ nombre: 1 });

    return clientes; // si está vacío, devuelve []
  } catch (error) {
    throw new Error(`Error al obtener clientes: ${error.message}`);
  }
};

export const getClienteById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido.");
    }

    const cliente = await Cliente.findById(id);
    if (!cliente) throw new Error("Cliente no encontrado.");

    return cliente;
  } catch (error) {
    throw new Error(`Error al obtener cliente por ID: ${error.message}`);
  }
};

export const updateCliente = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido.");
    }

    const cliente = await Cliente.findById(id);
    if (!cliente) throw new Error("Cliente no encontrado.");

    // Construir patch permitido (evita que te actualicen rol/password sin control)
    const patch = {};

    if (data.nombre?.trim()) patch.nombre = data.nombre.trim();

    if (data.correo !== undefined) {
      patch.correo = normEmail(data.correo); // puede quedar undefined para "vaciarlo"
    }

    if (data.telefono !== undefined) {
      patch.telefono = normText(data.telefono);
    }

    if (data.dni !== undefined) {
      patch.dni = normDni(data.dni);
    }

    if (data.estado && ["activo", "inactivo"].includes(data.estado)) {
      patch.estado = data.estado;
    }

    // Si permites rol, hazlo solo con permisos (ejemplo: solo superadmin)
    if (data.rol && ["cliente", "admin", "superadmin"].includes(data.rol)) {
      patch.rol = data.rol;
    }

    // Validación de negocio: al menos correo o teléfono (mismo criterio del schema)
    const correoFinal =
      patch.correo !== undefined ? patch.correo : cliente.correo;
    const telFinal =
      patch.telefono !== undefined ? patch.telefono : cliente.telefono;
    if (!correoFinal && !telFinal) {
      throw new Error("El cliente debe tener al menos un correo o teléfono.");
    }

    // Duplicados por dni/correo
    if (patch.dni) {
      const existeDni = await Cliente.findOne({
        dni: patch.dni,
        _id: { $ne: id },
      });
      if (existeDni) throw new Error("Ya existe un cliente con ese DNI.");
    }
    if (patch.correo) {
      const existeCorreo = await Cliente.findOne({
        correo: patch.correo,
        _id: { $ne: id },
      });
      if (existeCorreo) throw new Error("Ya existe un cliente con ese correo.");
    }

    const actualizado = await Cliente.findByIdAndUpdate(
      id,
      { $set: patch },
      {
        new: true,
        runValidators: true,
      }
    );

    return {
      message: "Cliente actualizado correctamente.",
      cliente: actualizado,
    };
  } catch (error) {
    throw new Error(`Error al actualizar cliente: ${error.message}`);
  }
};

export const cambiarContrasenaClienteser = async (id, nuevaContrasena) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido.");
    }
    if (!nuevaContrasena?.trim())
      throw new Error("La nueva contraseña es obligatoria.");

    const cliente = await Cliente.findById(id);
    if (!cliente) throw new Error("Cliente no encontrado.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);

    // ✅ Mejor que setear en doc con password select:false
    await Cliente.updateOne(
      { _id: id },
      { $set: { password: hashedPassword } }
    );

    return { message: "Contraseña del cliente cambiada correctamente." };
  } catch (error) {
    throw new Error(
      `Error al cambiar contraseña del cliente: ${error.message}`
    );
  }
};

export const deleteCliente = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido.");
    }

    const cliente = await Cliente.findById(id);
    if (!cliente) throw new Error("Cliente no encontrado.");

    cliente.estado = "inactivo";
    await cliente.save();

    return { message: "Cliente desactivado correctamente." };
  } catch (error) {
    throw new Error(`Error al eliminar cliente: ${error.message}`);
  }
};
