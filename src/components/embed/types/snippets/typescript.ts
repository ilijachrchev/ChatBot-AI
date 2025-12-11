export const typescriptSnippet = (domainId: string, baseUrl: string): string => `
const WIDGET_ORIGIN = '${baseUrl}';
const WIDGET_ID = '${domainId}';

const iframe: HTMLIFrameElement = document.createElement('iframe');

const iframeStyles = (styleString: string): void => {
  const style: HTMLStyleElement = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
};

iframeStyles(\`
  .chat-frame {
    position: fixed;
    bottom: 50px;
    right: 50px;
    border: none;
  }
\`);

iframe.src = \`\${WIDGET_ORIGIN}/chatbot\`;
iframe.classList.add('chat-frame');
document.body.appendChild(iframe);

window.addEventListener('message', (e: MessageEvent) => {
  if (e.origin !== WIDGET_ORIGIN) return;
  
  const data = e.data;
  
  if (data === 'ready') {
    iframe.contentWindow?.postMessage(WIDGET_ID, \`\${WIDGET_ORIGIN}/\`);
    return;
  }
  
  try {
    const dimensions = JSON.parse(data as string) as { width: number; height: number };
    iframe.width = String(dimensions.width);
    iframe.height = String(dimensions.height);
  } catch (err) {
    // ignore invalid messages
  }
});

iframe.onload = () => {
  setTimeout(() => {
    iframe.contentWindow?.postMessage(WIDGET_ID, \`\${WIDGET_ORIGIN}/\`);
  }, 500);
};`