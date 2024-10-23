import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
    const numericId = Number(id);
    if (isNaN(numericId))
        return Response.json(
            { error: "Invalid ID format" },
            { status: 400 }
        );

    try {
        const sql = neon(`${process.env.NEON_DATABASE_URL}`);

        const response = await sql`SELECT * FROM drivers WHERE id = ${numericId}`;

        return Response.json({ data: response }, { status: 200 });
    } catch (error) {
        return Response.json(
            {
                error: "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}
