import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const errorParam = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log('Callback received - code:', code ? 'present' : 'missing', 'state:', state);

    // Check for OAuth errors from Facebook
    if (errorParam) {
      console.error('Facebook OAuth error:', errorParam, errorDescription);
      const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://id-preview--cnklvgsbdftiqzdshvmd.lovable.app';
      return Response.redirect(
        `${frontendUrl}/meta-callback?error=${encodeURIComponent(errorDescription || errorParam)}`,
        302
      );
    }

    if (!code) {
      console.error('No authorization code received');
      const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://id-preview--cnklvgsbdftiqzdshvmd.lovable.app';
      return Response.redirect(
        `${frontendUrl}/meta-callback?error=No authorization code received`,
        302
      );
    }

    const FACEBOOK_CLIENT_ID = Deno.env.get('FACEBOOK_CLIENT_ID');
    const FACEBOOK_CLIENT_SECRET = Deno.env.get('FACEBOOK_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FACEBOOK_CLIENT_ID || !FACEBOOK_CLIENT_SECRET) {
      console.error('Missing Facebook credentials');
      throw new Error('Facebook credentials not configured');
    }

    // Build redirect URI (must match exactly what was sent in auth request)
    const redirectUri = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;

    // Exchange code for access token
    console.log('Exchanging code for access token...');
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', FACEBOOK_CLIENT_ID);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('client_secret', FACEBOOK_CLIENT_SECRET);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      throw new Error(tokenData.error.message || 'Failed to exchange code for token');
    }

    console.log('Token received successfully');
    const { access_token, expires_in } = tokenData;

    // Calculate expiration date
    const expiresAt = expires_in 
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : null;

    // Get user ID from state (we passed it when starting OAuth)
    const userId = state;

    if (!userId) {
      console.error('No user ID in state');
      throw new Error('User session not found');
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Upsert the token in the database
    console.log('Saving token for user:', userId);
    const { error: dbError } = await supabase
      .from('meta_ads_tokens')
      .upsert({
        user_id: userId,
        access_token: access_token,
        token_type: 'Bearer',
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save access token');
    }

    console.log('Token saved successfully, redirecting to frontend...');
    
    // Redirect back to frontend with success
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://id-preview--cnklvgsbdftiqzdshvmd.lovable.app';
    return Response.redirect(`${frontendUrl}/meta-callback?success=true`, 302);

  } catch (error: unknown) {
    console.error('Error in meta-oauth-callback:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://id-preview--cnklvgsbdftiqzdshvmd.lovable.app';
    return Response.redirect(
      `${frontendUrl}/meta-callback?error=${encodeURIComponent(message)}`,
      302
    );
  }
});
