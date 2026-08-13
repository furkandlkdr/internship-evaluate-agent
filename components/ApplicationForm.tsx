"use client";

import React, { useState, useCallback } from "react";
import FormField from "./FormField";
import FileUpload from "./FileUpload";
import {
  validateFirstName,
  validateLastName,
  validateTechnologies,
  validateDescription,
  validateCv,
  MAX_FIRST_NAME,
  MAX_LAST_NAME,
  MAX_TECHNOLOGIES,
  MAX_DESCRIPTION,
} from "@/lib/validation";
import { N8N_WEBHOOK_URL } from "@/lib/config";

type SubmissionState = "idle" | "submitting" | "success" | "error";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  technologies?: string;
  description?: string;
  cv?: string;
  general?: string;
}

export default function ApplicationForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [description, setDescription] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const validateAll = useCallback((): boolean => {
    const first = validateFirstName(firstName);
    const last = validateLastName(lastName);
    const tech = validateTechnologies(technologies);
    const desc = validateDescription(description);
    const cv = validateCv(cvFile);

    const newErrors: FormErrors = {};
    if (!first.valid) newErrors.firstName = first.message;
    if (!last.valid) newErrors.lastName = last.message;
    if (!tech.valid) newErrors.technologies = tech.message;
    if (!desc.valid) newErrors.description = desc.message;
    if (!cv.valid) newErrors.cv = cv.message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, technologies, description, cvFile]);

  const clearForm = useCallback(() => {
    setFirstName("");
    setLastName("");
    setTechnologies("");
    setDescription("");
    setCvFile(null);
    setErrors({});
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (status === "submitting") return;
      if (!validateAll()) return;

      setStatus("submitting");
      setStatusMessage("");
      setErrors((prev) => ({ ...prev, general: undefined }));

      const formData = new FormData();
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      formData.append("technologies", technologies.trim());
      formData.append("description", description.trim());
      // n8n workflow binary property adı "data" olarak bekleniyor
      if (cvFile) {
        formData.append("data", cvFile);
      }

      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          body: formData,
          // Content-Type header'ı manuel ayarlanmamalı;
          // tarayıcı multipart/form-data boundary'yi otomatik üretir.
        });

        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        let data: unknown;
        try {
          data = await response.json();
        } catch {
          // JSON parse hatası durumunda başarı kabul et
          data = { success: true };
        }

        const payload = data as { success?: boolean; error?: string };

        if (payload.success === true) {
          setStatus("success");
          setStatusMessage("Başvurunuz başarıyla gönderildi.");
          clearForm();
        } else {
          setStatus("error");
          setStatusMessage(
            payload.error ||
              "Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
          );
        }
      } catch {
        setStatus("error");
        setStatusMessage(
          "Başvurunuz şu anda gönderilemedi. Lütfen tekrar deneyin."
        );
      }
    },
    [
      firstName,
      lastName,
      technologies,
      description,
      cvFile,
      status,
      validateAll,
      clearForm,
    ]
  );

  const isSubmitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      noValidate
      aria-label="Staj başvuru formu"
    >
      <FormField
        id="first_name"
        label="Ad"
        required
        error={errors.firstName}
      >
        <input
          id="first_name"
          name="first_name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          maxLength={MAX_FIRST_NAME}
          disabled={isSubmitting}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60"
          placeholder="Adınız"
          aria-invalid={errors.firstName ? "true" : "false"}
          aria-describedby={errors.firstName ? "first_name-error" : undefined}
        />
      </FormField>

      <FormField
        id="last_name"
        label="Soyad"
        required
        error={errors.lastName}
      >
        <input
          id="last_name"
          name="last_name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          maxLength={MAX_LAST_NAME}
          disabled={isSubmitting}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60"
          placeholder="Soyadınız"
          aria-invalid={errors.lastName ? "true" : "false"}
          aria-describedby={errors.lastName ? "last_name-error" : undefined}
        />
      </FormField>

      <FormField
        id="technologies"
        label="Kullandığınız Teknolojiler / Uygulamalar"
        required
        error={errors.technologies}
        helperText={`${technologies.length} / ${MAX_TECHNOLOGIES} karakter`}
      >
        <textarea
          id="technologies"
          name="technologies"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          maxLength={MAX_TECHNOLOGIES}
          disabled={isSubmitting}
          rows={4}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 resize-y"
          placeholder="Örn: Python, TensorFlow, React, n8n, OpenAI API, Docker, vs."
          aria-invalid={errors.technologies ? "true" : "false"}
          aria-describedby={
            errors.technologies ? "technologies-error" : undefined
          }
        />
      </FormField>

      <FormField
        id="description"
        label="Açıklama"
        required
        error={errors.description}
        helperText={`${description.length} / ${MAX_DESCRIPTION} karakter`}
      >
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_DESCRIPTION}
          disabled={isSubmitting}
          rows={6}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 resize-y"
          placeholder="Kısaca geçmişinizi, projelerinizi, ilgi alanlarınızı ve neden bu stajı istediğinizi anlatın."
          aria-invalid={errors.description ? "true" : "false"}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
        />
      </FormField>

      <FormField id="cv" label="CV" required error={errors.cv}>
        <FileUpload
          id="cv"
          file={cvFile}
          onFileSelect={setCvFile}
          error={errors.cv}
        />
      </FormField>

      {status === "error" && (
        <div
          className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {statusMessage}
        </div>
      )}

      {status === "success" && (
        <div
          className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="mr-2 inline-flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "300ms" }}
              />
            </span>
            Gönderiliyor…
          </>
        ) : (
          "Başvuruyu Gönder"
        )}
      </button>
    </form>
  );
}
