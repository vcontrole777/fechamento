import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { startOfWeek, endOfWeek, format } from "https://esm.sh/date-fns@2.30.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { teamId, startDate: customStartDate, endDate: customEndDate } = await req.json();

    if (!teamId) {
      return new Response(
        JSON.stringify({ error: "Team ID é obrigatório" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Usar datas customizadas ou calcular semana atual
    let startDate, endDate;
    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    } else {
      const now = new Date();
      startDate = startOfWeek(now, { weekStartsOn: 0 });
      endDate = endOfWeek(now, { weekStartsOn: 0 });
    }
    
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    console.log(`Buscando ranking da semana ${formattedStartDate} a ${formattedEndDate} para equipe ${teamId}`);

    // Buscar pagamentos da semana atual
    const { data: payments, error } = await supabase
      .from("pagamentos")
      .select(`
        id_atendente,
        valor,
        atendente:pessoas!pagamentos_id_atendente_fkey(nome)
      `)
      .eq("id_equipe", teamId)
      .gte("data", formattedStartDate)
      .lte("data", formattedEndDate)
      .eq("status", "concluido")
      .not("id_atendente", "is", null);

    if (error) {
      console.error("Erro na consulta:", error);
      throw new Error("Erro ao buscar dados");
    }

    console.log(`Encontrados ${payments?.length || 0} pagamentos`);

    // Agrupar por atendente e calcular totais
    const rankingMap = new Map();
    
    payments?.forEach(payment => {
      const attendantId = payment.id_atendente;
      const attendantName = payment.atendente?.nome;
      const amount = Number(payment.valor) || 0;

      if (rankingMap.has(attendantId)) {
        const current = rankingMap.get(attendantId);
        rankingMap.set(attendantId, {
          ...current,
          totalAmount: current.totalAmount + amount
        });
      } else {
        rankingMap.set(attendantId, {
          id: attendantId,
          name: attendantName,
          totalAmount: amount
        });
      }
    });

    // Converter para array e ordenar por valor total
    const ranking = Array.from(rankingMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map((attendant, index) => ({
        position: index + 1,
        id: attendant.id,
        name: attendant.name,
        totalAmount: attendant.totalAmount
      }));

    const response = {
      weekStart: formattedStartDate,
      weekEnd: formattedEndDate,
      totalAttendants: ranking.length,
      ranking: ranking
    };

    console.log(`Ranking gerado com ${ranking.length} atendentes`);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("Erro no endpoint:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno do servidor" 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});