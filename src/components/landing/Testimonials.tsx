import { MessageSquare } from "lucide-react";

const Testimonials = () => {
  return (
    <section id="testimonios" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Lo que dicen nuestros <span className="text-gradient">clientes</span>
          </h2>
        </div>

        {/* Coming Soon Message */}
        <div className="max-w-2xl mx-auto">
          <div className="p-12 rounded-2xl bg-card border border-border text-center">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <MessageSquare className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Próximamente testimonios de clientes
            </h3>
            <p className="text-muted-foreground">
              Estamos recopilando las experiencias de nuestros primeros usuarios. 
              ¡Muy pronto podrás ver sus historias de éxito aquí!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
