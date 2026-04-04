import bcrypt from "bcrypt"

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
}

export const comparePassword = async (password: string, hashedPasswrd: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPasswrd)
}   