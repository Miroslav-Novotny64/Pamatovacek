import { sendDailyTaskNotifications } from "@/server/api/routers/push";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
const authHeader = request.headers.get('authorization');
const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

if (authHeader !== expectedAuth) {
console.error('Unauthorized cron attempt');
return new Response('Unauthorized', { status: 401 });
}

try {
console.log('Starting daily notification send...');
const result = await sendDailyTaskNotifications();
console.log('Notifications sent successfully:', result);
return NextResponse.json(result);
} catch (error) {
console.error('Error sending daily notifications:', error);
return NextResponse.json({ error: 'Failed', details: String(error) }, { status: 500 });
}
}

export async function POST(request: Request) {
if (process.env.NODE_ENV !== 'development') {
return new Response('Not allowed', { status: 403 });
}
try {
const result = await sendDailyTaskNotifications();
return NextResponse.json(result);
} catch (error) {
return NextResponse.json({ error: String(error) }, { status: 500 });
}
}
