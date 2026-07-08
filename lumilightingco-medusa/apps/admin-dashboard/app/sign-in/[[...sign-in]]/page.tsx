import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10">
      <div className="glass-panel p-8 rounded-3xl max-w-md w-full flex flex-col items-center shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />

        {/* Brand Logo & Heading */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <span className="text-black font-extrabold text-2xl">L</span>
          </div>
          <div className="text-center">
            <h2 className="font-bold text-xl text-theme-contrast leading-tight">LUMI Lighting.</h2>
            <p className="text-[10px] text-amber-500/80 uppercase tracking-widest font-semibold mt-0.5">Executive Portal</p>
          </div>
        </div>

        {/* Clerk Sign In component styled to match dark/light theme variables */}
        <SignIn
          appearance={{
            elements: {
              card: "bg-transparent shadow-none border-none w-full",
              header: "hidden",
              socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs rounded-xl py-2.5 transition-all",
              socialButtonsBlockButtonText: "text-white font-medium",
              formButtonPrimary: "bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl py-3 border-none shadow-md shadow-amber-500/10 transition-all cursor-pointer",
              formFieldInput: "bg-white/5 border border-white/10 rounded-xl text-white text-xs p-3 focus:border-amber-500 focus:bg-white/10 transition-all",
              formFieldLabel: "text-white/60 text-[10px] uppercase font-bold tracking-wider mb-1",
              footerActionText: "text-white/40 text-xs",
              footerActionLink: "text-amber-500 hover:text-amber-400 text-xs font-bold transition-all",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-amber-500",
              formResendCodeLink: "text-amber-500",
              dividerLine: "bg-white/10",
              dividerText: "text-white/40 text-xs",
            }
          }}
        />
      </div>
    </div>
  );
}
