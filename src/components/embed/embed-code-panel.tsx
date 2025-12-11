'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Code, Info } from 'lucide-react'
import { LanguageSelector } from './ui/language-selector'
import { CodeDisplay } from './ui/code-display'
import { generateCodeSnippet } from './types/snippets'

interface EmbedCodePanelProps {
  domainId: string
  domainName?: string
}

export function EmbedCodePanel({ domainId, domainName }: EmbedCodePanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const snippet = generateCodeSnippet(domainId, selectedLanguage)
      setCodeSnippet(snippet)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [domainId, selectedLanguage])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Embed Your Chatbot</h2>
        </div>
        <p className="text-muted-foreground">
          Copy and paste the code snippet below into your website to embed the chatbot
          {domainName && ` for ${domainName}`}
        </p>
      </div>

      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription>
          <span className="font-semibold">Important:</span> Make sure to replace the
          widget configuration values with your actual domain settings. The chatbot
          will appear in the bottom-right corner of your website.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Frameworks</CardTitle>
            <CardDescription>
              15 languages & frameworks supported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installation Code</CardTitle>
              <CardDescription>
                Copy this code and paste it into your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeDisplay
                code={codeSnippet}
                language={selectedLanguage}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Implementation Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal list-inside text-sm">
                <li className="text-muted-foreground">
                  <span className="font-medium text-foreground">Copy the code</span> from
                  the snippet above
                </li>
                <li className="text-muted-foreground">
                  <span className="font-medium text-foreground">Paste it</span> into your
                  website or application
                </li>
                <li className="text-muted-foreground">
                  <span className="font-medium text-foreground">Configure</span> the widget
                  settings in your dashboard
                </li>
                <li className="text-muted-foreground">
                  <span className="font-medium text-foreground">Test</span> the chatbot to
                  ensure it's working correctly
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Configuration</CardTitle>
          <CardDescription>
            Customize your chatbot's appearance and behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="styling" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="styling">Styling</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="api">API Reference</TabsTrigger>
            </TabsList>
            <TabsContent value="styling" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Custom CSS Classes</h4>
                <p className="text-sm text-muted-foreground">
                  The chatbot iframe has the class <code className="bg-muted px-1 py-0.5 rounded">.chat-frame</code>.
                  You can override the default styles by adding custom CSS to your website.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Position</h4>
                <p className="text-sm text-muted-foreground">
                  By default, the chatbot appears in the bottom-right corner (50px from bottom and right).
                  Modify the CSS to change the position.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="behavior" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Message Handling</h4>
                <p className="text-sm text-muted-foreground">
                  The chatbot uses the postMessage API for secure cross-origin communication.
                  Messages are validated to ensure they come from the correct origin.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Ready Event</h4>
                <p className="text-sm text-muted-foreground">
                  When the iframe loads, it sends a 'ready' message. Your page responds with the
                  widget ID to initialize the connection.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="api" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Widget ID</h4>
                <p className="text-sm text-muted-foreground">
                  Your unique widget ID: <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">{domainId}</code>
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Events</h4>
                <p className="text-sm text-muted-foreground">
                  The widget communicates dimensions for dynamic resizing. Listen to these events
                  to customize the behavior further if needed.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}