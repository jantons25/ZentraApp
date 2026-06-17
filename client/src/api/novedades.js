// api/novedades.js
import axios from "./axios";

export const getNovedadesRequest = (params) => axios.get("/novedades", { params });

export const getNovedadRequest = (id) => axios.get(`/novedades/${id}`);

export const createNovedadRequest = (novedad) => axios.post("/novedades", novedad);

export const updateNovedadRequest = (id, novedad) => axios.put(`/novedades/${id}`, novedad);

export const deleteNovedadRequest = (id) => axios.delete(`/novedades/${id}`);
