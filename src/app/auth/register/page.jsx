"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { createClientInstance } from "@/app/utils/supabase/client";

export default function Register() {
  const supabase = createClientInstance();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");

  const { register: formRegister, handleSubmit } = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImageToImgbb = async () => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("image", imageFile);
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) return data.data.url;
    return null;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    const { email, password, username } = data;
    let avatar_url = null;
    if (imageFile) {
      avatar_url = await uploadImageToImgbb();
      if (!avatar_url) {
        setError("Image upload failed");
        setLoading(false);
        return;
      }
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
        data: { username, avatar_url },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, avatar_url }),
      });
    } catch (dbError) {
      console.error("Failed to save user to database:", dbError);
    }

    setLoading(false);
    setEmailSent(true);
    toast.success("Signup successful! Please confirm your email.");
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center border border-gray-200">
          <h1 className="text-2xl font-bold mb-4">Check your email</h1>
          <p className="mb-4">We have sent a confirmation email to your inbox. Please confirm your email to login.</p>
          <Link href="/auth/login" className="text-green-500 font-medium hover:underline">
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
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300">
              <img src={imagePreview || "https://i.ibb.co/bjMzB512/User-Profile-PNG-High-Quality-Image.png"} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <label className="bg-gray-200 px-3 py-1 rounded cursor-pointer hover:bg-gray-300">
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {imageName && <span className="text-sm text-gray-600 mt-1">{imageName}</span>}
            </div>
          </div>
          <input type="text" placeholder="Username" {...formRegister("username", { required: true })} className="border p-3 rounded mb-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400" />
          <input type="email" placeholder="Email" {...formRegister("email", { required: true, pattern: /\S+@\S+\.\S+/ })} className="border p-3 rounded mb-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400" />
          <div className="relative w-full mb-2">
            <input type={showPassword ? "text" : "password"} placeholder="Password" {...formRegister("password", { required: true, pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/ })} className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400 pr-10" />
            <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500 cursor-pointer text-xl">
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
          <button type="submit" disabled={loading} className="bg-green-500 text-white px-6 py-3 rounded w-full font-semibold cursor-pointer hover:bg-green-600 transition-colors mb-4">
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="w-full flex items-center justify-center my-2">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-500 font-medium">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <GoogleLoginButton onError={setError} />
        <p className="mt-4 text-gray-600">
          Already have an account? <Link href="/auth/login" className="text-green-500 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
