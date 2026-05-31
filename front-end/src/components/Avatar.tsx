import { User, Users } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  isGroup?: boolean;
}

export function Avatar({ src, alt, className = "", isGroup = false }: AvatarProps) {
  if (src) {
    return <img src={src} alt={alt || "Avatar"} className={className} />;
  }
  
  return (
    <div className={`flex items-center justify-center bg-slate-200 text-slate-500 ${className}`}>
      {isGroup ? <Users className="w-1/2 h-1/2" /> : <User className="w-1/2 h-1/2" />}
    </div>
  );
}
