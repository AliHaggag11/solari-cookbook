import { Suspense } from "react";
import PortalLoginPage from "./login-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e8e4dc]" />}>
      <PortalLoginPage />
    </Suspense>
  );
}
