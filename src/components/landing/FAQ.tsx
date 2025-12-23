import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "¿Qué es Kai Ads Pro?",
    answer: "Próximamente más información. Estamos preparando contenido detallado sobre nuestra plataforma.",
  },
  {
    question: "¿Cómo funciona la IA Estratega?",
    answer: "Próximamente más información. Estamos preparando contenido detallado sobre nuestra IA.",
  },
  {
    question: "¿Necesito conocimientos técnicos?",
    answer: "Próximamente más información. Estamos preparando guías y tutoriales para ti.",
  },
  {
    question: "¿Cómo me conecto con Meta Ads?",
    answer: "Próximamente más información. Estamos preparando un tutorial paso a paso.",
  },
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer: "Próximamente más información. Estamos preparando contenido sobre nuestras políticas.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Preguntas <span className="text-gradient">frecuentes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra respuestas a las dudas más comunes sobre Kai Ads Pro
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-card border border-border mb-8">
            <div className="flex items-center gap-3 text-primary mb-4">
              <HelpCircle className="w-6 h-6" />
              <span className="font-medium">Contenido en construcción</span>
            </div>
            <p className="text-muted-foreground">
              Estamos trabajando en las respuestas detalladas para cada pregunta. 
              Muy pronto tendrás toda la información que necesitas.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50 transition-colors"
              >
                <AccordionTrigger className="text-foreground hover:text-primary hover:no-underline py-6 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
