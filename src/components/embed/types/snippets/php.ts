export const phpSnippet = (domainId: string, baseUrl: string): string => `
<?php
$widgetOrigin = '${baseUrl}';
$widgetId = '${domainId}';
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Chatbot Widget</title>
</head>
<body>
<script>
    const WIDGET_ORIGIN = '<?php echo $widgetOrigin; ?>';
    const WIDGET_ID = '<?php echo $widgetId; ?>';
    
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
    
    window.addEventListener('message', (e) => {
      if (e.origin !== WIDGET_ORIGIN) return;
      
      const data = e.data;
      
      if (data === 'ready') {
        iframe.contentWindow?.postMessage(WIDGET_ID, WIDGET_ORIGIN + '/');
        return;
      }
      
      try {
        const dimensions = JSON.parse(data);
        iframe.width = dimensions.width;
        iframe.height = dimensions.height;
      } catch (err) {
        // ignore
      }
    });
    
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.postMessage(WIDGET_ID, WIDGET_ORIGIN + '/');
      }, 500);
    };
</script>
</body>
</html>`