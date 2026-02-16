import mongoose from "mongoose";
import Reserva from "../models/reserva.model.js";
import Cliente from "../models/cliente.model.js";
import DetalleReserva from "../models/detalle_reserva.js";

export const crearReserva = async (data) => {
  try {
    // 1) Validaciones base
    if (!data.inicio || !data.fin)
      throw new Error("inicio y fin son obligatorios.");

    const inicio = new Date(data.inicio);
    const fin = new Date(data.fin);

    if (isNaN(inicio) || isNaN(fin)) throw new Error("inicio/fin inválidos.");
    if (fin <= inicio) throw new Error("fin debe ser mayor que inicio.");

    // 2) Anti-solapamiento
    const reservaExistente = await Reserva.findOne({
      espacio: data.espacio,
      estado: { $in: ["pendiente", "confirmada"] },
      inicio: { $lt: fin },
      fin: { $gt: inicio },
    });

    if (reservaExistente) {
      throw new Error(
        "Ya existe una reserva en ese horario para este espacio."
      );
    }

    // 3) Cliente (objeto esperado)
    const clienteData = data.cliente; // { nombre, correo, dni, telefono }

    if (!clienteData?.nombre?.trim()) {
      throw new Error("El nombre del cliente es obligatorio.");
    }

    // Deduplicación por DNI o correo
    let cliente = null;

    if (clienteData.dni?.trim()) {
      cliente = await Cliente.findOne({ dni: clienteData.dni.trim() });
    } else if (clienteData.correo?.trim()) {
      cliente = await Cliente.findOne({
        correo: clienteData.correo.trim().toLowerCase(),
      });
    }

    if (!cliente) {
      cliente = await Cliente.create({
        nombre: clienteData.nombre.trim(),
        correo: clienteData.correo?.trim().toLowerCase() || undefined,
        telefono: clienteData.telefono?.trim() || "",
        dni: clienteData.dni?.trim() || undefined,
        rol: "cliente",
        estado: "activo",
        origen_registro: "interno",
      });
    }

    // 4) Pagos (embebidos dentro de la reserva)
    const importe_total = Number(data.importe_total || 0);
    const pago_inicial = Number(data.pago_inicial || 0);

    if (importe_total < 0)
      throw new Error("importe_total no puede ser negativo.");
    if (pago_inicial < 0)
      throw new Error("pago_inicial no puede ser negativo.");
    if (pago_inicial > importe_total) {
      throw new Error("pago_inicial no puede ser mayor que el importe_total.");
    }

    const pagos = [];
    if (pago_inicial > 0) {
      pagos.push({
        monto_pago: pago_inicial,
        metodo_pago: data.metodo_pago || "efectivo",
        observacion_pago: data.observacion_pago || "",
        registrado_por: data.usuario || null,
      });
    }

    // 5) Crear reserva + detalle embebido (UNA sola escritura)
    const reserva = await Reserva.create({
      usuario: data.usuario,
      cliente: cliente._id,
      espacio: data.espacio,
      inicio,
      fin,
      descripcion: data.descripcion || "",
      tipo: data.tipo || "interna",
      estado: data.estado || "pendiente",
      observaciones: data.observaciones || "",

      // ✅ Detalle embebido
      detalle: {
        moneda: data.moneda || "PEN",
        importe_total,
        pagos,
        observaciones_generales: data.observaciones_generales || "",
      },
    });

    // 6) Obtener la reserva con populate para devolver objetos completos
    const reservaConPopulate = await Reserva.findById(reserva._id)
      .populate("cliente", "nombre correo telefono dni estado")
      .populate(
        "espacio",
        "nombre tipo capacidad descripcion precio_por_hora sede piso habilitado_reservas estado"
      )
      .populate("usuario", "nombre correo")
      .lean();

    // 7) Crear también el DetalleReserva (si usas modelo separado)
    // Pero como tienes detalle embebido en Reserva, solo devuelves ese
    const detalle = {
      moneda: data.moneda || "PEN",
      importe_total,
      pagos,
      observaciones_generales: data.observaciones_generales || "",
      total_pagado: pago_inicial,
      saldo_pendiente: importe_total - pago_inicial,
      estado_pago:
        pago_inicial >= importe_total
          ? "completo"
          : pago_inicial > 0
          ? "parcial"
          : "pendiente",
      facturado: false,
    };

    return {
      mensaje: "Reserva creada correctamente.",
      reserva: reservaConPopulate, // ← Con objetos populados
      detalle: detalle,
    };
  } catch (error) {
    throw new Error(`Error al crear reserva: ${error.message}`);
  }
};

