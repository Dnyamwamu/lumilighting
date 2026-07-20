import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 py-12 px-4">
      <SignUp
        fallbackRedirectUrl="/api/auth/sync-member"
        forceRedirectUrl="/api/auth/sync-member"
      />
    </div>
  )
}
