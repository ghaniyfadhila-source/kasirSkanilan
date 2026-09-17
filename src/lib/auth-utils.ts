import bcryptjs from "bcryptjs"

export const hashPassword = (password: string) => {
  return bcryptjs.hashSync(password, 10)
}

export const comparePassword = (password: string, hashed: string) => {
  return bcryptjs.compareSync(password, hashed)
}

export const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8)
}