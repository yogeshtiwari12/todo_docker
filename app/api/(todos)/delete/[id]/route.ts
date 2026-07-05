import { authOptions } from "@/app/api/(auth)/auth/[...nextauth]/options";
import { prisma } from "@/app/api/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(request: Request,ctx:any) {
    try {
        const {id} = await ctx.params       

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

        await prisma.todo.delete({ where: { id } });

        return NextResponse.json(
            { 
                success: true, 
                message: "Todo deleted successfully"
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting todo:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete todo" },
            { status: 500 }
        );
    }
}
