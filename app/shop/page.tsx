import { redirect } from "next/navigation";

/** Alias : la boutique est servie sur `/`. */
export default function ShopIndexRedirect() {
  redirect("/");
}
