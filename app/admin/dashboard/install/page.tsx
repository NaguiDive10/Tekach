import Link from "next/link";
import { SdkInstallSection } from "@/components/tekach/SdkInstallSection";

export default function AdminDashboardInstallPage() {
  return (
    <div className="space-y-8">
      <p className="text-sm text-stone-600">
        Intégration réservée aux équipes techniques et marchands. Vue grand
        public :{" "}
        <Link href="/tekach-ia" className="text-[#c45500] underline">
          Tekach IA
        </Link>
        .
      </p>
      <SdkInstallSection />
    </div>
  );
}
