import * as React from "react";
import { Body, Html, Text } from "@react-email/components";

export type ResetPasswordTemplateProps = {
  domain: string;
  token: string;
};

export function ResetPasswordTemplate({
  domain,
  token,
}: ResetPasswordTemplateProps): React.ReactElement {
  const base = domain.replace(/\/+$/, "");
  const href = `${base}/auth/password-recovery/new/${encodeURIComponent(token)}`;
  return (
    <Html>
      <Body>
        <Text>Reset your Explys password:</Text>
        <Text>
          <a href={href}>{href}</a>
        </Text>
      </Body>
    </Html>
  );
}
