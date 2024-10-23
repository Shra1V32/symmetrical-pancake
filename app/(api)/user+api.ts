import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.NEON_DATABASE_URL!;

export async function POST(req: Request) {
    try {
        const sql = neon(databaseUrl);

        const { name, email, clerkId } = await req.json();

        if (!name || !email || !clerkId) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const result = await sql`
        INSERT INTO users (name, email, clerk_id) 
        VALUES (${name}, ${email}, ${clerkId})
    `;

        return Response.json({ data: result }, { status: 201 });
    } catch (error) {
        console.log("Error creating user: ", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
