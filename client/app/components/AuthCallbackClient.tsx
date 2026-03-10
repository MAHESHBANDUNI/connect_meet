"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  token: string;
}

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userSignin = async (userDetails: User) => {
    const result = await signIn("oauth-credentials", {
      userDetails: JSON.stringify(userDetails),
      redirect: false,
    });
    return result;
  };

  useEffect(() => {
    const token = searchParams.get("token");
    const userJson = searchParams.get("user");

    if (token && userJson) {
      try {
        const userParsed: User = { ...JSON.parse(userJson), token };
        userSignin(userParsed).then((result) => {
          if (result?.ok) {
            router.push("/");
          } else {
            router.push("/auth/signin?error=signin_failed");
          }
        });
      } catch (e) {
        router.push("/auth/signin?error=invalid_user");
      }
    } else {
      router.push("/auth/signin?error=no_token");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">
          Completing sign in...
        </h2>
        <p className="text-gray-500">
          Please wait while we finish setting up your session.
        </p>
      </div>
    </div>
  );
}
