import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUploadZone from '@/components/FileUploadZone';
import LocationSearch from '@/components/LocationSearch';
import { 
  Globe, Target, 
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
  Lightbulb,
  MessageSquare,
  Zap
} from 'lucide-react';

// Location type for the search component
interface Location {
  id: string;
  name: string;
  type: 'country' | 'city' | 'region';
  parent?: string;
}

// Types for AI analysis results
interface AnalysisResult {
  presentation: {
    company_name: string;
    what_sells: string;
    main_attraction: string;
    uniqueness: string;
    competitive_advantages: string[];
  };
  audience: {
    problems_solved: string[];
    direct_interests: string[];
    indirect_interests: string[];
    target_countries: string[];
    buyer_demographics: string;
  };
  value_proposition: {
    keywords: string[];
    inspiring_phrases: string[];
    emotional_hooks: string[];
  };
  visual_identity: {
    recommended_colors: Array<{
      hex: string;
      name: string;
      psychology: string;
    }>;
    visual_style: string;
    theme: string;
    imagery_recommendations: string;
  };
  social_analysis: {
    top_content_types: string[];
    success_probability: string;
    competition_level: string;
    recommended_platforms: string[];
    posting_frequency: string;
  };
  strategy: {
    main_objective: string;
    primary_cta: string;
    secondary_ctas: string[];
    sales_profile: string;
    funnel_stages: string[];
    budget_recommendation: string;
  };
}

// Mock accounts with configuration status
const mockAccounts = [
  { id: '1', name: 'Cuenta 1', hasData: true },
  { id: '2', name: 'Cuenta 2', hasData: false },
  { id: '3', name: 'Cuenta 3', hasData: false },
];

