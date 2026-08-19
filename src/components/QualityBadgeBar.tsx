import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";

export default function QualityBadgeBar() {
  return (
    <Link
      href="/calidad"
      className="block bg-brown-dark/5 hover:bg-brown-dark/10 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm">
        <ShieldCheck className="w-4 h-4 text-brown-dark shrink-0" />
        <span className="text-brown-dark/80">
          Productos con certificación <strong className="text-brown-dark">SGS y FDA</strong>
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-brown-dark/50 shrink-0" />
      </div>
    </Link>
  );
}
