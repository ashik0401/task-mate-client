"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { createClient } from "@/app/utils/supabase/client";

export default function Register() {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    const { email, password } = data;
    const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/login` }
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setEmailSent(true);
    toast.success("Signup successful! Please confirm your email.");
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 ">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center border border-gray-200">
          <h1 className="text-2xl font-bold mb-4">Check your email</h1>
          <p className="mb-4">We have sent a confirmation email to your inbox. Please confirm your email to login.</p>
          <Link href="/auth/Login" className="text-green-500 font-medium hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-200">
        <h1 className="text-3xl font-bold mb-6">Register</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <input
            type="text"
            placeholder="Username"
            {...formRegister("username", { required: "Username is required" })}
            className="border p-3 rounded mb-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {errors.username && <p className="text-red-500 text-sm mb-2">{errors.username.message}</p>}
          <input
            type="email"
            placeholder="Email"
            {...formRegister("email", {
              required: "Email is required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email address" },
            })}
            className="border p-3 rounded mb-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>}
          <div className="relative w-full mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...formRegister("password", {
                required: "Password is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                  message: "Password must be 8+ chars, include upper, lower, number, special char",
                },
              })}
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400 pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-500 cursor-pointer text-xl"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
          {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded w-full font-semibold cursor-pointer hover:bg-green-600 transition-colors mb-4"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          <div className="flex items-center justify-center w-full my-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-3 text-gray-500 font-medium">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        </form>
        <div className="w-full">
          <GoogleLoginButton onError={setError} />
        </div>
        <p className="mt-4 text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-green-500 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
