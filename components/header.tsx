"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, FileText, GraduationCap } from "lucide-react";

export function Header() {
  const { user, logout, switchRole } = useAuth();

  if (!user) return null;

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case "alumno":
        return "bg-primary text-primary-foreground";
      case "profesor":
        return "bg-secondary text-secondary-foreground";
      case "coordinador":
        return "bg-chart-3 text-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case "alumno":
        return "Alumno";
      case "profesor":
        return "Profesor";
      case "coordinador":
        return "Coordinador";
      default:
        return rol;
    }
  };

  const getInitials = (nombre: string, apellidos: string) => {
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground leading-tight">
              SIJE
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              Sistema de Justificantes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge className={`${getRoleBadgeColor(user.rol)} hidden sm:flex`}>
            {getRoleLabel(user.rol)}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.imagen || "/placeholder.svg"} alt={user.nombre} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {/* {getInitials(user.nombre, user.apellidos)} */}
                    EP
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user.nombre} {user.apellidos}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {user.matricula && (
                    <p className="text-xs text-muted-foreground">
                      Matrícula: {user.matricula}
                    </p>
                  )}
                  {user.carrera && (
                    <p className="text-xs text-muted-foreground">
                      {user.carrera}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Opciones de cambio de rol para demo */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Cambiar rol (Demo)
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => switchRole("alumno")}>
                <User className="mr-2 h-4 w-4" />
                Ver como Alumno
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole("profesor")}>
                <FileText className="mr-2 h-4 w-4" />
                Ver como Profesor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole("coordinador")}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Ver como Coordinador
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
