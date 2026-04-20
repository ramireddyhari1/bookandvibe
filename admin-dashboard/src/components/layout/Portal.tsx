"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  selector?: string;
}

export default function Portal({ children, selector }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
    return () => setMounted(false);
  }, []);

  return mounted 
    ? createPortal(children, document.body) 
    : null;
}
