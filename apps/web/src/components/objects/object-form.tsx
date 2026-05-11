"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createObjectSchema, type CreateObjectInput, OBJECT_CONDITIONS, OBJECT_TYPES } from "@brol/shared";
import { BookOpen, QrCode, Loader2, CheckCircle2, XCircle } from "lucide-react";
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

// Labels and placeholders per object type
const typeLabels: Record<string, string> = {
  BOOK: "Livres",
  BOARD_GAME: "Jeux de société",
  TOOL: "Outils",
  FILM: "Films / DVD",
  MUSIC: "Musique / CD",
  ELECTRONIC: "Électronique",
  ELECTRIC: "Outillage électrique",
  CLOTHING: "Vêtements",
  CUSTOM: "Personnalisé",
};

type ObjectType = (typeof OBJECT_TYPES)[number];

const authorLabels: Record<ObjectType, { label: string; placeholder: string }> = {
  BOOK: { label: "Auteur", placeholder: "Antoine de Saint-Exupéry" },
  BOARD_GAME: { label: "Auteur / Créateur", placeholder: "Créateur du jeu" },
  TOOL: { label: "Marque / Fabricant", placeholder: "Makita, Bosch..." },
  FILM: { label: "Réalisateur", placeholder: "Christopher Nolan" },
  MUSIC: { label: "Artiste / Groupe", placeholder: "Daft Punk" },
  ELECTRONIC: { label: "Marque", placeholder: "Apple, Sony..." },
  ELECTRIC: { label: "Marque", placeholder: "Makita, DeWalt..." },
  CLOTHING: { label: "Marque", placeholder: "Nike, Zara..." },
  CUSTOM: { label: "Marque / Auteur", placeholder: "Marque ou auteur" },
};

const namePlaceholders: Record<ObjectType, string> = {
  BOOK: "Le Petit Prince",
  BOARD_GAME: "Catan",
  TOOL: "Tournevis cruciforme",
  FILM: "Inception",
  MUSIC: "Discovery",
  ELECTRONIC: "iPhone 13",
  ELECTRIC: "Perceuse sans fil 18V",
  CLOTHING: "Veste en cuir",
  CUSTOM: "Mon objet",
};

interface ObjectFormProps {
  collectionId?: string;
  objectId?: string;
  onSuccess?: () => void;
}

