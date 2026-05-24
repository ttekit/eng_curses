import * as React from "react";
import { Html, Body, Head, Preview } from "@react-email/components";

export interface TwoFactorAuthTemplateProps {
  token: string;
}

export function TwoFactorAuthTemplate({
  token,
}: TwoFactorAuthTemplateProps): React.ReactElement {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your two-factor authentication code: {token}</Preview>
      <Body
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
                    style={{
                      padding: "0 20px 20px 20px",
                      textAlign: "center",
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "20px",
                        color: "#09090b",
                        fontWeight: 700,
                      }}
                    >
                      Account Login
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        color: "#52525b",
                        lineHeight: "1.6",
                      }}
                    >
                      To continue logging into your account, please enter this
                      one-time security code:
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
                        {token}
                      </span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: "0 20px 30px 20px",
                      textAlign: "center",
                    }}
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
                      Do not share this code with anyone.
                    </p>
                  </td>
                </tr>

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
                      The security of your learning is our priority.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </Body>
    </Html>
  );
}