import { Suspense } from "react";
import Link from "next/link";
import ConsultFlow from "@/components/ConsultFlow";

export default function ConsultPage() {
  return (
    <main>
      <div className="flex items-center gap-3 bg-[#F8CB46] px-4 py-4">
        <Link href="/" className="text-lg text-gray-900">
          ←
        </Link>
        <span className="text-sm font-bold text-gray-900">Ritual consult</span>
      </div>
      <Suspense fallback={<div className="px-4 pt-6 text-sm text-gray-500">Loading…</div>}>
        <ConsultFlow />
      </Suspense>
    </main>
  );
}
