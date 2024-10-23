import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, id : string) {
    console.log("Fetching driver location with ID: " + id);
    if (!id) {
        console.log("Missing required fields");
        return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
    // log the id with json stringify
    console.log(JSON.stringify(id));

    try {
        const sql = neon(`${process.env.NEON_DATABASE_URL}`);
        const response = await sql`
        SELECT latitude, longitude, updated_at FROM driver_locations WHERE driver_id = ${id.ride_id} ORDER BY updated_at DESC LIMIT 1;
        `;

        console.log("Driver location response: " + JSON.stringify(response));

        if (response.length === 0) {
            return new Response(
                JSON.stringify({ error: "Driver location not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ data: response[0] }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error fetching driver location:", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}