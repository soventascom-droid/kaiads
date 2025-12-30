import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, Globe, Target, 
  Palette, TrendingUp, Users, Sparkles, 
  FileText, BarChart3, Eye,
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
  Lock,
  CheckCircle2,
  Trash2,
  Save,
  Search
} from 'lucide-react';

// Mock accounts with configuration status
const mockAccounts = [
  { id: '1', name: 'Cuenta 1', hasData: true },
  { id: '2', name: 'Cuenta 2', hasData: false },
  { id: '3', name: 'Cuenta 3', hasData: false },
];

// Mock results data
const mockResultsData = {
  presentacion: {
    nombre: 'TechFlow Solutions',
    venta: 'Software de automatización empresarial para PyMEs que buscan optimizar sus procesos operativos.',
    atractivo: 'Interfaz intuitiva que reduce el tiempo de implementación en un 60%.',
    unicidad: 'Único sistema que integra IA predictiva con automatización de flujos de trabajo.',
    ventajas: 'Soporte 24/7, actualizaciones gratuitas, integración con +50 herramientas.'
  },
  publico: {
    problemas: 'Pérdida de tiempo en tareas repetitivas, errores humanos en procesos, falta de visibilidad de métricas clave.',
    intereses: 'Productividad, Tecnología, Emprendimiento, Eficiencia operativa',
    paises: 'Colombia, México, Argentina, Chile, Perú'
  },
  valorAgregado: {
    palabrasClave: 'automatización, eficiencia, innovación, productividad, resultados',
    frases: '"Automatiza hoy, crece mañana", "Tu tiempo vale más", "Resultados en semanas, no meses"'
  },
  identidadVisual: {
    paletaActual: ['#6366f1', '#8b5cf6', '#a855f7', '#3b82f6'],
    paletaRecomendada: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b'],
    estilo: 'Moderno, Tecnológico, Profesional',
    tema: 'Minimalista con acentos vibrantes'
  },
  analisisRedes: {
    contenidoTop: 'Videos explicativos, Casos de éxito, Tips rápidos, Webinars',
    probabilidadExito: '82%',
    competencia: 'Media-Alta (12 competidores directos identificados)'
  },
  estrategia: {
    objetivo: 'Generación de leads calificados con enfoque en demos gratuitas',
    cta: '"Agenda tu demo gratuita" / "Prueba 14 días gratis"',
    perfilVenta: 'Gerentes y directores de operaciones, 30-50 años, empresas 10-200 empleados'
  }
};

const loadingMessages = [
  'La IA de KAI está trabajando...',
  'Analizando información del negocio...',
  'Identificando público objetivo...',
  'Generando estrategia de marketing...',
  'Analizando competencia...',
  'Finalizando análisis...'
];

