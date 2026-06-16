/** Shows after entry placement is done; hidden during onboarding and when verified. */
export function should_show_email_verification_banner(
  isLoggedIn: boolean,
  isVerified: boolean | undefined,
  hasCompletedPlacement: boolean | undefined,
): boolean {
  return (
    isLoggedIn &&
    isVerified === false &&
    hasCompletedPlacement === true
  );
}
