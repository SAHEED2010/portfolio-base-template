"use client";

import { useEffect, useRef, useState } from "react";

// Scroll reveal. A thin client wrapper whose only job is to add
// `.is-visible` when the element enters the viewport — the actual
// motion lives in globals.css.
//
// This is why we don't need Framer Motion: the JS here is an
// IntersectionObserver and a class toggle, and it keeps the wrapped
// content free to remain a server component.
//
// `once: true` because a section re-animating every time you scroll
// past it is irritating, not delightful.

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Fire slightly before the element is fully on screen, so the
      // motion finishes as it settles rather than starting late.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
