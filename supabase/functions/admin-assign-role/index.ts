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

    // Verificar autenticação
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

    // Verificar se é admin
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

    // Ler dados
    const { userId, role, action } = await req.json()

    if (!userId || !role || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, role, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['admin', 'user'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be admin or user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result
    let auditAction = ''

    if (action === 'add') {
      // Adicionar role
      result = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          created_by: adminUser.id
        })
      
      auditAction = 'role_added'

      // Atualizar também na tabela profiles para compatibilidade
      await supabaseAdmin
        .from('profiles')
        .update({ role: role })
        .eq('id', userId)
    } else if (action === 'remove') {
      // Remover role
      result = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role)
      
      auditAction = 'role_removed'

      // Se removeu admin, atualizar profiles para user
      if (role === 'admin') {
        await supabaseAdmin
          .from('profiles')
          .update({ role: 'user' })
          .eq('id', userId)
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be add or remove' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (result.error) {
      console.error('Role assignment error:', result.error)
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log de auditoria
    await supabaseAdmin
      .from('admin_audit_logs')
      .insert({
        admin_id: adminUser.id,
        action: auditAction,
        target_user_id: userId,
        details: { role, action }
      })

    return new Response(
      JSON.stringify({ success: true }),
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
