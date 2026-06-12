import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

export const DeleteAccountCodeTemplate = ({ code }: { code: string }) => {
  return (
    <Html>
      <Head />
      <Preview>Verification code to delete your Explys account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={headingDanger}>Delete Account Request</Heading>
          <Text style={text}>
            We received a request to permanently delete your{" "}
            <strong>Explys</strong> account. If you made this request, please
            enter the following 6-digit verification code to confirm:
          </Text>
          <Section style={codeBox}>
            <Text style={codeText}>{code}</Text>
          </Section>
          <Text style={text}>
            <strong>Warning:</strong> This action is irreversible. All your data
            will be scheduled for deletion.
          </Text>
          <Text style={text}>
            If you did not request this, please ignore this email and make sure
            your account is secure.
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
};

// Стили
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
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
const headingDanger = {
  color: "#dc2626",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
};
const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
};
const codeBox = {
  background: "#f3f4f6",
  borderRadius: "8px",
  margin: "24px 0",
  padding: "20px",
  textAlign: "center" as const,
};
const codeText = {
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "8px",
  color: "#111827",
  margin: "0",
};
const footerText = {
  color: "#9ca3af",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "20px 0 0",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "20px",
};

export default DeleteAccountCodeTemplate;
