import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md overflow-hidden rounded-lg border bg-card/80 p-8 shadow-lg backdrop-blur transition-all",
        "animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out",
        className
      )}
    >
      {children}
    </div>
  );
}