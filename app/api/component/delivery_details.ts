import { ApiResponse } from "./apiresponse";
import { transporter } from "./nodemailer";

interface TodoDetails {
  id: string;
  title: string;
  description: string;
  scheduleDate?: Date | null;
  userEmail: string;
}

export async function sendTodoCreatedEmail(
  details: TodoDetails
): Promise<ApiResponse> {
  try {
    if (!details.userEmail || !details.userEmail.includes("@")) {
      return { success: false, message: "Invalid email address" };
    }

    const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Created</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f1f5f9; color: #1e293b; }
      .wrapper { padding: 40px 20px; background: #f1f5f9; }
      .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
      .header { background: #0f172a; padding: 36px 32px 28px; text-align: center; }
      .icon-wrap { width: 56px; height: 56px; background: #6366f1; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
      .icon-wrap svg { width: 26px; height: 26px; }
      .header h1 { color: #ffffff; font-size: 20px; font-weight: 500; margin-bottom: 6px; }
      .header p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
      .body { padding: 28px 32px 0; }
      .intro { font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.6; }
      .table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; table-layout: fixed; }
      .table tr { border-bottom: 1px solid #e2e8f0; }
      .table tr:last-child { border-bottom: none; }
      .label-cell { width: 110px; background: #f8fafc; padding: 12px; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; border-right: 1px solid #e2e8f0; vertical-align: middle; }
      .value-cell { padding: 12px 14px; font-size: 13px; color: #475569; word-break: break-word; vertical-align: middle; }
      .value-cell.title { font-size: 14px; font-weight: 500; color: #0f172a; }
      .value-cell.mono { font-family: 'Courier New', monospace; font-size: 11px; color: #94a3b8; }
      .badge { display: inline-flex; align-items: center; gap: 5px; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 999px; }
      .dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; flex-shrink: 0; }
      .actions { padding: 24px 32px; display: flex; flex-direction: column; gap: 10px; }
      .btn { display: block; width: 100%; text-align: center; padding: 13px 0; font-size: 14px; font-weight: 500; border-radius: 8px; text-decoration: none; line-height: 1; }
      .btn-primary { background: #6366f1; color: #ffffff !important; }
      .btn-outline { background: #ffffff; color: #0f172a !important; border: 1px solid #e2e8f0; }
      .footer { border-top: 1px solid #e2e8f0; padding: 18px 32px; display: flex; justify-content: space-between; align-items: center; }
      .footer span { font-size: 12px; color: #94a3b8; }

      @media (max-width: 480px) {
        .wrapper { padding: 20px 12px; }
        .header { padding: 28px 20px 22px; }
        .body { padding: 20px 16px 0; }
        .label-cell { width: 80px; padding: 10px 8px; font-size: 10px; }
        .value-cell { padding: 10px; font-size: 12px; }
        .value-cell.title { font-size: 13px; }
        .actions { padding: 16px; gap: 8px; }
        .footer { padding: 14px 16px; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="header">
          <div class="icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1>Task saved</h1>
          <p>Your new task has been added to your list</p>
        </div>

        <div class="body">
          <p class="intro">Hello — here's a summary of what was just created.</p>
          <table class="table">
            <tr>
              <td class="label-cell">ID</td>
              <td class="value-cell mono">${details.id}</td>
            </tr>
            <tr>
              <td class="label-cell">Title</td>
              <td class="value-cell title">${details.title}</td>
            </tr>
            ${details.description ? `
            <tr>
              <td class="label-cell">Notes</td>
              <td class="value-cell">${details.description}</td>
            </tr>` : ''}
            ${details.scheduleDate ? `
            <tr>
              <td class="label-cell">Due</td>
              <td class="value-cell">${new Date(details.scheduleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &nbsp;·&nbsp; ${new Date(details.scheduleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            </tr>` : ''}
            <tr>
              <td class="label-cell">Status</td>
              <td class="value-cell">
                <span class="badge">
                  <span class="dot"></span>Pending
                </span>
              </td>
            </tr>
          </table>
        </div>

        <div class="actions">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/edit/${details.id}" class="btn btn-primary">Update status</a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/edit/${details.id}" class="btn btn-outline">Change date</a>
        </div>

        <div class="footer">
          <span>Todo App &nbsp;·&nbsp; © ${new Date().getFullYear()}</span>
          <span>Manage preferences</span>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

    const textContent = `New Task Created: ${details.title}\n${details.description ? `Description: ${details.description}\n` : ''}${details.scheduleDate ? `Due: ${new Date(details.scheduleDate).toLocaleDateString()}` : ''}`;

    await transporter.sendMail({
      from: '"Todo App" <yt781703@gmail.com>',
      to: details.userEmail,
      subject: `✨ New Task: ${details.title}`,
      html: htmlContent,
      text: textContent,
    });
    console.log("email sent", details)

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, message: "Failed to send email" };
  }
}
