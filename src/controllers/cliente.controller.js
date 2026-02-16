import {
  crearCliente,
  getClientes,
  getClienteById,
  updateCliente,
  cambiarContrasenaClienteser,
  deleteCliente,
} from "../services/cliente.service.js";

// Crear cliente
export const registrarCliente = async (req, res) => {
  try {
    const resultado = await crearCliente(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener todos los clientes
export const obtenerClientes = async (req, res) => {
  try {
    const soloActivos = req.query.soloActivos === "true";
    const clientes = await getClientes({ soloActivos });
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener cliente por ID
export const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await getClienteById(id);
    res.status(200).json(cliente);
  } catch (error) {
    const status = error.message.includes("ID inválido")
      ? 400
      : error.message.includes("no encontrado")
      ? 404
      : 500;

    res.status(status).json({ mensaje: error.message });
  }
};

// Actualizar cliente
export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await updateCliente(id, req.body);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Cambiar contraseña del cliente
export const cambiarContrasenaCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaContrasena } = req.body;

    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      return res.status(400).json({
        mensaje: "La nueva contraseña debe tener al menos 6 caracteres.",
      });
    }

    const resultado = await cambiarContrasenaClienteser(id, nuevaContrasena);
    res.status(200).json(resultado);
  } catch (error) {
    const status = error.message.includes("ID inválido")
      ? 400
      : error.message.includes("no encontrado")
      ? 404
      : 400;

    res.status(status).json({ mensaje: error.message });
  }
};

// Eliminar cliente (borrado lógico)
export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await deleteCliente(id);
    res.status(200).json(resultado);
  } catch (error) {
    const status = error.message.includes("ID inválido")
      ? 400
      : error.message.includes("no encontrado")
      ? 404
      : 400;

    res.status(status).json({ mensaje: error.message });
  }
};