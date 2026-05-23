import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Link,
  Section,
  Button,
} from "@react-email/components";
import * as React from "react";

interface AccountDeletedTemplateProps {
  name: string;
  restoreLink: string;
}

export const AccountDeletedTemplate = ({
  name,
  restoreLink,
}: AccountDeletedTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Explys account is scheduled for deletion</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Account Deletion Request</Heading>

          <Text style={text}>Hello {name},</Text>

          <Text style={text}>
            You recently requested to delete your <strong>Explys</strong>{" "}
            account. Your profile and all associated data will be permanently
            deleted from our servers in <strong>30 days</strong>.
          </Text>

          <Text style={text}>
            If you didn't make this request, or if you simply changed your mind,
            you can cancel the deletion and restore your account by clicking the
            button below:
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={restoreLink}>
              Restore my account
            </Button>
          </Section>

          <Text style={text}>
            If you do not click the link, your account will be permanently
            erased after 30 days. We are sad to see you go!
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
  color: "#dc2626",
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
  margin: "24px 0",
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

const footerText = {
  color: "#9ca3af",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "20px 0 0",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "20px",
};

export default AccountDeletedTemplate;
