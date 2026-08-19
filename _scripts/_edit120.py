path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

# 1. Imports
old_imports = '''import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X, DollarSign, FileCheck, Save } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import ConfirmModal from "@/components/ConfirmModal";
import ToggleSwitch from "@/components/ToggleSwitch";'''

new_imports = '''import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X, DollarSign, FileCheck, Save, Check } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import ConfirmModal from "@/components/ConfirmModal";
import ToggleSwitch from "@/components/ToggleSwitch";
import SocialLinkModal from "@/components/SocialLinkModal";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M16.5 3c.4 2.2 1.8 3.6 4 3.9v2.6c-1.4.1-2.7-.3-4-1.1v6.4c0 3.2-2.6 5.7-5.8 5.7S5 18 5 14.8s2.6-5.7 5.8-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V3h2.7Z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.1c0-.8.2-1.3 1.4-1.3h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2h-2.5v2.8h2.5V21h3Z" />
    </svg>
  ),
};'''

assert content.count(old_imports) == 1
content = content.replace(old_imports, new_imports)

# 2. Replace the 3 separate SectionCards with one grid card
old_cards = '''        <SectionCard icon={AtSign} title="Instagram">
          <input
            value={form.instagramUrl}
            onChange={(e) => setForm((f) => f && { ...f, instagramUrl: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
          />
        </SectionCard>

        <SectionCard icon={AtSign} title="Facebook">
          <input
            value={form.facebookUrl}
            onChange={(e) => setForm((f) => f && { ...f, facebookUrl: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
          />
        </SectionCard>

        <SectionCard icon={AtSign} title="TikTok">
          <input
            value={form.tiktokUrl}
            onChange={(e) => setForm((f) => f && { ...f, tiktokUrl: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
          />
        </SectionCard>'''

new_cards = '''        <SocialGrid form={form} setForm={setForm} />'''

assert content.count(old_cards) == 1
content = content.replace(old_cards, new_cards)

# 3. Add SocialGrid component before ConfiguracionPage
old_before_export = '''export default function ConfiguracionPage() {'''

new_before_export = '''function SocialGrid({
  form,
  setForm,
}: {
  form: SettingsData;
  setForm: React.Dispatch<React.SetStateAction<SettingsData | null>>;
}) {
  const [openPlatform, setOpenPlatform] = useState<null | "Instagram" | "Facebook" | "TikTok">(null);

  const platforms: { name: "Instagram" | "Facebook" | "TikTok"; field: keyof SettingsData }[] = [
    { name: "Instagram", field: "instagramUrl" },
    { name: "Facebook", field: "facebookUrl" },
    { name: "TikTok", field: "tiktokUrl" },
  ];

  function handleSave(field: keyof SettingsData, value: string) {
    setForm((f) => f && { ...f, [field]: value });
    setOpenPlatform(null);
  }

  return (
    <SectionCard icon={AtSign} title="Redes sociales">
      <div className="grid grid-cols-3 gap-3">
        {platforms.map((p) => {
          const hasValue = !!(form[p.field] as string)?.trim();
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setOpenPlatform(p.name)}
              className="relative flex flex-col items-center gap-1.5 border border-brown/15 hover:border-brown/30 rounded-xl py-3 transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-brown-dark">
                {SOCIAL_ICONS[p.name]}
              </span>
              <span className="text-xs text-ink/70">{p.name}</span>
              <span
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center ${
                  hasValue ? "bg-green text-white" : "bg-brown-dark/10 text-brown-dark"
                }`}
              >
                {hasValue ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              </span>
            </button>
          );
        })}
      </div>

      {platforms.map((p) => (
        <SocialLinkModal
          key={p.name}
          open={openPlatform === p.name}
          platform={p.name}
          currentUrl={(form[p.field] as string) || ""}
          onSave={(url) => handleSave(p.field, url)}
          onClose={() => setOpenPlatform(null)}
        />
      ))}
    </SectionCard>
  );
}

export default function ConfiguracionPage() {'''

assert content.count(old_before_export) == 1
content = content.replace(old_before_export, new_before_export)

with open(path, "w") as f:
    f.write(content)
print("OK: cuadricula de redes sociales con modal implementada")
