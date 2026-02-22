import { Justificante } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

interface FormDataInterface {
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  descripcion: string;
  tutorEmail: string;
  profesoresEmails: string[];
  file: File | null;
}

type useJustificantesReturn = {
  isErrorJustificantes: boolean;
  isUploadingJustificante: boolean;
  isSuccess: boolean;
  uploadJustificante: (formData: FormDataInterface) => Promise<string>;
  getJustificantes: () => Promise<void>
  isLoadingJustificantes: boolean
  justificantes: Justificante[];
};

// Hook to manage justificantes GET and POST operations
// Expose a function to get all justificantes according of the user role
// ESTUDIANTE: only their justificantes
// ADMIN & COORDINADOR: all justificantes
// DOCENTE: only just ificantes assigned to them
// The role validaton is determined in the API route using the JWT token

export default function useJustificantes(): useJustificantesReturn {
  const [justificantes, setJustificantes] = useState<Justificante[]>([]);
  const [isLoadingJustificantes, setIsLoadingJustificantes] = useState(false);
  
  const [isErrorJustificantes, setIsErrorJustificantes] = useState(false);
  const [isUploadingJustificante, setIsUploadingJustificante] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getJustificantes = async () => {
    setIsLoadingJustificantes(true);
    try {
      const response = await fetch("/api/justificantes");
      if (!response.ok) {
        throw new Error("Failed to fetch justificantes");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setJustificantes(data);
      } else if (data.justificantes) {
        setJustificantes(data.justificantes);
      }
    } catch (error) {
      setIsErrorJustificantes(true);
      toast.error("Error al obtener los justificantes: " + (error as Error).message);
    } finally {
      setIsLoadingJustificantes(false);
    }
  }

  const uploadJustificante = async (formData: FormDataInterface) => {
    setIsUploadingJustificante(true);
    try {
      if (!formData.file) return
      const formDataToSend = new FormData();
      formDataToSend.append("fechaInicio", formData.fechaInicio);
      formDataToSend.append("fechaFin", formData.fechaFin);
      formDataToSend.append("motivo", formData.motivo);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("tutorEmail", formData.tutorEmail);
      formDataToSend.append("profesoresEmails", JSON.stringify(formData.profesoresEmails));
      formDataToSend.append("file", formData.file);

      const response = await fetch("/api/justificantes", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to upload justificante");
      }

      const data = await response.json();
      setIsSuccess(true);
      return data.url;
    } catch (error) {
      toast.error("Error al subir el justificante: " + (error as Error).message);
      setIsErrorJustificantes(true);
      throw error;
    } finally {
      setIsUploadingJustificante(false);
    }
  };

  return {
    isLoadingJustificantes,
    isErrorJustificantes,
    isUploadingJustificante,
    uploadJustificante,
    getJustificantes,
    isSuccess,
    justificantes
  };
}