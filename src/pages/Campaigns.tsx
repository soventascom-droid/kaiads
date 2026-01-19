import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Link as LinkIcon, 
  Building2, 
  Megaphone, 
  BarChart3,
  User, 
  CreditCard, 
  Bell,
  LogOut,
  Loader2,
  Shield,
  Settings,
  Lock,
  Rocket,
  Send
} from 'lucide-react';

const Campaigns = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>('trial');
  const [isBusinessConfigured, setIsBusinessConfigured] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (data && data.length > 0) {
          const roles = data.map(r => r.role);
          setIsAdmin(roles.includes('admin'));
          setUserRole(roles.includes('admin') ? 'admin' : roles[0] || 'trial');
        }
      }
    };
    checkUserRole();
  }, [user]);

  useEffect(() => {
    const checkBusinessConfig = async () => {
      if (user) {
        const { data } = await supabase
          .from('business_configurations')
          .select('is_configured')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsBusinessConfigured(data?.is_configured || false);
      }
    };
    checkBusinessConfig();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLaunchTestCampaign = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setIsSendingTest(true);

    try {
      // Fetch user's Meta token and ad account
      const { data: tokenData, error: tokenError } = await supabase
        .from('meta_ads_tokens')
        .select('access_token')
        .eq('user_id', user.id)
        .maybeSingle();

      if (tokenError || !tokenData?.access_token) {
        toast.error('No se encontró el token de Facebook. Conecta tu cuenta primero.');
        setIsSendingTest(false);
        return;
      }

      // Fetch business configuration for ad_account_id
      const { data: configData, error: configError } = await supabase
        .from('business_configurations')
        .select('ad_account_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (configError || !configData?.ad_account_id) {
        toast.error('No se encontró la cuenta publicitaria. Configura tu cuenta primero.');
        setIsSendingTest(false);
        return;
      }

      // Prepare payload for Make webhook
      const payload = {
        access_token: tokenData.access_token,
        ad_account_id: configData.ad_account_id,
        campaign_name: 'Campaña Prueba Lovable',
        objective: 'OUTCOME_SALES',
        status: 'PAUSED'
      };

      // Send to Make webhook
      const response = await fetch('https://hook.us2.make.com/mdldznf4zmti6swziyci89mx6yfnpoif', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('¡Campaña de prueba enviada a Make exitosamente!');
      } else {
        const errorText = await response.text();
        console.error('Make webhook error:', errorText);
        toast.error('Error al enviar la campaña de prueba');
      }
    } catch (error) {
      console.error('Error launching test campaign:', error);
      toast.error('Error al lanzar la campaña de prueba');
    } finally {
      setIsSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { icon: LinkIcon, label: 'Conectar cuenta', href: '/dashboard', locked: false },
    { icon: Building2, label: 'Configurar empresa', href: '/configure-company', locked: false },
    { icon: Megaphone, label: 'Campañas de venta', href: '/campaigns', locked: false, active: true },
    { icon: BarChart3, label: 'Estrategias activas', href: '/strategies', locked: !isBusinessConfigured },
  ];

  const adminItems = [
    { icon: Shield, label: 'Panel Admin', href: '/admin' },
    { icon: Settings, label: 'Entrenar IA', href: '/admin/ai-training' },
  ];

  const accountItems = [
    { icon: User, label: 'Mi Perfil', href: '#profile' },
    { icon: CreditCard, label: 'Facturación', href: '#billing' },
    { icon: Bell, label: 'Notificaciones', href: '#notifications' },
  ];

  const NavLink = ({ icon: Icon, label, href, locked = false, active = false }: { 
    icon: any; 
    label: string; 
    href: string; 
    locked?: boolean;
    active?: boolean;
  }) => (
    <a
      href={locked ? undefined : href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-primary/20 text-primary border-l-4 border-primary' 
          : locked 
            ? 'text-muted-foreground cursor-not-allowed opacity-50' 
            : 'text-foreground hover:bg-muted hover:text-primary'
      }`}
      onClick={(e) => {
        if (locked) {
          e.preventDefault();
          return;
        }
        if (href.startsWith('/')) {
          e.preventDefault();
          navigate(href);
        }
      }}
    >
      {locked ? <Lock className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
      <span className="font-medium">{label}</span>
    </a>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">KAI ADS PRO</h1>
              <p className="text-xs text-muted-foreground">Panel de Control</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">
            Principal
          </p>
          {menuItems.map((item) => (
            <NavLink key={item.label} {...item} />
          ))}

          {isAdmin && (
            <>
              <div className="my-4 border-t border-border" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">
                Administración
              </p>
              {adminItems.map((item) => (
                <NavLink key={item.label} {...item} />
              ))}
            </>
          )}

          <div className="my-4 border-t border-border" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">
            Cuenta
          </p>
          {accountItems.map((item) => (
            <NavLink key={item.label} {...item} />
          ))}
        </nav>

        {/* User info & logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                Plan: {userRole}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full mt-2 text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Campañas de Venta
            </h1>
            <p className="text-muted-foreground">
              Crea y gestiona tus campañas publicitarias en Meta Ads
            </p>
          </div>

          {/* Test Campaign Card */}
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Prueba de Integración con Make</CardTitle>
                  <CardDescription>
                    Envía una campaña de prueba a tu webhook de Make para verificar la integración
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                <p><strong>Datos que se enviarán:</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Token de acceso de Facebook (de tu sesión)</li>
                  <li>ID de cuenta publicitaria (configurada)</li>
                  <li>Nombre: "Campaña Prueba Lovable"</li>
                  <li>Objetivo: OUTCOME_SALES</li>
                  <li>Estado: PAUSED</li>
                </ul>
              </div>

              <Button 
                onClick={handleLaunchTestCampaign}
                disabled={isSendingTest}
                className="w-full sm:w-auto"
                size="lg"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Lanzar Campaña de Prueba
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Campaigns;
