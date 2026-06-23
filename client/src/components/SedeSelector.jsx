import { useEffect, useId, useRef, useState } from "react";
import { useSede } from "../context/SedeContext.jsx";
import { etiquetaDeSede } from "../constants/sedes.js";
import SedeIcon from "../assets/lista.png";
import SedeItemIcon from "../assets/carro.png";
import "../css/sedeSelector.css";

function SedeSelector() {
  const { sedeActiva, setSedeActiva, puedeCambiarSede, sedesDisponibles } = useSede();
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const optionRefs = useRef([]);
  const popoverId = useId();

  // Cierra al hacer click fuera o al presionar Escape, solo mientras está abierto.
  useEffect(() => {
    if (!open) return;

    const handlePointer = (e) => {
      if (
        popoverRef.current?.contains(e.target) ||
        triggerRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Cierra el popover cuando el cursor sale del sidebar (se colapsa).
  useEffect(() => {
    const sidebar = triggerRef.current?.closest(".sidebar");
    if (!sidebar) return;
    const handleSidebarLeave = () => setOpen(false);
    sidebar.addEventListener("mouseleave", handleSidebarLeave);
    return () => sidebar.removeEventListener("mouseleave", handleSidebarLeave);
  }, []);

  // Al abrir, enfoca la sede activa (o la primera) para soportar teclado.
  useEffect(() => {
    if (!open) {
      setFocusedIndex(-1);
      return;
    }
    const activeIdx = sedesDisponibles.findIndex((s) => s === sedeActiva);
    const initial = activeIdx >= 0 ? activeIdx : 0;
    setFocusedIndex(initial);
  }, [open, sedeActiva, sedesDisponibles]);

  useEffect(() => {
    if (open && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [open, focusedIndex]);

  if (!puedeCambiarSede) return null;

  const seleccionar = (sede) => {
    setSedeActiva(sede);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleListKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => (i + 1) % sedesDisponibles.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) =>
        i <= 0 ? sedesDisponibles.length - 1 : i - 1
      );
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <li className="sede-selector">
      {open && (
        <div
          ref={popoverRef}
          id={popoverId}
          role="menu"
          aria-label="Cambiar de sede"
          className="sede-popover"
          onKeyDown={handleListKey}
        >
          {sedesDisponibles.map((sede, idx) => {
            const activa = sede === sedeActiva;
            return (
              <button
                key={sede}
                type="button"
                role="menuitem"
                aria-current={activa ? "true" : undefined}
                ref={(el) => (optionRefs.current[idx] = el)}
                className={`sede-option ${activa ? "sede-option--active" : ""}`}
                onClick={() => seleccionar(sede)}
              >
                <img src={SedeItemIcon} alt="" className="sede-option__icon" />
                <span>{etiquetaDeSede(sede)}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        className="sede-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((v) => !v)}
      >
        <img src={SedeIcon} alt="" className="sede-trigger__icon" />
        <span className="sede-trigger__label sidebar__hide">Sede</span>
      </button>
    </li>
  );
}

export default SedeSelector;
