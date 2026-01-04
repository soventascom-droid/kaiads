import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Brain,
  Sparkles,
  Shield,
  ChevronRight,
  LogOut,
  User,
  CreditCard,
  Bell,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  LayoutDashboard,
  Link as LinkIcon,
  Building2,
  Megaphone,
  BarChart3,
  Lock,
  Settings,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AIPrompt {
  id: string;
  module_key: string;
  system_instruction: string;
  description: string | null;
  model_config: { model: string; temperature: number };
  created_at: string;
  updated_at: string;
}

const AITraining = () => {
  const { user, loading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>('trial');
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState<AIPrompt | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Form state for create/edit
  const [formData, setFormData] = useState({
    module_key: '',
    system_instruction: '',
    description: '',
    model: 'gpt-4o',
    temperature: 0.7,
  });

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
          const adminStatus = roles.includes('admin');
          setIsAdmin(adminStatus);
          setUserRole(adminStatus ? 'admin' : roles[0] || 'trial');

          if (!adminStatus) {
            toast.error('Acceso denegado. Solo administradores.');
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      }
    };
    checkUserRole();
  }, [user, navigate]);

  useEffect(() => {
    const fetchPrompts = async () => {
      const { data, error } = await supabase
        .from('ai_system_prompts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching prompts:', error);
        toast.error('Error al cargar los prompts');
      } else {
        setPrompts(data as AIPrompt[] || []);
      }
      setLoadingPrompts(false);
    };

    if (isAdmin) {
      fetchPrompts();
    }
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const openEdit = (prompt: AIPrompt) => {
    setEditingPrompt(prompt);
    setFormData({
      module_key: prompt.module_key,
      system_instruction: prompt.system_instruction,
      description: prompt.description || '',
      model: prompt.model_config?.model || 'gpt-4o',
      temperature: prompt.model_config?.temperature ?? 0.7,
    });
  };

  const openCreate = () => {
    setFormData({
      module_key: '',
      system_instruction: '',
      description: '',
      model: 'gpt-4o',
      temperature: 0.7,
    });
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    if (!formData.module_key.trim()) {
      toast.error('El module_key es obligatorio');
      return;
    }

    setSaving(true);
    const model_config = { model: formData.model, temperature: formData.temperature };

    if (editingPrompt) {
      // Update
      const { error } = await supabase
        .from('ai_system_prompts')
        .update({
          system_instruction: formData.system_instruction,
          description: formData.description,
          model_config,
        })
        .eq('id', editingPrompt.id);

      if (error) {
        toast.error('Error al guardar: ' + error.message);
      } else {
        toast.success('Prompt actualizado');
        setPrompts(prev =>
          prev.map(p =>
            p.id === editingPrompt.id
              ? { ...p, system_instruction: formData.system_instruction, description: formData.description, model_config }
              : p
          )
        );
        setEditingPrompt(null);
      }
    } else {
      // Create
      const { data, error } = await supabase
        .from('ai_system_prompts')
        .insert({
          module_key: formData.module_key,
          system_instruction: formData.system_instruction,
          description: formData.description,
          model_config,
        })
        .select()
        .single();

      if (error) {
        toast.error('Error al crear: ' + error.message);
      } else {
        toast.success('Prompt creado');
        setPrompts(prev => [...prev, data as AIPrompt]);
        setIsCreateOpen(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletePrompt) return;

    const { error } = await supabase
      .from('ai_system_prompts')
      .delete()
      .eq('id', deletePrompt.id);

    if (error) {
      toast.error('Error al eliminar: ' + error.message);
    } else {
      toast.success('Prompt eliminado');
      setPrompts(prev => prev.filter(p => p.id !== deletePrompt.id));
    }
    setDeletePrompt(null);
  };

  const menuItems = [
    { icon: LinkIcon, label: 'Conectar cuenta', href: '/dashboard' },
    { icon: Building2, label: 'Configurar empresa', href: '/configure-company' },
    { icon: Megaphone, label: 'Campañas de venta', href: '#campaigns', locked: true },
    { icon: BarChart3, label: 'Estrategias activas', href: '#strategies', locked: true },
  ];

  const adminItems = [
    { icon: Brain, label: 'Entrenamiento IA', href: '/admin/ai-training', active: true },
    { icon: Users, label: 'Gestionar usuarios', href: '#users' },
    { icon: Settings, label: 'Configuración', href: '#settings' },
  ];

  const accountItems = [
    { icon: User, label: 'Mi perfil', href: '#profile' },
    { icon: CreditCard, label: 'Facturación', href: '#billing' },
    { icon: Bell, label: 'Novedades', href: '#news' },
  ];

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.locked) {
                  e.preventDefault();
                  toast.info('Función próximamente disponible');
                } else if (item.href.startsWith('/')) {
                  e.preventDefault();
                  navigate(item.href);
                }
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                item.locked
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
              }`}
            >
              <item.icon className={`w-5 h-5 ${!item.locked && 'group-hover:text-primary'}`} />
              <span>{item.label}</span>
              {item.locked && <Lock className="w-4 h-4 ml-auto text-muted-foreground/50" />}
            </a>
          ))}

          {/* Admin Section */}
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                item.active
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
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
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.user_metadata?.full_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <span className="px-2 py-1 text-xs rounded-full font-medium bg-amber-500/20 text-amber-400">
              Admin
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                Entrenamiento de IA
              </h1>
              <p className="text-muted-foreground mt-2">
                Gestiona los System Prompts de cada módulo de inteligencia artificial.
              </p>
            </div>
            <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-accent">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Módulo
            </Button>
          </header>

          {loadingPrompts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : prompts.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Brain className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay módulos de IA configurados</p>
                <Button onClick={openCreate} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear el primero
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <code className="text-primary bg-primary/10 px-2 py-1 rounded text-sm font-mono">
                            {prompt.module_key}
                          </code>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {prompt.description || 'Sin descripción'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(prompt)}
                          className="hover:border-primary"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletePrompt(prompt)}
                          className="hover:border-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded">
                        Modelo: {prompt.model_config?.model || 'gpt-4o'}
                      </span>
                      <span className="bg-muted px-2 py-1 rounded">
                        Temp: {prompt.model_config?.temperature ?? 0.7}
                      </span>
                      <span className="bg-muted px-2 py-1 rounded">
                        {prompt.system_instruction?.length || 0} caracteres
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Editar Módulo: <code className="text-primary">{editingPrompt?.module_key}</code>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Descripción</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del módulo..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Modelo</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="gpt-4o"
                />
              </div>
              <div>
                <Label>Temperature</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.7 }))}
                />
              </div>
            </div>
            <div>
              <Label>System Instruction (Prompt)</Label>
              <Textarea
                value={formData.system_instruction}
                onChange={(e) => setFormData(prev => ({ ...prev, system_instruction: e.target.value }))}
                placeholder="Escribe aquí el prompt de entrenamiento para la IA..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPrompt(null)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nuevo Módulo de IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Module Key (único)</Label>
              <Input
                value={formData.module_key}
                onChange={(e) => setFormData(prev => ({ ...prev, module_key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                placeholder="ej: soporte_flotante"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del módulo..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Modelo</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="gpt-4o"
                />
              </div>
              <div>
                <Label>Temperature</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.7 }))}
                />
              </div>
            </div>
            <div>
              <Label>System Instruction (Prompt)</Label>
              <Textarea
                value={formData.system_instruction}
                onChange={(e) => setFormData(prev => ({ ...prev, system_instruction: e.target.value }))}
                placeholder="Escribe aquí el prompt de entrenamiento para la IA..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePrompt} onOpenChange={() => setDeletePrompt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar el módulo <strong>{deletePrompt?.module_key}</strong>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AITraining;
