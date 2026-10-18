import bcrypt from "bcrypt";
import { UserRepository } from "@/repositories/user-repository";

export async function signupService(name: string, email: string, password: string) {
  const userRepository = new UserRepository();

  try {
    // Reject duplicate accounts before inserting.
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return { code: 409, status: "error", message: "An account with this email already exists" };
    }

    // Public signup always creates a USER account; passwords are stored hashed.
    const user = await userRepository.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    if (!user) {
      return { code: 500, status: "error", message: "Failed to create account" };
    }

    return {
      code: 201,
      status: "success",
      message: "Account created successfully",
      data: { user },
    };
  } catch (error) {
    console.error("SignupService Error", error);
    return { code: 500, status: "error", message: "Failed to create account" };
  }
}
