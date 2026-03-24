import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

const schema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function Register() {
    
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const onSubmit = async (data: RegisterFormData): Promise<void> => {
    console.log("Form Data:", data);
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-400 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm flex flex-col"
      >
        <h1 className="text-2xl font-bold text-center mb-4">
          Register
        </h1>

        <label className="mb-1">Name</label>
        <input
          type="text"
          {...register("name")}
          placeholder="Enter your name"
          className="mb-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-2">
            {errors.name.message}
          </p>
        )}

        <label className="mb-1">Email</label>
        <input
          type="email"
          {...register("email")}
          placeholder="Enter your email"
          className="mb-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2">
            {errors.email.message}
          </p>
        )}

        <label className="mb-1">Password</label>
        <input
          type="password"
          {...register("password")}
          placeholder="Enter password"
          className="mb-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-2">
            {errors.password.message}
          </p>
        )}

        <label className="mb-1">Confirm Password</label>
        <input
          type="password"
          {...register("confirmPassword")}
          placeholder="Confirm password"
          className="mb-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mb-2">
            {errors.confirmPassword.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`py-2 rounded text-white mt-2 transition ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
          }`}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center mt-3">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
export default Register;

