import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MetaAccountSlot from '@/components/MetaAccountSlot';
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  Building2, 
  Megaphone, 
  BarChart3, 
  User, 
  CreditCard, 
  Bell,
  LogOut,
  Loader2,
  ChevronRight,
  Sparkles,
  Shield,
  Settings,
  Users,
  Lock,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>('trial');
  const [isMetaConnected, setIsMetaConnected] = useState(false);
  const [isBusinessConfigured, setIsBusinessConfigured] = useState(false);
  const [connectingMeta, setConnectingMeta] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const { data, error } = await supabase
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

  // Check if Meta Ads is connected
  useEffect(() => {
    const checkMetaConnection = async () => {
      if (user) {
        const { data } = await supabase
          .from('meta_ads_tokens')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsMetaConnected(!!data);
      }
    };
    checkMetaConnection();
  }, [user]);

  // Check if business is configured
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

  const handleConnectMeta = async () => {
    if (!user) return;
    
    setConnectingMeta(true);
    try {
      const { data, error } = await supabase.functions.invoke('meta-oauth-start', {
        body: { state: user.id }
      });

      if (error) {
        console.error('Error starting Meta OAuth:', error);
        toast.error('Error al iniciar conexión con Meta');
        return;
      }

      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      console.error('Error connecting to Meta:', err);
      toast.error('Error al conectar con Meta Ads');
    } finally {
      setConnectingMeta(false);
    }
  };

  const handleDisconnect = () => {
    setIsMetaConnected(false);
    setIsBusinessConfigured(false);
  };

  const handleConfigSaved = () => {
    setIsBusinessConfigured(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
    { icon: LinkIcon, label: 'Conectar cuenta', href: '#connect', locked: false },
    { icon: Building2, label: 'Configurar empresa', href: '/configure-company', locked: !isBusinessConfigured },
    { icon: Megaphone, label: 'Campañas de venta', href: '#campaigns', locked: true },
    { icon: BarChart3, label: 'Estrategias activas', href: '#strategies', locked: true },
  ];

  const adminItems = [
    { icon: Brain, label: 'Entrenamiento IA', href: '/admin/ai-training' },
    { icon: Users, label: 'Gestionar usuarios', href: '#users' },
    { icon: Settings, label: 'Configuración', href: '#settings' },
  ];

  const accountItems = [
    { icon: User, label: 'Mi perfil', href: '#profile' },
    { icon: CreditCard, label: 'Facturación', href: '#billing' },
    { icon: Bell, label: 'Novedades', href: '#news' },
  ];

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col flex-shrink-0 overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Kai Ads Pro</h1>
              <p className="text-xs text-muted-foreground">Mi negocio</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Menú
          </p>
          {menuItems.map((item) => {
            const isLocked = item.locked;
            const handleClick = (e: React.MouseEvent) => {
              if (isLocked) {
                e.preventDefault();
                toast.info('Completa la configuración de empresa primero');
              } else if (item.href.startsWith('/')) {
                e.preventDefault();
                navigate(item.href);
              }
            };
            
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={handleClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isLocked 
                    ? 'text-muted-foreground/50 cursor-not-allowed' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                }`}
              >
                <item.icon className={`w-5 h-5 ${!isLocked && 'group-hover:text-primary'} transition-colors`} />
                <span>{item.label}</span>
                {isLocked ? (
                  <Lock className="w-4 h-4 ml-auto text-muted-foreground/50" />
                ) : (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </a>
            );
          })}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3 mt-4">
                <Shield className="w-3 h-3 inline mr-1" />
                Administrador
              </p>
              {adminItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith('/')) {
                      e.preventDefault();
                      navigate(item.href);
                    }
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all group"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </>
          )}
        </nav>

        {/* Account Section */}
        <div className="p-4 border-t border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Cuenta
          </p>
          {accountItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
              <span>{item.label}</span>
            </a>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.user_metadata?.full_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              isAdmin 
                ? 'bg-amber-500/20 text-amber-400' 
                : 'bg-primary/20 text-primary'
            }`}>
              {isAdmin ? 'Admin' : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Conectar Cuentas de Meta</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona tus cuentas de Meta Ads. Puedes conectar hasta 3 cuentas.
            </p>
          </header>

          {/* Account Slots */}
          <div className="space-y-4" id="connect">
            {/* Slot 1 - Active */}
            <MetaAccountSlot
              slotNumber={1}
              isConnected={isMetaConnected}
              onConnectMeta={handleConnectMeta}
              onDisconnect={handleDisconnect}
              onConfigSaved={handleConfigSaved}
              connecting={connectingMeta}
            />

            {/* Slot 2 - Disabled for now */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-6 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                    <LinkIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-muted-foreground">Cuenta Meta #2</h3>
                    <p className="text-muted-foreground text-sm">Próximamente disponible</p>
                  </div>
                </div>
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Slot 3 - Disabled for now */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-6 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                    <LinkIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-muted-foreground">Cuenta Meta #3</h3>
                    <p className="text-muted-foreground text-sm">Próximamente disponible</p>
                  </div>
                </div>
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-8 bg-primary/10 border border-primary/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Importante</h3>
                <p className="text-muted-foreground text-sm">
                  Después de conectar tu cuenta y guardar la configuración, se desbloqueará la opción 
                  <strong className="text-foreground"> "Configurar empresa"</strong> en el menú lateral, 
                  donde podrás definir la estrategia de marketing de tu negocio.
                </p>
              </div>
            </div>
          </div>

          {/* Admin/Trial Banner */}
          <div className="mt-6">
            {isAdmin ? (
              <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 border border-amber-500/30 rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-amber-400">
                    <Shield className="w-5 h-5" />
                    Modo Administrador
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Tienes acceso completo a todas las funcionalidades
                  </p>
                </div>
                <span className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full font-semibold">
                  Acceso Total
                </span>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Estás en modo de prueba
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Actualiza a Pro para desbloquear todas las funcionalidades
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Ser Pro
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
