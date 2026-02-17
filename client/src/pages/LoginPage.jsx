import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/loginPage.css";
import zentraImage from "../assets/zentra-reception.webp"; // Ajusta la ruta según donde guardes la imagen

function LoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { signin, errors: singinErrors, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  const onSubmit = handleSubmit((data) => {
    signin(data);
  });

  return (
    <div className="bg w-full h-screen flex justify-center items-center p-4">
      <div className="flex max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Panel izquierdo - Imagen/Branding */}
        <div
          className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(185, 188, 49, 0.85), rgba(138, 141, 37, 0.85)), url(${zentraImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#b9bc31] text-2xl font-bold">Z</span>
              </div>
              <h2 className="text-white text-2xl font-bold">ZentraApp</h2>
            </div>
          </div>

          <div className="relative z-10 flex justify-center items-center flex-1">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/20">
                <svg
                  className="w-32 h-32 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-white text-2xl font-semibold mb-2">
                Gestión Inteligente
              </h3>
              <p className="text-white/90">
                Control total de tu inventario y operaciones
              </p>
            </div>
          </div>

          <div className="relative z-10 text-white/80 text-sm text-center mt-8">
            Copyright © 2026 ZentraApp. All rights reserved.
          </div>

          {/* Overlay adicional para mejorar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 pointer-events-none"></div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h1>
              <p className="text-gray-500">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            {singinErrors.map((error, index) => (
              <div
                key={index}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
              >
                {error}
              </div>
            ))}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  {...register("username", { required: true })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b9bc31] focus:border-transparent transition"
                />
                {errors.username && (
                  <span className="text-red-500 text-sm mt-1 block">
                    Este campo es requerido
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: true })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b9bc31] focus:border-transparent transition"
                />
                {errors.password && (
                  <span className="text-red-500 text-sm mt-1 block">
                    Este campo es requerido
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#b9bc31] text-white font-semibold py-3 rounded-lg hover:bg-[#a0a329] transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
