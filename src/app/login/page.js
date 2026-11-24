
import Image from "next/image";
import LoginForm from "@/components/auth/login-form";

export const metadata = {
  title: "Admin Sign In · Sathi",
};

export const instant = false;

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 py-10 text-[#152238]">

<div className="flex w-full max-w-md flex-col items-center">

  {/* Branding */}
  <div className="flex justify-center">
    <Image
      src="/logo_without_bg.png"
      alt="Sathi Logo"
      width={120}
      height={120}
      priority
      className="h-24 w-24 object-contain"
    />
  </div>

  {/* Login Form */}
  <div className="w-full">
    <LoginForm initialReason={params?.reason} />
  </div>

</div>


     
      
    </main>
  );
}
