import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailChangeTemplateProps {
  code: string;
}

export const EmailChangeTemplate = ({ code }: EmailChangeTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your email verification code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Email Update</Heading>

          <Text style={text}>
            You recently requested to change your email address. Please enter
            the following 6-digit verification code to complete the process.
          </Text>

          <Section style={codeContainer}>
            <Text style={codeText}>{code}</Text>
          </Section>

          <Text style={text}>
            This code is valid for 15 minutes. If you did not make this request,
            please log in immediately and change your password to secure your
            account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

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

const codeContainer = {
  background: "#f3f4f6",
  borderRadius: "8px",
  margin: "30px 0",
  padding: "24px 0",
  textAlign: "center" as const,
};

const codeText = {
  color: "#6d28d9",
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "8px",
  margin: "0",
};

export default EmailChangeTemplate;
