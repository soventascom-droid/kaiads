import { Bot, Clock, Target, TrendingUp, Zap, Shield } from "lucide-react";

const benefits = [
  {
    icon: Bot,
    title: "IA Estratega",
    description: "Nuestra inteligencia artificial analiza tu negocio y crea estrategias publicitarias personalizadas para maximizar tu ROI.",
  },
  {
    icon: Clock,
    title: "Disponible 24/7",
    description: "Tu asistente publicitario nunca descansa. Crea campañas a cualquier hora del día, cuando más lo necesites.",
  },
  {
    icon: Zap,
    title: "Campañas en Minutos",
    description: "Olvídate de pasar horas configurando. Con Kai Ads Pro, lanzas campañas profesionales en cuestión de minutos.",
  },
  {
    icon: Target,
    title: "Segmentación Precisa",
    description: "Alcanza a tu cliente ideal con segmentación avanzada basada en datos e inteligencia artificial.",
  },
  {
    icon: TrendingUp,
    title: "Optimización Continua",
    description: "La IA monitorea y optimiza tus campañas automáticamente para obtener los mejores resultados.",
  },
  {
    icon: Shield,
    title: "Conexión Segura",
    description: "Integración oficial con Meta Ads. Tus datos y cuentas publicitarias siempre protegidos.",
  },
];

const Benefits = () => {
  return (
    <section id="beneficios" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-secondary/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            ¿Por qué elegir <span className="text-gradient">Kai Ads Pro</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre las ventajas que hacen de nuestra plataforma la mejor opción para automatizar tu publicidad
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:glow-primary transition-shadow">
                <benefit.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
