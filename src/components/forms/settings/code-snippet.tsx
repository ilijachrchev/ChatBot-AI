'use client'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import React from 'react'
import { Section } from '@/components/section-label'

type Props = {
  id: string
}

const CodeSnippet = ({ id }: Props) => {
  let snippet = `
    const iframe = document.createElement("iframe");
    
    const iframeStyles = (styleString) => {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
    }
    
    iframeStyles('
        .chat-frame {
            position: fixed;
            bottom: 50px;
            right: 50px;
            border: none;
        }
    ')
    
    iframe.src = "http://localhost:3000/chatbot"
    iframe.classList.add('chat-frame')
    document.body.appendChild(iframe)
    
    window.addEventListener("message", (e) => {
        if(e.origin !== "http://localhost:3000") return null
        
        let data = e.data;
        
        if (data === 'ready') {
            iframe.contentWindow.postMessage("${id}",
             "http://localhost:3000/");
            return;
        }
        
        try {
            let dimensions = JSON.parse(data);
            iframe.width = dimensions.width;
            iframe.height = dimensions.height;
        } catch (err) {}
    })
    
    iframe.onload = () => {
        setTimeout(() => {
            iframe.contentWindow.postMessage("${id}",
             "http://localhost:3000/");
        }, 500);
    }
        `

    const handleCopy = () => {
      navigator.clipboard.writeText(snippet)
      toast('Copied to clipboard', {
        description: 'You can now paste the code inside your website',
      })
    }

  return (
    <div className="mt-10 flex flex-col gap-5 items-start w-full">
      <Section
        label="Code snippet"
        message="Copy and paste this code snippet into the header tag of your website"
      />

      {/* MOBILE: no script, just info text */}
      <div className="w-full sm:hidden rounded-lg bg-cream px-4 py-3 text-xs text-slate-700">
        You don&apos;t need the embed script on mobile.
        <br />
        Open this page on your laptop or desktop to copy the chatbot embed code.
      </div>

      {/* DESKTOP / TABLET: full script in a scrollable box */}
      <div className="hidden sm:block w-full">
        <div className="relative rounded-lg bg-cream px-4 py-4">
          <Copy
            className="absolute top-3 right-3 h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={handleCopy}
          />
          <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-md bg-white/70 px-3 py-3">
            <pre className="whitespace-pre text-[11px] leading-relaxed">
              <code className="text-gray-700">{snippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}


export default CodeSnippet