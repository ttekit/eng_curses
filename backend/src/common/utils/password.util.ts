import { randomInt } from "crypto";

export function generateSecurePassword(length = 16): string {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const all = lower + upper + numbers + symbols;

  const pwdArray = [
    lower[randomInt(lower.length)],
    upper[randomInt(upper.length)],
    numbers[randomInt(numbers.length)],
    symbols[randomInt(symbols.length)],
  ];

  for (let i = pwdArray.length; i < length; i++) {
    pwdArray.push(all[randomInt(all.length)]);
  }
  
  for (let i = pwdArray.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [pwdArray[i], pwdArray[j]] = [pwdArray[j], pwdArray[i]];
  }

  return pwdArray.join("");
}
