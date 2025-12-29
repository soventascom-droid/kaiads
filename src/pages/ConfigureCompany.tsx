import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, Globe, Target, 
  Palette, TrendingUp, Users, Sparkles, 
  FileText, BarChart3, Eye,
  LayoutDashboard, 
  Link as LinkIcon, 
  Building2, 
  Megaphone, 
  User, 
  CreditCard, 
  Bell,
  LogOut,
  Loader2,
  ChevronRight,
  Shield,
  Settings,
  Lock
} from 'lucide-react';

// Mock data for visual purposes
const mockAccounts = [
  { id: '1', name: 'Mi Negocio Principal' },
  { id: '2', name: 'Tienda Online' },
];

const ConfigureCompany = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState('1');
  const [showResults, setShowResults] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>('trial');
  const [isBusinessConfigured, setIsBusinessConfigured] = useState(false);

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

  const handleAnalyze = () => {
    setShowResults(true);
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
    { icon: Building2, label: 'Configurar empresa', href: '/configure-company', locked: false, active: true },
    { icon: Megaphone, label: 'Campañas de venta', href: '#campaigns', locked: true },
    { icon: BarChart3, label: 'Estrategias activas', href: '#strategies', locked: true },
  ];

  const adminItems = [
    { icon: Users, label: 'Gestionar usuarios', href: '#users' },
    { icon: Settings, label: 'Configuración', href: '#settings' },
  ];

  const accountItems = [
    { icon: User, label: 'Mi perfil', href: '#profile' },
    { icon: CreditCard, label: 'Facturación', href: '#billing' },
    { icon: Bell, label: 'Novedades', href: '#news' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col">
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
            const isActive = item.active;
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
                  isActive 
                    ? 'bg-primary/20 text-primary' 
                    : isLocked 
                      ? 'text-muted-foreground/50 cursor-not-allowed' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : !isLocked && 'group-hover:text-primary'} transition-colors`} />
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
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Configuración de Empresa</h1>
                <p className="text-muted-foreground mt-2">
                  Sube la información de tu negocio para que la IA genere tu estrategia
                </p>
              </div>
              {/* Account Selector */}
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-64 h-12">
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {mockAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>

          {!showResults ? (
            <div className="space-y-6">
              {/* PDF Upload Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Información de la Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-primary/5">
                    <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
                      <DialogTrigger asChild>
                        <Button size="lg" className="gap-3 text-lg px-8 h-14">
                          <Upload className="w-6 h-6" />
                          Cargar información de mi empresa (PDF)
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Requisitos del Documento
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <p className="text-muted-foreground">
                            Para un análisis óptimo, tu documento debe incluir información sobre:
                          </p>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">1</span>
                              </div>
                              <span><strong>Diferenciación:</strong> ¿Qué te hace único frente a la competencia?</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">2</span>
                              </div>
                              <span><strong>Cliente ideal:</strong> ¿A quién le vendes principalmente?</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">3</span>
                              </div>
                              <span><strong>Problema:</strong> ¿Qué problema resuelves para tus clientes?</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">4</span>
                              </div>
                              <span><strong>Producto/Servicio:</strong> ¿Qué ofreces exactamente?</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">5</span>
                              </div>
                              <span><strong>Tono de comunicación:</strong> ¿Cómo hablas con tus clientes?</span>
                            </li>
                          </ul>
                          <div className="pt-4 border-t border-border">
                            <Label htmlFor="pdf-upload" className="text-sm font-medium">Subir archivo PDF</Label>
                            <div className="mt-2 flex gap-3">
                              <Input id="pdf-upload" type="file" accept=".pdf" className="flex-1 h-12" />
                              <Button className="h-12" onClick={() => setPdfModalOpen(false)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Subir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <p className="text-muted-foreground mt-4">
                      Sube un documento con información de tu negocio para un análisis más preciso
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Segmentation Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Segmentación Geográfica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>País</Label>
                      <Select defaultValue="co">
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Seleccionar país" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="co">Colombia</SelectItem>
                          <SelectItem value="mx">México</SelectItem>
                          <SelectItem value="ar">Argentina</SelectItem>
                          <SelectItem value="es">España</SelectItem>
                          <SelectItem value="us">Estados Unidos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ciudad</Label>
                      <Select defaultValue="bog">
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Seleccionar ciudad" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="bog">Bogotá</SelectItem>
                          <SelectItem value="med">Medellín</SelectItem>
                          <SelectItem value="cal">Cali</SelectItem>
                          <SelectItem value="bar">Barranquilla</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button size="lg" className="w-full h-14 text-lg mt-4" onClick={handleAnalyze}>
                    <Sparkles className="w-5 h-5 mr-2" />
                    ANALIZAR
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Results Dashboard - Mock */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Resultados del Análisis</h2>
                <Button variant="outline" onClick={() => setShowResults(false)}>
                  Volver
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* A. PRESENTACIÓN */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      A. PRESENTACIÓN
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><strong>Nombre:</strong> Mi Empresa S.A.S</div>
                    <div><strong>Venta:</strong> Lorem ipsum dolor sit amet consectetur adipiscing elit.</div>
                    <div><strong>Atractivo:</strong> Sed do eiusmod tempor incididunt ut labore.</div>
                    <div><strong>Unicidad:</strong> Ut enim ad minim veniam quis nostrud.</div>
                    <div><strong>Ventajas:</strong> Excepteur sint occaecat cupidatat non proident.</div>
                  </CardContent>
                </Card>

                {/* B. PÚBLICO */}
                <Card className="bg-card/50 backdrop-blur-sm border-accent/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent" />
                      B. PÚBLICO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><strong>Problemas:</strong> Duis aute irure dolor in reprehenderit in voluptate.</div>
                    <div><strong>Intereses:</strong> Fitness, Tecnología, Emprendimiento, Viajes</div>
                    <div><strong>Países:</strong> Colombia, México, Argentina, España</div>
                  </CardContent>
                </Card>

                {/* C. VALOR AGREGADO */}
                <Card className="bg-card/50 backdrop-blur-sm border-green-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      C. VALOR AGREGADO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><strong>Palabras clave:</strong> innovación, calidad, confianza, resultados</div>
                    <div><strong>Frases:</strong> "Transforma tu negocio", "Resultados garantizados", "Expertos en tu industria"</div>
                  </CardContent>
                </Card>

                {/* D. IDENTIDAD VISUAL */}
                <Card className="bg-card/50 backdrop-blur-sm border-purple-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-500" />
                      D. IDENTIDAD VISUAL
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><strong>Paletas de color:</strong></div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded bg-blue-500" />
                      <div className="w-8 h-8 rounded bg-purple-500" />
                      <div className="w-8 h-8 rounded bg-pink-500" />
                      <div className="w-8 h-8 rounded bg-orange-500" />
                    </div>
                    <div><strong>Estilo:</strong> Moderno, Minimalista, Profesional</div>
                  </CardContent>
                </Card>

                {/* E. ANÁLISIS REDES */}
                <Card className="bg-card/50 backdrop-blur-sm border-blue-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      E. ANÁLISIS REDES
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><strong>Contenido top:</strong> Videos cortos, Carruseles, Stories interactivas</div>
                    <div><strong>Probabilidad de éxito:</strong> 78%</div>
                    <div><strong>Competencia:</strong> Media-Alta en tu sector</div>
                  </CardContent>
                </Card>

                {/* F. ESTRATEGIA */}
                <Card className="bg-card/50 backdrop-blur-sm border-orange-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      F. ESTRATEGIA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><strong>Objetivo:</strong> Conversiones con enfoque en leads calificados</div>
                    <div><strong>CTA recomendado:</strong> "Agenda tu consulta gratis"</div>
                    <div><strong>Perfil ideal:</strong> Profesionales 25-45 años con poder adquisitivo medio-alto</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ConfigureCompany;
