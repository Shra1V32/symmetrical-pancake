# Telethon code to get the live location of a user
# and update the location in the database

import os

import asyncpg
import dotenv
import telethon
from geopy.distance import geodesic
from telethon import events
from telethon.tl.custom import Message
from telethon.tl.types import (
    GeoPoint,
    InputMediaGeoPoint,
    MessageMediaGeo,
    MessageMediaGeoLive,
    MessageMediaVenue,
)

dotenv.load_dotenv("../.env")

DATABASE_URL = os.getenv("NEON_DATABASE_URL")

client = telethon.TelegramClient(
    "locationUpdateAgent", os.environ["TG_API_ID"], os.environ["TG_API_HASH"]
).start(bot_token=os.environ["TG_BOT_TOKEN"])
client.start()


async def update_location_in_db(user_id, latitude, longitude):
    conn = await asyncpg.connect(DATABASE_URL)

    # Find driver user id in the database using telegram user id
    driver_id = await conn.fetchval(
        """
        SELECT id
        FROM drivers
        WHERE telegram_id = $1
    """,
        user_id,
    )

    try:
        await conn.execute(
            """
            INSERT INTO driver_locations (driver_id, latitude, longitude)
            VALUES ($1, $2, $3)
            ON CONFLICT (driver_id) DO UPDATE
            SET latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                updated_at = CURRENT_TIMESTAMP
        """,
            driver_id,
            latitude,
            longitude,
        )

        try:
            # Fetch the package's origin latitude and longitude
            origin_latitude, origin_longitude = await conn.fetchrow(
                """
                SELECT origin_latitude, origin_longitude
                FROM packages
                WHERE driver_id = $1
                AND package_status = 'in_transit'
            """,
                driver_id,
            )
        except TypeError:
            # If the driver is not assigned to any package, return
            return

        # Calculate the distance between the driver's current location and the package's origin location
        origin_location = (origin_latitude, origin_longitude)
        current_location = (latitude, longitude)
        distance = geodesic(current_location, origin_location).meters

        # Check if the driver is within 100 meters of the package's origin location
        if distance <= 100:
            # Update the package status to 'package_pickup'
            await conn.execute(
                """
                UPDATE packages
                SET package_status = 'package_pickup'
                WHERE driver_id = $1
                AND package_status = 'in_transit'
            """,
                driver_id,
            )
    finally:
        await conn.close()


@client.on(events.NewMessage)
async def locationUpdateAgent(event: Message):
    user_id = event.sender_id
    if event.media is not None:
        if isinstance(event.media, MessageMediaGeo):
            location = event.media.geo
        elif isinstance(event.media, MessageMediaGeoLive):
            location = event.media.geo
        elif isinstance(event.media, MessageMediaVenue):
            location = event.media.geo
        else:
            print("Location not found")
            return

        latitude = location.lat
        longitude = location.long
        print("Latitude: ", latitude)
        print("Longitude: ", longitude)
        await update_location_in_db(user_id, latitude, longitude)
    else:
        print("Location not found")


@client.on(events.MessageEdited)
async def locationUpdateAgent(event: Message):
    user_id = event.sender_id
    if event.media is not None:
        if isinstance(event.media, MessageMediaGeo):
            location = event.media.geo
        elif isinstance(event.media, MessageMediaGeoLive):
            location = event.media.geo
        elif isinstance(event.media, MessageMediaVenue):
            location = event.media.geo
        else:
            print("Location not found")
            return

        latitude = location.lat
        longitude = location.long
        print("Latitude: ", latitude)
        print("Longitude: ", longitude)
        await update_location_in_db(user_id, latitude, longitude)
    else:
        print("Location not found")


@client.on(events.CallbackQuery)
async def handle_button(event):
    user_id = event.sender_id
    data = event.data.decode("utf-8")

    if "accept_ride" in data:
        ride_id = int(data.split("_")[-1])
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.execute(
            """
            WITH driver AS (
            SELECT id
            FROM drivers
            WHERE telegram_id = $1
            )
            UPDATE packages
            SET package_status = 'in_transit'
            WHERE driver_id = $2
        """,
            user_id,
            str(ride_id),
        )
        await conn.close()
        await event.answer("Ride accepted")

        # Send the origin and destination location to the driver
        conn = await asyncpg.connect(DATABASE_URL)
        row = await conn.fetchrow(
            """
            SELECT origin_latitude, origin_longitude, destination_latitude, destination_longitude
                FROM packages
                WHERE driver_id = (SELECT id FROM drivers WHERE telegram_id = $1);
        """,
            user_id,
        )

        (
            origin_latitude,
            origin_longitude,
            destination_latitude,
            destination_longitude,
        ) = row

        # Parse the location in GMaps format
        origin_location = f"{origin_latitude},{origin_longitude}"
        destination_location = f"{destination_latitude},{destination_longitude}"

        gmaps_url = f"https://www.google.com/maps/dir/?api=1&origin={origin_location}&destination={destination_location}"
        await client.send_message(
            user_id,
            f"Click [here]({gmaps_url}) to navigate to the package's origin location",
        )

    # Handle button click event here


client.run_until_disconnected()
