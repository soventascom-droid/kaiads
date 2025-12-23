import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Users } from "lucide-react";

const plans = [
  {
    name: "Plan Permanente",
    icon: Crown,
    priceUSD: 380,
    priceCOP: 1600000,
    period: "Pago único",
    description: "Acceso de por vida a todas las funciones",
    badge: "Cupo limitado: 100 usuarios",
    features: [
      "Acceso permanente a Kai Ads Pro",
      "Hasta 3 empresas conectadas",
      "Campañas ilimitadas",
      "IA Estratega incluida",
      "Soporte prioritario",
      "Actualizaciones de por vida",
      "Sin pagos mensuales",
    ],
    highlighted: true,
  },
  {
    name: "Plan Mensual",
    icon: Zap,
    priceUSD: 42,
    priceCOP: 175000,
    period: "por mes",
    description: "Flexibilidad para escalar tu negocio",
    badge: null,
    features: [
      "Acceso completo a Kai Ads Pro",
      "Hasta 3 empresas conectadas",
      "Campañas ilimitadas",
      "IA Estratega incluida",
      "Soporte por email",
      "Actualizaciones incluidas",
      "Cancela cuando quieras",
    ],
    highlighted: false,
  },
];

const formatCOP = (value: number) => {
  return new Intl.NumberFormat("es-CO").format(value);
};

const Pricing = () => {
  return (
    <section id="precios" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-secondary/30" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Elige tu <span className="text-gradient">plan ideal</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Invierte en el crecimiento de tu negocio con planes diseñados para maximizar tus resultados
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-primary/20 to-card border-2 border-primary glow-primary"
                  : "bg-card border border-border hover:border-primary/30"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-sm font-medium text-primary-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8 pt-4">
                <div className={`w-16 h-16 rounded-2xl ${plan.highlighted ? "gradient-primary" : "bg-secondary"} flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className={`w-8 h-8 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">${plan.priceUSD}</span>
                  <span className="text-xl text-muted-foreground">USD</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  ~${formatCOP(plan.priceCOP)} COP
                </div>
                <div className="text-sm text-primary font-medium mt-2">{plan.period}</div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full py-6 text-lg ${
                  plan.highlighted
                    ? "gradient-primary text-primary-foreground hover:opacity-90 glow-primary"
                    : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                }`}
              >
                Comenzar ahora
              </Button>
            </div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            ✨ Garantía de satisfacción de 7 días en ambos planes
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
