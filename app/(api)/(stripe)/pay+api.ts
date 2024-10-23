import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { payment_method_id, payment_intent_id, customer_id } = body;

        if (!payment_method_id || !payment_intent_id || !customer_id) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const payment_method = await stripe.paymentMethods.attach(
            payment_method_id,
            {
                customer: customer_id,
            }
        );

        const result = await stripe.paymentIntents.confirm(payment_intent_id, {
            payment_method: payment_method.id,
        });

        return Response.json(
            { success: true, message: "Payment successful", result: result },
            { status: 200 }
        );
    } catch (error) {
        return Response.json({ error: error }, { status: 500 });
    }
}
