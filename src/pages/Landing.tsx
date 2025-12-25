import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Cloud, 
  Shield, 
  Users, 
  Truck, 
  ClipboardList, 
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import heroImage from "@/assets/hero-cloud.png";

const features = [
  {
    icon: Shield,
    title: "Seguridad Avanzada",
    description: "Control total de usuarios, roles y permisos. Autenticación robusta y auditoría completa."
  },
  {
    icon: Users,
    title: "Gestión de Empleados",
    description: "Administra tu equipo de trabajo, legajos, documentación y seguimiento en tiempo real."
  },
  {
    icon: Truck,
    title: "Control de Equipos",
    description: "Monitorea tu flota de vehículos, maquinaria y equipamiento con trazabilidad total."
  },
  {
    icon: ClipboardList,
    title: "Partes Diarios",
    description: "Registra actividades, horas trabajadas y novedades de forma digital y centralizada."
  },
  {
    icon: Award,
    title: "Habilitaciones",
    description: "Gestiona licencias, certificaciones y vencimientos con alertas automáticas."
  },
  {
    icon: Sparkles,
    title: "Movimientos",
    description: "Seguimiento de traslados, asignaciones y movimientos de recursos empresariales."
  }
];

const benefits = [
  "Plataforma 100% cloud, accede desde cualquier lugar",
  "Diseño modular y escalable para tu empresa",
  "Seguridad multi-empresa con aislamiento de datos",
  "Actualizaciones automáticas sin interrupciones",
  "Soporte técnico especializado incluido"
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(200,20%,8%)] text-[hsl(166,20%,95%)] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[hsl(200,20%,8%)]/80 border-b border-[hsl(200,18%,20%)]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Cloud className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold tracking-tight">DNSCloud</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Funcionalidades
              </a>
              <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Beneficios
              </a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </a>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Acceder
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="DNSCloud Technology" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(200,20%,8%)] via-[hsl(200,20%,8%)]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(200,20%,8%)] via-transparent to-[hsl(200,20%,8%)]/50" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              Plataforma Empresarial Modular
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Con <span className="text-primary">DNSCloud</span> las posibilidades son{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(174,55%,60%)] bg-clip-text text-transparent">
                Infinitas
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Descubre cómo nuestra plataforma cloud puede transformar la gestión de tu empresa 
              con soluciones inteligentes y modulares. Con DNSCloud, el futuro está en tus manos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="border-primary/30 text-foreground hover:bg-primary/10 px-8 h-12 text-base">
                  Ver Funcionalidades
                </Button>
              </a>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="flex flex-col items-center text-muted-foreground text-sm">
            <span>Descubre más</span>
            <ChevronRight className="h-5 w-5 rotate-90 mt-1" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Módulos que <span className="text-primary">Potencian</span> tu Empresa
            </h2>
            <p className="text-muted-foreground text-lg">
              Una suite completa de herramientas diseñadas para optimizar cada aspecto de tu operación empresarial.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-[hsl(200,18%,12%)] border-[hsl(200,18%,20%)] hover:border-primary/50 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-[hsl(200,18%,10%)]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                ¿Por qué elegir <span className="text-primary">DNSCloud</span>?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Somos más que una plataforma de gestión. Somos tu socio tecnológico para 
                la transformación digital de tu empresa.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Link to="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Empieza Gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-8 flex items-center justify-center">
                <Cloud className="h-48 w-48 text-primary/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">100%</div>
                    <div className="text-xl text-muted-foreground">Cloud Native</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para <span className="text-primary">Transformar</span> tu Empresa?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Únete a las empresas que ya confían en DNSCloud para gestionar sus operaciones de forma eficiente y segura.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                  Acceder a la Plataforma
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[hsl(200,18%,20%)]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Cloud className="h-6 w-6 text-primary" />
              <span className="font-semibold">DNSCloud</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DNSCloud. Todos los derechos reservados.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="hover:text-foreground transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
