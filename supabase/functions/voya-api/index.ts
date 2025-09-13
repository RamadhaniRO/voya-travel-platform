import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method, url } = req
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const searchParams = urlObj.searchParams

    // Route handling
    switch (path) {
      case '/api/send-email':
        return await handleSendEmail(req, supabaseClient)
      
      case '/api/process-payment':
        return await handleProcessPayment(req, supabaseClient)
      
      case '/api/generate-report':
        return await handleGenerateReport(req, supabaseClient)
      
      case '/api/process-image':
        return await handleProcessImage(req, supabaseClient)
      
      case '/api/send-notification':
        return await handleSendNotification(req, supabaseClient)
      
      case '/api/analytics':
        return await handleAnalytics(req, supabaseClient)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Send email notification
async function handleSendEmail(req, supabaseClient) {
  const { to, subject, template, data } = await req.json()
  
  // Get user from auth
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Log email attempt
  const { error: logError } = await supabaseClient
    .from('email_notifications')
    .insert([{
      template_name: template,
      recipient_email: to,
      variables: data,
      status: 'pending'
    }])

  if (logError) {
    console.error('Error logging email:', logError)
  }

  // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
  // For now, we'll simulate success
  const emailData = {
    to,
    subject,
    template,
    data,
    sent_at: new Date().toISOString()
  }

  // Update email status
  await supabaseClient
    .from('email_notifications')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('recipient_email', to)
    .eq('template_name', template)

  return new Response(
    JSON.stringify({ success: true, data: emailData }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Process payment
async function handleProcessPayment(req, supabaseClient) {
  const { booking_id, amount, currency, payment_method } = await req.json()
  
  // Get user from auth
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create payment record
  const { data: payment, error: paymentError } = await supabaseClient
    .from('payments')
    .insert([{
      booking_id,
      amount,
      currency,
      method: payment_method,
      status: 'processing'
    }])
    .select()
    .single()

  if (paymentError) {
    return new Response(
      JSON.stringify({ error: paymentError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Here you would integrate with Stripe or other payment processor
  // For now, we'll simulate success
  const paymentResult = {
    payment_intent_id: `pi_${Date.now()}`,
    status: 'completed',
    transaction_id: `txn_${Date.now()}`
  }

  // Update payment status
  await supabaseClient
    .from('payments')
    .update({
      status: 'completed',
      stripe_payment_intent_id: paymentResult.payment_intent_id,
      transaction_id: paymentResult.transaction_id
    })
    .eq('id', payment.id)

  // Update booking status
  await supabaseClient
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', booking_id)

  return new Response(
    JSON.stringify({ success: true, data: paymentResult }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Generate analytics report
async function handleGenerateReport(req, supabaseClient) {
  const { start_date, end_date, report_type } = await req.json()
  
  // Get user from auth
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let reportData = {}

  switch (report_type) {
    case 'bookings':
      const { data: bookings } = await supabaseClient
        .from('bookings')
        .select(`
          *,
          properties(name, property_type),
          profiles(first_name, last_name)
        `)
        .gte('created_at', start_date)
        .lte('created_at', end_date)
      
      reportData = {
        total_bookings: bookings?.length || 0,
        total_revenue: bookings?.reduce((sum, b) => sum + parseFloat(b.total_price), 0) || 0,
        bookings: bookings || []
      }
      break

    case 'users':
      const { data: users } = await supabaseClient
        .from('profiles')
        .select('*')
        .gte('created_at', start_date)
        .lte('created_at', end_date)
      
      reportData = {
        total_users: users?.length || 0,
        users_by_role: users?.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1
          return acc
        }, {}) || {},
        users: users || []
      }
      break

    case 'properties':
      const { data: properties } = await supabaseClient
        .from('properties')
        .select(`
          *,
          destinations(name, country),
          profiles(first_name, last_name)
        `)
        .gte('created_at', start_date)
        .lte('created_at', end_date)
      
      reportData = {
        total_properties: properties?.length || 0,
        properties_by_type: properties?.reduce((acc, prop) => {
          acc[prop.property_type] = (acc[prop.property_type] || 0) + 1
          return acc
        }, {}) || {},
        properties: properties || []
      }
      break

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid report type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }

  return new Response(
    JSON.stringify({ success: true, data: reportData }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Process image (resize, optimize)
async function handleProcessImage(req, supabaseClient) {
  const { image_url, width, height, quality } = await req.json()
  
  // Get user from auth
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Here you would integrate with image processing service
  // For now, we'll return the original URL
  const processedImage = {
    original_url: image_url,
    processed_url: image_url, // In real implementation, this would be the processed image URL
    width: width || 800,
    height: height || 600,
    quality: quality || 80
  }

  return new Response(
    JSON.stringify({ success: true, data: processedImage }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Send push notification
async function handleSendNotification(req, supabaseClient) {
  const { user_id, title, message, type } = await req.json()
  
  // Get user from auth
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create notification
  const { data: notification, error } = await supabaseClient
    .from('notifications')
    .insert([{
      user_id,
      type: type || 'system',
      title,
      message
    }])
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, data: notification }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Analytics endpoint
async function handleAnalytics(req, supabaseClient) {
  const { start_date, end_date, metrics } = await req.json()
  
  // Get user from auth
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const analyticsData = {}

  // Get analytics events
  const { data: events } = await supabaseClient
    .from('analytics_events')
    .select('*')
    .gte('timestamp', start_date)
    .lte('timestamp', end_date)

  // Process metrics
  if (metrics.includes('page_views')) {
    analyticsData.page_views = events?.filter(e => e.event_type === 'page_view').length || 0
  }

  if (metrics.includes('conversions')) {
    analyticsData.conversions = events?.filter(e => e.event_type === 'conversion').length || 0
  }

  if (metrics.includes('searches')) {
    analyticsData.searches = events?.filter(e => e.event_type === 'search').length || 0
  }

  if (metrics.includes('errors')) {
    analyticsData.errors = events?.filter(e => e.event_type === 'error').length || 0
  }

  return new Response(
    JSON.stringify({ success: true, data: analyticsData }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
