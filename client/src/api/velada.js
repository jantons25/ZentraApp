import axios from "./axios";

export const getVeladasRequest = () => axios.get("/veladas");
export const createVeladaRequest = (velada) => axios.post("/veladas", velada);
export const deleteVeladaRequest = (id) => axios.delete(`/veladas/${id}`);
export const deleteLoteVeladasRequest = (id_lote) =>
  axios.delete(`/veladas/lote/${id_lote}`);
export const updateLoteVeladasRequest = ({ ids, nuevasVeladas }) =>
  axios.put("/veladas/lote", { ids, nuevasVeladas });