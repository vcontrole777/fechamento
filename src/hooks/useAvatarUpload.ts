import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      setIsUploading(true);

      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, envie uma imagem JPG, PNG ou WebP.",
          variant: "destructive",
        });
        return null;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo é 5MB.",
          variant: "destructive",
        });
        return null;
      }

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Deletar avatar anterior se existir
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from('avatars')
          .remove([`${userId}/${existingFiles[0].name}`]);
      }

      // Fazer upload do novo avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar profile com nova URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAvatar = async (userId: string): Promise<boolean> => {
    try {
      setIsUploading(true);

      // Listar arquivos do usuário
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (!files || files.length === 0) {
        toast({
          title: "Nenhuma foto para remover",
          variant: "default",
        });
        return false;
      }

      // Deletar arquivo
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([`${userId}/${files[0].name}`]);

      if (deleteError) throw deleteError;

      // Atualizar profile removendo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({
        title: "Foto removida",
        description: "Sua foto de perfil foi removida com sucesso.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao remover foto",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    deleteAvatar,
    isUploading
  };
}
