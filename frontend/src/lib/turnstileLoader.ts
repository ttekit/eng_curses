// export const loadTurnstileScript = (callback: () => void) => {
//   if (window.turnstile) {
//     callback();
//     return;
//   }
//   const script = document.createElement('script');
//   script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
//   script.async = true;
//   script.onload = callback;
//   document.head.appendChild(script);
// };

//нигде не работает, можна удалить будет 