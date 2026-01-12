import SigninForm from "../../components/SigninForm";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SigninForm />
    </Suspense>
  );
}

