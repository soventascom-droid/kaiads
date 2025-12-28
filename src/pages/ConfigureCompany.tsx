import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, Upload, Globe, Target, ChevronDown,
  Palette, MessageSquare, TrendingUp, Users, Sparkles, 
  FileText, BarChart3, Eye
} from 'lucide-react';

// Mock data for visual purposes
const mockAccounts = [
  { id: '1', name: 'Mi Negocio Principal' },
  { id: '2', name: 'Tienda Online' },
];

const ConfigureCompany = () => {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState('1');
  const [showResults, setShowResults] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const handleAnalyze = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Configurar Empresa</h1>
              <p className="text-sm text-muted-foreground">Análisis de marketing con IA</p>
            </div>
          </div>
          
          {/* Account Selector */}
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar cuenta" />
            </SelectTrigger>
            <SelectContent>
              {mockAccounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!showResults ? (
          <div className="space-y-8">
            {/* PDF Upload Section */}
            <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-8 text-center">
                <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-3 text-lg px-8 py-6 h-auto">
                      <Upload className="w-6 h-6" />
                      Cargar información de mi empresa (PDF)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
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
                          <Input id="pdf-upload" type="file" accept=".pdf" className="flex-1" />
                          <Button onClick={() => setPdfModalOpen(false)}>
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
              </CardContent>
            </Card>

            {/* Segmentation Section */}
            <Card>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar país" />
                      </SelectTrigger>
                      <SelectContent>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ciudad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bog">Bogotá</SelectItem>
                        <SelectItem value="med">Medellín</SelectItem>
                        <SelectItem value="cal">Cali</SelectItem>
                        <SelectItem value="bar">Barranquilla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button size="lg" className="w-full mt-6 text-lg py-6 h-auto" onClick={handleAnalyze}>
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
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* A. PRESENTACIÓN */}
              <Card className="border-primary/30">
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
              <Card className="border-accent/30">
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
              <Card className="border-green-500/30">
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
              <Card className="border-purple-500/30">
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
              <Card className="border-blue-500/30">
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
              <Card className="border-orange-500/30">
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
      </main>
    </div>
  );
};

export default ConfigureCompany;
