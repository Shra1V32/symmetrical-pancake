import { neon } from "@neondatabase/serverless";
// import telegram api environment
process.env.TELEGRAM_API = "https://api.telegram.org/bot" + process.env.TELEGRAM_BOT_TOKEN;

export async function GET(request: Request, { id }: { id: string }) {
    if (!id)
        return Response.json(
            { error: "Missing required fields" },
            { status: 400 }
        );

    try {
        const sql = neon(`${process.env.NEON_DATABASE_URL}`);
        const response = await sql`
        SELECT
            packages.ride_id,
            packages.origin_address,
            packages.destination_address,
            packages.origin_latitude,
            packages.origin_longitude,
            packages.destination_latitude,
            packages.destination_longitude,
            packages.ride_time,
            packages.fare_price,
            packages.package_status,
            packages.created_at,
            'driver', json_build_object(
                'driver_id', drivers.id,
                'first_name', drivers.first_name,
                'last_name', drivers.last_name,
                'profile_image_url', drivers.profile_image_url,
                'vehicle_image_url', drivers.vehicle_image_url,
                'vehicle_size', drivers.vehicle_size,
                'rating', drivers.rating,
                'telegram_id', drivers.telegram_id
            ) AS driver 
        FROM 
            packages
        INNER JOIN
            drivers ON packages.driver_id = drivers.id
        WHERE 
            packages.user_id = ${id}
        ORDER BY 
            packages.created_at DESC;
        `;

        return Response.json({ data: response });
    } catch (error) {
        console.info("Error fetching recent packages:", error);
        return Response.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// Function to send a message the drivers channel
// the message should contain the ride details
// so that it becomes easier for the drivers to accept the ride
function sendMessageToDriversChannel(ride: any) {
    const message = `🚖 **New Ride Request** 🚖\n\n` +
                    `**From:** ${ride.origin_address}\n` +
                    `**To:** ${ride.destination_address}\n` +
                    `**Time:** ${new Date(ride.ride_time).toLocaleString()}\n\n` +
                    `Please respond promptly!`;

    fetch(`${process.env.TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            chat_id: 658048451,
            text: message,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "✅ Accept",
                            callback_data: `accept_ride_${ride.ride_id}`,
                        },
                        {
                            text: "❌ Decline",
                            callback_data: `decline_ride_${ride.ride_id}`,
                        },
                    ],
                ],
            },
        }),
    });
}