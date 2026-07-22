import { LoginForm } from '@/components/pages/login'
import { redirectAuthenticatedUser } from '@/lib/auth'

export default async function LoginPage() {
  await redirectAuthenticatedUser()

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <h2 className="text-sidebar-foreground truncate text-5xl leading-none font-extralight tracking-[0.35em] uppercase select-none">
            Vanillato
          </h2>
        </div>

        <div className="border-border/70 bg-card rounded-lg border p-6">
          <div className="mb-6 space-y-2">
            <h1 className="text-card-foreground text-xl font-semibold">Entrar</h1>
            <p className="text-muted-foreground text-sm">Acesse com seu usuário.</p>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  )
}
