import mongoose from 'mongoose';

export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `ID inválido: ${paramName}` });
  }
  next();
};
