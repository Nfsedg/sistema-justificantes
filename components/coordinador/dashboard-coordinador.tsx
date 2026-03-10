"use client";

import { useEffect, useState, useMemo } from "react";
import useUsers from "@/hooks/useUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Search, ShieldAlert, GraduationCap, Briefcase } from "lucide-react";
import { User, UserRole } from "@/lib/types";

export function DashboardCoordinador() {
  const { users, getUsers, isLoading, updateUserRole } = useUsers();
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch all users at once for the coordinator
    getUsers();
  }, [getUsers]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    return users.filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const alumnos = filteredUsers.filter(u => u.role.toUpperCase() === "ESTUDIANTE" || u.role.toUpperCase() === "ALUMNO");
  const docentes = filteredUsers.filter(u => u.role.toUpperCase() === "DOCENTE");
  const tutores = filteredUsers.filter(u => u.role.toUpperCase() === "TUTOR");

  const handleChangeRole = async (userId: string, targetRole: "DOCENTE" | "TUTOR") => {
    await updateUserRole(userId, targetRole);
  };

  const UserTable = ({ data, showRoleActions = false }: { data: User[], showRoleActions?: boolean }) => (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Rol Actual</TableHead>
            {showRoleActions && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showRoleActions ? 4 : 3} className="h-24 text-center text-muted-foreground">
                No se encontraron usuarios
              </TableCell>
            </TableRow>
          ) : (
            data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || "Sin nombre"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                    ${user.role.toUpperCase() === 'TUTOR' ? 'bg-purple-100 text-purple-700' :
                      user.role.toUpperCase() === 'DOCENTE' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'}`}>
                    {user.role}
                  </span>
                </TableCell>
                {showRoleActions && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role.toUpperCase() === "DOCENTE" && (
                          <DropdownMenuItem onClick={() => handleChangeRole(user.id, "TUTOR")}>
                            Cambiar a Tutor
                          </DropdownMenuItem>
                        )}
                        {user.role.toUpperCase() === "TUTOR" && (
                          <DropdownMenuItem onClick={() => handleChangeRole(user.id, "DOCENTE")}>
                            Cambiar a Docente
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Directorio de Usuarios</CardTitle>
          <CardDescription>
            Busca y administra a todos los miembros de la comunidad escolar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Tabs defaultValue="alumnos" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mb-6">
              <TabsTrigger value="alumnos" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Alumnos ({alumnos.length})
              </TabsTrigger>
              <TabsTrigger value="docentes" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Docentes ({docentes.length})
              </TabsTrigger>
              <TabsTrigger value="tutores" className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Tutores ({tutores.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alumnos">
              <UserTable data={alumnos} showRoleActions={false} />
            </TabsContent>

            <TabsContent value="docentes">
              <UserTable data={docentes} showRoleActions={true} />
            </TabsContent>

            <TabsContent value="tutores">
              <UserTable data={tutores} showRoleActions={true} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
