import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ModalBig from "./ModalBig.jsx";
import RegisterFormPage from "../pages/RegisterPage.jsx";
import ModalConfirmacion from "./ModalConfirmacion.jsx";
import "../css/userList.css";

function UsersList({ closeModal, refreshPagina, vistaActiva, users }) {
  const { deleteUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setselectedUser] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const confirmarEliminarUsuario = async () => {
    try {
      await deleteUser(selectedUser); // Este es el id_lote
      refreshPagina();
    } catch (error) {
      console.error("Error eliminando reserva:", error);
    } finally {
      setMostrarModal(false);
      setselectedUser(null);
    }
  };

  return (
    <div className="bg-white p-4 w-full userList__container">
      <h1 className="text-2xl bold font-medium">Configuración de Usuario</h1>

      <p className="p_final">
        En esta sección puedes ver y administrar a todas las personas que tienen
        acceso al sistema. La tabla muestra su nombre, usuario, rol y estado
        para que puedas tener una visión rápida de quién forma parte del equipo.
        Si necesitas hacer algún cambio, usa los botones de Editar o Eliminar
        según corresponda. Y si quieres registrar a alguien nuevo, simplemente
        haz clic en el botón “+ Agregar” para crear un usuario con su propio rol
        y permisos.
      </p>

      {/* CONTENEDOR SCROLLEABLE */}
      <div className="mt-2 max-h-[60vh] overflow-y-auto border rounded-lg">
        <table className="w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0 ">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Sede</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users
              .filter((user) => user.status === "active")
              .map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4">{user.username}</td>
                  <td className="px-6 py-4">{user.sede}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">{user.status}</td>

                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => {
                        setselectedUser(user);
                        setIsModalOpen(true);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs cursor-pointer"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        setselectedUser(user._id);
                        setMostrarModal(true);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <ModalBig
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        component={
          selectedUser ? (
            <RegisterFormPage
              user={selectedUser}
              closeModal={() => setIsModalOpen(false)}
              refreshPagina={refreshPagina}
            />
          ) : null
        }
        vistaActiva={"ActualizarUsuario"}
      />
      <ModalConfirmacion
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onConfirm={confirmarEliminarUsuario}
        mensaje="¿Estás seguro de que deseas eliminar este usuario?"
      />
    </div>
  );
}

export default UsersList;
