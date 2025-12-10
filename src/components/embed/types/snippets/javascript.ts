export const javascriptSnippet = (domainId: string, baseUrl: string): string => `
const iframe = document.createElement("iframe");

const iframeStyles = (styleString) => {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
}

iframeStyles(\`
  .chat-frame {
    position: fixed;
    bottom: 50px;
    right: 50px;
    border: none;
  }
\`)

iframe.src = "${baseUrl}/chatbot"
iframe.classList.add('chat-frame')
document.body.appendChild(iframe)

window.addEventListener("message", (e) => {
  if(e.origin !== "${baseUrl}") return null
  
  let data = e.data;
  
  if (data === 'ready') {
    iframe.contentWindow.postMessage("${domainId}", "${baseUrl}/");
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
    iframe.contentWindow.postMessage("${domainId}", "${baseUrl}/");
  }, 500);
}`