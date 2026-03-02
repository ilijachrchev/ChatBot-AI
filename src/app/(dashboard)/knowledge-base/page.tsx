import { redirect } from 'next/navigation'

// Knowledge Base has moved to per-domain settings.
// Any direct visit here is redirected to the dashboard.
const KnowledgeBasePage = () => {
  redirect('/dashboard')
}

export default KnowledgeBasePage
