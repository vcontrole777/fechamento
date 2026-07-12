import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Cliente com service role para operações administrativas
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Cliente com anon key para verificar o usuário atual
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verificar se o usuário atual é admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o usuário tem role de admin
    const { data: isAdmin, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem criar usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, nome, teamOption, existingTeamId, newTeamName, isAdmin: makeAdmin } = await req.json();

    // Validação básica
    if (!email || !password || !nome) {
      return new Response(
        JSON.stringify({ error: 'Email, senha e nome são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let teamId = existingTeamId;

    // Se for criar uma nova equipe
    if (teamOption === 'new') {
      if (!newTeamName) {
        return new Response(
          JSON.stringify({ error: 'Nome da equipe é obrigatório' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: newTeam, error: teamError } = await supabaseAdmin
        .from('equipes')
        .insert({ nome: newTeamName })
        .select()
        .single();

      if (teamError) {
        throw new Error(`Erro ao criar equipe: ${teamError.message}`);
      }

      teamId = newTeam.id;
    }

    // Criar o usuário no auth.users
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        id_equipe: teamId
      }
    });

    if (createError) {
      throw new Error(`Erro ao criar usuário: ${createError.message}`);
    }

    // Se deve ser admin, adicionar role
    if (makeAdmin) {
      const { error: roleInsertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: 'admin',
          created_by: user.id
        });

      if (roleInsertError) {
        console.error('Erro ao adicionar role de admin:', roleInsertError);
      }

      // Atualizar também na tabela profiles
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', newUser.user.id);

      if (profileUpdateError) {
        console.error('Erro ao atualizar perfil:', profileUpdateError);
      }
    }

    // Log da ação administrativa
    await supabaseAdmin
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id,
        target_user_id: newUser.user.id,
        action: 'user_created',
        details: {
          email,
          nome,
          team_id: teamId,
          is_admin: makeAdmin
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
