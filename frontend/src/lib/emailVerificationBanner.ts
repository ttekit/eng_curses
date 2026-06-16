/** Shows a reminder while the learner is signed in but email is not verified yet. */
export function should_show_email_verification_banner(
  isLoggedIn: boolean,
  isVerified: boolean | undefined,
): boolean {
  return isLoggedIn && isVerified === false;
}
