import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage({ user, closeModal, refreshPagina }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const {
    signup,
    isAuthenticated,
    errors: registerErrors,
    updateUser,
  } = useAuth();

  const onSubmit = handleSubmit(async (values) => {
    if (user && user._id) {
      try {
        await updateUser(user._id, values);
        closeModal();
        refreshPagina();
      } catch (error) {
        console.error("Error actualizando usuario", error);
      }
    } else {
      try {
        await signup(values);
        closeModal();
        refreshPagina();
      } catch (error) {
        console.error("Error creando usuario", error);
      }
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        password: "", // usualmente no se rellena la contraseña
        name: user.name || "",
        role: user.role || "",
      });
    } else {
      reset();
    }
  }, [user]);

  return (
    <div className="bg-white w-[420px] p-5 rounded-md">
      {registerErrors.map((error, index) => (
        <div key={index} className="text-white bg-red-500 w-full p-2">
          {error}
        </div>
      ))}
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Usuario"
          {...register("username", { required: true })}
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2 "
        />
        {errors.username && (
          <span className="text-red-500 w-full">Este campo es requerido</span>
        )}
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          {...register("name", { required: true })}
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2 "
        />
        {errors.name && (
          <span className="text-red-500 w-full">Este campo es requerido</span>
        )}
        <select
          name="role"
          {...register("role", { required: true })}
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2 "
          defaultValue=""
        >
          <option value="" disabled>
            Selecciona un rol
          </option>
          <option value="recepcionista">Recepcionista</option>
          <option value="admin">Administrador</option>
          <option value="seguridad">Seguridad</option>
        </select>

        {errors.role && (
          <span className="text-red-500 w-full">Este campo es requerido</span>
        )}
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          {...register("password", {
            required: !user || !user._id ? "Este campo es requerido" : false,
          })}
          className="w-full bg-gray-200 px-4 py-2 rounded-md my-2 "
        />
        {errors.password && (
          <span className="text-red-500 w-full">Este campo es requerido</span>
        )}

        <div className="w-full flex justify-center">
          <button
            type="submit"
            className="bg-[#b9bc31] cursor-pointer text-zinc-800 px-4 py-2 mt-5 rounded-md hover:border-[#b9bc31] hover:border-2 hover:bg-white hover:text-black my-2"
          >
            Registrarse
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
