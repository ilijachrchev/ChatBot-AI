import { getKnowledgeBaseFiles } from '@/actions/knowledge-base'
import InfoBar from '@/components/infobar'
import KnowledgeBaseContent from '@/components/knowledge-base'
import React from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = Record<string, never>

const Page = async (props: Props) => {
  const filesResult = await getKnowledgeBaseFiles()
  const files = filesResult.status === 200 ? filesResult.files : []

  return (
    <>
      <InfoBar />
      <KnowledgeBaseContent initialFiles={files || []} />
    </>
  )
}

export default Page

