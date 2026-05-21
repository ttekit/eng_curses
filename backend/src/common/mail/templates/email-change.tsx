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
      <Preview>Ваш код підтвердження електронної пошти</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Оновлення електронної пошти</Heading>

          <Text style={text}>
            Нещодавно ви надіслали запит на зміну адреси електронної пошти. Будь
            ласка, введіть наступний 6-значний код підтвердження, щоб завершити
            процес.
          </Text>

          <Section style={codeContainer}>
            <Text style={codeText}>{code}</Text>
          </Section>

          <Text style={text}>
            Цей код дійсний протягом 15 хвилин. Якщо ви не надсилали цей запит,
            будь ласка, негайно увійдіть в систему та змініть свій пароль, щоб
            захистити свій акаунт.
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
