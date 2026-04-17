import { useState, useCallback } from "react";
import { toast } from "sonner";
import { User } from "@/lib/types";

export default function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getUsers = useCallback(async (role?: string) => {
    setIsLoading(true);
    try {
      const url = role ? `/justificantes/api/users?role=${role}` : '/justificantes/api/users';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al obtener usuarios");
      }
      const data = await response.json();
      setUsers(data);
      return data;
    } catch (error) {
      toast.error((error as Error).message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserRole = async (userId: string, newRole: "DOCENTE" | "TUTOR") => {
    try {
      const response = await fetch(`/justificantes/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar rol");
      }

      toast.success(`Rol actualizado a ${newRole} exitosamente`);
      
      // Update local state to reflect change immediately without refetching everything
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      return true;
    } catch (error) {
      toast.error((error as Error).message);
      return false;
    }
  };

  return {
    users,
    isLoading,
    getUsers,
    updateUserRole,
  };
}
