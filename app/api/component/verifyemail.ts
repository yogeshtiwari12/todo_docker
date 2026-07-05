import { ApiResponse } from "./apiresponse";
import { transporter } from "./nodemailer";


export async function sendVerificationEmail(
  name: string,
  otp: string,
  email: string
): Promise<ApiResponse>{
  try {
    if (!email || !email.includes("@") || !email.includes(".")) {
      console.error("Invalid email format:", email);
      return {
        success: false,
        message: "Invalid email address format",
      };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; color: #1f2937; line-height: 1.6; }
          .wrapper { background-color: #f9fafb; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .header p { font-size: 14px; opacity: 0.95; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
          .message { font-size: 14px; color: #4b5563; line-height: 1.8; margin-bottom: 30px; }
          .otp-box { background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 2px solid #e5e7eb; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0; }
          .otp-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; font-weight: 600; }
          .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace; }
          .timer { text-align: center; font-size: 13px; color: #ef4444; margin-top: 15px; font-weight: 600; }
          .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #92400e; }
          .footer { text-align: center; padding: 25px 30px; background: #f9fafb; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
          .footer a { color: #667eea; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>✉️ Verify Your Email</h1>
              <p>Complete your registration in seconds</p>
            </div>
            <div class="content">
              <p class="greeting">Hi ${name},</p>
              <p class="message">Thank you for joining us! We're excited to have you on board. To complete your registration and secure your account, please verify your email using the code below.</p>
              
              <div class="otp-box">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="timer">⏱️ Expires in 10 minutes</div>
              </div>
              
              <div class="info-box">
                <strong>💡 Tip:</strong> Never share this code with anyone. We'll never ask for it via email or message.
              </div>
              
              <p class="message">If you didn't create this account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>Need help? <a href="mailto:support@yourbrand.com">Contact our support team</a></p>
              <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Kudos. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;


  await transporter.sendMail({
      from: '"kudos" <yt781703@gmail.com>',
      to: email,
      subject: "Your Verification Code",
      html: htmlContent,
      text: `Hello r ${name}, Your verification code is: ${otp}`,
    });


    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error);
    return {
      success: false,
      message: `An error occurred while sending the verification email: ${
        (error as Error).message
      }`,
    };
  }
}
