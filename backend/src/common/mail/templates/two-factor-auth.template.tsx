import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

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
    <Html lang="en">
      <Head />
      <Preview>Reset your Explys password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Reset Your Password</Heading>

          <Text style={text}>
            We received a request to reset the password for your{" "}
            <strong>Explys</strong> account. If you made this request, please
            click the button below to set a new password:
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={href}>
              Reset Password
            </Button>
          </Section>

          <Text style={text}>
            Or copy and paste this link into your browser:
            <br />
            <a href={href} style={linkStyle}>
              {href}
            </a>
          </Text>

          <Text style={text}>
            This link will expire in <strong>15 minutes</strong>. If you did not
            request a password reset, you can safely ignore this email. Your
            password will remain unchanged.
          </Text>

          <Text style={footerText}>
            Best regards,
            <br />
            The Explys Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "560px",
};

const heading = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  padding: "0",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#6d28d9",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 24px",
};

const linkStyle = {
  color: "#6d28d9",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const footerText = {
  color: "#9ca3af",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "20px 0 0",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "20px",
};

export default ResetPasswordTemplate;
