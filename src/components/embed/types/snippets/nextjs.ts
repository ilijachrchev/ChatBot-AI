export const nextjsSnippet = (domainId: string, baseUrl: string): string => `
'use client';

import { useEffect } from 'react';

export function SendWiseChatbot() {
  useEffect(() => {
    const iframe = document.createElement("iframe");
    iframe.src = "${baseUrl}/chatbot";
    iframe.className = "chat-frame";
    
    const style = document.createElement('style');
    style.textContent = \`
      .chat-frame {
        position: fixed;
        bottom: 50px;
        right: 50px;
        border: none;
        z-index: 9999;
      }
    \`;
    document.head.append(style);
    document.body.appendChild(iframe);

    const handleMessage = (e: MessageEvent) => {
      if(e.origin !== "${baseUrl}") return;
      
      if (e.data === 'ready') {
        iframe.contentWindow?.postMessage("${domainId}", "${baseUrl}/");
      } else {
        try {
          const dimensions = JSON.parse(e.data);
          iframe.width = dimensions.width;
          iframe.height = dimensions.height;
        } catch (err) {}
      }
    };

    window.addEventListener("message", handleMessage);
    
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.postMessage("${domainId}", "${baseUrl}/");
      }, 500);
    };

    return () => {
      window.removeEventListener("message", handleMessage);
      iframe.remove();
      style.remove();
    };
  }, []);

  return null;
}`