import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Bot, 
  Calendar, 
  Shield, 
  Zap, 
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Moon,
  Sun
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import PhoneMockup from '@/components/PhoneMockup';

const features = [
  {
    icon: Clock,
    title: 'Atendimento 24/7',
    description: 'Seu negócio nunca fecha. Clientes podem interagir a qualquer hora do dia ou noite.',
  },
  {
    icon: Bot,
    title: 'IA Conversacional',
    description: 'Inteligência artificial que entende contexto e responde de forma natural e humanizada.',
  },
  {
    icon: Calendar,
    title: 'Auto-Agendamento',
    description: 'Agendamentos marcados automaticamente. Sem conflitos, sem retrabalho.',
  },
  {
    icon: Shield,
    title: 'Dados Seguros',
    description: 'Criptografia de ponta. Seus dados e dos seus clientes sempre protegidos.',
  },
  {
    icon: Zap,
    title: 'Respostas Instantâneas',
    description: 'Tempo de resposta menor que 3 segundos. Experiência fluida para o cliente.',
  },
  {
    icon: Users,
    title: 'Multi-Nicho',
    description: 'Adaptado para diversos segmentos: clínicas, escritórios, comércios e mais.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Escolha seu nicho',
    description: 'Selecione o segmento do seu negócio entre 14 opções disponíveis.',
  },
  {
    number: '02',
    title: 'Configure seu agente',
    description: 'Personalize o nome, tom de voz e comportamento do assistente.',
  },
  {
    number: '03',
    title: 'Ative e pronto!',
    description: 'Seu agente de IA começa a atender clientes imediatamente.',
  },
];

export default function Demo() {
  const navigate = useNavigate();
  const { theme, setTheme, globalConfig } = useApp();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-foreground">{globalConfig.appName}</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Ir para App
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left animate-fade-in">
              <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Tecnologia de IA Avançada
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Atendimento Inteligente com{' '}
                <span className="gradient-text">Agentes de IA</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Automatize o atendimento do seu negócio com IA conversacional. 
                Seus clientes são atendidos 24/7, com respostas personalizadas e agendamento automático.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                <Badge variant="outline" className="text-sm py-1.5 px-3">
                  <Clock className="h-3 w-3 mr-1" />
                  24/7 Disponível
                </Badge>
                <Badge variant="outline" className="text-sm py-1.5 px-3">
                  <Bot className="h-3 w-3 mr-1" />
                  IA Inteligente
                </Badge>
                <Badge variant="outline" className="text-sm py-1.5 px-3">
                  <Calendar className="h-3 w-3 mr-1" />
                  Auto-Agendamento
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" variant="outline" onClick={() => {
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Ver Demonstração
                </Button>
                <Button size="lg" variant="ghost" onClick={() => navigate('/')}>
                  Ir para App
                </Button>
              </div>
            </div>
            
            {/* Right Content - Phone Mockup */}
            <div className="flex justify-center lg:justify-end animate-slide-up">
              <PhoneMockup />
            </div>
          </div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4">Recursos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para{' '}
              <span className="gradient-text">automatizar</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa para transformar o atendimento do seu negócio com inteligência artificial.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4">Como Funciona</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simples como uma{' '}
              <span className="gradient-text">conversa</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Em apenas 3 passos, seu agente de IA está pronto para atender.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4">Demonstração</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Experimente{' '}
              <span className="gradient-text">agora mesmo</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha um dos 14 nichos disponíveis e veja como o agente de IA atende seus clientes.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
              {['Médico', 'Odonto', 'Advogado', 'Estética', 'Imobiliária', 'E mais 9...'].map((niche, index) => (
                <div
                  key={niche}
                  className="flex items-center gap-2 p-3 rounded-lg bg-card border animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{niche}</span>
                </div>
              ))}
            </div>
            
            <Button size="lg" variant="outline" onClick={() => navigate('/')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Ver Todos os Nichos
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center glass-strong rounded-3xl p-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para{' '}
              <span className="gradient-text">automatizar</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Experimente gratuitamente e descubra como a IA pode transformar o atendimento do seu negócio.
            </p>
            <Button size="lg" variant="outline" onClick={() => navigate('/')}>
              Explorar Nichos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Demo de Agentes de IA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
