"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

type BarcodeDisplayProps = {
  value: string;
  height?: number;
  showText?: boolean;
};

export default function BarcodeDisplay({
  value,
  height = 70,
  showText = true,
}: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const cleanValue = value.trim();

    if (!svgRef.current || !cleanValue) {
      return;
    }

    try {
      JsBarcode(svgRef.current, cleanValue, {
        format: "CODE128",
        width: 2,
        height,
        displayValue: showText,
        fontSize: 14,
        margin: 10,
        background: "#ffffff",
        lineColor: "#000000",
      });
    } catch (error) {
      console.error("Error generando código de barras:", error);
    }
  }, [value, height, showText]);

  if (!value.trim()) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max flex justify-center bg-white rounded-xl p-3">
        <svg ref={svgRef} />
      </div>
    </div>
  );
}
