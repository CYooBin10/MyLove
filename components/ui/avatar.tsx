import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

export function Avatar({ src, name, size = "md", className }: Props) {
  const initials = (name || "?").slice(0, 1).toUpperCase();

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold overflow-hidden select-none border border-border/40",
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-12 w-12 text-sm",
        size === "lg" && "h-16 w-16 text-xl",
        size === "xl" && "h-24 w-24 text-3xl",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || "Avatar"} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
