export const goSnippet = (domainId: string, baseUrl: string): string => `
package main

import (
	"net/http"
)

const widgetOrigin = "${baseUrl}"
const widgetID = "${domainId}"

func handler(w http.ResponseWriter, r *http.Request) {
	html := \`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Chatbot Widget</title>
</head>
<body>
<script>
  const WIDGET_ORIGIN = '\` + widgetOrigin + \`';
  const WIDGET_ID = '\` + widgetID + \`';
  
  const iframe = document.createElement('iframe');
  
  const iframeStyles = (styleString) => {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
  };
  
  iframeStyles(\\\`
    .chat-frame {
      position: fixed;
      bottom: 50px;
      right: 50px;
      border: none;
    }
  \\\`);
  
  iframe.src = WIDGET_ORIGIN + '/chatbot';
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
</html>\`

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(html))
}

func main() {
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}`