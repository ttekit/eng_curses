import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface DailyReminderTemplateProps {
  name: string;
}

export const DailyReminderTemplate = ({ name }: DailyReminderTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Time to study, {name}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            This is your daily reminder to keep learning! Every session brings
            you closer to your goal. 
          </Text>
          <Section style={buttonContainer}>
            <Text style={text}>Keep up the great work!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px",
  maxWidth: "560px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "20px",
};
