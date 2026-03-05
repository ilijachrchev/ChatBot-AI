import { onGetCurrentDomainInfo } from '@/actions/settings'
import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ domain: string }>
}

const ProductsPage = async ({ params }: Props) => {
  const { domain } = await params
  const domainInfo = await onGetCurrentDomainInfo(domain)
  const domainId = domainInfo?.domains?.[0]?.id
  if (domainId) redirect(`/products?domain=${domainId}`)
  redirect('/products')
}

export default ProductsPage
