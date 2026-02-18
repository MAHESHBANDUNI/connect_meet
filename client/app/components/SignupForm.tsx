"use client"
import { useState, useEffect } from "react";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignupForm() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [animate, setAnimate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        setAnimate(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        setIsSubmitting(true);

        try {
            const result = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/signup`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email: email.trim(),
                        password,
                    }),
                }
            );

            const data = await result.json();

            try{
             const result = await signIn("credentials", {
                email: data?.user?.email.trim(),
                password: password,
                redirect: false,
              });
            if(result?.ok){
              const session = await getSession();
                if (session?.user?.role) {
                  let path='';
                  const callbackUrl = searchParams.get("callbackUrl");
                  if(callbackUrl){
                    path = callbackUrl.replace(process.env.NEXT_PUBLIC_BASE_URL as string, "");
                  }
                 
                  if(callbackUrl){
                    window.location.href = path;
                  }
                  else{
                  switch (session?.user?.role) {
                    case "admin":
                      window.location.href = "/";
                      break;
                    case "candidate":
                      window.location.href = "/";
                      break;
                    default:
                      window.location.href = "/";
                  }
                  }
                } else {
                  window.location.href = "/"; 
                }
            }
            if(!result?.ok){
              console.error("Error: ",result?.error);
            }
            }
            catch(err){
              console.error("Error: ",err);
            }
        } catch (err) {
            console.error("Error: ", err);
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignup = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/google`;
    };

    return (
        <>
            <style>{`
        @keyframes fadeIn {
          0% {opacity: 0;}
          100% {opacity: 1;}
        }
        .animateFadeIn {
          animation: fadeIn 0.5s ease-in forwards;
        }
      `}</style>

            <div className={`flex min-h-screen items-center justify-center bg-linear-to-br from-blue-100 via-white to-blue-200 p-4`}>
                <div
                    className={`w-full max-w-md rounded-xl shadow-lg bg-white p-8 transform transition-all duration-700 ease-out
            ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                >
                    <h2 className="mb-6 text-center text-xl font-semibold text-gray-800">Create your account</h2>

                    <button
                        onClick={handleGoogleSignup}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors mb-6"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Sign up with Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
                                        placeholder="John"
                                        required
                                    />
                                    <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
                                        placeholder="Doe"
                                        required
                                    />
                                    <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
                                    placeholder="you@example.com"
                                    required
                                />
                                <Mail className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400"
                                >
                                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
                                    placeholder="••••••••"
                                    required
                                />
                                <Lock className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm animateFadeIn">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex justify-center items-center disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating account..." : "Sign Up"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link href="/auth/signin" className="text-blue-600 font-medium hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}
