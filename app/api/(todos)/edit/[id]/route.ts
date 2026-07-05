import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/api/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { sendTodoEditedEmail } from "@/app/api/component/send_cancel_email";

export async function PATCH(request: Request, ctx: any) {

    try {
        const { id } = await ctx.params
        const body = await request.json();
        const { title, description, iscompleted, ismessage, scheduleDate, onwhatsapp, onemail } = body;

        if (!id) {
            return NextResponse.json(

                { success: false, error: "Todo ID is required" },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify ownership
        const todo = await prisma.todo.findUnique({ where: { id } });
        if (!todo || todo.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: "Todo not found or unauthorized" },
                { status: 404 }
            );
        }

        const updatedTodo = await prisma.todo.update({
            where: { id },
            data: {
                ...(title && { title: title.trim() }),
                ...(description !== undefined && { description: description?.trim() || "" }),
                ...(iscompleted !== undefined && { iscompleted }),
                ...(ismessage !== undefined && { ismessage }),
                ...(scheduleDate !== undefined && { scheduleDate: scheduleDate ? new Date(scheduleDate) : null }),
                ...(onemail !== undefined && { onemail })
            }
        });

        // Send Email Notification asynchronously
        if (updatedTodo.onemail && updatedTodo.userId) {
            prisma.user.findUnique({
                where: { id: updatedTodo.userId },
                select: { email: true }
            }).then(user => {
                if (user?.email) {
                    sendTodoEditedEmail({
                        id: updatedTodo.id,
                        title: updatedTodo.title,
                        iscompleted: updatedTodo.iscompleted ?? false,
                        scheduleDate: updatedTodo.scheduleDate,
                        userEmail: user.email
                    }).catch(console.error);
                }
            }).catch(console.error);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Todo updated successfully",
                data: updatedTodo
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating todo:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update todo" },
            { status: 500 }
        );
    }
}
