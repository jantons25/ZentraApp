import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export async function findUserByUsername(username) {
  return await User.findOne({ username });
}

export async function createUser({ username, password, name, role }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    password: hashedPassword,
    name: name || "",
    role: role || "user",
    status: "active"
  });
  return await user.save();
}