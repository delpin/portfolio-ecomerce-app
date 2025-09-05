import { getCart } from "@/lib/actions/cart";
import { getCurrentUser } from "@/lib/auth/actions";
import CartClient from "./pageClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [cart, user] = await Promise.all([getCart(), getCurrentUser()]);
  return <CartClient initialCart={cart} isAuthenticated={Boolean(user)} />;
}