export const actualizarReserva = async (id, data) => {
  try {
    // 1) Buscar la reserva actual
    const reservaActual = await Reserva.findById(id, null);
    if (!reservaActual) throw new Error("Reserva no encontrada.");

    // Si está cancelada/finalizada, normalmente bloqueas edición (ajusta a tu negocio)
    if (["cancelada", "finalizada"].includes(reservaActual.estado)) {
      throw new Error(
        "No se puede actualizar una reserva cancelada o finalizada."
      );
    }

    // 2) Resolver valores nuevos (fallback a lo actual si no viene)
    const espacio = data.espacio || reservaActual.espacio;
    const inicio = data.inicio ? new Date(data.inicio) : reservaActual.inicio;
    const fin = data.fin ? new Date(data.fin) : reservaActual.fin;

    if (!inicio || !fin || isNaN(inicio) || isNaN(fin)) {
      throw new Error("inicio/fin inválidos.");
    }
    if (fin <= inicio) {
      throw new Error("fin debe ser mayor que inicio.");
    }

    // 3) Anti-solapamiento (pendiente/confirmada bloquean)
    const reservaSolapada = await Reserva.findOne(
      {
        _id: { $ne: id },
        espacio,
        estado: { $in: ["pendiente", "confirmada"] },
        inicio: { $lt: fin },
        fin: { $gt: inicio },
      },
      null,
    );

    if (reservaSolapada) {
      throw new Error(
        "Ya existe una reserva en ese horario para este espacio."
      );
    }

    // 4) Cliente: idealmente data.cliente es objeto (no array)
    let clienteId = reservaActual.cliente;

    if (data.cliente) {
      const c = data.cliente;

      if (!c?.nombre?.trim()) {
        throw new Error(
          "El nombre del cliente es obligatorio para actualizar la reserva."
        );
      }

      // Prioriza deduplicación por dni/correo si existen
      let cliente = null;

      if (c.dni?.trim()) {
        cliente = await Cliente.findOne({ dni: c.dni.trim() }, null);
      } else if (c.correo?.trim()) {
        cliente = await Cliente.findOne(
          { correo: c.correo.trim().toLowerCase() },
          null
        );
      }

      if (!cliente) {
        // Crear cliente nuevo
        const creado = await Cliente.create(
          [
            {
              nombre: c.nombre.trim(),
              correo: c.correo?.trim().toLowerCase() || undefined, // <- importante, no ""
              telefono: c.telefono?.trim() || "",
              dni: c.dni?.trim() || undefined,
              rol: "cliente",
              estado: "activo",
              origen_registro: data.tipo === "web" ? "web" : "interno",
            },
          ]
        );
        cliente = creado[0];
      } else {
        // Si deseas, puedes actualizar datos básicos del cliente existente
        // (solo si vienen y no están vacíos)
        const patch = {};
        if (c.nombre?.trim()) patch.nombre = c.nombre.trim();
        if (c.telefono?.trim()) patch.telefono = c.telefono.trim();
        if (c.correo?.trim()) patch.correo = c.correo.trim().toLowerCase();
        if (c.dni?.trim()) patch.dni = c.dni.trim();

        if (Object.keys(patch).length) {
          await Cliente.updateOne(
            { _id: cliente._id },
            { $set: patch }
          );
        }
      }

      clienteId = cliente._id;
    }

    // 5) Actualizar Reserva (solo campos permitidos)
    const updateReserva = {
      usuario: data.usuario ?? reservaActual.usuario,
      cliente: clienteId,
      espacio,
      inicio,
      fin,
      descripcion: data.descripcion ?? reservaActual.descripcion ?? "",
      tipo: data.tipo ?? reservaActual.tipo ?? "interna",
      estado: data.estado ?? reservaActual.estado ?? "pendiente",
      observaciones: data.observaciones ?? reservaActual.observaciones ?? "",
    };

    // Si el estado pasa a "cancelada", captura auditoría (si lo deseas)
    if (
      updateReserva.estado === "cancelada" &&
      reservaActual.estado !== "cancelada"
    ) {
      updateReserva.cancelado_por = data.usuario || null;
      updateReserva.fecha_cancelacion = new Date();
      updateReserva.motivo_cancelacion = data.motivo_cancelacion?.trim() || "";
    }

    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id,
      updateReserva,
      {
        new: true,
        runValidators: true
      }
    );

    if (!reservaActualizada) throw new Error("Error al actualizar la reserva.");

    // 6) Actualizar DetalleReserva (1-1)
    // Si no existe, lo creamos (por seguridad)
    let detalle = await DetalleReserva.findOne({ reserva: id }, null);

    // data.detalle es recomendado para separar concern
    const d = data.detalle || {};

    if (!detalle) {
      // crear detalle mínimo
      const creado = await DetalleReserva.create(
        [
          {
            reserva: id,
            moneda: d.moneda || "PEN",
            importe_total: Number(d.importe_total || 0),
            pagos: [],
            observaciones_generales: d.observaciones_generales || "",
          },
        ]
      );
      detalle = creado[0];
    } else {
      // actualizar campos base del detalle
      const patchDetalle = {};
      if (d.moneda) patchDetalle.moneda = d.moneda;
      if (d.importe_total !== undefined)
        patchDetalle.importe_total = Number(d.importe_total || 0);
      if (d.observaciones_generales !== undefined) {
        patchDetalle.observaciones_generales = d.observaciones_generales || "";
      }

      if (Object.keys(patchDetalle).length) {
        await DetalleReserva.updateOne(
          { _id: detalle._id },
          { $set: patchDetalle },
        );
      }
    }

    // 6.1) Agregar un pago nuevo (si viene)
    if (d.nuevo_pago && Number(d.nuevo_pago.monto_pago) > 0) {
      const pago = {
        monto_pago: Number(d.nuevo_pago.monto_pago),
        metodo_pago: d.nuevo_pago.metodo_pago || "efectivo",
        observacion_pago: d.nuevo_pago.observacion_pago || "",
        referencia: d.nuevo_pago.referencia || "",
        comprobante_url: d.nuevo_pago.comprobante_url || "",
        registrado_por: data.usuario || null,
        fecha_pago: d.nuevo_pago.fecha_pago
          ? new Date(d.nuevo_pago.fecha_pago)
          : new Date(),
      };

      await DetalleReserva.updateOne(
        { _id: detalle._id },
        { $push: { pagos: pago } }
      );
    }

    // 6.2) Releer el detalle para devolverlo actualizado (y disparar hooks si los usas)
    // Si tu schema recalcula en pre('validate') y no en update,
    // puedes forzar .save() aquí:
    let detalleActualizado = await DetalleReserva.findOne(
      { reserva: id },
      null
    );
    if (!detalleActualizado)
      throw new Error("No se pudo obtener el detalle actualizado.");

    // Forzar recalculo/hook si tu schema lo recalcula en validate/save
    // (Esto es útil porque updateOne/$push no dispara pre('validate') automáticamente)
    await detalleActualizado.save();

    return {
      mensaje: "Reserva actualizada correctamente.",
      reserva: reservaActualizada,
      detalle: detalleActualizado,
    };
  } catch (error) {
    throw new Error(`Error al actualizar reserva: ${error.message}`);
  }
};

