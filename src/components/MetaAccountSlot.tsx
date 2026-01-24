import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  Building2, 
  CreditCard, 
  FileText, 
  MessageCircle, 
  Globe, 
  Zap,
  Facebook,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MetaAssets {
  businesses: { id: string; name: string }[];
  adAccounts: { id: string; name: string; account_id: string }[];
  pages: { id: string; name: string }[];
  pixels: { id: string; name: string; ad_account_id: string }[];
  whatsappAccounts: { id: string; name: string; phones: { number: string; name: string }[] }[];
}

interface MetaAccountSlotProps {
  slotNumber: number;
  isConnected: boolean;
  onConnectMeta: () => void;
  onDisconnect: () => void;
  onConfigSaved: () => void;
  connecting: boolean;
}

const MetaAccountSlot = ({ 
  slotNumber, 
  isConnected, 
  onConnectMeta, 
  onDisconnect,
  onConfigSaved,
  connecting 
}: MetaAccountSlotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState<MetaAssets | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  // Form state
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedAdAccount, setSelectedAdAccount] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [selectedPixel, setSelectedPixel] = useState('');
  const [selectedWhatsApp, setSelectedWhatsApp] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Load existing config
  useEffect(() => {
    const loadExistingConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('business_configurations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setSelectedBusiness(data.business_manager_id || '');
        setSelectedAdAccount(data.ad_account_id || '');
        setSelectedPage(data.facebook_page_id || '');
        setSelectedPixel(data.pixel_id || '');
        setSelectedWhatsApp(data.whatsapp_account_id || '');
        setWebsiteUrl(data.website_url || '');
      }
    };

    if (isConnected) {
      loadExistingConfig();
    }
  }, [isConnected]);

  // Auto-fetch assets when connected (not just when opened)
  useEffect(() => {
    if (isConnected && !assets && !loading) {
      fetchAssets();
    }
  }, [isConnected]);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('meta-fetch-assets');
      
      if (error) {
        console.error('Error fetching assets:', error);
        setError(error.message || 'Error al cargar los activos de Meta');
        return;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      console.log('Assets loaded:', data);
      setAssets(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión al cargar los activos');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete token
      await supabase
        .from('meta_ads_tokens')
        .delete()
        .eq('user_id', user.id);

      // Delete configuration
      await supabase
        .from('business_configurations')
        .delete()
        .eq('user_id', user.id);

      toast.success('Cuenta desconectada');
      onDisconnect();
    } catch (err) {
      console.error('Error disconnecting:', err);
      toast.error('Error al desconectar la cuenta');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Find selected names
      const businessName = assets?.businesses.find(b => b.id === selectedBusiness)?.name || '';
      const adAccountName = assets?.adAccounts.find(a => a.id === selectedAdAccount)?.name || '';
      const pageName = assets?.pages.find(p => p.id === selectedPage)?.name || '';
      const pixelName = assets?.pixels.find(p => p.id === selectedPixel)?.name || '';
      const waAccount = assets?.whatsappAccounts.find(w => w.id === selectedWhatsApp);
      const waPhone = waAccount?.phones[0]?.number || '';

      const { error } = await supabase
        .from('business_configurations')
        .upsert({
          user_id: user.id,
          business_manager_id: selectedBusiness,
          business_manager_name: businessName,
          ad_account_id: selectedAdAccount,
          ad_account_name: adAccountName,
          facebook_page_id: selectedPage,
          facebook_page_name: pageName,
          pixel_id: selectedPixel,
          pixel_name: pixelName,
          whatsapp_account_id: selectedWhatsApp,
          whatsapp_phone: waPhone,
          website_url: websiteUrl,
          is_configured: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving config:', error);
        toast.error('Error al guardar la configuración');
        return;
      }

      toast.success('Configuración guardada exitosamente');
      onConfigSaved();
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const filteredPixels = assets?.pixels.filter(p => 
    !selectedAdAccount || p.ad_account_id === selectedAdAccount
  ) || [];

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isConnected ? 'bg-blue-600' : 'bg-muted'
            }`}>
              <Facebook className={`w-8 h-8 ${isConnected ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Cuenta Meta #{slotNumber}</h3>
              <p className="text-muted-foreground text-sm">
                {isConnected 
                  ? 'Cuenta conectada - Configura tus activos' 
                  : 'Conecta tu cuenta de Meta Ads'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium text-sm">Conectado</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  {disconnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Desconectar
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button 
                onClick={onConnectMeta}
                disabled={connecting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  'Conectar Meta Ads'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Data Extraction Info - Always visible */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/30">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            {isConnected ? 'Datos extraídos de Meta' : 'Datos que se extraerán al conectar'}
          </h4>
          
          {isConnected && loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando activos...
            </div>
          ) : isConnected && error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className={`p-3 rounded-lg border ${isConnected && assets ? 'bg-card/50 border-border/30' : 'bg-muted/20 border-dashed border-border/50'}`}>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Building2 className="w-3 h-3" />
                  <span className="text-xs">Business Managers</span>
                </div>
                <p className={`text-lg font-bold ${isConnected && assets ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {isConnected && assets ? assets.businesses.length : '—'}
                </p>
              </div>
              <div className={`p-3 rounded-lg border ${isConnected && assets ? 'bg-card/50 border-border/30' : 'bg-muted/20 border-dashed border-border/50'}`}>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CreditCard className="w-3 h-3" />
                  <span className="text-xs">Cuentas Publicitarias</span>
                </div>
                <p className={`text-lg font-bold ${isConnected && assets ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {isConnected && assets ? assets.adAccounts.length : '—'}
                </p>
              </div>
              <div className={`p-3 rounded-lg border ${isConnected && assets ? 'bg-card/50 border-border/30' : 'bg-muted/20 border-dashed border-border/50'}`}>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileText className="w-3 h-3" />
                  <span className="text-xs">Páginas de Facebook</span>
                </div>
                <p className={`text-lg font-bold ${isConnected && assets ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {isConnected && assets ? assets.pages.length : '—'}
                </p>
              </div>
              <div className={`p-3 rounded-lg border ${isConnected && assets ? 'bg-card/50 border-border/30' : 'bg-muted/20 border-dashed border-border/50'}`}>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Zap className="w-3 h-3" />
                  <span className="text-xs">Píxeles de Meta</span>
                </div>
                <p className={`text-lg font-bold ${isConnected && assets ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {isConnected && assets ? assets.pixels.length : '—'}
                </p>
              </div>
              <div className={`p-3 rounded-lg border ${isConnected && assets ? 'bg-card/50 border-border/30' : 'bg-muted/20 border-dashed border-border/50'}`}>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MessageCircle className="w-3 h-3" />
                  <span className="text-xs">Cuentas WhatsApp</span>
                </div>
                <p className={`text-lg font-bold ${isConnected && assets ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {isConnected && assets ? assets.whatsappAccounts.length : '—'}
                </p>
              </div>
            </div>
          )}
          
          {!isConnected && (
            <p className="text-xs text-muted-foreground mt-3 italic">
              Conecta tu cuenta de Meta Ads para ver los activos disponibles
            </p>
          )}
        </div>
      </div>

      {/* Collapsible Form */}
      {isConnected && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full px-6 py-3 border-t border-border/50 flex items-center justify-between hover:bg-primary/5 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">
                {isOpen ? 'Ocultar configuración de activos' : 'Mostrar configuración de activos'}
              </span>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 pb-6 pt-4 border-t border-border/50">
              {loading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">Cargando activos de tu cuenta de Meta...</p>
                </div>
              ) : error ? (
                <div className="py-6 text-center">
                  <p className="text-destructive mb-4 text-sm">{error}</p>
                  <Button onClick={fetchAssets} size="sm">Reintentar</Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Business Manager */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      Gerente de Negocios
                    </Label>
                    <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {assets?.businesses.length === 0 && (
                          <SelectItem value="none" disabled>No disponible</SelectItem>
                        )}
                        {assets?.businesses.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ad Account */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      Cuenta Publicitaria
                    </Label>
                    <Select value={selectedAdAccount} onValueChange={setSelectedAdAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {assets?.adAccounts.length === 0 && (
                          <SelectItem value="none" disabled>No disponible</SelectItem>
                        )}
                        {assets?.adAccounts.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Facebook Page */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      Página de Facebook
                    </Label>
                    <Select value={selectedPage} onValueChange={setSelectedPage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {assets?.pages.length === 0 && (
                          <SelectItem value="none" disabled>No disponible</SelectItem>
                        )}
                        {assets?.pages.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pixel */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      Pixel de Meta
                    </Label>
                    <Select value={selectedPixel} onValueChange={setSelectedPixel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {filteredPixels.length === 0 && (
                          <SelectItem value="none" disabled>No disponible</SelectItem>
                        )}
                        {filteredPixels.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      Cuenta de WhatsApp
                    </Label>
                    <Select value={selectedWhatsApp} onValueChange={setSelectedWhatsApp}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {assets?.whatsappAccounts.length === 0 && (
                          <SelectItem value="none" disabled>No disponible</SelectItem>
                        )}
                        {assets?.whatsappAccounts.map(w => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name} {w.phones[0]?.number && `(${w.phones[0].number})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Website URL */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      URL del Sitio Web
                    </Label>
                    <Input 
                      type="url"
                      placeholder="https://tusitio.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="md:col-span-2 pt-4">
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Guardar Configuración'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default MetaAccountSlot;
