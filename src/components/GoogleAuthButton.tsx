import { ACCOUNT_PAGE_URL } from "@/lib/config";

export function GoogleAuthButton() {
  return (
    <a
      href={ACCOUNT_PAGE_URL}
      className="px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-white/95 hover:bg-white/10 transition-all"
    >
      Mi cuenta
    </a>
  );
}
