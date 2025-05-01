import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function AuthHeader({
  title,
  description,
  className,
}: AuthHeaderProps) {
  return (
    <div className={cn("mb-8 text-center", className)}>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}