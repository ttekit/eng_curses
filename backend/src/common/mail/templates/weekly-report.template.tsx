// src/common/mail/templates/weekly-report.template.tsx
import * as React from "react";
import { Html, Body, Container, Text, Heading, Section } from "@react-email/components";

interface WeeklyReportProps {
  name: string;
  stats: {
    minutes: number;
    completed: number;
  };
}

export const WeeklyReportTemplate = ({ name, stats }: WeeklyReportProps) => {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Weekly Learning Report</Heading>
          
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>Here is a quick look at your progress over the last 7 days:</Text>
          
          <Section style={statsContainer}>
            <Text style={statItem}>
              ⏱️ Time Spent: <strong>{stats.minutes} minutes</strong>
            </Text>
            <Text style={statItem}>
              ✅ Lessons Completed: <strong>{stats.completed}</strong>
            </Text>
          </Section>

          <Text style={text}>
            {stats.minutes > 0 
              ? "Great job! Keep the momentum going this week. 🚀" 
              : "Looks like you took a break this week. Ready to jump back in? 💪"}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Стили (можешь подогнать под дизайн Explys)
const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif", padding: "40px 0" };
const container = { backgroundColor: "#ffffff", padding: "30px", borderRadius: "8px", maxWidth: "560px", margin: "0 auto" };
const heading = { color: "#111827", fontSize: "24px", textAlign: "center" as const };
const text = { color: "#4b5563", fontSize: "16px", lineHeight: "24px" };
const statsContainer = { backgroundColor: "#f3f4f6", padding: "20px", borderRadius: "8px", margin: "20px 0" };
const statItem = { fontSize: "18px", color: "#111827", margin: "10px 0" };