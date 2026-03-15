import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().getFullYear()}
      </p>
      <p className="text-muted-foreground">
        Privacy policy content coming soon. Contact us at{' '}
        <a href="mailto:privacy@sendwiseai.com" className="underline">
          privacy@sendwiseai.com
        </a>
        {' '}with any questions.
      </p>
    </div>
  )
}
