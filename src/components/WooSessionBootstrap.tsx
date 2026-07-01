"use client";

import { useEffect } from "react";
import { primeWooSession } from "@/lib/woo-session";

export function WooSessionBootstrap() {
  useEffect(() => {
    primeWooSession();
  }, []);

  return null;
}
