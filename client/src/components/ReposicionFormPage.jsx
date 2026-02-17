import { useForm } from "react-hook-form";
import { useReposicion } from "../context/ReposicionContext.jsx";
import { useProduct } from "../context/ProductContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function ReposicionFormPage({
  closeModal,
  refreshPagina,
  reposicion,
  products,
  user,
  users
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();
  const { createReposicion, updateReposicion } = useReposicion();
  const navigate = useNavigate();


  const onSubmit = handleSubmit(async (data) => {
    if (reposicion && reposicion._id) {
      try {
        await updateReposicion(reposicion._id, data);
        closeModal();
        refreshPagina();
      } catch (err) {
        console.error("Error actualizando reposicion:", err);
      }
    } else {
      try {
        await createReposicion(data);
        closeModal();
        refreshPagina();
      } catch (err) {
        console.error("Error creando reposicion:", err);
      }
    }
  });

  useEffect(() => {
    if (reposicion) {
      reset({
        ...reposicion,
        producto: reposicion.producto?._id || reposicion.producto,
      });
    }
  }, [reposicion]);

  return (
    <div className="bg-zinc-800 max-w-md p-10 rounded-md">
      <form onSubmit={onSubmit}>
        
        <select
          {...register("producto", { required: true })}
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
        >
          <option value="">Selecciona un producto</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.nombre}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Cantidad"
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
          {...register("cantidad", { required: true, valueAsNumber: true })}
        />
        <select
          {...register("habitacion", { required: true })}
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
        >
          <option value="">Seleccione habitación</option>
          <option value="201">201</option>
          <option value="202">202</option>
          <option value="203">203</option>
          <option value="204">204</option>
          <option value="205">205</option>
          <option value="301">301</option>
          <option value="302">302</option>
          <option value="303">303</option>
          <option value="304">304</option>
          <option value="305">305</option>
          <option value="306">306</option>
          <option value="401">401</option>
          <option value="402">402</option>
          <option value="403">403</option>
          <option value="404">404</option>
          <option value="405">405</option>
          <option value="406">406</option>
          <option value="501">501</option>
          <option value="502">502</option>
          <option value="503">503</option>
          <option value="504">504</option>
          <option value="505">505</option>
          <option value="506">506</option>
        </select>
        <select
          {...register("responsable", { required: true })}
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
        >
          <option value="">Selecciona un resposable</option>
          {users.map((resp) => (
            <option key={resp._id} value={resp.username}>
              {resp.username}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Observación"
          className="w-full bg-zinc-700 px-4 py-2 rounded-md text-white my-2"
          {...register("observacion", { required: true })}
        />
        <div className="w-full flex justify-center">
          <button
            type="submit"
            className="text-white px-4 py-2 rounded-md border-white border-2 hover:bg-white hover:text-zinc-800 my-2"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReposicionFormPage;
