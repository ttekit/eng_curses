import * as React from "react";
import { Body, Html, Text } from "@react-email/components";

export type PasswordChangedTemplateProps = {
  email: string;
};

export function PasswordChangedTemplate({
  email,
}: PasswordChangedTemplateProps): React.ReactElement {
  return (
    <Html>
      <Body>
        <Text>
          The password for your Explys account ({email}) was changed. If this was not you,
          contact support immediately.
        </Text>
      </Body>
    </Html>
  );
}
