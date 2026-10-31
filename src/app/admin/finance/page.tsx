import { redirect } from "next/navigation";

export default function AdminFinanceRedirect() {
  redirect("/app/finance");
}
