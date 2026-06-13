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

export const ResetProgressCodeTemplate = ({ code }: { code: string }) => {
  return (
    <Html>
      <Head />
      <Preview>Verification code to reset your learning progress</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={headingWarning}>Reset Progress Request</Heading>
          <Text style={text}>
            We received a request to reset the learning progress on your{" "}
            <strong>Explys</strong> account. To proceed, please enter the
            following 6-digit verification code:
          </Text>
          <Section style={codeBox}>
            <Text style={codeText}>{code}</Text>
          </Section>
          <Text style={text}>
            <strong>Note:</strong> Resetting progress will clear your saved
            words, watch history, and test results. Your account itself will
            remain active.
          </Text>
          <Text style={text}>
            If you did not request this, simply ignore this email.
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

// Стили (те же самые, только заголовок оранжевый/желтый для ворнинга)
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
const headingWarning = {
  color: "#d97706",
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

export default ResetProgressCodeTemplate;
