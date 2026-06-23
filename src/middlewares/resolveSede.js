import { SEDES_VALIDAS } from "../constants/sedes.js";

/**
 * Resuelve la sede activa de la petición según el rol del usuario.
 *
 * - recepcionista: la sede la dicta la BD (req.user.sede). Se ignora cualquier
 *   cabecera X-Sede que envíe el cliente — no puede operar fuera de su sede.
 * - admin / superadmin: la sede activa viene en la cabecera X-Sede y debe
 *   pertenecer a la whitelist.
 *
 * Debe montarse SIEMPRE después de authRequired.
 */
export const resolveSede = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const { role, sede: sedeUsuario } = req.user;

  if (role === "recepcionista") {
    if (!sedeUsuario || !SEDES_VALIDAS.includes(sedeUsuario)) {
      return res.status(403).json({
        message: "Recepcionista sin sede asignada. Contacte al administrador.",
      });
    }
    req.sede = sedeUsuario;
    return next();
  }

  if (role === "admin" || role === "superadmin") {
    const sedeHeader = req.header("X-Sede");
    if (!sedeHeader || !SEDES_VALIDAS.includes(sedeHeader)) {
      return res.status(400).json({
        message: "Sede activa no especificada o inválida.",
      });
    }
    req.sede = sedeHeader;
    return next();
  }

  return res.status(403).json({ message: "Rol no autorizado para operar sobre sedes." });
};
