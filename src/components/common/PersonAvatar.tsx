import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PersonAvatarProps {
  name: string;
  className?: string;
}

export function PersonAvatar({ name, className }: PersonAvatarProps) {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Avatar className={className}>
      <AvatarFallback className={`${getAvatarColor(name)} text-white font-medium`}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
