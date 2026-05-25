import { SEO } from "../components/SEO/SEO";
import { resolveCanonicalUrl } from "./siteUrl";

type AuthPageSeoProps = {
  title: string;
  description: string;
  path: string;
};

/**
 * Standard noindex SEO wrapper for auth and registration routes.
 */
export function AuthPageSeo({ title, description, path }: AuthPageSeoProps) {
  return (
    <SEO
      title={title}
      description={description}
      canonicalUrl={resolveCanonicalUrl(path)}
      noindex
    />
  );
}
