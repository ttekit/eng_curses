export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return email || "";

  const [name, domain] = email.split("@");

  // Если имя ящика слишком короткое (1-2 символа), показываем только первую букву
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }

  // Берем первые 2 буквы и последние 2 буквы
  const start = name.slice(0, 2);
  const end = name.slice(-2);

  return `${start}***${end}@${domain}`;
}