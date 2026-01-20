import bcrypt from "bcryptjs";

const ROUNDS = 10;

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(ROUNDS);
  return bcrypt.hash(password, salt);
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
