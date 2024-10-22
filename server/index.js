const express = require('express');
const stripe = require('stripe')('sk_test_51QCeCgGrm7Jys6wXF8WksqljkXnUma0L0ZZqqtS90mDTOvNVJItJvcjNtXo55A4IgZly9Gsaa0uNpjHTL0jU2yfe00mOuajI7S');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Middleware to log request details
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.post('/create-payment-intent', async (req, res) => {
  console.log('Received request to create payment intent');
  try {
    const { amount } = req.body;
    console.log('Received amount:', amount);

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Ensure amount is a number and convert to cents
    const amountInCents = Math.round(parseFloat(amount) * 100);
    console.log('Amount in cents:', amountInCents);

    if (isNaN(amountInCents) || amountInCents < 50) {
      return res.status(400).json({ error: 'Invalid amount. Minimum amount is 50 cents.' });
    }

    console.log('Creating PaymentIntent for amount:', amountInCents);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
    });

    console.log('PaymentIntent created successfully:', paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error in /create-payment-intent:', err);
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred', details: err.message });
});

const PORT = process.env.PORT || 5175;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));