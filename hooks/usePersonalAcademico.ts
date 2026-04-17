import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface UserAcademic {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  image: string | null;
  createdAt: string;
}

export function usePersonalAcademico() {
  const [personal, setPersonal] = useState<UserAcademic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getPersonal = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/justificantes/api/users?roles=DOCENTE,TUTOR');
      if (!response.ok) {
        throw new Error("Error al obtener personal académico");
      }
      const data = await response.json();
      setPersonal(data);
      return data;
    } catch (error) {
      toast.error((error as Error).message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    personal,
    isLoadingPersonal: isLoading,
    getPersonal,
  };
}
