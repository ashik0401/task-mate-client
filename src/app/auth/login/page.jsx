"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Login() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    const { email, password } = data;

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signInError) return setError(signInError.message);
    if (signInData?.user) router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md flex flex-col items-center border border-gray-200 text-black">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full text-black">
          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email address" },
            })}
            className="border p-3 rounded mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>}
          <div className="relative w-full mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-500 cursor-pointer text-xl"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
          {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>}
          <div className="w-full mb-4">
            <Link href="/auth/ForgotPassword" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded w-full font-semibold hover:bg-blue-600 transition-colors mb-4 cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
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
          Don’t have an account?{" "}
          <Link href="/auth/register" className="text-blue-500 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
