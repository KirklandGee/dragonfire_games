import "@/styles/globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      {...pageProps}
      appearance={{
        cssLayerName: "clerk",
      }}
    >
      <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
        <header className="flex items-center justify-between border-b border-[color:var(--color-granite)]/30 bg-[color:var(--color-imperial-blue)] px-6 py-4 text-white">
          <a className="text-lg font-semibold tracking-tight" href="/">
            Dragonfire Games
          </a>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <a href="/about" className="hover:underline">
              About
            </a>
            <a href="/events" className="hover:underline">
              Events
            </a>
            <a href="/admin" className="hover:underline">
              Admin
            </a>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </nav>
        </header>
        <main className="px-6 py-8">
          <Component {...pageProps} />
        </main>
      </div>
    </ClerkProvider>
  );
}
