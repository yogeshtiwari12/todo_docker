import { getServerSession } from "next-auth";
import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "../../(auth)/auth/[...nextauth]/options";
import { sendTodoCreatedEmail } from "../../component/delivery_details";

export async function PUT(request: Request) {
    console.log("================ CREATE TODO API CALLED ================");
    try {
        const body = await request.json();
        console.log("Incoming request body:", body);
        const {
            title,
            description,
            completed,
            iscompleted,
            ismessage,
            scheduleDate,
            onemail,
            onwhatsapp
        } = body;

        if (!title || title.trim() === "") {
            return NextResponse.json(
                { success: false, error: "Title is required" },
                { status: 400 }
            );
        }

        // const session = await getServerSession(authOptions);

        // if (!session?.user?.id) {
        //     return NextResponse.json(
        //         { success: false, error: "Unauthorized - Please login first" },
        //         { status: 401 }
        //     );
        // }

        const duplicate = await prisma.todo.findFirst({
            where: {
                title: {
                    equals: title.trim(),
                    mode: 'insensitive'
                },
                // userId: "7f760048-bae0-445a-8d5a-7c2a0a020ba3" 
            }
        });

        if (duplicate) {
            return NextResponse.json(
                { success: false, error: "A todo with this title already exists" },
                { status: 409 }
            );
        }

        const newTodo = 
        await prisma.todo.create({
                data: {
                    title: title.trim(),
                    description: description?.trim() || "",
                    iscompleted: iscompleted ?? completed ?? false,
                    ismessage: ismessage ?? false,
                    scheduleDate: scheduleDate ? new Date(scheduleDate) : "",
                    onemail: true,
                    userId: "7f760048-bae0-445a-8d5a-7c2a0a020ba3"
                }
            });

        // Send Email Notification
        // const shouldSendEmail = newTodo.onemail || true; // Force true for testing if frontend doesn't send it
        // console.log("Checking email conditions. shouldSendEmail:", shouldSendEmail, "userId:", newTodo.userId);

            try {
                const user = await prisma.user.findUnique({
                    where: { id: newTodo.userId! },
                    select: { email: true }
                });

                // Get recipient email strictly from DB
                const recipientEmail = user?.email;
                console.log("Recipient email resolved to:", recipientEmail);

                if (recipientEmail) {
                     await sendTodoCreatedEmail({
                        id: newTodo.id,
                        title: newTodo.title,
                        description: newTodo.description || "",
                        scheduleDate: newTodo.scheduleDate,
                        userEmail: recipientEmail
                    });

                    //   console.log(`Email sent to ${recipientEmail}, result:`, emailResult);
                } else {
                    console.log("Could not resolve an email address to send to.");
                }
            } catch (error) {
                console.error("Failed during email process:", error);
            }
        

        
        return NextResponse.json(
            {
                success: true,
                message: "Todo created successfully",
                data: newTodo
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating todo:", error);

        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { success: false, error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: "Failed to create todo" },
            { status: 500 }
        );
    }
}

