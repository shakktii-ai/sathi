"use client";

import { useEffect, useState } from "react";

export default function AnimatedNumber({ value }) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const target = Number.isFinite(numericValue) ? numericValue : null;
  const [displayValue, setDisplayValue] = useState(target);

  useEffect(() => {
    if (target === null) {
      return undefined;
    }
    let frame;
    const startedAt = performance.now();
    const duration = 480;
    function animate(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      setDisplayValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const visibleValue = target === null ? null : displayValue;
  return visibleValue === null ? "—" : visibleValue.toLocaleString("en-IN");
}
