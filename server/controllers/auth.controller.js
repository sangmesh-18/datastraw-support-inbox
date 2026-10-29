
import {
  registerUser,
  loginUser,
} from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, valid email, and password of at least 8 characters are required",
      });
    }

    // Public registration must never allow users to choose ADMIN.
    const user = await registerUser({
      name,
      email,
      password,
      role: "AGENT",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 409
          ? error.message
          : "Failed to register user",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 401
          ? "Invalid email or password"
          : "Login failed",
    });
  }
};
