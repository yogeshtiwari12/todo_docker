import bcrypt from "bcryptjs";

import { prisma } from "../../lib/prisma";
import { sendVerificationEmail } from "../../component/verifyemail";

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone}],
      },
    });

    const verifycode = Math.floor(100000 + Math.random() * 900000).toString();
    const haspass = await bcrypt.hash(password, 10);

    if (existingUser && existingUser.isverifyed) {
      return Response.json(
        { success: false, message: "User already Exists With this email" },
        { status: 400 }
      );
    }

    if (existingUser && !existingUser.isverifyed) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: haspass,
          otp: verifycode,
          verifyCodeExpiry: new Date(Date.now() + 3600000),
        },
      });
    }

    if (!existingUser) {
      await prisma.user.create({
        data: {
          name,
          email,
          otp: verifycode,
          password: haspass,
          verifyCodeExpiry: new Date(Date.now() + 3600000),
          phone,
        },
      });
    }

    await sendVerificationEmail(name, verifycode, email);

    return Response.json(
      {
        message: "User created successfully. Check your email for verification.",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Internal Server Error",error: error  },
      { status: 500 }
    );
  }
}

