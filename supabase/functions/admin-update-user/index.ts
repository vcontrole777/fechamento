import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar autenticação e admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: adminUser }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', {
      _user_id: adminUser.id,
      _role: 'admin'
    })

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ler dados da requisição
    const { userId, action, data } = await req.json()

    if (!userId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result
    let auditAction = action
    let auditDetails: any = { userId }

    switch (action) {
      case 'block':
        // Banir usuário por 100 anos
        const banUntil = new Date()
        banUntil.setFullYear(banUntil.getFullYear() + 100)
        
        result = await supabaseAdmin.auth.admin.updateUserById(userId, {
          ban_duration: '876000h' // 100 anos
        })
        auditDetails.ban_until = banUntil.toISOString()
        break

      case 'unblock':
        result = await supabaseAdmin.auth.admin.updateUserById(userId, {
          ban_duration: 'none'
        })
        break

      case 'delete':
        // Buscar equipe do usuário antes de deletar
        const { data: profileData } = await supabaseAdmin
          .from('profiles')
          .select('id_equipe')
          .eq('id', userId)
          .single()
        
        // Se o usuário tem equipe, deletar todos os dados da equipe
        if (profileData?.id_equipe) {
          const { error: deleteEquipeError } = await supabaseAdmin.rpc('deletar_equipe_completa_admin', {
            equipe_id: profileData.id_equipe
          })
          
          if (deleteEquipeError) {
            console.error('Error deleting team data:', deleteEquipeError)
            return new Response(
              JSON.stringify({ error: 'Erro ao deletar dados da equipe: ' + deleteEquipeError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          auditDetails.deleted_equipe_id = profileData.id_equipe
        }
        
        // Deletar o usuário (profiles, user_roles e notes serão deletados em CASCADE)
        result = await supabaseAdmin.auth.admin.deleteUser(userId)
        auditAction = 'user_deleted'
        break

      case 'update_profile':
        if (!data?.nome) {
          return new Response(
            JSON.stringify({ error: 'Missing nome in data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        result = await supabaseAdmin
          .from('profiles')
          .update({ nome: data.nome })
          .eq('id', userId)
        
        auditDetails.new_name = data.nome
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    if (result.error) {
      console.error('Action error:', result.error)
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Registrar log de auditoria
    await supabaseAdmin
      .from('admin_audit_logs')
      .insert({
        admin_id: adminUser.id,
        action: auditAction,
        target_user_id: userId,
        details: auditDetails
      })

    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
