import { randomInt } from "node:crypto";

export function generateSecurePassword(length = 16): string {
  const finalLength = Math.max(length, 10);

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

  for (let i = pwdArray.length; i < finalLength; i++) {
    pwdArray.push(all[randomInt(all.length)]);
  }

  for (let i = pwdArray.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const temp = pwdArray[i];
    pwdArray[i] = pwdArray[j];
    pwdArray[j] = temp;
  }

  return pwdArray.join("");
}
