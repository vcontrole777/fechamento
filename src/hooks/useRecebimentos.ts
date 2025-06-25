import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DateRange } from "@/components/common/date-filter/types";
import { format } from "date-fns";

export type Recebimento = {
  id: number;
  data: string;
  valor: number;
  id_tripeiro: number;
  id_equipe: number;
  id_responsavel: number | null;
  banco: string | null;
  conta_depositada: string | null;
  tipo_deposito: string | null;
  numero_comprovante: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
  tripeiro?: {
    id: number;
    nome: string;
  };
  responsavel?: {
    nome: string;
  };
};

export function useRecebimentos(dateRange: DateRange, tripeiroId?: number) {
  return useQuery({
    queryKey: ["recebimentos", dateRange, tripeiroId],
    queryFn: async () => {
      console.log("🔍 Fetching recebimentos with dateRange:", dateRange, "tripeiroId:", tripeiroId);
      
      const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

      console.log("📅 Date filters - from:", fromDate, "to:", toDate);

      // Get user's team ID first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ User not authenticated");
        return [];
      }

      console.log("🔑 User authenticated:", user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id_equipe")
        .eq("id", user.id)
        .single();

      console.log("👤 Profile query result:", profile, "error:", profileError);

      if (profileError || !profile?.id_equipe) {
        console.error("❌ Unable to get user team information:", profileError);
        // Let's try to get recebimentos without team filter to debug
        console.log("🔧 Trying to fetch recebimentos without team filter for debugging...");
        
        const debugQuery = supabase
          .from("recebimentos")
          .select(`
            *,
            tripeiro:pessoas!recebimentos_id_tripeiro_fkey(id, nome),
            responsavel:pessoas!recebimentos_id_responsavel_fkey(nome)
          `)
          .order("data", { ascending: false });

        const { data: debugData, error: debugError } = await debugQuery;
        console.log("🔧 Debug query - all recebimentos:", debugData, "error:", debugError);
        
        return debugData || [];
      }

      console.log("👥 User's team ID:", profile.id_equipe);

      let query = supabase
        .from("recebimentos")
        .select(`
          *,
          tripeiro:pessoas!recebimentos_id_tripeiro_fkey(id, nome),
          responsavel:pessoas!recebimentos_id_responsavel_fkey(nome)
        `)
        .eq("id_equipe", profile.id_equipe); // Filter by user's team

      if (tripeiroId) {
        query = query.eq("id_tripeiro", tripeiroId);
        console.log("🔍 Filtering by tripeiro ID:", tripeiroId);
      }

      // Simplify date filtering for debugging
      console.log("🔧 Applying date filters...");
      if (fromDate && toDate && fromDate === toDate) {
        query = query.eq('data', fromDate);
        console.log("📅 Filtering by exact date:", fromDate);
      } else {
        if (fromDate) {
          query = query.gte('data', fromDate);
          console.log("📅 Filtering from date:", fromDate);
        }
        if (toDate) {
          query = query.lte('data', toDate);
          console.log("📅 Filtering to date:", toDate);
        }
      }

      query = query.order("data", { ascending: false });

      console.log("🔧 Final query about to execute...");
      const { data, error } = await query;

      console.log("📊 Query result - data count:", data?.length, "error:", error);
      console.log("📊 Full query result data:", data);

      if (error) {
        console.error("❌ Error fetching recebimentos:", error);
        toast({
          title: "Erro ao carregar recebimentos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      console.log("✅ Successfully fetched recebimentos:", data);
      return data as Recebimento[];
    },
  });
}

export function useAddRecebimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      data: Date;
      valor: number;
      valores_massa?: number[];
      id_tripeiro: number;
      id_responsavel?: number;
      banco?: string;
      conta_depositada?: string;
      tipo_deposito?: string;
      numero_comprovante?: string;
      observacoes?: string;
    }) => {
      // Get the user's team ID from their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id_equipe")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.id_equipe) {
        throw new Error("Unable to get user team information");
      }

      const baseRecebimento = {
        data: format(data.data, 'yyyy-MM-dd'),
        id_tripeiro: data.id_tripeiro,
        id_responsavel: data.id_responsavel,
        banco: data.banco,
        conta_depositada: data.conta_depositada,
        tipo_deposito: data.tipo_deposito,
        numero_comprovante: data.numero_comprovante,
        observacoes: data.observacoes,
        id_equipe: profile.id_equipe
      };

      console.log("💾 Creating recebimento(s) with base data:", baseRecebimento);

      // Se há valores em massa, criar múltiplos recebimentos
      if (data.valores_massa && data.valores_massa.length > 0) {
        const recebimentos = [
          { ...baseRecebimento, valor: data.valor },
          ...data.valores_massa.map(valor => ({ ...baseRecebimento, valor }))
        ];

        console.log("📦 Creating multiple recebimentos:", recebimentos.length, "records");

        const { data: results, error } = await supabase
          .from("recebimentos")
          .insert(recebimentos)
          .select();

        if (error) {
          console.error("❌ Error creating multiple recebimentos:", error);
          throw error;
        }
        
        console.log("✅ Successfully created multiple recebimentos:", results);
        return results;
      } else {
        // Recebimento único
        console.log("📦 Creating single recebimento");
        
        const { data: result, error } = await supabase
          .from("recebimentos")
          .insert([{ ...baseRecebimento, valor: data.valor }])
          .select()
          .single();

        if (error) {
          console.error("❌ Error creating single recebimento:", error);
          throw error;
        }
        
        console.log("✅ Successfully created single recebimento:", result);
        return result;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["recebimentos"] });
      const isMultiple = Array.isArray(result);
      console.log("🔄 Invalidated queries and showing success toast");
      toast({
        title: isMultiple ? "Recebimentos adicionados" : "Recebimento adicionado",
        description: isMultiple 
          ? `${result.length} recebimentos foram registrados com sucesso.`
          : "O recebimento foi registrado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("❌ Error in mutation:", error);
      toast({
        title: "Erro ao adicionar recebimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
