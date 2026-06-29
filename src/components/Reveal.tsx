"use client";

import { motion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left";
}

export function Reveal({ children, className, delay = 0, direction = "up" }: RevealProps) {
  const initial =
    direction === "left"
      ? { opacity: 0, x: 24 }
      : { opacity: 0, y: 30 };
  const animate =
    direction === "left"
      ? { opacity: 1, x: 0 }
      : { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
