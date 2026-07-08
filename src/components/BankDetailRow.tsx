"use client";

import { CopyToClipboardButton } from "@/components/CopyToClipboardButton";

type BankFieldProps = {
  label: string;
  value: string;
  copyable?: boolean;
  href?: string;
};

export function BankDetailRow({ label, value, copyable, href }: BankFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4">
      <dt className="text-sm font-semibold text-euforia-sky-dark uppercase tracking-wide">
        {label}
      </dt>
      <dd className="flex items-center gap-3 min-w-0">
        {href ? (
          <a
            href={href}
            className="text-base font-mono font-semibold text-travel-ink break-all hover:text-euforia-sky-dark hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-base font-mono font-semibold text-travel-ink break-all">
            {value}
          </span>
        )}
        {copyable ? <CopyToClipboardButton value={value} /> : null}
      </dd>
    </div>
  );
}
