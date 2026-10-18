"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Lock, User, LogIn, UserPlus, ArrowRight, X, LayoutDashboard, LogOut, Loader2 } from "lucide-react";
import Image from "next/image";

/**
 * Login y registro conectados a Supabase Auth.
 * - Al iniciar sesión se lee el ROL en la tabla `usuarios`:
 *   admin -> va al panel /admin (CRUD); cliente -> se queda en la web.
 * - El registro crea la cuenta; un trigger en la BD le crea su fila en
 *   `usuarios` con rol "cliente".
 */
type Sesion = { nombre: string; rol: "admin" | "cliente" } | null;

function traducirError(mensaje: string) {
  if (/invalid login credentials/i.test(mensaje)) return "Correo o contraseña incorrectos.";
  if (/email not confirmed/i.test(mensaje)) return "Debes confirmar tu correo antes de ingresar.";
  if (/already registered/i.test(mensaje)) return "Ese correo ya tiene una cuenta.";
  if (/at least 6 characters/i.test(mensaje)) return "La contraseña debe tener al menos 6 caracteres.";
  return mensaje;
}

function MensajeError({ texto }: { texto: string | null }) {
  if (!texto) return null;
  return (
    <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {texto}
    </p>
  );
}
function FieldIcon({ icon: Icon }: { icon: typeof Mail }) {
  return (
    <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
  );
}

function DialogBrandHeader({
  eyebrow,
  title,
  description,
  onClose,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <div className="relative -mx-4 -mt-4 mb-2 rounded-t-xl bg-gradient-to-br from-primary to-secondary-foreground px-6 pb-8 pt-6 text-primary-foreground">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
      >
        <X className="size-4" />
        <span className="sr-only">Cerrar</span>
      </button>
      <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-md">
        <Image src="/images/logo-mark.png" alt="Logo M&M" fill sizes="44px" className="object-contain p-1.5" />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-white/70">
        {eyebrow}
      </p>
      <DialogHeader className="mt-0.5 text-left">
        <DialogTitle className="text-white">{title}</DialogTitle>
        <DialogDescription className="text-white/80">{description}</DialogDescription>
      </DialogHeader>
    </div>
  );
}

export function AuthDialogs() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [sesion, setSesion] = useState<Sesion>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function leerSesion() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSesion(null);
      return null;
    }
    const { data } = await supabase
      .from("usuarios")
      .select("nombre, rol")
      .eq("auth_id", user.id)
      .maybeSingle();
    const s = (data as Sesion) ?? { nombre: user.email ?? "Usuario", rol: "cliente" as const };
    setSesion(s);
    return s;
  }

  useEffect(() => {
    // Se suscribe a los cambios de sesión (también avisa la sesión inicial).
    // setTimeout: Supabase recomienda no consultar dentro del propio callback.
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange(() => {
      setTimeout(leerSesion, 0);
    });
    // /admin redirige aquí con ?login=1 cuando no hay sesión.
    const t = setTimeout(() => {
      if (new URLSearchParams(window.location.search).get("login") === "1") setLoginOpen(true);
    }, 0);
    return () => {
      subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  async function iniciarSesion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setEnviando(false);
      setError(traducirError(error.message));
      return;
    }
    const s = await leerSesion();
    setEnviando(false);
    setLoginOpen(false);
    if (s?.rol === "admin") router.push("/admin");
    else router.refresh();
  }

  async function registrarse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: { data: { nombre: String(form.get("nombre")) } },
    });
    setEnviando(false);
    if (error) {
      setError(traducirError(error.message));
      return;
    }
    if (!data.session) {
      setAviso("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.");
      setRegisterOpen(false);
      setLoginOpen(true);
      return;
    }
    await leerSesion();
    setRegisterOpen(false);
    router.refresh();
  }

  async function cerrarSesion() {
    await createClient().auth.signOut();
    setSesion(null);
    router.push("/");
    router.refresh();
  }

  if (sesion) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-32 truncate text-sm text-muted-foreground lg:inline">
          Hola, {sesion.nombre.split(" ")[0]}
        </span>
        {sesion.rol === "admin" && (
          <Button size="sm" nativeButton={false} render={<Link href="/admin" />}>
            <LayoutDashboard className="size-3.5" />
            Panel admin
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={cerrarSesion}>
          <LogOut className="size-3.5" />
          Salir
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={loginOpen} onOpenChange={(v) => { setLoginOpen(v); setError(null); }}>
        <DialogTrigger render={<Button variant="ghost" size="sm" />}>
          Ingresar
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="overflow-hidden sm:max-w-sm">
          <DialogBrandHeader
            eyebrow="M&M Mueblería"
            title="Iniciar sesión"
            description="Ingresa a tu cuenta para ver tus pedidos y cotizaciones."
            onClose={() => setLoginOpen(false)}
          />
          <form className="flex flex-col gap-4 px-0.5" onSubmit={iniciarSesion}>
            {aviso && (
              <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{aviso}</p>
            )}
            <MensajeError texto={error} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-email">Correo</Label>
              <div className="relative">
                <FieldIcon icon={Mail} />
                <Input id="login-email" name="email" type="email" required autoComplete="email" placeholder="tucorreo@correo.com" className="pl-9" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-password">Contraseña</Label>
              <div className="relative">
                <FieldIcon icon={Lock} />
                <Input id="login-password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="pl-9" />
              </div>
            </div>
            <Button type="submit" size="lg" disabled={enviando} className="mt-1 shadow-md shadow-primary/20">
              {enviando ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
              Ingresar
            </Button>
          </form>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            ¿Aún no tienes cuenta?{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => {
                setError(null);
                setLoginOpen(false);
                setRegisterOpen(true);
              }}
            >
              Regístrate
            </button>
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={registerOpen} onOpenChange={(v) => { setRegisterOpen(v); setError(null); }}>
        <DialogTrigger render={<Button size="sm" />}>
          Registrarse
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="overflow-hidden sm:max-w-sm">
          <DialogBrandHeader
            eyebrow="M&M Mueblería"
            title="Crear cuenta"
            description="Regístrate para hacer seguimiento a tus pedidos y cotizaciones."
            onClose={() => setRegisterOpen(false)}
          />
          <form className="flex flex-col gap-4 px-0.5" onSubmit={registrarse}>
            <MensajeError texto={error} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="register-name">Nombre completo</Label>
              <div className="relative">
                <FieldIcon icon={User} />
                <Input id="register-name" name="nombre" required placeholder="Tu nombre" className="pl-9" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="register-email">Correo</Label>
              <div className="relative">
                <FieldIcon icon={Mail} />
                <Input id="register-email" name="email" type="email" required autoComplete="email" placeholder="tucorreo@correo.com" className="pl-9" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="register-password">Contraseña</Label>
              <div className="relative">
                <FieldIcon icon={Lock} />
                <Input id="register-password" name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="Mínimo 6 caracteres" className="pl-9" />
              </div>
            </div>
            <Button type="submit" size="lg" disabled={enviando} className="mt-1 shadow-md shadow-primary/20">
              {enviando ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              Crear cuenta
            </Button>
          </form>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
              onClick={() => {
                setError(null);
                setRegisterOpen(false);
                setLoginOpen(true);
              }}
            >
              Inicia sesión
              <ArrowRight className="size-3" />
            </button>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
