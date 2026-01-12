"use client"
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            // Store token in localStorage or cookie
            localStorage.setItem("token", token);

            // Redirect to dashboard or home
            router.push("/");
        } else {
            // Handle error
            router.push("/auth/signin?error=no_token");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Completing sign in...</h2>
                <p className="text-gray-500">Please wait while we finish setting up your session.</p>
            </div>
        </div>
    );
}
