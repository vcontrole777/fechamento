
// Follow Deno runtime API
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { startOfWeek, endOfWeek, format } from "https://esm.sh/date-fns@2.30.0";

// Set up CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const { startDate, endDate, teamId } = await req.json();

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use provided date range or default to current week
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const now = new Date();
      start = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
      end = endOfWeek(now, { weekStartsOn: 0 }); // Saturday
    }

    // Format dates for query
    const formattedStartDate = format(start, 'yyyy-MM-dd');
    const formattedEndDate = format(end, 'yyyy-MM-dd');
    
    console.log(`Fetching attendant rankings from ${formattedStartDate} to ${formattedEndDate} for team ${teamId}`);

    // Validate team ID
    if (!teamId) {
      throw new Error("Team ID is required");
    }

    // Debug info about the query parameters
    console.log("Query parameters:", {
      teamId: teamId,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });

    // Query to get attendant rankings
    const { data, error } = await supabase
      .from("pagamentos")
      .select(`
        id_atendente,
        valor,
        atendente:pessoas!pagamentos_id_atendente_fkey(nome)
      `)
      .eq("id_equipe", teamId)
      .gte("data", formattedStartDate)
      .lte("data", formattedEndDate)
      .not("id_atendente", "is", null);
    
    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    // Log raw data for debugging
    console.log(`Query returned ${data ? data.length : 0} records`);
    if (data && data.length > 0) {
      console.log("Sample record:", data[0]);
    } else {
      console.log("No records found for the specified parameters");
      
      // Debug query: Check if the team exists
      const { data: teamData, error: teamError } = await supabase
        .from("equipes")
        .select("id, nome")
        .eq("id", teamId);
      
      if (teamError) {
        console.error("Team lookup error:", teamError);
      } else {
        console.log(`Team check: ${teamData && teamData.length > 0 ? "Team exists" : "Team does not exist"}`, teamData);
      }
      
      // Debug query: Check if there are any payments for this team regardless of date
      const { data: anyPayments, error: paymentsError } = await supabase
        .from("pagamentos")
        .select("id, data, valor")
        .eq("id_equipe", teamId)
        .limit(5);
      
      if (paymentsError) {
        console.error("Payments lookup error:", paymentsError);
      } else {
        console.log(`Any payments check: ${anyPayments && anyPayments.length > 0 ? "Payments exist for this team" : "No payments for this team at all"}`, anyPayments);
      }
    }

    // Process and aggregate the data by attendant
    const attendantMap = new Map();
    
    data?.forEach(payment => {
      if (!payment.id_atendente || !payment.atendente) return;
      
      const attendantId = payment.id_atendente;
      const attendantName = payment.atendente.nome;
      const amount = Number(payment.valor) || 0;
      
      if (attendantMap.has(attendantId)) {
        const current = attendantMap.get(attendantId);
        attendantMap.set(attendantId, {
          ...current,
          totalAmount: current.totalAmount + amount,
        });
      } else {
        attendantMap.set(attendantId, {
          id: attendantId,
          name: attendantName,
          totalAmount: amount,
        });
      }
    });

    // Convert to array and sort by total amount (descending)
    const ranking = Array.from(attendantMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map((attendant, index) => ({
        position: index + 1,
        ...attendant,
      }));

    // Log the final ranking
    console.log(`Final ranking contains ${ranking.length} attendants`);
    
    // Return the ranking with date range info
    return new Response(
      JSON.stringify({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        ranking,
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error in weekly-attendant-ranking function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to get attendant ranking" 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
