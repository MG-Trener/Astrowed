"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Static hosting has no HTTP redirect handler. Keep old bookmarks usable.
export function LibraryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/knowledge");
  }, [router]);
  return (
    <div className="page-wrap">
      <h1>Библиотека знаний</h1>
      <p>Все материалы собраны в библиотеке со статьями.</p>
      <Link className="button" href="/knowledge">
        Открыть библиотеку →
      </Link>
    </div>
  );
}
