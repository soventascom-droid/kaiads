import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's JWT
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get user's Meta token
    const { data: tokenData, error: tokenError } = await supabase
      .from('meta_ads_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tokenError || !tokenData) {
      throw new Error('No Meta token found. Please connect your Meta account first.');
    }

    const accessToken = tokenData.access_token;
    console.log('Fetching Meta assets for user:', user.id);

    // Fetch all data in parallel
    const [businessesRes, adAccountsRes, pagesRes] = await Promise.all([
      // Fetch Business Managers
      fetch(`https://graph.facebook.com/v18.0/me/businesses?access_token=${accessToken}&fields=id,name`),
      // Fetch Ad Accounts
      fetch(`https://graph.facebook.com/v18.0/me/adaccounts?access_token=${accessToken}&fields=id,name,account_id`),
      // Fetch Facebook Pages
      fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}&fields=id,name,access_token`),
    ]);

    const [businessesData, adAccountsData, pagesData] = await Promise.all([
      businessesRes.json(),
      adAccountsRes.json(),
      pagesRes.json(),
    ]);

    console.log('Businesses response:', JSON.stringify(businessesData));
    console.log('Ad Accounts response:', JSON.stringify(adAccountsData));
    console.log('Pages response:', JSON.stringify(pagesData));

    // Format businesses
    const businesses = businessesData.data?.map((b: any) => ({
      id: b.id,
      name: b.name
    })) || [];

    // Format ad accounts
    const adAccounts = adAccountsData.data?.map((a: any) => ({
      id: a.id,
      name: a.name || `Account ${a.account_id}`,
      account_id: a.account_id
    })) || [];

    // Format pages
    const pages = pagesData.data?.map((p: any) => ({
      id: p.id,
      name: p.name,
      access_token: p.access_token
    })) || [];

    // Fetch pixels for each ad account
    let pixels: any[] = [];
    for (const account of adAccounts) {
      try {
        const pixelsRes = await fetch(
          `https://graph.facebook.com/v18.0/${account.id}/adspixels?access_token=${accessToken}&fields=id,name`
        );
        const pixelsData = await pixelsRes.json();
        console.log(`Pixels for ${account.id}:`, JSON.stringify(pixelsData));
        
        if (pixelsData.data) {
          pixels = [...pixels, ...pixelsData.data.map((px: any) => ({
            id: px.id,
            name: px.name,
            ad_account_id: account.id
          }))];
        }
      } catch (e) {
        console.log(`Error fetching pixels for ${account.id}:`, e);
      }
    }

    // Fetch WhatsApp Business Accounts from businesses
    let whatsappAccounts: any[] = [];
    for (const biz of businesses) {
      try {
        const waRes = await fetch(
          `https://graph.facebook.com/v18.0/${biz.id}/owned_whatsapp_business_accounts?access_token=${accessToken}&fields=id,name,phone_numbers{display_phone_number,verified_name}`
        );
        const waData = await waRes.json();
        console.log(`WhatsApp for ${biz.id}:`, JSON.stringify(waData));
        
        if (waData.data) {
          for (const wa of waData.data) {
            const phones = wa.phone_numbers?.data || [];
            whatsappAccounts.push({
              id: wa.id,
              name: wa.name,
              phones: phones.map((p: any) => ({
                number: p.display_phone_number,
                name: p.verified_name
              }))
            });
          }
        }
      } catch (e) {
        console.log(`Error fetching WhatsApp for ${biz.id}:`, e);
      }
    }

    const result = {
      businesses,
      adAccounts,
      pages,
      pixels,
      whatsappAccounts
    };

    console.log('Final result:', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in meta-fetch-assets:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
