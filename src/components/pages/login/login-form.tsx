'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { login, type LoginInput, loginSchema } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginInput>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(values: LoginInput) {
    startTransition(() => {
      void login(values).then((result) => {
        if (!result.success) {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, messages]) => {
              const message = messages?.at(0)

              if (message) {
                setError(field as keyof LoginInput, { message })
              }
            })
          }

          toast.error(result.message)
          return
        }

        toast.success(result.message)
        router.replace('/dashboard')
        router.refresh()
      })
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <div className="relative">
          <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            autoComplete="email"
            className="pl-9"
            id="email"
            placeholder="user@email.com"
            type="email"
            {...register('email')}
          />
        </div>
        {errors.email?.message ? (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <LockKeyhole className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            autoComplete="current-password"
            className="pl-9"
            id="password"
            placeholder="Sua senha"
            type="password"
            {...register('password')}
          />
        </div>
        {errors.password?.message ? (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        ) : null}
      </div>

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
