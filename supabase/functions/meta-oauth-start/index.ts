import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FACEBOOK_CLIENT_ID = Deno.env.get('FACEBOOK_CLIENT_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

    if (!FACEBOOK_CLIENT_ID) {
      console.error('Missing FACEBOOK_CLIENT_ID');
      return new Response(
        JSON.stringify({ error: 'Missing Facebook Client ID configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the state from request body (contains user session info)
    const { state } = await req.json();

    // Build the redirect URI for the callback function
    const redirectUri = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;

    // Required scopes for Meta Ads
    const scopes = [
      'ads_management',
      'business_management', 
      'pages_read_engagement',
      'read_insights'
    ].join(',');

    // Build Facebook OAuth URL
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', FACEBOOK_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state || '');

    console.log('Generated Meta OAuth URL:', authUrl.toString());
    console.log('Redirect URI for Meta Developer Console:', redirectUri);

    return new Response(
      JSON.stringify({ 
        authUrl: authUrl.toString(),
        redirectUri: redirectUri 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in meta-oauth-start:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
