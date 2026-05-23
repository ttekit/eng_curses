import * as React from "react";
import { Html, Body, Head, Preview } from "@react-email/components";

export type PasswordChangedTemplateProps = {
  email: string;
};

export function PasswordChangedTemplate({
  email,
}: PasswordChangedTemplateProps): React.ReactElement {
  return (
    <Html lang="en">
      <Head />
      <Preview>The password for your Explys account has been changed</Preview>
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
                      Password Changed!
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        color: "#52525b",
                        lineHeight: "1.6",
                        textAlign: "left",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      This email confirms that the password for your Explys
                      account <strong>{email}</strong> has been successfully
                      changed.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: "10px 20px 30px 20px" }}>
                    <div
                      style={{
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fee2e2",
                        borderRadius: "12px",
                        padding: "16px",
                        textAlign: "left",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#991b1b",
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                      >
                        Important:
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#7f1d1d",
                          lineHeight: "1.5",
                        }}
                      >
                        If you did not change your password, your account may
                        have been compromised. Please contact our support team
                        immediately or use the password recovery feature.
                      </p>
                    </div>
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
