"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createObjectSchema, type CreateObjectInput, OBJECT_CONDITIONS } from "@brol/shared";
import { BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { trpc } from "../../lib/trpc";

const conditionLabels: Record<string, string> = {
  NEW: "Neuf",
  LIKE_NEW: "Comme neuf",
  GOOD: "Bon",
  FAIR: "Correct",
  POOR: "Mauvais",
};

interface ObjectFormProps {
  collectionId?: string;
  objectId?: string;
  onSuccess?: () => void;
}

/**
 * Formulaire de création/modification d'objet.
 */
export function ObjectForm({ collectionId, objectId, onSuccess }: ObjectFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<CreateObjectInput>({
    resolver: zodResolver(createObjectSchema),
    defaultValues: {
      name: "",
      author: "",
      edition: "",
      isbn: "",
      barcode: "",
      condition: "GOOD",
      notes: "",
      collectionId: collectionId ?? "",
    },
  });

  // Update collectionId when prop changes
  useEffect(() => {
    if (collectionId) {
      setValue("collectionId", collectionId);
    }
  }, [collectionId, setValue]);

  // Create mutation
  const createMutation = trpc.objects.create.useMutation({
    onSuccess: (data) => {
      utils.objects.list.invalidate({ collectionId: data.collectionId });
      onSuccess?.();
      reset();
      // Redirect to collection
      router.push(`/collections/${data.collectionId}`);
    },
  });

  // Fetch collections for dropdown if no collectionId provided
  const { data: collections } = trpc.collections.list.useQuery(
    undefined,
    { enabled: !collectionId }
  );

  const onSubmit = async (formData: CreateObjectInput) => {
    try {
      await createMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Failed to create object:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Collection selector */}
      {!collectionId && (
        <div className="space-y-2">
          <Label htmlFor="collectionId" className="font-mono text-xs uppercase">
            Collection *
          </Label>
          <select
            id="collectionId"
            {...register("collectionId")}
            className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">Sélectionner une collection</option>
            {collections?.items.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          {errors.collectionId && (
            <p className="font-mono text-xs text-destructive">
              {errors.collectionId.message}
            </p>
          )}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="font-mono text-xs uppercase">
          Nom de l'objet *
        </Label>
        <Input
          id="name"
          placeholder="Le Petit Prince"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="font-mono text-xs text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Author */}
      <div className="space-y-2">
        <Label htmlFor="author" className="font-mono text-xs uppercase">
          Auteur / Marque
        </Label>
        <Input
          id="author"
          placeholder="Antoine de Saint-Exupéry"
          {...register("author")}
        />
      </div>

      {/* Edition */}
      <div className="space-y-2">
        <Label htmlFor="edition" className="font-mono text-xs uppercase">
          Édition / Modèle
        </Label>
        <Input
          id="edition"
          placeholder="Gallimard, 1943"
          {...register("edition")}
        />
      </div>

      {/* ISBN / Barcode */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="isbn" className="font-mono text-xs uppercase">
            ISBN
          </Label>
          <Input
            id="isbn"
            placeholder="978-2-07-040850-4"
            {...register("isbn")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode" className="font-mono text-xs uppercase">
            Code-barres
          </Label>
          <Input
            id="barcode"
            placeholder="1234567890123"
            {...register("barcode")}
          />
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase">
          État
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {OBJECT_CONDITIONS.map((condition) => (
            <label
              key={condition}
              className={`
                flex flex-col items-center gap-1 p-2 border-2 border-border cursor-pointer
                hover:border-primary/50 transition-colors text-center
                ${watch("condition") === condition ? "border-primary bg-primary/10" : ""}
              `}
            >
              <input
                type="radio"
                value={condition}
                {...register("condition")}
                className="sr-only"
              />
              <span className="font-mono text-xs">{conditionLabels[condition]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="font-mono text-xs uppercase">
          Notes
        </Label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Notes ou remarques sur l'objet..."
          {...register("notes")}
          className="flex w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || createMutation.isPending}
      >
        <BookOpen className="w-4 h-4 mr-2" />
        {createMutation.isPending ? "Création..." : "Ajouter l'objet"}
      </Button>
    </form>
  );
}
