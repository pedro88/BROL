"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createObjectSchema, type CreateObjectInput, OBJECT_CONDITIONS } from "@brol/shared";
import { BookOpen, QrCode } from "lucide-react";
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

  // Generate QR mutation
  const generateQrMutation = trpc.qr.generateStock.useMutation({
    retry: 1,
  });
  const createMutation = trpc.objects.create.useMutation({
    onSuccess: (data) => {
      utils.objects.list.invalidate({ collectionId: data.collectionId });
      onSuccess?.();
      reset();
      // Redirect to collection
      router.push(`/collections/${data.collectionId}`);
    },
    onError: () => {
      // Reset form error state so user can try again
      // The form shows the error message via errors.name / errors.collectionId
    },
  });

  // Always fetch collections (needed for the dropdown when no collectionId prop)
  const { data: collections } = trpc.collections.list.useQuery();

  // Auto-select first collection when collections load and no collectionId prop is given
  useEffect(() => {
    if (!collectionId && collections?.items.length) {
      const current = watch("collectionId");
      if (!current) {
        setValue("collectionId", collections.items[0].id);
      }
    }
  }, [collections, collectionId, setValue, watch]);

  // Fetch available QR codes when collectionId is provided
  const { data: qrCodes } = trpc.qr.listStock.useQuery(
    { used: false },
    { enabled: !!collectionId }
  );

  // QR code selection state
  const [qrSelection, setQrSelection] = useState<"none" | "existing" | "create">("none");
  const [selectedQrId, setSelectedQrId] = useState<string>("");
  const [creatingQr, setCreatingQr] = useState(false);

  const onSubmit = async (formData: CreateObjectInput) => {
    try {
      let qrStockId: string | undefined;

      // Handle QR code selection
      if (qrSelection === "create") {
        setCreatingQr(true);
        const qrResult = await generateQrMutation.mutateAsync({ count: 1 });
        if (qrResult.codes.length > 0) {
          qrStockId = qrResult.codes[0].id;
        }
        setCreatingQr(false);
      } else if (qrSelection === "existing" && selectedQrId) {
        qrStockId = selectedQrId;
      }

      const objectData = {
        ...formData,
        qrStockId,
      };

      const created = await createMutation.mutateAsync(objectData);
    } catch (error) {
      setCreatingQr(false);
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

      {/* QR Code selection — only when collectionId is provided */}
      {collectionId && (
        <div className="space-y-2">
          <Label className="font-mono text-xs uppercase">
            QR Code
          </Label>
          <div className="space-y-2">
            {[
              { value: "none", label: "Aucun QR code" },
              { value: "existing", label: "Sélectionner un QR existant" },
              { value: "create", label: "Créer un nouveau QR" },
            ].map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center gap-3 p-3 border-2 border-border cursor-pointer
                  hover:border-primary/50 transition-colors
                  ${qrSelection === option.value ? "border-primary bg-primary/10" : ""}
                `}
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={qrSelection === option.value}
                  onChange={() => setQrSelection(option.value as typeof qrSelection)}
                  className="sr-only"
                />
                <QrCode className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-sm">{option.label}</span>
              </label>
            ))}
          </div>

          {/* Existing QR selector */}
          {qrSelection === "existing" && (
            <select
              value={selectedQrId}
              onChange={(e) => setSelectedQrId(e.target.value)}
              className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Sélectionner un QR code</option>
              {qrCodes?.items.map((qr) => (
                <option key={qr.id} value={qr.id}>
                  {qr.code}
                </option>
              ))}
            </select>
          )}

          {qrSelection === "existing" && selectedQrId && (
            <p className="font-mono text-xs text-green-400">
              QR sélectionné : {qrCodes?.items.find((q) => q.id === selectedQrId)?.code}
            </p>
          )}

          {qrSelection === "create" && (
            <p className="font-mono text-xs text-muted-foreground">
              Un nouveau QR code sera généré automatiquement à la création de l&apos;objet.
            </p>
          )}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || createMutation.isPending || creatingQr}
      >
        {createMutation.isPending || creatingQr ? (
          <>
            <BookOpen className="w-4 h-4 mr-2 animate-spin" />
            {creatingQr ? "Génération du QR..." : "Création..."}
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4 mr-2" />
            Ajouter l&apos;objet
          </>
        )}
      </Button>
    </form>
  );
}
