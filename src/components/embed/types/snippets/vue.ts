export const vueSnippet = (domainId: string, baseUrl: string): string => `
<template>
  <!-- Chatbot iframe will be mounted here -->
</template>

<script>
const WIDGET_ORIGIN = '${baseUrl}';
const WIDGET_ID = '${domainId}';

export default {
  name: 'ChatbotWidget',
  mounted() {
    const iframe = document.createElement('iframe');
    
    const iframeStyles = (styleString) => {
      const style = document.createElement('style');
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
    
    const handleMessage = (e) => {
      if (e.origin !== WIDGET_ORIGIN) return;
      
      const data = e.data;
      
      if (data === 'ready') {
        iframe.contentWindow?.postMessage(WIDGET_ID, \`\${WIDGET_ORIGIN}/\`);
        return;
      }
      
      try {
        const dimensions = JSON.parse(data);
        iframe.width = String(dimensions.width);
        iframe.height = String(dimensions.height);
      } catch (err) {
        // ignore
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.postMessage(WIDGET_ID, \`\${WIDGET_ORIGIN}/\`);
      }, 500);
    };
    
    this._iframe = iframe;
    this._handleMessage = handleMessage;
  },
  beforeUnmount() {
    window.removeEventListener('message', this._handleMessage);
    this._iframe?.remove();
  }
}
</script>`