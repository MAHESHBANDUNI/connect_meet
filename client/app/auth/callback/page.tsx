import AuthCallbackClient from "@/app/components/AuthCallbackClient";
import { Suspense } from "react";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
