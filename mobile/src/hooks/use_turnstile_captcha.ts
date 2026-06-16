import { useState } from "react";

export function use_turnstile_captcha() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const reset_captcha = () => {
    setCaptchaToken(null);
    setCaptchaKey((previous) => previous + 1);
  };

  return {
    captchaToken,
    captchaKey,
    setCaptchaToken,
    reset_captcha,
  };
}
