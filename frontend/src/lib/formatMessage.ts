/**
 * Simple `"{name}"` placeholder replacement for localized templates.
 *
 * @param template - String containing `{token}` segments.
 * @param vars - Values to substitute; unknown keys are left as `{token}` in output.
 * @returns Interpolated string.
 */
export function formatMessage(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (full: string, key: string) => {
    const value = vars[key];
    return value !== undefined ? value : full;
  });
}
