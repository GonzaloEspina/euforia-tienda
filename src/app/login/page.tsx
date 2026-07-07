import { redirect } from "next/navigation";
import { ACCOUNT_PAGE_URL } from "@/lib/config";

export default function LoginPage() {
  redirect(ACCOUNT_PAGE_URL);
}
