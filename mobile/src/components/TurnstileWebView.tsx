/**
 * Cloudflare Turnstile in a WebView — same token flow as the web login form.
 */
import { useMemo, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import { getTurnstileSiteKey } from "../lib/config";
import { colors } from "../theme/colors";

type TurnstileWebViewProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  resetKey?: number;
};

function buildTurnstileHtml(siteKey: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=_explysTurnstileReady" async defer></script>
    <style>
      html, body { margin: 0; padding: 0; background: #09090b; }
      #wrap { display: flex; justify-content: center; padding: 8px 0; }
    </style>
  </head>
  <body>
    <div id="wrap"></div>
    <script>
      function post(payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      }
      window._explysTurnstileReady = function () {
        turnstile.render('#wrap', {
          sitekey: ${JSON.stringify(siteKey)},
          theme: 'dark',
          callback: function (token) { post({ type: 'token', token: token }); },
          'expired-callback': function () { post({ type: 'expired' }); },
          'error-callback': function () { post({ type: 'error' }); },
        });
      };
    </script>
  </body>
</html>`;
}

export function TurnstileWebView({ onToken, onExpire, resetKey = 0 }: TurnstileWebViewProps) {
  const handledRef = useRef(false);
  const html = useMemo(() => buildTurnstileHtml(getTurnstileSiteKey()), [resetKey]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        token?: string;
      };
      if (payload.type === "token" && payload.token && !handledRef.current) {
        handledRef.current = true;
        onToken(payload.token);
      }
      if (payload.type === "expired" || payload.type === "error") {
        handledRef.current = false;
        onExpire?.();
      }
    } catch {
      /* ignore malformed messages */
    }
  };

  return (
    <View style={styles.wrap}>
      <WebView
        key={resetKey}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 72,
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
});
