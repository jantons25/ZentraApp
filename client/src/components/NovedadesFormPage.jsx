import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNovedad } from "../context/NovedadContext.jsx";
import {
  novedadSchema,
  TIPOS_NOVEDAD,
  ESTADOS_NOVEDAD,
} from "../validations/novedadSchema.js";

function NovedadesFormPage({ closeModal, refreshPagina, novedad }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(novedadSchema),
    defaultValues: {
      tipo: "Informativo",
      estado: "Pendiente",
    },
  });

  const { crearNovedad, actualizarNovedad } = useNovedad();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const esEdicion = Boolean(novedad?._id);

  useEffect(() => {
    if (novedad) {
      reset({
        titulo: novedad.titulo,
        descripcion: novedad.descripcion,
        tipo: novedad.tipo,
        estado: novedad.estado,
      });
    }
  }, [novedad]);

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (esEdicion) {
        await actualizarNovedad(novedad._id, data);
      } else {
        await crearNovedad(data);
      }
      refreshPagina();
      closeModal();
    } catch (err) {
      console.error("Error al guardar la novedad:", err);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="bg-white w-full p-5 rounded-md">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="relative w-full">
          <label className="font-bold block text-left">Título</label>
          {errors.titulo && (
            <p className="text-red-500 text-xs text-left">
              {errors.titulo.message}
            </p>
          )}
          <input
            type="text"
            placeholder="Título de la novedad"
            {...register("titulo")}
            className="w-full bg-gray-200 px-4 py-2 rounded-md"
          />
        </div>

        <div className="relative w-full">
          <label className="font-bold block text-left">Descripción</label>
          {errors.descripcion && (
            <p className="text-red-500 text-xs text-left">
              {errors.descripcion.message}
            </p>
          )}
          <textarea
            rows={4}
            placeholder="Describe lo ocurrido durante el turno"
            {...register("descripcion")}
            className="w-full bg-gray-200 px-4 py-2 rounded-md resize-none"
          />
        </div>

        <div className="flex flex-row flex-wrap gap-4">
          <div className="relative w-40">
            <label className="font-bold block text-left">Tipo</label>
            {errors.tipo && (
              <p className="text-red-500 text-xs text-left">
                {errors.tipo.message}
              </p>
            )}
            <select
              {...register("tipo")}
              className="w-full bg-gray-200 px-4 py-2 rounded-md"
            >
              {TIPOS_NOVEDAD.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-40">
            <label className="font-bold block text-left">Estado</label>
            {errors.estado && (
              <p className="text-red-500 text-xs text-left">
                {errors.estado.message}
              </p>
            )}
            <select
              {...register("estado")}
              className="w-full bg-gray-200 px-4 py-2 rounded-md"
            >
              {ESTADOS_NOVEDAD.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md my-2 text-zinc-800 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed opacity-60"
                : "bg-[#b9bc31] hover:bg-yellow-300 hover:text-black"
            }`}
          >
            {isSubmitting
              ? "Guardando..."
              : esEdicion
              ? "Actualizar"
              : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NovedadesFormPage;
