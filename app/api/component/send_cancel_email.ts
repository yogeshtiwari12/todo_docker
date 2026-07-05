import { ApiResponse } from "./apiresponse";
import { transporter } from "./nodemailer";

interface TodoEditDetails {
  id: string;
  title: string;
  iscompleted?: boolean;
  scheduleDate?: Date | null;
  userEmail: string;
}

export async function sendTodoEditedEmail(
  details: TodoEditDetails
): Promise<ApiResponse> {
  try {
    if (!details.userEmail || !details.userEmail.includes("@")) {
      return { success: false, message: "Invalid email address" };
    }

    const isDone = details.iscompleted;
    const headerBg = isDone ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
    const headerTitle = isDone ? "✅ Task Completed!" : "✏️ Task Updated";
    const headerSubtitle = isDone ? "Great job finishing your task!" : "Changes have been saved to your task";
    const cardBorder = isDone ? "4px solid #10b981" : "4px solid #f59e0b";
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Updated</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; color: #1f2937; }
          .wrapper { background-color: #f9fafb; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
          .header { background: ${headerBg}; padding: 40px 30px; text-align: center; color: white; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
          .header p { font-size: 15px; opacity: 0.95; }
          .content { padding: 40px 30px; text-align: center; }
          .greeting { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 20px; text-align: center; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; border-left: ${cardBorder}; text-align: left; }
          .details-table tr { border-bottom: 1px solid #e5e7eb; }
          .details-table tr:last-child { border-bottom: none; }
          .details-table td { padding: 14px 16px; font-size: 15px; color: #374151; }
          .details-table .label { width: 30%; background: #f9fafb; font-weight: 600; color: #6b7280; border-right: 1px solid #e5e7eb; text-align: right; }
          .badge { display: inline-block; background: ${isDone ? '#d1fae5' : '#fef3c7'}; color: ${isDone ? '#065f46' : '#92400e'}; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
          .actions { margin-top: 30px; text-align: center; }
          .btn { display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; margin: 0 10px; transition: background 0.3s; }
          .btn-primary { background-color: ${isDone ? '#10b981' : '#f59e0b'}; color: #ffffff !important; }
          .btn-secondary { background-color: #ffffff; color: ${isDone ? '#10b981' : '#f59e0b'} !important; border: 1px solid ${isDone ? '#10b981' : '#f59e0b'}; }
          .footer { text-align: center; padding: 25px 30px; background: #f9fafb; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>${headerTitle}</h1>
              <p>${headerSubtitle}</p>
            </div>
            <div class="content">
              <p class="greeting">Hello!</p>
              <p style="margin-bottom: 20px; color: #4b5563; line-height: 1.6;">We are writing to let you know that one of your tasks was recently updated.</p>
              
              <table class="details-table" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="label">Task ID</td>
                  <td>${details.id}</td>
                </tr>
                <tr>
                  <td class="label">Title</td>
                  <td><strong><del style="${isDone ? '' : 'display:none;'}">${details.title}</del><span style="${!isDone ? '' : 'display:none;'}">${details.title}</span></strong></td>
                </tr>
                <tr>
                  <td class="label">Status</td>
                  <td><span class="badge">${isDone ? 'Completed' : 'Updated'}</span></td>
                </tr>
                ${details.scheduleDate ? `
                <tr>
                  <td class="label">Due Date</td>
                  <td>${new Date(details.scheduleDate).toLocaleDateString()} ${new Date(details.scheduleDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                </tr>` : ''}
              </table>
              
              <div class="actions">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/edit/${details.id}" class="btn btn-primary">Update Status</a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/edit/${details.id}" class="btn btn-secondary">Change Date</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">Log in to the app to see all your updates!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Todo App. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `Task Updated: ${details.title}\nStatus: ${isDone ? 'Completed' : 'Updated'}`;

    await transporter.sendMail({
      from: '"Todo App" <yt781703@gmail.com>',
      to: details.userEmail,
      subject: `${isDone ? '✅ Completed' : '✏️ Updated'}: ${details.title}`,
      html: htmlContent,
      text: textContent,
    });

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, message: "Failed to send email" };
  }
}
