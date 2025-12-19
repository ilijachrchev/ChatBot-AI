import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ domain: string }>
}

const DomainSettingsPage = async ({ params }: Props) => {
  const { domain } = await params
  
  redirect(`/settings/${domain}/configuration`)
}

export default DomainSettingsPage