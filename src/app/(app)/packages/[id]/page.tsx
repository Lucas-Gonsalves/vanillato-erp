import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/page-header'
import { PackageForm } from '@/components/pages/packages'
import { buttonVariants } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { cn } from '@/lib/utils'

import { findPackageProductOptions } from '../package-product-options'

type EditPackagePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const { id } = await params
  const [packageData, productOptions] = await Promise.all([
    prisma.package.findUnique({
      select: {
        id: true,
        items: {
          orderBy: {
            product: {
              name: 'asc',
            },
          },
          select: {
            productId: true,
            quantity: true,
          },
        },
        name: true,
        salePrice: true,
      },
      where: {
        id,
      },
    }),
    findPackageProductOptions(),
  ])

  if (!packageData) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Link className={cn(buttonVariants({ variant: 'outline' }))} href="/packages">
            Voltar
          </Link>
        }
        description="Atualize os dados e a composição do pacote."
        title="Editar Pacote"
      />
      <PackageForm
        packageData={{
          id: packageData.id,
          items: packageData.items,
          name: packageData.name,
          salePrice: packageData.salePrice.toString(),
        }}
        productOptions={productOptions}
      />
    </div>
  )
}
