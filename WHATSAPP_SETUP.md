# WhatsApp Integration Setup Guide

This guide helps you set up WhatsApp messaging using @whiskeysockets/baileys library.

## Prerequisites

### 1. Install Dependencies

```bash
npm install @whiskeysockets/baileys @hapi/boom qrcode-terminal pino pino-pretty
```

### 2. Database Schema Update

Make sure your Prisma schema includes `userPhone` field in the `Todo` model:

```prisma
model Todo {
  id            String    @id @default(cuid())
  title         String
  description   String?
  completed     Boolean   @default(false)
  ismessage     Boolean   @default(false)
  onwhatsapp    Boolean   @default(false)
  onemail       Boolean   @default(false)
  scheduleDate  DateTime?
  userPhone     String?   // Add this field to store user's WhatsApp number
  
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
}
```

Run migration:
```bash
npx prisma migrate dev --name add_user_phone_to_todo
```

## API Endpoints

### 1. Get All Todos (with auto WhatsApp sending)
**GET** `/api/todos/get`

Automatically sends WhatsApp messages for todos that:
- Have `onwhatsapp: true`
- Have `scheduleDate` set to today
- Are not completed
- Have `userPhone` stored

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      "onwhatsapp": true,
      "scheduleDate": "2026-06-10T00:00:00Z",
      "userPhone": "+919876543210"
    }
  ],
  "count": 5
}
```

### 2. Send WhatsApp Message (Manual)
**POST** `/api/todos/send-whatsapp`

Request body:
```json
{
  "phone": "+919876543210",
  "message": "Your message here"
}
```

Response:
```json
{
  "success": true,
  "message": "WhatsApp message sent successfully",
  "messageId": "..."
}
```

### 3. Check WhatsApp Connection Status
**GET** `/api/todos/send-whatsapp`

Response:
```json
{
  "success": true,
  "data": {
    "connected": true,
    "user": "Yogesh Tiwari"
  }
}
```

## Usage Flow

### 1. Initialize WhatsApp Connection

The first time you start the server, the WhatsApp connection will initialize:

```
WhatsApp QR Code generated - scan it in WhatsApp Web
```

Scan the QR code with your WhatsApp mobile app.

### 2. Create a Todo with WhatsApp Notification

**POST** `/api/todos/create-todo`

```json
{
  "title": "Important Meeting",
  "description": "Team sync at 2 PM",
  "onwhatsapp": true,
  "scheduleDate": "2026-06-10T14:00:00Z",
  "userPhone": "+919876543210"
}
```

### 3. Auto-send Messages

When the scheduled date arrives (today), the GET endpoint automatically sends:
```
📋 Reminder: Important Meeting
Team sync at 2 PM

Scheduled for today!
```

## File Structure

```
app/api/
├── lib/
│   ├── whatsapp.ts          # WhatsApp service (main logic)
│   ├── prisma.ts
│   └── ...
├── (todos)/
│   ├── create-todo/route.ts # Create todo endpoint
│   ├── get/route.ts         # Get todos + auto send WhatsApp
│   └── send-whatsapp/route.ts # Manual WhatsApp sending
└── ...
```

## Important Notes

### Phone Number Format

Phone numbers should be in international format:
- India: `+919876543210` (country code 91, then number without leading 0)
- US: `+12025551234`
- UK: `+442071838750`

### Authentication

- All endpoints require user session (NextAuth)
- WhatsApp connection is server-side and persistent
- QR code appears in server logs on first connection

### Error Handling

- If WhatsApp is not connected: Returns 503 status with connection error
- If phone number invalid: Message send fails gracefully
- All errors are logged to console for debugging

### Rate Limiting

- Messages have 1 second delay between sends
- Prevents rate limiting from WhatsApp

## Troubleshooting

### QR Code Not Appearing

The QR code appears in terminal/logs only on first run. To reconnect:

```bash
# Delete the auth folder and restart server
rm -r .auth
npm run dev
```

### Message Not Sending

1. Check if WhatsApp is connected: `GET /api/todos/send-whatsapp`
2. Verify phone number format
3. Ensure user is logged in to WhatsApp Web
4. Check server logs for errors

### WhatsApp Account Issues

- Use an account that hasn't been recently flagged
- Don't use on multiple devices simultaneously
- Keep the app open on phone while sending

## Environment Variables (Optional)

Create a `.env.local` file if needed:

```env
# WhatsApp Configuration
WHATSAPP_AUTO_RECONNECT=true
WHATSAPP_PRINT_QR=true
WHATSAPP_SYNC_HISTORY=false
```

## Security Considerations

⚠️ **Important:**
- Don't expose auth credentials in logs
- Keep `.auth` folder private (add to .gitignore)
- Never commit credentials to git
- Use environment-specific configurations

Add to `.gitignore`:
```
.auth/
.whatsapp-credentials/
*.qrcode
```

## Testing

### Test Message Sending

```bash
curl -X POST http://localhost:3000/api/todos/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "message": "Test message from API"
  }'
```

### Check Connection Status

```bash
curl http://localhost:3000/api/todos/send-whatsapp
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Update Prisma schema
3. ✅ Run migrations
4. ✅ Start server and scan QR code
5. ✅ Create todos with `onwhatsapp: true`
6. ✅ Test message sending

## Support

For issues with @whiskeysockets/baileys:
- GitHub: https://github.com/WhiskeySockets/Baileys
- Documentation: Check GitHub README for advanced options
