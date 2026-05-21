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
      <Preview>Ваш акаунт Explys заплановано на видалення</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Запит на видалення акаунту</Heading>

          <Text style={text}>Привіт, {name},</Text>

          <Text style={text}>
            Нещодавно ви надіслали запит на видалення вашого акаунту{" "}
            <strong>Explys</strong>. Ваш профіль та всі пов'язані з ним дані
            будуть остаточно видалені з наших серверів через{" "}
            <strong>30 днів</strong>.
          </Text>

          <Text style={text}>
            Якщо ви не робили цей запит, або якщо ви просто передумали, ви
            можете скасувати видалення та відновити свій акаунт, натиснувши
            кнопку нижче:
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={restoreLink}>
              Відновити мій акаунт
            </Button>
          </Section>

          <Text style={text}>
            Якщо ви не перейдете за посиланням, ваш акаунт буде назавжди стерто
            після закінчення 30 днів. Нам сумно прощатися!
          </Text>

          <Text style={footerText}>
            З найкращими побажаннями,
            <br />
            Команда Explys
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
