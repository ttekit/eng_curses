import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { setStoredAccessToken } from "../../lib/api"; // поправь путь к файлу api, если нужно

export const EmailVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (!email) {
      navigate("/registration");
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorText("Код повинен складатися з 6 цифр");
      return;
    }

    setErrorText("");
    setLoading(false);

    try {
      const response = await fetch("http://localhost:4200/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setStoredAccessToken(data.access_token);

        const savedStudents = location.state?.generatedStudents || [];

        if (savedStudents.length > 0) {
          navigate("/registrationSuccess", {
            state: { generatedStudents: savedStudents },
          });
        } else {
          navigate("/registrationDetails");
        }
      }
    } catch (err) {
      setErrorText("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorText("");
    setResendMessage("");

    try {
      const response = await fetch(
        "http://localhost:4200/auth/resend-confirmation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (response.ok) {
        setResendMessage("Новий код успішно надіслано!");
        setTimer(59);
      } else {
        const data = await response.json();
        setErrorText(data.message || "Не вдалося надіслати код");
      }
    } catch {
      setErrorText("Помилка при повторному надсиланні");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#0f172a",
        color: "#fff",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#a78bfa", marginBottom: "10px" }}>
          Підтвердження пошти ✉️
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "25px" }}>
          Ми надіслали 6-значний код на <br /> <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            style={{
              width: "100%",
              letterSpacing: "8px",
              textAlign: "center",
              fontSize: "28px",
              padding: "10px",
              borderRadius: "8px",
              border: "2px solid #334155",
              backgroundColor: "#0f172a",
              color: "#fff",
              marginBottom: "15px",
              outline: "none",
            }}
            disabled={loading}
          />

          {errorText && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "14px",
                marginBottom: "15px",
              }}
            >
              {errorText}
            </p>
          )}
          {resendMessage && (
            <p
              style={{
                color: "#10b981",
                fontSize: "14px",
                marginBottom: "15px",
              }}
            >
              {resendMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: code.length === 6 ? "#7c3aed" : "#4c1d95",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: code.length === 6 ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Перевірка..." : "Підтвердити"}
          </button>
        </form>

        <div style={{ marginTop: "25px", fontSize: "14px" }}>
          {timer > 0 ? (
            <p style={{ color: "#64748b" }}>
              Надіслати код повторно через {timer}с
            </p>
          ) : (
            <button
              onClick={handleResend}
              style={{
                background: "none",
                border: "none",
                color: "#a78bfa",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "14px",
              }}
            >
              Надіслати код повторно
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
