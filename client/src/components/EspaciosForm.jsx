import React, { useState } from "react";
import "../css/Espacios/espaciosForm.css";
import { FaCheck } from "react-icons/fa";
import { useEspacio } from "../context/EspacioContext.jsx";

function EspacioWizard({ closeModal, refreshPagina }) {
  const { createEspacio } = useEspacio();
  const [currentStep, setCurrentStep] = useState(1);
  const [espacioData, setEspacioData] = useState({
    // Paso 1: Información básica
    nombre: "",
    piso: "",
    tipo: "",
    capacidad: "",
    descripcion: "",

    // Paso 2: Precios y tarifas
    precio_por_hora: "",
    tarifas: [
      { tipo: "hora", precio: "", activo: true },
      { tipo: "dia", precio: "", activo: true },
      { tipo: "mes", precio: "", activo: true },
    ],

    // Paso 3: Servicios
    servicios: [],
    serviciosPersonalizados: [],
    nuevoServicio: "",

    // Paso 4: Equipamiento
    equipamiento: [],
    nuevoEquipamiento: "",

    // Paso 5: Configuración adicional
    color_tag: "#b9bc31",
    estado: "disponible",
  });

  // Opciones predefinidas
  const tiposEspacio = [
    { value: "oficina", label: "Oficina Privada" },
    { value: "sala", label: "Sala de Reuniones" },
    { value: "compartido", label: "Escritorio Compartido" },
    { value: "auditorio", label: "Auditorio" },
    { value: "oficina_virtual", label: "Oficica Virtual" },
  ];

  const serviciosPredefinidos = [
    "WiFi",
    "Aire acondicionado",
    "Agua",
    "Impresora",
    "Proyector",
    "Pantalla",
    "Pizarra",
    "Estacionamiento",
    "Lockers",
    "Recepción",
  ];

  const estados = [
    { value: "disponible", label: "Disponible" },
    { value: "inactivo", label: "Inactivo" },
    { value: "mantenimiento", label: "Mantenimiento" },
    { value: "reservado", label: "Reservado" },
    { value: "no_disponible", label: "No Disponible" },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setEspacioData({
      ...espacioData,
      [field]: value,
    });
  };

  const handleTarifaChange = (index, field, value) => {
    const updatedTarifas = [...espacioData.tarifas];
    updatedTarifas[index] = {
      ...updatedTarifas[index],
      [field]: field === "precio" ? parseFloat(value) || 0 : value,
    };

    setEspacioData({
      ...espacioData,
      tarifas: updatedTarifas,
    });
  };

  const handleServicioToggle = (servicio) => {
    const updatedServicios = espacioData.servicios.includes(servicio)
      ? espacioData.servicios.filter((s) => s !== servicio)
      : [...espacioData.servicios, servicio];

    setEspacioData({
      ...espacioData,
      servicios: updatedServicios,
    });
  };

  const handleAddServicioPersonalizado = () => {
    if (espacioData.nuevoServicio.trim()) {
      setEspacioData({
        ...espacioData,
        serviciosPersonalizados: [
          ...espacioData.serviciosPersonalizados,
          espacioData.nuevoServicio.trim(),
        ],
        servicios: [...espacioData.servicios, espacioData.nuevoServicio.trim()],
        nuevoServicio: "",
      });
    }
  };

  const handleAddEquipamiento = () => {
    if (espacioData.nuevoEquipamiento.trim()) {
      setEspacioData({
        ...espacioData,
        equipamiento: [
          ...espacioData.equipamiento,
          espacioData.nuevoEquipamiento.trim(),
        ],
        nuevoEquipamiento: "",
      });
    }
  };

  const handleRemoveEquipamiento = (index) => {
    const updatedEquipamiento = [...espacioData.equipamiento];
    updatedEquipamiento.splice(index, 1);
    setEspacioData({
      ...espacioData,
      equipamiento: updatedEquipamiento,
    });
  };

  const calcularTarifasAutomaticamente = () => {
    const precioHora = parseFloat(espacioData.precio_por_hora) || 0;
    const tarifas = [
      { tipo: "hora", precio: precioHora, activo: true },
      { tipo: "dia", precio: precioHora * 8 * 0.9, activo: true }, // 8 horas con 10% descuento
      { tipo: "mes", precio: precioHora * 8 * 22 * 0.8, activo: true }, // 22 días con 20% descuento
    ];

    setEspacioData({
      ...espacioData,
      tarifas: tarifas.map((t) => ({
        ...t,
        precio: parseFloat(t.precio.toFixed(2)),
      })),
    });
  };

  const handleSubmit = async () => {
    try {
      // Validaciones
      if (!espacioData.nombre.trim()) {
        alert("El nombre del espacio es obligatorio");
        return;
      }

      if (!espacioData.tipo) {
        alert("Debe seleccionar un tipo de espacio");
        return;
      }

      if (!espacioData.capacidad || espacioData.capacidad < 1) {
        alert("La capacidad debe ser al menos 1");
        return;
      }

      // Preparar datos para el backend
      const espacioDataToSend = {
        nombre: espacioData.nombre,
        piso: parseInt(espacioData.piso) || 1,
        tipo: espacioData.tipo,
        capacidad: parseInt(espacioData.capacidad),
        precio_por_hora: parseFloat(espacioData.precio_por_hora),
        tarifas: espacioData.tarifas.map((tarifa) => ({
          ...tarifa,
          precio: parseFloat(tarifa.precio) || 0,
        })),
        descripcion: espacioData.descripcion,
        servicios: [
          ...espacioData.servicios,
          ...espacioData.serviciosPersonalizados,
        ],
        equipamiento: espacioData.equipamiento,
        color_tag: espacioData.color_tag,
        estado: espacioData.estado,
      };

      // Enviar al backend
      await createEspacio(espacioDataToSend);
      closeModal();
      refreshPagina();

      // Resetear formulario
      setCurrentStep(1);
      setEspacioData({
        nombre: "",
        piso: "",
        tipo: "",
        capacidad: "",
        descripcion: "",
        precio_por_hora: "",
        tarifas: [
          { tipo: "hora", precio: "", activo: true },
          { tipo: "dia", precio: "", activo: true },
          { tipo: "mes", precio: "", activo: true },
        ],
        servicios: [],
        serviciosPersonalizados: [],
        nuevoServicio: "",
        equipamiento: [],
        nuevoEquipamiento: "",
        color_tag: "#b9bc31",
        estado: "disponible",
      });
    } catch (error) {
      console.error("Error al crear espacio:", error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="font-bold">Información Básica</h2>
            <div className="form-group">
              <label>Nombre del Espacio *:</label>
              <input
                type="text"
                placeholder="Ej: Oficina Privada 2A"
                value={espacioData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                required
              />
            </div>

            <div className="time-group">
              <div className="form-group">
                <label>Piso:</label>
                <input
                  type="number"
                  placeholder="Número de piso"
                  min="1"
                  value={espacioData.piso}
                  onChange={(e) => handleInputChange("piso", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tipo de Espacio *:</label>
                <select
                  value={espacioData.tipo}
                  onChange={(e) => handleInputChange("tipo", e.target.value)}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposEspacio.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Capacidad (personas) *:</label>
              <input
                type="number"
                placeholder="Ej: 5"
                min="1"
                value={espacioData.capacidad}
                onChange={(e) => handleInputChange("capacidad", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                placeholder="Describa el espacio, características principales..."
                value={espacioData.descripcion}
                onChange={(e) =>
                  handleInputChange("descripcion", e.target.value)
                }
                rows="3"
              />
            </div>

            <div className="button-group">
              <button className="btn-next" onClick={handleNext}>
                Siguiente
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Precios y Tarifas</h2>

            <div className="form-group">
              <label>Precio por Hora (S/) *:</label>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={espacioData.precio_por_hora}
                onChange={(e) =>
                  handleInputChange("precio_por_hora", e.target.value)
                }
                required
              />
            </div>

            <div className="button-container" style={{ marginBottom: "20px" }}>
              <button
                type="button"
                onClick={calcularTarifasAutomaticamente}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                Calcular Tarifas Automáticamente
              </button>
            </div>

            <h3>Tarifas</h3>
            <div className="tarifas-grid">
              {espacioData.tarifas.map((tarifa, index) => (
                <div key={tarifa.tipo} className="tarifa-card">
                  <div className="tarifa-header">
                    <h4>
                      {tarifa.tipo.charAt(0).toUpperCase() +
                        tarifa.tipo.slice(1)}
                    </h4>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={tarifa.activo}
                        onChange={(e) =>
                          handleTarifaChange(index, "activo", e.target.checked)
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Precio (S/):</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={tarifa.precio}
                      onChange={(e) =>
                        handleTarifaChange(index, "precio", e.target.value)
                      }
                      disabled={!tarifa.activo}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="button-group">
              <button className="btn-prev" onClick={handlePrev}>
                Anterior
              </button>
              <button className="btn-next" onClick={handleNext}>
                Siguiente
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2 className="font-bold">Servicios</h2>

            <div className="services-grid">
              {serviciosPredefinidos.map((servicio, index) => (
                <div
                  key={index}
                  className={`service-card ${
                    espacioData.servicios.includes(servicio) ? "selected" : ""
                  }`}
                  onClick={() => handleServicioToggle(servicio)}
                >
                  {servicio}
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label>Agregar servicio personalizado:</label>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="Ej: Conserjería, Recepción 24h..."
                  value={espacioData.nuevoServicio}
                  onChange={(e) =>
                    handleInputChange("nuevoServicio", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={handleAddServicioPersonalizado}
                  className="btn-add"
                >
                  Agregar
                </button>
              </div>
            </div>

            {espacioData.serviciosPersonalizados.length > 0 && (
              <div className="selected-items">
                <h4>Servicios personalizados agregados:</h4>
                <div className="tags-container">
                  {espacioData.serviciosPersonalizados.map(
                    (servicio, index) => (
                      <span key={index} className="tag">
                        {servicio}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="button-group">
              <button className="btn-prev" onClick={handlePrev}>
                Anterior
              </button>
              <button className="btn-next" onClick={handleNext}>
                Siguiente
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Equipamiento</h2>
            <p>Lista de equipamiento incluido en el espacio:</p>

            <div className="form-group">
              <label>Agregar equipamiento:</label>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="Ej: Mesa ejecutiva, 5 sillas ergonómicas..."
                  value={espacioData.nuevoEquipamiento}
                  onChange={(e) =>
                    handleInputChange("nuevoEquipamiento", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={handleAddEquipamiento}
                  className="btn-add"
                >
                  Agregar
                </button>
              </div>
            </div>

            {espacioData.equipamiento.length > 0 && (
              <div className="equipamiento-list">
                <h4>Equipamiento agregado:</h4>
                <ul className="equipamiento-items">
                  {espacioData.equipamiento.map((item, index) => (
                    <li key={index} className="equipamiento-item">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipamiento(index)}
                        className="btn-remove"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-group">
              <label>Color de etiqueta:</label>
              <div className="color-picker-container">
                <input
                  type="color"
                  value={espacioData.color_tag}
                  onChange={(e) =>
                    handleInputChange("color_tag", e.target.value)
                  }
                />
                <span
                  style={{
                    backgroundColor: espacioData.color_tag,
                    width: "30px",
                    height: "30px",
                    borderRadius: "4px",
                    marginLeft: "10px",
                  }}
                ></span>
                <span style={{ marginLeft: "10px" }}>
                  {espacioData.color_tag}
                </span>
              </div>
            </div>

            <div className="button-group">
              <button className="btn-prev" onClick={handlePrev}>
                Anterior
              </button>
              <button className="btn-next" onClick={handleNext}>
                Siguiente
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <div className="resumen">
              <h3>Resumen del Espacio</h3>
              <div className="resumen-grid">
                <div className="resumen-item">
                  <strong>Nombre:</strong>
                  <p>{espacioData.nombre || "No ingresado"}</p>
                </div>
                <div className="resumen-item">
                  <strong>Tipo:</strong>
                  <p>
                    {espacioData.tipo
                      ? tiposEspacio.find((t) => t.value === espacioData.tipo)
                          ?.label
                      : "No seleccionado"}
                  </p>
                </div>
                <div className="resumen-item">
                  <strong>Piso:</strong>
                  <p>{espacioData.piso || "No especificado"}</p>
                </div>
                <div className="resumen-item">
                  <strong>Capacidad:</strong>
                  <p>{espacioData.capacidad || "0"} personas</p>
                </div>
              </div>

              <div className="form-group">
                <label>Estado del espacio:</label>
                <select
                  value={espacioData.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                >
                  {estados.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="summary-details">
                <div className="summary-section">
                  <h4>Servicios ({espacioData.servicios.length}):</h4>
                  <div className="tags-container">
                    {espacioData.servicios.map((servicio, index) => (
                      <span key={index} className="tag">
                        {servicio}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Equipamiento ({espacioData.equipamiento.length}):</h4>
                  <div className="tags-container">
                    {espacioData.equipamiento.map((item, index) => (
                      <span key={index} className="tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Tarifas:</h4>
                  <div className="tarifas-resumen">
                    {espacioData.tarifas
                      .filter((t) => t.activo)
                      .map((tarifa, index) => (
                        <div key={index} className="tarifa-resumen-item">
                          <span>
                            {tarifa.tipo.charAt(0).toUpperCase() +
                              tarifa.tipo.slice(1)}
                            :
                          </span>
                          <strong>S/ {tarifa.precio || "0.00"}</strong>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button className="btn-prev" onClick={handlePrev}>
                Anterior
              </button>
              <button className="btn-submit" onClick={handleSubmit}>
                Crear Espacio
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="wizard-component">
      <div className="container">
        <div className="page__one">
          <section className="title">
            <h1>Nuevo Espacio</h1>
          </section>
          <section className="steps">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className={`step ${currentStep >= step ? "active" : ""}`}>
                  <span>{currentStep > step ? <FaCheck /> : step}</span>
                  <p>
                    {step === 1 && "Información Básica"}
                    {step === 2 && "Precios y Tarifas"}
                    {step === 3 && "Servicios"}
                    {step === 4 && "Equipamiento"}
                    {step === 5 && "Configuración"}
                  </p>
                </div>
                {step < 5 && (
                  <div className="separator">
                    <span></span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </section>
        </div>
        <div className="page__two">{renderStepContent()}</div>
      </div>
    </div>
  );
}

export default EspacioWizard;
