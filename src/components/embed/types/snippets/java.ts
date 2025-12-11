export const javaSnippet = (domainId: string, baseUrl: string): string => `
// Spring Boot controller returning HTML that embeds the widget script
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatbotWidgetController {
    private static final String WIDGET_ORIGIN = "${baseUrl}";
    private static final String WIDGET_ID = "${domainId}";
    
    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String index() {
        return "<!DOCTYPE html>\\n" +
                "<html>\\n" +
                "<head><meta charset='utf-8'/><title>Chatbot Widget</title></head>\\n" +
                "<body>\\n" +
                "<script>\\n" +
                "  const WIDGET_ORIGIN = '" + WIDGET_ORIGIN + "';\\n" +
                "  const WIDGET_ID = '" + WIDGET_ID + "';\\n" +
                "  const iframe = document.createElement('iframe');\\n" +
                "  const iframeStyles = (styleString) => {\\n" +
                "    const style = document.createElement('style');\\n" +
                "    style.textContent = styleString;\\n" +
                "    document.head.append(style);\\n" +
                "  };\\n" +
                "  iframeStyles(\`\\n" +
                "    .chat-frame {\\n" +
                "      position: fixed;\\n" +
                "      bottom: 50px;\\n" +
                "      right: 50px;\\n" +
                "      border: none;\\n" +
                "    }\\n" +
                "  \`);\\n" +
                "  iframe.src = WIDGET_ORIGIN + '/chatbot';\\n" +
                "  iframe.classList.add('chat-frame');\\n" +
                "  document.body.appendChild(iframe);\\n" +
                "  window.addEventListener('message', (e) => {\\n" +
                "    if (e.origin !== WIDGET_ORIGIN) return;\\n" +
                "    const data = e.data;\\n" +
                "    if (data === 'ready') {\\n" +
                "      iframe.contentWindow?.postMessage(WIDGET_ID, WIDGET_ORIGIN + '/');\\n" +
                "      return;\\n" +
                "    }\\n" +
                "    try {\\n" +
                "      const dimensions = JSON.parse(data);\\n" +
                "      iframe.width = dimensions.width;\\n" +
                "      iframe.height = dimensions.height;\\n" +
                "    } catch (err) {}\\n" +
                "  });\\n" +
                "  iframe.onload = () => {\\n" +
                "    setTimeout(() => {\\n" +
                "      iframe.contentWindow?.postMessage(WIDGET_ID, WIDGET_ORIGIN + '/');\\n" +
                "    }, 500);\\n" +
                "  };\\n" +
                "</script>\\n" +
                "</body>\\n" +
                "</html>";
    }
}`