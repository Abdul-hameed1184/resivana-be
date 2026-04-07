// templates/otp.template.ts

export const otpTemplate = ({
    name,
    otp,
    type,
    expiryMinutes,
}: {
    name: string;
    otp: string;
    type: "VERIFY_EMAIL" | "PASSWORD_RESET";
    expiryMinutes: number;
}) => {
    const title =
        type === "VERIFY_EMAIL"
            ? "Verify Your Email"
            : "Reset Your Password";

    const message =
        type === "VERIFY_EMAIL"
            ? "Use the OTP below to verify your email address."
            : "Use the OTP below to reset your password.";

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>${title}</h2>

      <p>Hello ${name},</p>

      <p>${message}</p>

      <div style="
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 4px;
        background: #f4f4f4;
        padding: 12px;
        text-align: center;
        margin: 20px 0;
      ">
        ${otp}
      </div>

      <p>This OTP will expire in ${expiryMinutes} minutes.</p>

      <p>If you did not request this, please ignore this email.</p>

      <hr />

      <p style="font-size: 12px; color: gray;">
        © Resivana. All rights reserved.
      </p>
    </div>
  `;
};