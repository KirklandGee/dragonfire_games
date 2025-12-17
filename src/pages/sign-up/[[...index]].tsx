import { SignUp } from "@clerk/nextjs";
import Head from "next/head";

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>Sign up | Dragonfire Games</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-4 py-10">
        <div className="rounded-2xl border border-[color:var(--color-granite)]/20 bg-white/90 p-6 shadow-sm">
          <SignUp appearance={{ elements: { formButtonPrimary: "bg-[color:var(--color-imperial-blue)]" } }} />
        </div>
      </main>
    </>
  );
}
