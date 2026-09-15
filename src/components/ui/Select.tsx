"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

type Option = { value: string; label: string };

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="w-full">
      {label && <label className="text-xs font-medium text-ink/60 block mb-1">{label}</label>}
      <RadixSelect.Root value={value} onValueChange={onChange}>
        <RadixSelect.Trigger className="w-full flex items-center justify-between border border-panel-border rounded-lg px-3 py-2 text-sm bg-panel-surface focus:outline-none focus:ring-2 focus:ring-brown-dark/30 data-[placeholder]:text-panel-ink-soft">
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="w-4 h-4 text-panel-ink-soft" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content className="overflow-hidden bg-panel-surface rounded-lg border border-panel-border shadow-lg z-[100]">
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex items-center px-3 py-2 pl-8 text-sm rounded-md text-panel-ink hover:bg-panel-bg cursor-pointer outline-none data-[state=checked]:bg-brown-dark/8 data-[state=checked]:text-brown-dark"
                >
                  <RadixSelect.ItemIndicator className="absolute left-2 flex items-center">
                    <Check className="w-3.5 h-3.5" />
                  </RadixSelect.ItemIndicator>
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
