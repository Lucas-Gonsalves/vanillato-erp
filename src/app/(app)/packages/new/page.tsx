import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { PackageForm } from '@/components/pages/packages'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { findPackageProductOptions } from '../package-product-options'

export default async function NewPackagePage() {
  const productOptions = await findPackageProductOptions()

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Link className={cn(buttonVariants({ variant: 'outline' }))} href="/packages">
            Voltar
          </Link>
        }
        description="Monte a composição do pacote com produtos ativos."
        title="Novo Pacote"
      />
      <PackageForm productOptions={productOptions} />
    </div>
  )
}