export const getReservas = async (opts = {}) => {
  try {
    const {
      filtros = {},
      page = 1,
      limit = 50,
      sort = { inicio: -1 }, // más útil que fecha_reserva
    } = opts;

    const query = {};

    // ✅ Filtros por rango de fechas usando inicio/fin (modelo nuevo)
    if (filtros.desde || filtros.hasta) {
      query.inicio = {};
      if (filtros.desde) query.inicio.$gte = new Date(filtros.desde);
      if (filtros.hasta) query.inicio.$lte = new Date(filtros.hasta);
    }

    // ✅ Filtros típicos
    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.tipo) query.tipo = filtros.tipo;
    if (filtros.espacio) query.espacio = filtros.espacio;
    if (filtros.cliente) query.cliente = filtros.cliente;

    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);

    // 1) Traer reservas paginadas y pobladas
    const [reservas, total] = await Promise.all([
      Reserva.find(query)
        .populate("cliente", "nombre correo telefono dni estado")
        .populate(
          "espacio",
          "nombre tipo capacidad descripcion precio_por_hora sede piso habilitado_reservas estado"
        )
        .populate("usuario", "nombre correo")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(), // más rápido para lecturas
      Reserva.countDocuments(query),
    ]);

    if (!reservas.length) {
      return {
        data: [],
        pagination: { page, limit, total, totalPages: 0 },
      };
    }

    // 2) Traer detalles 1-1 por reserva
    const reservaIds = reservas.map((r) => r._id);
    const detalles = await DetalleReserva.find({ reserva: { $in: reservaIds } })
      .select(
        "reserva moneda importe_total total_pagado saldo_pendiente estado_pago facturado pagos observaciones_generales comprobante"
      )
      .lean();

    // 3) Mapear detalle por reservaId (O(1))
    const detalleByReservaId = new Map(
      detalles.map((d) => [String(d.reserva), d])
    );

    // 4) Unir reserva + detalle
    const data = reservas.map((reserva) => ({
      reserva,
      detalle: detalleByReservaId.get(String(reserva._id)) || null,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error al obtener reservas: ${error.message}`);
  }
};

export const getReservaById = async (id) => {
  try {
    // 1) Traer la reserva (con populate)
    const reserva = await Reserva.findById(id)
      .populate("cliente", "nombre correo telefono dni estado")
      .populate(
        "espacio",
        "nombre tipo capacidad descripcion precio_por_hora sede piso habilitado_reservas estado"
      )
      .populate("usuario", "nombre correo")
      .lean();

    if (!reserva) {
      throw new Error("Reserva no encontrada.");
    }

    // 2) Traer el detalle 1-1 asociado
    const detalle = await DetalleReserva.findOne({ reserva: reserva._id })
      .select(
        "reserva moneda importe_total total_pagado saldo_pendiente estado_pago facturado pagos observaciones_generales comprobante createdAt updatedAt"
      )
      .lean();

    // 3) Retornar
    return {
      reserva,
      detalle: detalle || null,
    };
  } catch (error) {
    throw new Error(`Error al obtener reserva por ID: ${error.message}`);
  }
};

export const eliminarReserva = async (id, usuarioId, motivo = "") => {

  try {
    // 1) Buscar reserva
    const reserva = await Reserva.findById(id, null);
    if (!reserva) throw new Error("Reserva no encontrada.");

    // 2) Validar estado actual
    if (reserva.estado === "cancelada") {
      throw new Error("La reserva ya está cancelada.");
    }

    if (reserva.estado === "finalizada") {
      throw new Error("No se puede cancelar una reserva finalizada.");
    }

    // 3) Cambiar estado (soft delete)
    reserva.estado = "cancelada";
    reserva.cancelado_por = usuarioId || null;
    reserva.fecha_cancelacion = new Date();
    reserva.motivo_cancelacion = motivo?.trim() || "";

    await reserva.save();
    const detalle = await DetalleReserva.findOne({ reserva: id }, null);

    if (detalle) {
      if ((detalle.total_pagado || 0) <= 0) {
        detalle.estado_pago = "cancelado";
        await detalle.save();
      }
    }

    return {
      mensaje: "Reserva cancelada correctamente.",
      reserva,
    };
  } catch (error) {
    throw new Error(`Error al cancelar la reserva: ${error.message}`);
  }
};
