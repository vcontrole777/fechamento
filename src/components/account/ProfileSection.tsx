import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, User as UserIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

interface ProfileSectionProps {
  name: string;
  email: string;
  teamId: string;
  teamName: string;
  role: string;
  avatarUrl?: string | null;
  onAvatarUpdate: () => void;
}

export function ProfileSection({ name, email, teamId, teamName, role, avatarUrl, onAvatarUpdate }: ProfileSectionProps) {
  const { user } = useAuth();
  const { uploadAvatar, deleteAvatar, isUploading } = useAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const publicUrl = await uploadAvatar(file, user.id);
    if (publicUrl) {
      onAvatarUpdate();
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;
    const success = await deleteAvatar(user.id);
    if (success) {
      onAvatarUpdate();
    }
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items || !user) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          event.preventDefault();
          const publicUrl = await uploadAvatar(file, user.id);
          if (publicUrl) {
            onAvatarUpdate();
          }
        }
      }
    }
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuário';
      default:
        return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil do Usuário</CardTitle>
        <CardDescription>Suas informações pessoais e de equipe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div 
            className="relative" 
            onPaste={handlePaste}
            tabIndex={0}
            title="Cole uma imagem do clipboard aqui (Ctrl+V)"
          >
            <Avatar className="h-24 w-24 cursor-pointer" onClick={handleUploadClick}>
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={name} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="absolute -bottom-2 -right-2 flex gap-1">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full shadow-lg"
                onClick={handleUploadClick}
                disabled={isUploading}
                title="Alterar foto"
              >
                <Upload className="h-4 w-4" />
              </Button>
              
              {avatarUrl && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full shadow-lg"
                  onClick={handleDeleteAvatar}
                  disabled={isUploading}
                  title="Remover foto"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">{name || "Sem nome"}</h3>
                <Badge variant={getRoleBadgeVariant(role)}>
                  {getRoleLabel(role)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>

            <div className="grid gap-2 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Equipe:</span>
                <span className="font-medium">{teamName || "Sem equipe"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">ID da Equipe:</span>
                <code className="px-2 py-1 bg-muted rounded text-xs font-mono">{teamId || "N/A"}</code>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
