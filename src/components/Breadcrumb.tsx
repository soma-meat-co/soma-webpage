interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "dark" | "light";
  className?: string;
}

const variantStyles = {
  dark: {
    wrapper: "bg-soma-brown",
    link: "text-soma-gray hover:text-soma-red transition-colors",
    separator: "text-white/30",
    current: "text-white font-semibold",
  },
  light: {
    wrapper: "bg-soma-off-wh border-b border-soma-black/[0.08]",
    link: "text-[#666] hover:text-soma-red transition-colors",
    separator: "text-soma-black/20",
    current: "text-soma-black font-semibold",
  },
};

export function Breadcrumb({ items, variant = "dark", className }: BreadcrumbProps) {
  const styles = variantStyles[variant];

  return (
    <div className={className ?? styles.wrapper} style={{ padding: "14px 80px" }}>
      <div className="flex items-center gap-2.5 font-label text-[11px] tracking-[0.12em] uppercase">
        <a href="/" className={styles.link}>
          Inicio
        </a>
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-2.5">
            <span className={styles.separator}>›</span>
            {item.href ? (
              <a href={item.href} className={styles.link}>
                {item.label}
              </a>
            ) : (
              <span className={styles.current}>{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
