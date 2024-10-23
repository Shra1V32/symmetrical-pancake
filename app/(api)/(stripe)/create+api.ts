import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    const body = await req.json();
    const { name, email, amount } = body;

    if (!name || !email || !amount) {
        return Response.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    let customer;

    const doesCustomerExist = await stripe.customers.list({ email });

    if (doesCustomerExist.data.length === 0) {
        customer = await stripe.customers.create({
            name,
            email,
        });
    } else customer = doesCustomerExist.data[0];

    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2020-08-27" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(amount) * 100,
        currency: "usd",
        customer: customer.id,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
        },
    });

    return Response.json(
        {
            paymentIntent: paymentIntent,
            ephemeralKey: ephemeralKey,
            customer: customer.id,
        },
        { status: 201 }
    );
}
