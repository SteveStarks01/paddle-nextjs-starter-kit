import { redirect } from 'next/navigation';

export default async function CheckoutPage() {
  // Redirect to signup since we're using mobile money instead of Paddle
  redirect('/signup');
}