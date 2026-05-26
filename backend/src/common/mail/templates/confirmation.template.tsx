import * as React from "react";

interface ConfirmationTemplateProps {
  code: string;
  isLogin?: boolean;
}

export const ConfirmationTemplate: React.FC<ConfirmationTemplateProps> = ({
  code,
  isLogin = false,
}) => {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: "#f4f4f5",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <table
        width="100%"
        border={0}
        cellSpacing="0"
        cellPadding="0"
        style={{ backgroundColor: "#f4f4f5", padding: "40px 10px" }}
      >
        <tr>
          <td align="center">
            <table
              width="100%"
              border={0}
              cellSpacing="0"
              cellPadding="0"
              style={{
                maxWidth: "500px",
                width: "100%",
                margin: "0 auto",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              }}
            >
              <tr>
                <td
                  style={{
                    padding: "30px 20px 15px 20px",
                    textAlign: "center",
                  }}
                >
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "26px",
                      color: "#8b5cf6",
                      fontWeight: 800,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Explys
                  </h1>
                </td>
              </tr>

              <tr>
                <td
                  style={{ padding: "0 20px 20px 20px", textAlign: "center" }}
                >
                  <h2
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "20px",
                      color: "#09090b",
                      fontWeight: 700,
                    }}
                  >
                    {isLogin ? "Verify your email" : "Welcome!"}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      color: "#52525b",
                      lineHeight: "1.6",
                    }}
                  >
                    {isLogin
                      ? "We noticed you're trying to log in, but your email isn't verified yet. Please enter this verification code to continue:"
                      : "Glad to see you in Explys. To complete your registration, please enter this verification code:"}
                  </p>
                </td>
              </tr>

              <tr>
                <td style={{ padding: "10px 20px 30px 20px" }}>
                  <div
                    style={{
                      backgroundColor: "#f5f3ff",
                      border: "2px dashed #c4b5fd",
                      borderRadius: "12px",
                      padding: "20px 10px",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "34px",
                        fontWeight: 800,
                        letterSpacing: "4px",
                        color: "#6d28d9",
                      }}
                    >
                      {code}
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td
                  style={{ padding: "0 20px 30px 20px", textAlign: "center" }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#71717a",
                      lineHeight: "1.5",
                    }}
                  >
                    The code is valid for <strong>15 minutes</strong>.<br />
                    If you did not register for Explys, please ignore this
                    email.
                  </p>
                </td>
              </tr>
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  backgroundColor: "#fff1f1",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#991b1b",
                    lineHeight: "1.4",
                  }}
                >
                  <strong>Attention:</strong> Please verify your email within{" "}
                  <strong>24 hours</strong>. Otherwise, your account will be
                  automatically deleted for security reasons.
                </p>
              </div>

              <tr>
                <td
                  style={{
                    backgroundColor: "#fafafa",
                    padding: "20px",
                    textAlign: "center",
                    borderTop: "1px solid #e4e4e7",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#a1a1aa",
                      lineHeight: "1.5",
                    }}
                  >
                    &copy; {new Date().getFullYear()} Explys. All rights
                    reserved.
                    <br />
                    Your path to perfect English.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  );
};
