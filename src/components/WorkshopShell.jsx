import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  ListChecks,
  Settings,
  Smartphone,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkshop } from "@/contexts/WorkshopContext";

const links = [
  ["/", "Início", LayoutDashboard],
  ["/historico", "Histórico", ClipboardList],
  ["/servicos", "Serviços", Wrench],
  ["/checklist", "Checklist", ListChecks],
  ["/configuracoes", "Empresa", Settings],
];

function colorWash(hex, opacity) {
  if (typeof hex !== "string" || !/^#[\da-f]{6}$/i.test(hex)) return null;
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

export function WorkshopShell({ children }) {
  const { settings, error, reload } = useWorkshop();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (settings && !settings.configured && location.pathname !== "/configuracoes")
      navigate({ to: "/configuracoes" });
  }, [settings, location.pathname, navigate]);
  if (error)
    return (
      <main className="mx-auto max-w-lg p-8">
        <h1 className="text-xl font-bold">Dados locais indisponíveis</h1>
        <p role="alert" className="my-4 text-muted-foreground">
          {error}
        </p>
        <Button onClick={reload}>
          <RefreshCw className="size-4" />
          Tentar novamente
        </Button>
      </main>
    );
  if (!settings)
    return (
      <main className="p-8 text-muted-foreground" role="status">
        Abrindo assistência…
      </main>
    );
  const palette = settings.empresa.logoPalette;
  const firstColor = colorWash(palette?.[0], 0.2);
  const secondColor = colorWash(palette?.[1], 0.15);
  const headerStyle =
    settings.empresa.logo && firstColor && secondColor
      ? {
          backgroundImage: `linear-gradient(112deg, ${firstColor} 0%, ${secondColor} 56%, ${firstColor} 100%)`,
        }
      : undefined;
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card" style={headerStyle}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            {settings.empresa.logo ? (
              <img
                src={settings.empresa.logo}
                alt="Logo da empresa"
                className="size-10 shrink-0 rounded-md object-contain"
              />
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Smartphone className="size-6" />
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold">
                {settings.empresa.fantasia || settings.empresa.nome || "Ordem de Serviço"}
              </span>
              <span className="block text-xs text-muted-foreground">Assistência técnica</span>
            </span>
          </Link>
          {settings.configured && (
            <Button asChild size="sm">
              <Link to="/ordens/nova">
                <Plus className="size-4" />
                <span>Nova O.S.</span>
              </Link>
            </Button>
          )}
        </div>
        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-6xl overflow-x-auto px-2 sm:px-6"
        >
          {links.map(([to, label, Icon]) => (
            <Button
              key={to}
              asChild
              variant="ghost"
              className={`h-12 shrink-0 rounded-none border-b-2 px-3 text-xs sm:px-4 sm:text-sm ${location.pathname === to ? "border-primary bg-accent text-primary" : "border-transparent text-muted-foreground"}`}
            >
              <Link to={to}>
                <Icon className="size-4" />
                {label}
              </Link>
            </Button>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
