// api/cortesias.js
import axios from "./axios";

export const getCortesiasRequest = () => axios.get("/cortesias");

export const createCortesiaRequest = (cortesias) =>
  axios.post("/cortesias", cortesias);

export const updateCortesiaLoteRequest = ({ ids, nuevasCortesias }) =>
  axios.put("/cortesias/lote", { ids, nuevasCortesias });

export const updateCortesiaRequest = (id, cortesia) =>
  axios.put(`/cortesias/${id}`, cortesia);

export const deleteCortesiaRequest = (id) => axios.delete(`/cortesias/${id}`);

export const deleteLoteCortesiasRequest = (id_lote) =>
  axios.delete(`/cortesias/lote/${id_lote}`);
