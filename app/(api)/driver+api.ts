import { neon } from "@neondatabase/serverless";

export async function GET() {
    try {
        const sql = neon(`${process.env.NEON_DATABASE_URL}`);

        const response = await sql`SELECT * FROM drivers`;

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
