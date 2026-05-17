import * as React from "react";
import { Body, Html, Text } from "@react-email/components";

export type ConfirmationTemplateProps = {
  domain: string;
  token: string;
};

export function ConfirmationTemplate({
  domain,
  token,
}: ConfirmationTemplateProps): React.ReactElement {
  const base = domain.replace(/\/+$/, "");
  const href = `${base}/auth/confirm-email?token=${encodeURIComponent(token)}`;
  return (
    <Html>
      <Body>
        <Text>Confirm your Explys account:</Text>
        <Text>
          <a href={href}>{href}</a>
        </Text>
      </Body>
    </Html>
  );
}
