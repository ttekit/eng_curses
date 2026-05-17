import * as React from "react";
import { Body, Html, Text } from "@react-email/components";

export type TwoFactorAuthTemplateProps = {
  token: string;
};

export function TwoFactorAuthTemplate({
  token,
}: TwoFactorAuthTemplateProps): React.ReactElement {
  return (
    <Html>
      <Body>
        <Text>Your verification code: {token}</Text>
        <Text>This code expires in 15 minutes.</Text>
      </Body>
    </Html>
  );
}