const loadingMessages = [
  'La IA de KAI está trabajando...',
  'Analizando información del negocio...',
  'Identificando público objetivo...',
  'Segmentando intereses directos e indirectos...',
  'Generando paleta de colores...',
  'Construyendo estrategia de marketing...',
  'Finalizando análisis profundo...'
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
  const [businessInfo, setBusinessInfo] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  
  // Loading modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  
  // Analysis results
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult | null>>({
    '1': null,
    '2': null,
    '3': null
  });

  const currentAccountData = analysisResults[selectedAccount];

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
      }, 800);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [isProcessing, processingComplete]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
    if (file) {
      setBusinessInfo(`Documento cargado: ${file.name}`);
    } else {
      setBusinessInfo('');
    }
  };

  const handleConfigure = async () => {
    if (selectedLocations.length === 0) {
      toast.error('Por favor selecciona al menos una ubicación');
      return;
    }
    
    setIsProcessing(true);
    setLoadingMessageIndex(0);
    setProcessingComplete(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session');
      }

      // Format locations for the API
      const locationNames = selectedLocations.map(loc => 
        loc.parent ? `${loc.name}, ${loc.parent}` : loc.name
      ).join('; ');
      
      const response = await supabase.functions.invoke('analyze-business-pdf', {
        body: {
          businessInfo: businessInfo || `Empresa buscando expandir su presencia digital y aumentar ventas a través de publicidad en Meta.`,
          country: locationNames,
          city: ''
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { analysis } = response.data;
      
      setProcessingComplete(true);
      
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingComplete(false);
        setLoadingMessageIndex(0);
        setAnalysisResults(prev => ({ ...prev, [selectedAccount]: analysis }));
        toast.success('Análisis completado exitosamente');
      }, 1500);

    } catch (error) {
      console.error('Error analyzing business:', error);
      setIsProcessing(false);
      setProcessingComplete(false);
      toast.error('Error al analizar. Por favor intenta de nuevo.');
    }
  };

  const handleDeleteData = () => {
    setAnalysisResults(prev => ({ ...prev, [selectedAccount]: null }));
    setUploadedFile(null);
    setSelectedLocations([]);
    setBusinessInfo('');
    toast.success('Información eliminada correctamente');
  };

  const handleSave = async () => {
    if (!user || !currentAccountData) {
      toast.error('No hay datos para guardar');
      return;
    }

    try {
      // Check if configuration already exists
      const { data: existing } = await supabase
        .from('business_configurations')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing configuration
        const { error } = await supabase
          .from('business_configurations')
          .update({ is_configured: true, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new configuration
        const { error } = await supabase
          .from('business_configurations')
          .insert({ user_id: user.id, is_configured: true });

        if (error) throw error;
      }

      setIsBusinessConfigured(true);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Error al guardar la configuración');
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
    { icon: Building2, label: 'Configurar empresa', href: '/configure-company', locked: false, active: true },
    { icon: Megaphone, label: 'Campañas de venta', href: '#campaigns', locked: !isBusinessConfigured },
    { icon: BarChart3, label: 'Estrategias activas', href: '#strategies', locked: !isBusinessConfigured },
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

  // Color swatch component
  const ColorSwatch = ({ hex, name, psychology }: { hex: string; name: string; psychology: string }) => (
    <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background/50">
      <div 
        className="w-12 h-12 rounded-full border-2 border-border shadow-lg"
        style={{ backgroundColor: hex }}
      />
      <span className="text-xs font-mono text-muted-foreground">{hex}</span>
      <span className="text-xs font-medium text-foreground">{name}</span>
      <span className="text-xs text-muted-foreground text-center leading-tight">{psychology}</span>
    </div>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col flex-shrink-0 overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold">
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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Configurar Empresa</h1>
                  <p className="text-muted-foreground">
                    Análisis profundo de marketing con IA
                  </p>
                </div>
              </div>
              {/* Account Selector */}
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-48 h-12 border-primary/30">
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {mockAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <div className="flex items-center gap-2">
                        <span>{acc.name}</span>
                        {analysisResults[acc.id] && (
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
          {!currentAccountData ? (
            <div className="space-y-6 animate-fade-in">
              {/* Card A: Document Requirements */}
              <Card className="bg-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <FileText className="w-6 h-6" />
                    Requisitos del Documento
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">
                    Para un análisis óptimo, tu documento debe incluir información sobre:
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Checklist */}
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      '¿Qué te hace único frente a la competencia?',
                      '¿A quién le vendes principalmente?',
                      '¿Qué problema resuelves?',
                      '¿Qué ofreces exactamente?',
                      '¿Cómo hablas con tus clientes?'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* File Upload Zone */}
                  <FileUploadZone
                    onFileChange={handleFileUpload}
                    uploadedFile={uploadedFile}
                    accept=".pdf"
                  />
                </CardContent>
              </Card>

              {/* Card B: Geographic Segmentation - Meta Ads Style */}
              <Card className="bg-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <Globe className="w-6 h-6" />
                    Segmentación Geográfica
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">
                    Selecciona uno o más lugares donde quieres anunciarte
                  </p>
                </CardHeader>
                <CardContent>
                  <LocationSearch
                    selectedLocations={selectedLocations}
                    onLocationsChange={setSelectedLocations}
                    placeholder="Buscar lugares (países, ciudades, regiones)..."
                  />
                </CardContent>
              </Card>

              {/* Main Action Button */}
              <Button 
                size="lg" 
                className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 transition-all shadow-lg"
                onClick={handleConfigure}
              >
                <Sparkles className="w-6 h-6 mr-3" />
                CONFIGURAR
              </Button>
            </div>
          ) : (
            /* STATE 2: Results Dashboard - Full Width Vertical Cards */
            <div className="space-y-6 animate-fade-in">
              
              {/* PRESENTACIÓN */}
              <Card className="bg-card border-primary/30">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-xl flex items-center gap-3 text-primary">
                    <Eye className="w-6 h-6" />
                    PRESENTACIÓN
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Nombre de la Empresa</span>
                    <p className="text-lg font-semibold">{currentAccountData.presentation.company_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Qué Vende</span>
                    <p className="text-foreground leading-relaxed">{currentAccountData.presentation.what_sells}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Atractivo Principal</span>
                    <p className="text-foreground leading-relaxed">{currentAccountData.presentation.main_attraction}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Unicidad</span>
                    <p className="text-foreground leading-relaxed">{currentAccountData.presentation.uniqueness}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Ventajas Competitivas</span>
                    <ul className="space-y-2">
                      {currentAccountData.presentation.competitive_advantages.map((adv, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* PÚBLICO */}
              <Card className="bg-card border-primary/30">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-xl flex items-center gap-3 text-primary">
                    <Users className="w-6 h-6" />
                    PÚBLICO OBJETIVO
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Problemas que Resuelve</span>
                    <ul className="space-y-2">
                      {currentAccountData.audience.problems_solved.map((problem, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground">
                          <Target className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <span>{problem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground font-medium">Intereses Directos (10)</span>
                      <ul className="space-y-1">
                        {currentAccountData.audience.direct_interests.map((interest, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>{interest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground font-medium">Intereses Indirectos (10)</span>
                      <ul className="space-y-1">
                        {currentAccountData.audience.indirect_interests.map((interest, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            <span>{interest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Demografía del Comprador</span>
                    <p className="text-foreground leading-relaxed">{currentAccountData.audience.buyer_demographics}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Países Objetivo</span>
                    <div className="flex flex-wrap gap-2">
                      {currentAccountData.audience.target_countries.map((country, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                          {country}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* VALOR AGREGADO */}
              <Card className="bg-card border-primary/30">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-xl flex items-center gap-3 text-primary">
                    <Lightbulb className="w-6 h-6" />
                    PROPUESTA DE VALOR
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Palabras Clave</span>
                    <div className="flex flex-wrap gap-2">
                      {currentAccountData.value_proposition.keywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Frases Inspiradoras</span>
                    <ul className="space-y-2">
                      {currentAccountData.value_proposition.inspiring_phrases.map((phrase, i) => (
                        <li key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-foreground italic">
                          "{phrase}"
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Ganchos Emocionales</span>
                    <ul className="space-y-2">
                      {currentAccountData.value_proposition.emotional_hooks.map((hook, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground">
                          <Zap className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <span>{hook}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* IDENTIDAD VISUAL */}
              <Card className="bg-card border-primary/30">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-xl flex items-center gap-3 text-primary">
                    <Palette className="w-6 h-6" />
                    IDENTIDAD VISUAL
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <span className="text-sm text-muted-foreground">Paleta de Colores Recomendada</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {currentAccountData.visual_identity.recommended_colors.map((color, i) => (
                        <ColorSwatch 
                          key={i}
                          hex={color.hex}
                          name={color.name}
                          psychology={color.psychology}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Estilo Visual</span>
                      <p className="text-foreground">{currentAccountData.visual_identity.visual_style}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Tema</span>
                      <p className="text-foreground">{currentAccountData.visual_identity.theme}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Recomendaciones de Imágenes</span>
                    <p className="text-foreground leading-relaxed">{currentAccountData.visual_identity.imagery_recommendations}</p>
                  </div>
                </CardContent>
              </Card>

              {/* ANÁLISIS REDES */}
              <Card className="bg-card border-primary/30">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-xl flex items-center gap-3 text-primary">
                    <BarChart3 className="w-6 h-6" />
                    ANÁLISIS DE REDES SOCIALES
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                      <p className="text-3xl font-bold text-primary">{currentAccountData.social_analysis.success_probability}</p>
                      <p className="text-sm text-muted-foreground mt-1">Probabilidad de Éxito</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary border border-border text-center col-span-2">
                      <p className="text-lg font-semibold text-foreground">{currentAccountData.social_analysis.competition_level}</p>
                      <p className="text-sm text-muted-foreground mt-1">Nivel de Competencia</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Tipos de Contenido Top</span>
                    <div className="flex flex-wrap gap-2">
                      {currentAccountData.social_analysis.top_content_types.map((type, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Plataformas Recomendadas</span>
                    <ul className="space-y-2">
                      {currentAccountData.social_analysis.recommended_platforms.map((platform, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground">
                          <MessageSquare className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <span>{platform}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Frecuencia de Publicación</span>
                    <p className="text-foreground">{currentAccountData.social_analysis.posting_frequency}</p>
                  </div>
                </CardContent>
              </Card>

              {/* ESTRATEGIA */}
              <Card className="bg-card border-primary/30">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-xl flex items-center gap-3 text-primary">
                    <TrendingUp className="w-6 h-6" />
                    ESTRATEGIA DE MARKETING
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Objetivo Principal</span>
                    <p className="text-foreground leading-relaxed">{currentAccountData.strategy.main_objective}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-sm text-muted-foreground">CTA Principal</span>
                    <p className="text-lg font-bold text-primary mt-1">{currentAccountData.strategy.primary_cta}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">CTAs Secundarios</span>
                    <div className="flex flex-wrap gap-2">
                      {currentAccountData.strategy.secondary_ctas.map((cta, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm font-medium">
                          {cta}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Perfil de Venta Ideal</span>
                    <p className="text-foreground leading-relaxed">{currentAccountData.strategy.sales_profile}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Etapas del Funnel</span>
                    <div className="flex flex-wrap gap-2">
                      {currentAccountData.strategy.funnel_stages.map((stage, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{i + 1}</span>
                          {stage}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <span className="text-sm text-muted-foreground">Presupuesto Recomendado</span>
                    <p className="text-foreground mt-1">{currentAccountData.strategy.budget_recommendation}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-4 pt-4 pb-8">
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
        <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/30 max-w-md [&>button]:hidden">
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <h2 className="text-xl font-bold text-center">
              Generando análisis profundo
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