const ConfigureCompany = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState('1');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>('trial');
  const [isBusinessConfigured, setIsBusinessConfigured] = useState(false);
  
  // Wizard states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Loading modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  
  // Account data state (simulated)
  const [accountsData, setAccountsData] = useState<Record<string, boolean>>({
    '1': true, // Cuenta 1 has data
    '2': false,
    '3': false
  });

  const currentAccountHasData = accountsData[selectedAccount] || false;

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

  // Loading animation effect
  useEffect(() => {
    if (isProcessing && !processingComplete) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => {
          if (prev < loadingMessages.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 700);
      
      // Complete after 4 seconds
      const timeout = setTimeout(() => {
        setProcessingComplete(true);
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingComplete(false);
          setLoadingMessageIndex(0);
          setAccountsData(prev => ({ ...prev, [selectedAccount]: true }));
          toast.success('Análisis completado exitosamente');
        }, 1000);
      }, 4000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isProcessing, processingComplete, selectedAccount]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleConfigure = () => {
    if (!selectedCountry) {
      toast.error('Por favor selecciona un país');
      return;
    }
    setIsProcessing(true);
  };

  const handleDeleteData = () => {
    setAccountsData(prev => ({ ...prev, [selectedAccount]: false }));
    setUploadedFile(null);
    setSelectedCountry('');
    setSelectedCity('');
    toast.success('Información eliminada correctamente');
  };

  const handleSave = () => {
    toast.success('Configuración guardada correctamente');
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

  const countries = [
    { code: 'co', name: 'Colombia', cities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'] },
    { code: 'mx', name: 'México', cities: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'] },
    { code: 'ar', name: 'Argentina', cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'] },
    { code: 'es', name: 'España', cities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'] },
    { code: 'us', name: 'Estados Unidos', cities: ['Nueva York', 'Los Angeles', 'Chicago', 'Miami', 'Houston'] },
  ];

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Configurar Empresa</h1>
                  <p className="text-muted-foreground">
                    Sube la información de tu negocio para que la IA genere tu estrategia
                  </p>
                </div>
              </div>
              {/* Account Selector */}
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {mockAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <div className="flex items-center gap-2">
                        <span>{acc.name}</span>
                        {accountsData[acc.id] && (
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>

          {/* STATE 1: Loading Form */}
          {!currentAccountHasData ? (
            <div className="space-y-6 animate-fade-in">
              {/* Card A: Document Requirements */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="w-6 h-6 text-primary" />
                    Requisitos del Documento
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">
                    Para un análisis óptimo, tu documento debe incluir información sobre:
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">¿Qué te hace único frente a la competencia?</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">¿A quién le vendes principalmente?</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">¿Qué problema resuelves?</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">¿Qué ofreces exactamente?</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 md:col-span-2 md:w-1/2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">¿Cómo hablas con tus clientes?</span>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 bg-primary/5 transition-all hover:border-primary/50 hover:bg-primary/10">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Arrastra tu archivo PDF aquí</p>
                        <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
                      </div>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="max-w-xs h-12 cursor-pointer"
                      />
                      {uploadedFile && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-medium">{uploadedFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card B: Geographic Segmentation */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Globe className="w-6 h-6 text-accent" />
                    Segmentación Geográfica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Country Select */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">País</Label>
                      <Select value={selectedCountry} onValueChange={(val) => {
                        setSelectedCountry(val);
                        setSelectedCity('');
                      }}>
                        <SelectTrigger className="h-12 w-full">
                          <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Buscar país..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {countries.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City Select */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Ciudad</Label>
                      <Select 
                        value={selectedCity} 
                        onValueChange={setSelectedCity}
                        disabled={!selectedCountry}
                      >
                        <SelectTrigger className={`h-12 w-full ${!selectedCountry ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder={selectedCountry ? "Seleccionar ciudad..." : "Primero selecciona un país"} />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {selectedCountryData?.cities.map(city => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Action Button */}
              <Button 
                size="lg" 
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                onClick={handleConfigure}
              >
                <Sparkles className="w-6 h-6 mr-3" />
                CONFIGURAR
              </Button>
            </div>
          ) : (
            /* STATE 2: Results Dashboard */
            <div className="space-y-6 animate-fade-in">
              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* A. PRESENTACIÓN */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-primary/30 hover:border-primary/50 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-primary">
                      <Eye className="w-5 h-5" />
                      PRESENTACIÓN
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><span className="text-muted-foreground">Nombre:</span> <span className="text-foreground font-medium">{mockResultsData.presentacion.nombre}</span></div>
                    <div><span className="text-muted-foreground">Qué vende:</span> <span className="text-foreground">{mockResultsData.presentacion.venta}</span></div>
                    <div><span className="text-muted-foreground">Atractivo:</span> <span className="text-foreground">{mockResultsData.presentacion.atractivo}</span></div>
                    <div><span className="text-muted-foreground">Unicidad:</span> <span className="text-foreground">{mockResultsData.presentacion.unicidad}</span></div>
                    <div><span className="text-muted-foreground">Ventajas:</span> <span className="text-foreground">{mockResultsData.presentacion.ventajas}</span></div>
                  </CardContent>
                </Card>

                {/* B. PÚBLICO */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-accent/30 hover:border-accent/50 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-accent">
                      <Users className="w-5 h-5" />
                      PÚBLICO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><span className="text-muted-foreground">Problemas:</span> <span className="text-foreground">{mockResultsData.publico.problemas}</span></div>
                    <div><span className="text-muted-foreground">Intereses:</span> <span className="text-foreground">{mockResultsData.publico.intereses}</span></div>
                    <div><span className="text-muted-foreground">Países impacto:</span> <span className="text-foreground">{mockResultsData.publico.paises}</span></div>
                  </CardContent>
                </Card>

                {/* C. VALOR AGREGADO */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-green-500/30 hover:border-green-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-500">
                      <Sparkles className="w-5 h-5" />
                      VALOR AGREGADO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><span className="text-muted-foreground">Palabras clave:</span> <span className="text-foreground">{mockResultsData.valorAgregado.palabrasClave}</span></div>
                    <div><span className="text-muted-foreground">Frases inspiradoras:</span> <span className="text-foreground italic">{mockResultsData.valorAgregado.frases}</span></div>
                  </CardContent>
                </Card>

                {/* D. IDENTIDAD VISUAL */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-purple-500/30 hover:border-purple-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-purple-500">
                      <Palette className="w-5 h-5" />
                      IDENTIDAD VISUAL
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Paleta actual:</span>
                      <div className="flex gap-2 mt-1">
                        {mockResultsData.identidadVisual.paletaActual.map((color, i) => (
                          <div key={i} className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paleta recomendada:</span>
                      <div className="flex gap-2 mt-1">
                        {mockResultsData.identidadVisual.paletaRecomendada.map((color, i) => (
                          <div key={i} className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                    <div><span className="text-muted-foreground">Estilo:</span> <span className="text-foreground">{mockResultsData.identidadVisual.estilo}</span></div>
                    <div><span className="text-muted-foreground">Tema:</span> <span className="text-foreground">{mockResultsData.identidadVisual.tema}</span></div>
                  </CardContent>
                </Card>

                {/* E. ANÁLISIS REDES */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-blue-500/30 hover:border-blue-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-500">
                      <BarChart3 className="w-5 h-5" />
                      ANÁLISIS REDES
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><span className="text-muted-foreground">Contenido Top:</span> <span className="text-foreground">{mockResultsData.analisisRedes.contenidoTop}</span></div>
                    <div><span className="text-muted-foreground">Probabilidad éxito:</span> <span className="text-green-400 font-bold">{mockResultsData.analisisRedes.probabilidadExito}</span></div>
                    <div><span className="text-muted-foreground">Competencia:</span> <span className="text-foreground">{mockResultsData.analisisRedes.competencia}</span></div>
                  </CardContent>
                </Card>

                {/* F. ESTRATEGIA */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-500">
                      <TrendingUp className="w-5 h-5" />
                      ESTRATEGIA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div><span className="text-muted-foreground">Objetivo:</span> <span className="text-foreground">{mockResultsData.estrategia.objetivo}</span></div>
                    <div><span className="text-muted-foreground">CTA:</span> <span className="text-foreground font-medium">{mockResultsData.estrategia.cta}</span></div>
                    <div><span className="text-muted-foreground">Perfil venta:</span> <span className="text-foreground">{mockResultsData.estrategia.perfilVenta}</span></div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleDeleteData}
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  ELIMINAR INFORMACIÓN
                </Button>
                <Button
                  size="lg"
                  className="h-12 px-8 bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                >
                  <Save className="w-5 h-5 mr-2" />
                  GUARDAR
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Loading Modal */}
      <Dialog open={isProcessing} onOpenChange={() => {}}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 max-w-md [&>button]:hidden">
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <h2 className="text-xl font-bold text-center">
              Generando información de la empresa
            </h2>
            
            {!processingComplete ? (
              <>
                {/* Animated Spinner */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                
                {/* Changing Text */}
                <p className="text-muted-foreground text-center animate-pulse min-h-[24px]">
                  {loadingMessages[loadingMessageIndex]}
                </p>
              </>
            ) : (
              <>
                {/* Success Check */}
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-green-400 font-medium">¡Análisis completado!</p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfigureCompany;
