import * as React from "react";

export const ConfirmationTemplate = ({ code }: { code: string }) => {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#7c3aed" }}>Ласкаво просимо до Explys!</h2>
      <p>Ваш код підтвердження:</p>

      <div
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          padding: "15px",
          backgroundColor: "#f3f4f6",
          display: "inline-block",
          borderRadius: "8px",
        }}
      >
        {code}
      </div>

      <p style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        Код дійсний 15 хвилин.
      </p>
    </div>
  );
};