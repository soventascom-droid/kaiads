import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2, CreditCard, FileText, MessageCircle, Globe, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MetaAssets {
  businesses: { id: string; name: string }[];
  adAccounts: { id: string; name: string; account_id: string }[];
  pages: { id: string; name: string }[];
  pixels: { id: string; name: string; ad_account_id: string }[];
  whatsappAccounts: { id: string; name: string; phones: { number: string; name: string }[] }[];
}

interface BusinessConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved: () => void;
}

const BusinessConfigModal = ({ open, onOpenChange, onConfigSaved }: BusinessConfigModalProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState<MetaAssets | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedAdAccount, setSelectedAdAccount] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [selectedPixel, setSelectedPixel] = useState('');
  const [selectedWhatsApp, setSelectedWhatsApp] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  useEffect(() => {
    if (open) {
      fetchAssets();
    }
  }, [open]);

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
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-6 h-6 text-primary" />
            Configurar Activos de Meta
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando activos de tu cuenta de Meta...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchAssets}>Reintentar</Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Business Manager */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Gerente de Negocios
              </Label>
              <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Business Manager" />
                </SelectTrigger>
                <SelectContent>
                  {assets?.businesses.length === 0 && (
                    <SelectItem value="none" disabled>No hay Business Managers disponibles</SelectItem>
                  )}
                  {assets?.businesses.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ad Account */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                Cuenta Publicitaria
              </Label>
              <Select value={selectedAdAccount} onValueChange={setSelectedAdAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta publicitaria" />
                </SelectTrigger>
                <SelectContent>
                  {assets?.adAccounts.length === 0 && (
                    <SelectItem value="none" disabled>No hay cuentas publicitarias</SelectItem>
                  )}
                  {assets?.adAccounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Facebook Page */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Página de Facebook
              </Label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar página" />
                </SelectTrigger>
                <SelectContent>
                  {assets?.pages.length === 0 && (
                    <SelectItem value="none" disabled>No hay páginas disponibles</SelectItem>
                  )}
                  {assets?.pages.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pixel */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                Pixel de Meta
              </Label>
              <Select value={selectedPixel} onValueChange={setSelectedPixel}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar pixel" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPixels.length === 0 && (
                    <SelectItem value="none" disabled>No hay pixels disponibles</SelectItem>
                  )}
                  {filteredPixels.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                Cuenta de WhatsApp
              </Label>
              <Select value={selectedWhatsApp} onValueChange={setSelectedWhatsApp}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta de WhatsApp" />
                </SelectTrigger>
                <SelectContent>
                  {assets?.whatsappAccounts.length === 0 && (
                    <SelectItem value="none" disabled>No hay cuentas de WhatsApp</SelectItem>
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
              <Label className="flex items-center gap-2">
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BusinessConfigModal;
