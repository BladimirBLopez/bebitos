"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

export default function Tooltip({ children, content }: { children: ReactNode; content: string }) {
  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side="top"
            sideOffset={6}
            className="bg-panel-ink text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg z-[100]"
          >
            {content}
            <RadixTooltip.Arrow className="fill-panel-ink" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
