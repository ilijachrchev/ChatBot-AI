import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().getFullYear()}
      </p>
      <p className="text-muted-foreground">
        Terms of service content coming soon. Contact us at{' '}
        <a href="mailto:legal@sendwiseai.com" className="underline">
          legal@sendwiseai.com
        </a>
        {' '}with any questions.
      </p>
    </div>
  )
}
