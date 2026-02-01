import { useState } from "react";

type useJustificantesReturn = {
  isErrorJustificantes: boolean;
  isLoadingJustificantes: boolean;
  isSuccess: boolean;
  uploadJustificante: (file: File) => Promise<string>;
};

export default function useJustificantes(): useJustificantesReturn {
  const [isErrorJustificantes, setIsErrorJustificantes] = useState(false);
  const [isLoadingJustificantes, setIsLoadingJustificantes] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const uploadJustificante = async (file: File) => {
    setIsLoadingJustificantes(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/justificantes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload justificante");
      }

      const data = await response.json();
      setIsSuccess(true);
      return data.url;
    } catch (error) {
      setIsErrorJustificantes(true);
      throw error;
    } finally {
      setIsLoadingJustificantes(false);
    }
  };

  return {
    isErrorJustificantes,
    isLoadingJustificantes,
    uploadJustificante,
    isSuccess
  };
}