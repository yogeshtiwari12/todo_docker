import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../(auth)/auth/[...nextauth]/options";
import { prisma } from "../lib/prisma";


export async function GET(request: Request) {
    try {

        const userId = "7f760048-bae0-445a-8d5a-7c2a0a020ba3"

        // Fetch all todos
        const todos = await prisma.todo.findMany({
            where: { userId: userId },
            // orderBy: { createdAt: "desc" }
        });



        return NextResponse.json(
            {
                success: true,
                data: todos,
                count: todos.length
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching todos:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch todos" },
            { status: 500 }
        );
    }
}