/**
 * Formulaire de création/modification d'objet.
 * Les champs affichés s'adaptent au type de la collection cible.
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

  // Fetch the target collection to get its type
  const { data: targetCollection } = trpc.collections.get.useQuery(
    { id: collectionId ?? "" },
    { enabled: !!collectionId }
  );

  // Determine objectType from collection.type
  const objectType: ObjectType = (targetCollection?.type as ObjectType) ?? "BOOK";

  // Auto-select first collection when no collectionId prop given
  const { data: collections } = trpc.collections.list.useQuery();
  useEffect(() => {
    if (!collectionId && collections?.items.length) {
      const current = watch("collectionId");
      if (!current) {
        setValue("collectionId", collections.items[0].id);
      }
    }
  }, [collections, collectionId, setValue, watch]);

  // Fetch QR codes
  const { data: qrCodes } = trpc.qr.listStock.useQuery(
    { used: false },
    { enabled: !!collectionId }
  );

  // QR state
  const [qrSelection, setQrSelection] = useState<"none" | "existing" | "create">("none");
  const [selectedQrId, setSelectedQrId] = useState<string>("");
  const [creatingQr, setCreatingQr] = useState(false);

  // ISBN lookup state
  const [isbnQuery, setIsbnQuery] = useState("");
  const [isbnForLookup, setIsbnForLookup] = useState("");
  const [isbnStatus, setIsbnStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");
  const isbnDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lookupQuery = trpc.objects.lookupIsbn.useQuery(
    { isbn: isbnForLookup },
    {
      enabled: isbnForLookup.length >= 10,
      staleTime: 10 * 60 * 1000, // Cache 10 min — metadata doesn't change
      retry: 1,
    }
  );

  // Auto-fill when lookup resolves
  useEffect(() => {
    if (!lookupQuery.isFetching && lookupQuery.data !== undefined) {
      if (lookupQuery.data) {
        setIsbnStatus("found");
        if (lookupQuery.data.title) setValue("name", lookupQuery.data.title, { shouldDirty: true });
        if (lookupQuery.data.author) setValue("author", lookupQuery.data.author, { shouldDirty: true });
        if (lookupQuery.data.coverUrl) setValue("coverImage", lookupQuery.data.coverUrl, { shouldDirty: true });
      } else {
        setIsbnStatus("not_found");
      }
    }
  }, [lookupQuery.isFetching, lookupQuery.data, setValue]);

  // Debounced ISBN lookup
  const handleIsbnChange = useCallback((isbn: string) => {
    setIsbnQuery(isbn);
    if (isbnDebounceRef.current) clearTimeout(isbnDebounceRef.current);

    const cleanIsbn = isbn.replace(/[-\s]/g, "");

    if (cleanIsbn.length < 10) {
      setIsbnStatus("idle");
      setIsbnForLookup("");
      return;
    }

    // Don't re-trigger if already looked up this ISBN
    if (cleanIsbn === isbnForLookup && lookupQuery.data !== undefined) {
      return;
    }

    setIsbnStatus("loading");
    isbnDebounceRef.current = setTimeout(() => {
      setIsbnForLookup(cleanIsbn);
    }, 700); // Debounce 700ms
  }, [isbnForLookup, lookupQuery.data]);

  const generateQrMutation = trpc.qr.generateStock.useMutation({ retry: 1 });
  const createMutation = trpc.objects.create.useMutation({
    onSuccess: (data) => {
      utils.objects.list.invalidate({ collectionId: data.collectionId });
      onSuccess?.();
      reset();
      router.push(`/collections/${data.collectionId}`);
    },
  });

  const onSubmit = async (formData: CreateObjectInput) => {
    try {
      let qrStockId: string | undefined;
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

      await createMutation.mutateAsync({
        ...formData,
        objectType,
        qrStockId,
      });
    } catch {
      setCreatingQr(false);
    }
  };

  const authorInfo = authorLabels[objectType];
  const namePlaceholder = namePlaceholders[objectType];
  const showIsbn = objectType === "BOOK" || objectType === "FILM";
  const showBoardGameFields = objectType === "BOARD_GAME";
  const showElectricFields = objectType === "ELECTRIC";
  const showCustomFields = objectType === "CUSTOM";

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
                {collection.type ? ` (${typeLabels[collection.type] ?? collection.type})` : ""}
              </option>
            ))}
          </select>
          {errors.collectionId && (
            <p className="font-mono text-xs text-destructive">{errors.collectionId.message}</p>
          )}
        </div>
      )}

      {/* Type indicator */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground uppercase">Type</span>
        <span className="font-mono text-xs bg-secondary/20 text-secondary border border-secondary/30 px-2 py-1">
          {typeLabels[objectType] ?? objectType}
        </span>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="font-mono text-xs uppercase">
          Nom *
        </Label>
        <Input
          id="name"
          placeholder={namePlaceholder}
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="font-mono text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Author / type-specific */}
      <div className="space-y-2">
        <Label htmlFor="author" className="font-mono text-xs uppercase">
          {authorInfo.label}
        </Label>
        <Input
          id="author"
          placeholder={authorInfo.placeholder}
          {...register("author")}
        />
      </div>

      {/* Edition / Model */}
      <div className="space-y-2">
        <Label htmlFor="edition" className="font-mono text-xs uppercase">
          {objectType === "BOARD_GAME" ? "Édition" :
           objectType === "ELECTRIC" ? "Modèle / Référence" : "Édition / Modèle"}
        </Label>
        <Input
          id="edition"
          placeholder={
            objectType === "BOOK" ? "Gallimard, 1943" :
            objectType === "BOARD_GAME" ? "Édition française" :
            objectType === "FILM" ? "Director's Cut" :
            objectType === "MUSIC" ? "Virgin Records, 1997" :
            objectType === "ELECTRIC" ? "DFD453, 18V" :
            "Modèle, référence..."
          }
          {...register("edition")}
        />
      </div>

      {/* BOARD_GAME specific fields */}
      {showBoardGameFields && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="playersMin" className="font-mono text-xs uppercase">
                Joueurs min.
              </Label>
              <Input
                id="playersMin"
                type="number"
                min={1}
                placeholder="2"
                {...register("playersMin", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="playersMax" className="font-mono text-xs uppercase">
                Joueurs max.
              </Label>
              <Input
                id="playersMax"
                type="number"
                min={1}
                placeholder="6"
                {...register("playersMax", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="playingTimeMinutes" className="font-mono text-xs uppercase">
                Durée (min.)
              </Label>
              <Input
                id="playingTimeMinutes"
                type="number"
                min={1}
                placeholder="60"
                {...register("playingTimeMinutes", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageMin" className="font-mono text-xs uppercase">
                Âge min.
              </Label>
              <Input
                id="ageMin"
                type="number"
                min={0}
                placeholder="8"
                {...register("ageMin", { valueAsNumber: true })}
              />
            </div>
          </div>
        </>
      )}

      {/* ELECTRIC specific fields */}
      {showElectricFields && (
        <div className="space-y-2">
          <Label htmlFor="powerWatts" className="font-mono text-xs uppercase">
            Puissance (W)
          </Label>
          <Input
            id="powerWatts"
            type="number"
            min={1}
            placeholder="500"
            {...register("powerWatts", { valueAsNumber: true })}
          />
        </div>
      )}

      {/* ISBN — BOOK and FILM */}
      {showIsbn && (
        <div className="space-y-2">
          <Label htmlFor="isbn" className="font-mono text-xs uppercase">
            ISBN
          </Label>
          <div className="relative">
            <Input
              id="isbn"
              placeholder="978-2-07-040850-4"
              value={isbnQuery}
              onChange={(e) => handleIsbnChange(e.target.value)}
              className="pr-20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isbnStatus === "loading" && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
              {isbnStatus === "found" && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
              {isbnStatus === "not_found" && (
                <XCircle className="w-4 h-4 text-orange-500" />
              )}
            </div>
          </div>
          {isbnStatus === "found" && (
            <p className="font-mono text-xs text-green-400">
              ✓ Métadonnées récupérées — vérifiez et ajustez si nécessaire
            </p>
          )}
          {isbnStatus === "not_found" && isbnQuery.length >= 10 && (
            <p className="font-mono text-xs text-orange-400">
              ISBN non trouvé — remplissez manuellement
            </p>
          )}
          {isbnStatus === "idle" && isbnQuery.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground">
              Saisie automatique via Open Library
            </p>
          )}
        </div>
      )}

      {/* Barcode — all types */}
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

      {/* CUSTOM fields */}
      {showCustomFields && (
        <>
          <div className="space-y-2">
            <Label htmlFor="customField1" className="font-mono text-xs uppercase">
              {targetCollection?.customField1Label ?? "Champ libre 1"}
            </Label>
            <Input
              id="customField1"
              placeholder="Valeur..."
              {...register("customField1")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customField2" className="font-mono text-xs uppercase">
              {targetCollection?.customField2Label ?? "Champ libre 2"}
            </Label>
            <Input
              id="customField2"
              placeholder="Valeur..."
              {...register("customField2")}
            />
          </div>
        </>
      )}

      {/* Condition */}
      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase">État</Label>
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

      {/* QR Code selection */}
      {collectionId && (
        <div className="space-y-2">
          <Label className="font-mono text-xs uppercase">QR Code</Label>
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
