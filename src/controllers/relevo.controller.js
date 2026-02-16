import Relevo from '../models/relevo.model.js';

export const getRelevos = async (req, res) => {
  try {
    const relevos = await Relevo.find({
      user: req.user.id,
    }).populate('user');

    res.json(relevos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los relevos' });
  }
}

export const getAllRelevos = async (req, res) => {
  try {
    const relevos = await Relevo.find().populate("user")
    res.json(relevos);
  } catch (error) {
    console.error('🛑 Error al obtener los relevos:', error); // Agrega esto
    res.status(500).json({
      message: 'Error al obtener los relevos',
      error: error.message,
      stack: error.stack,
    });
  }
}

export const createRelevo = async (req, res) => {
  try {
    const { responsable, recepcionista, observacion, conformidad } = req.body;

    const newRelevo = new Relevo({
      responsable,
      recepcionista,
      observacion,
      conformidad,
      user: req.user.id,
    });

    const saveRelevo = await newRelevo.save();

    res.json(saveRelevo);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el relevo' });
  }
}

export const getRelevo = async (req, res) => {
  try {
    const { id } = req.params;
    const relevo = await Relevo.findById(id).populate('user');
    if (!relevo) return res.status(404).json({ message: 'Relevo no encontrado' });
    res.json(relevo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el relevo' });
  }
}

export const deleteRelevo = async (req, res) => {
  try {
    const { id } = req.params;
    const relevo = await Relevo.findByIdAndDelete(id);
    if (!relevo) return res.status(404).json({ message: 'Relevo no encontrado' });
    res.json({ message: 'Relevo eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el relevo' });
  }
}

export const updateRelevo = async (req, res) => {
  try {
    const { id } = req.params;
    const { responsable, recepcionista, observacion, conformidad } = req.body;
    const relevo = await Relevo.findByIdAndUpdate(
      id,
      { responsable, recepcionista, observacion, conformidad },
      { new: true }
    );
    if (!relevo) return res.status(404).json({ message: 'Relevo no encontrado' });
    res.json(relevo);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el relevo' });
  }
}

