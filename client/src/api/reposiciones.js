import axios from './axios';

export const getReposicionesRequest = () => axios.get('/reposiciones');

export const createReposicionRequest = (reposicion) => axios.post('/reposiciones', reposicion);

export const updateReposicionLoteRequest = (reposicion) => axios.put("/reposiciones/lote", reposicion);

export const updateReposicionRequest = (id, reposicion) => axios.put(`/reposiciones/${id}`, reposicion);

export const deleteReposicionRequest = (id) => axios.delete(`/reposiciones/${id}`);

export const deleteLoteReposicionesRequest = (id_lote) => axios.delete(`/reposiciones/lote/${id_lote}`);