const REGISTRATION_PATH_MARKERS = [
  "/register",
  "/register-details",
  "/register-preferences",
  "/register-success",
] as const;

/** True while the user is in the email/password registration wizard. */
export function isRegistrationFlowPath(pathname: string): boolean {
  return REGISTRATION_PATH_MARKERS.some((marker) => pathname.includes(marker));
}
