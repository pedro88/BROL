"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { createObjectSchema, type CreateObjectInput, OBJECT_CONDITIONS, OBJECT_TYPES } from "@brol/shared";
import { BookOpen, QrCode, Loader2, CheckCircle2, XCircle, Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { PhotoPicker } from "./photo-picker";
import { QrScanner } from "../qr/qr-scanner";
import { trpc } from "../../lib/trpc";
import { compressImage } from "../../lib/image-compress";

type ObjectType = (typeof OBJECT_TYPES)[number];

interface ObjectFormProps {
  collectionId?: string;
  objectId?: string;
  onSuccess?: (newObject?: { id: string; collectionId: string }) => void;
}

/**
 * Formulaire de création/modification d'objet.
 * Les champs affichés s'adaptent au type de la collection cible.
 */
export function ObjectForm({ collectionId, objectId, onSuccess }: ObjectFormProps) {
  const t = useTranslations();
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

  // Track the currently-selected collectionId (prop OR form-watched value, so the
  // dropdown sélection se propage à `objectType`).
  const watchedCollectionId = watch("collectionId");
  const effectiveCollectionId = collectionId ?? watchedCollectionId;

  // Fetch the target collection to get its type
  const { data: targetCollection } = trpc.collections.get.useQuery(
    { id: effectiveCollectionId ?? "" },
    { enabled: !!effectiveCollectionId }
  );

  // Determine objectType from collection.type — use state to update when collection changes
  const [objectType, setObjectType] = useState<ObjectType>("BOOK");
  useEffect(() => {
    const type = (targetCollection?.type as ObjectType) ?? "BOOK";
    setObjectType(type);
  }, [targetCollection?.type]);

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
    { enabled: !!effectiveCollectionId }
  );

  // QR state
  const [qrSelection, setQrSelection] = useState<"none" | "scan" | "existing" | "create">("none");
  const [selectedQrId, setSelectedQrId] = useState<string>("");
  const [creatingQr, setCreatingQr] = useState(false);

  // Self-service mode
  const [selfServiceEnabled, setSelfServiceEnabled] = useState(false);

  // Photo state for creation-time upload
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // QR Scanner state
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scannedQrCode, setScannedQrCode] = useState<string | null>(null);

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
      utils.objects.all.invalidate();
    },
  });

  const onSubmit = async (formData: CreateObjectInput) => {
    setCreatingQr(false);
    setUploadingPhoto(false);

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
      } else if (qrSelection === "scan" && scannedQrCode) {
        // Will be assigned after object creation
      }

      // 1. Créer l'objet
      const newObject = await createMutation.mutateAsync({
        ...formData,
        objectType,
        qrStockId,
        selfServiceMode: selfServiceEnabled ? "CONTACTS" : "OFF",
      });

      // 2. Assigner le QR scanné après création
      if (qrSelection === "scan" && scannedQrCode) {
        try {
          // Extraire le code si c'est une URL
          const code = scannedQrCode.includes("/qr/")
            ? scannedQrCode.split("/qr/").pop()!
            : scannedQrCode;

          await assignQrMutation.mutateAsync({
            objectId: newObject.id,
            qrCode: code,
          });
        } catch (assignErr) {
          console.error("QR assign failed:", assignErr);
        }
      }

      // 3. Upload la photo si sélectionnée — séquentiel pour garantir que
      // `photos.add` complète AVANT le redirect (`onSuccess?.(newObject)`).
      // L'ancien flux laissait le PUT S3 + `photos.add` dans le `onSuccess`
      // de la mutation, qui restait pending au moment du navigate → fetches
      // abortés → photo perdue côté DB.
      if (selectedPhoto) {
        setUploadingPhoto(true);
        try {
          // Compression côté client AVANT presigned URL : on signe pour la
          // taille/MIME du fichier compressé, sinon validation backend (S3
          // policy) peut rejeter une taille décalée.
          const compressed = await compressImage(selectedPhoto);
          const presigned = await getPresignedUrlMutation.mutateAsync({
            objectId: newObject.id,
            filename: compressed.name,
            contentType: compressed.type,
            fileSize: compressed.size,
          });
          const putRes = await fetch(presigned.uploadUrl, {
            method: "PUT",
            body: compressed,
            headers: { "Content-Type": compressed.type },
          });
          if (!putRes.ok) {
            throw new Error(`Upload S3 échoué (${putRes.status})`);
          }
          await addPhotoMutation.mutateAsync({
            objectId: newObject.id,
            url: presigned.publicUrl,
            position: 0,
          });
        } catch (uploadErr) {
          console.error("Photo upload failed:", uploadErr);
          toast.error(
            uploadErr instanceof Error
              ? t("objects.photoUploadError", { error: uploadErr.message })
              : t("objects.photoUploadErrorGeneric"),
          );
        } finally {
          setUploadingPhoto(false);
        }
      }

      setScannedQrCode(null);
      setSelectedPhoto(null);
      onSuccess?.(newObject);

      // Toast de succès
      toast.success(t("objects.createSuccess"));

      // Reset form
      reset();
    } catch (err) {
      setCreatingQr(false);
      setUploadingPhoto(false);
      toast.error(t("objects.createError"));
      throw err; // Rethrow to prevent form reset
    }
  };

  const authorInfo = {
    label: objectType === "BOOK" ? t("objects.author") : t(`objects.authorLabel.${objectType}`),
    placeholder: t(`objects.authorPlaceholder.${objectType}`),
  };
  const namePlaceholder = t(`objects.namePlaceholder.${objectType}`);
  const showIsbn = objectType === "BOOK" || objectType === "FILM";
  const showBoardGameFields = objectType === "BOARD_GAME";
  const showVideoGameFields = objectType === "VIDEOGAME";
  const showElectricFields = objectType === "ELECTRIC";
  const showClothingFields = objectType === "CLOTHING";
  const showToolFields = objectType === "TOOL";
  const showCustomFields = objectType === "CUSTOM";
  // Tarification: disponible pour tous les types, mais désactivée par défaut
  const [pricingEnabled, setPricingEnabled] = useState(false);

  // QR assign mutation
  const assignQrMutation = trpc.qr.assign.useMutation();

  // Photo add mutation
  const addPhotoMutation = trpc.photos.add.useMutation();

  // Photo presigned URL mutation — la logique d'upload est inline dans
  // `onSubmit` pour garantir un séquencement strict avec le redirect.
  const getPresignedUrlMutation = trpc.photos.getPresignedUrl.useMutation();

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
            <option value="">{t("objects.selectCollection")}</option>
            {collections?.items.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
                {collection.type ? ` (${t(`collections.typeLabel.${collection.type}`)})` : ""}
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
        <span className="font-mono text-xs text-muted-foreground uppercase">{t("objects.type")}</span>
        <span className="font-mono text-xs bg-secondary/20 text-secondary border border-secondary/30 px-2 py-1">
          {t(`collections.typeLabel.${objectType}`)}
        </span>
      </div>

      {/* Photo picker */}
      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase">{t("objects.photo")}</Label>
        <PhotoPicker
          onPhotoSelected={(file) => {
            setSelectedPhoto(file);
          }}
          disabled={uploadingPhoto}
        />
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

      {/* Author / type-specific — CLOTHING + TOOL ont leur propre champ `brand`
          dans la section dédiée. */}
      {objectType !== "CLOTHING" && objectType !== "TOOL" && (
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
      )}

      {/* Edition / Model */}
      <div className="space-y-2">
        <Label htmlFor="edition" className="font-mono text-xs uppercase">
          {objectType === "BOARD_GAME" ? "Édition" :
           objectType === "ELECTRIC" ? t("objects.editionLabel.ELECTRIC") :
           objectType === "VIDEOGAME" ? t("objects.editionLabel.VIDEOGAME") : t("objects.editionLabel")}
        </Label>
        <Input
          id="edition"
          placeholder={
            objectType === "BOOK" ? t("objects.editionPlaceholder.BOOK") :
            objectType === "BOARD_GAME" ? t("objects.editionPlaceholder.BOARD_GAME") :
            objectType === "FILM" ? t("objects.editionPlaceholder.FILM") :
            objectType === "MUSIC" ? t("objects.editionPlaceholder.MUSIC") :
            objectType === "ELECTRIC" ? t("objects.editionPlaceholder.ELECTRIC") :
            objectType === "VIDEOGAME" ? t("objects.editionPlaceholder.VIDEOGAME") :
            t("objects.editionPlaceholder.DEFAULT")
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
                {t("objects.playersMin")}
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
                {t("objects.playersMax")}
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
                {t("objects.playingTimeMinutes")}
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
                {t("objects.ageMin")}
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

      {/* VIDEOGAME specific fields */}
      {showVideoGameFields && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="playersMax" className="font-mono text-xs uppercase">
              {t("objects.playersMax")}
            </Label>
            <Input
              id="playersMax"
              type="number"
              min={1}
              placeholder="4"
              {...register("playersMax", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ageMin" className="font-mono text-xs uppercase">
              {t("objects.ageMin")}
            </Label>
            <Input
              id="ageMin"
              type="number"
              min={0}
              placeholder="12"
              {...register("ageMin", { valueAsNumber: true })}
            />
          </div>
        </div>
      )}

      {/* ELECTRIC specific fields */}
      {showElectricFields && (
        <div className="space-y-2">
          <Label htmlFor="powerWatts" className="font-mono text-xs uppercase">
            {t("objects.powerWatts")}
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
              placeholder={t("objects.isbnPlaceholder")}
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
              {t("objects.isbnFound")}
            </p>
          )}
          {isbnStatus === "not_found" && isbnQuery.length >= 10 && (
            <p className="font-mono text-xs text-orange-400">
              {t("objects.isbnNotFound")}
            </p>
          )}
          {isbnStatus === "idle" && isbnQuery.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground">
              {t("objects.isbnAutoFill")}
            </p>
          )}
        </div>
      )}

      {/* Code-barres : retiré de l'UI de création (backlog) mais conservé en
          DB (`barcode`) — le champ reste dans le form state (default "") pour
          ne pas casser le schéma de création / l'autofill ISBN. */}

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

      {/* CLOTHING specific fields */}
      {showClothingFields && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clothingSize" className="font-mono text-xs uppercase">
                {t("objects.gender.clothing.size")}
              </Label>
              <select
                id="clothingSize"
                {...register("clothingSize")}
                className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">Sélectionner</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
                <option value="34">34</option>
                <option value="36">36</option>
                <option value="38">38</option>
                <option value="40">40</option>
                <option value="42">42</option>
                <option value="44">44</option>
                <option value="46">46</option>
                <option value="48">48</option>
                <option value="50">50</option>
                <option value="52">52</option>
                <option value="54">54</option>
                <option value="56">56</option>
                <option value="Enfant">{t("objects.size.CHILD")}</option>
                <option value="Autre">{t("common.other")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clothingGender" className="font-mono text-xs uppercase">
                {t("objects.gender.clothing.gender")}
              </Label>
              <select
                id="clothingGender"
                {...register("clothingGender")}
                className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">Sélectionner</option>
                <option value="Homme">{t("objects.gender.MALE")}</option>
                <option value="Femme">{t("objects.gender.FEMALE")}</option>
                <option value="Unisexe">{t("objects.gender.UNISEX")}</option>
                <option value="Enfant">{t("objects.size.CHILD")}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clothingColor" className="font-mono text-xs uppercase">
                {t("objects.color")}
              </Label>
              <Input
                id="clothingColor"
                placeholder="Noir, bleu..."
                {...register("clothingColor")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clothingMaterial" className="font-mono text-xs uppercase">
                {t("objects.material")}
              </Label>
              <Input
                id="clothingMaterial"
                placeholder="Coton, cuir..."
                {...register("clothingMaterial")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand" className="font-mono text-xs uppercase">
              {t("objects.authorLabel.CLOTHING")}
            </Label>
            <Input
              id="brand"
              placeholder={t("objects.brandPlaceholder.CLOTHING")}
              {...register("brand")}
            />
          </div>
        </>
      )}

      {/* TOOL specific fields */}
      {showToolFields && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="toolSector" className="font-mono text-xs uppercase">
                {t("objects.toolSector.label")}
              </Label>
              <select
                id="toolSector"
                {...register("toolSector")}
                className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">Sélectionner</option>
                <option value="Bricolage">{t("objects.toolSector.DIY")}</option>
                <option value="Jardinage">{t("objects.toolSector.GARDENING")}</option>
                <option value="Automobile">{t("objects.toolSector.AUTOMOTIVE")}</option>
                <option value="Plomberie">{t("objects.toolSector.PLUMBING")}</option>
                <option value="Électricité">{t("objects.toolSector.ELECTRICAL")}</option>
                <option value="Construction">{t("objects.toolSector.CONSTRUCTION")}</option>
                <option value="Menuiserie">{t("objects.toolSector.CARPENTRY")}</option>
                <option value="Peinture">{t("objects.toolSector.PAINTING")}</option>
                <option value="Autre">{t("common.other")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="toolPowerSource" className="font-mono text-xs uppercase">
                {t("objects.powerSource.label")}
              </Label>
              <select
                id="toolPowerSource"
                {...register("toolPowerSource")}
                className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">Sélectionner</option>
                <option value="MANUAL">{t("objects.powerSource.MANUAL")}</option>
                <option value="MAINS">{t("objects.powerSource.MAINS")}</option>
                <option value="BATTERY">{t("objects.powerSource.BATTERY")}</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand" className="font-mono text-xs uppercase">
              {t("objects.authorLabel.CLOTHING")}
            </Label>
            <Input
              id="brand"
              placeholder={t("objects.brandPlaceholder.TOOL")}
              {...register("brand")}
            />
          </div>
        </>
      )}

      {/* Condition */}
      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase">{t("objects.conditionLabel")}</Label>
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
              <span className="font-mono text-xs">{t(`objects.conditions.${condition}`)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pricing toggle — available for all object types */}
      <div className="border-t-2 border-border pt-4 mt-4">
        <button
          type="button"
          onClick={() => setPricingEnabled(!pricingEnabled)}
          className={`
            w-full flex items-center justify-between px-4 py-3 border-2 border-border
            hover:border-primary/50 transition-colors
            ${pricingEnabled ? "border-primary bg-primary/10" : ""}
          `}
        >
          <span className="font-mono text-xs uppercase">
            {pricingEnabled ? t("objects.pricingEnabled") : t("objects.pricingDisabled")}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {pricingEnabled ? t("common.disable") : t("common.optional")}
          </span>
        </button>

        {/* Pricing fields */}
        {pricingEnabled && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cautionAmount" className="font-mono text-xs uppercase">
                  {t("objects.cautionAmount")}
                </Label>
                <Input
                  id="cautionAmount"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={t("objects.cautionAmountPlaceholder")}
                  {...register("cautionAmount", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalPriceDay" className="font-mono text-xs uppercase">
                  {t("objects.rentalPriceDay")}
                </Label>
                <Input
                  id="rentalPriceDay"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={t("objects.rentalPriceDayPlaceholder")}
                  {...register("rentalPriceDay", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentalPriceHour" className="font-mono text-xs uppercase">
                  {t("objects.rentalPriceHour")}
                </Label>
                <Input
                  id="rentalPriceHour"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={t("objects.rentalPriceHourPlaceholder")}
                  {...register("rentalPriceHour", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalPriceWeek" className="font-mono text-xs uppercase">
                  {t("objects.rentalPriceWeek")}
                </Label>
                <Input
                  id="rentalPriceWeek"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={t("objects.rentalPriceWeekPlaceholder")}
                  {...register("rentalPriceWeek", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalPriceKm" className="font-mono text-xs uppercase">
                  {t("objects.rentalPriceKm")}
                </Label>
                <Input
                  id="rentalPriceKm"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={t("objects.rentalPriceKmPlaceholder")}
                  {...register("rentalPriceKm", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="font-mono text-xs uppercase">
          Notes
        </Label>
        <textarea
          id="notes"
          rows={3}
          placeholder={t("objects.notesPlaceholder")}
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
              { value: "none", label: t("qrCodes.none") },
              { value: "scan", label: t("qrCodes.scan") },
              { value: "existing", label: t("qrCodes.selectExisting") },
              { value: "create", label: t("qrCodes.createNew") },
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
                  onChange={() => {
                    setQrSelection(option.value as typeof qrSelection);
                    if (option.value === "scan") {
                      setShowQrScanner(true);
                    }
                  }}
                  className="sr-only"
                />
                {option.value === "scan" ? (
                  <Camera className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <QrCode className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="font-mono text-sm">{option.label}</span>
              </label>
            ))}
          </div>

          {scannedQrCode && (
            <p className="font-mono text-xs text-green-400">
              {t("qrCodes.scanned", { code: scannedQrCode })}
            </p>
          )}

          {qrSelection === "existing" && (
            <select
              value={selectedQrId}
              onChange={(e) => setSelectedQrId(e.target.value)}
              className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">{t("qrCodes.selectLabel")}</option>
              {qrCodes?.items.map((qr) => (
                <option key={qr.id} value={qr.id}>
                  {qr.code}
                </option>
              ))}
            </select>
          )}

          {qrSelection === "existing" && selectedQrId && (
            <p className="font-mono text-xs text-green-400">
              {t("qrCodes.selected", { code: qrCodes?.items.find((q) => q.id === selectedQrId)?.code ?? "" })}
            </p>
          )}

          {qrSelection === "create" && (
            <p className="font-mono text-xs text-muted-foreground">
              {t("qrCodes.createAutomatically")}
            </p>
          )}
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <QrScanner
          onCodeScanned={(code) => {
            setScannedQrCode(code);
            setQrSelection("scan");
            setShowQrScanner(false);
          }}
          onClose={() => {
            setShowQrScanner(false);
          }}
        />
      )}

      {/* Self-service toggle */}
      <div className="flex items-center justify-between pt-4 mt-4">
        <div className="space-y-1">
          <Label htmlFor="selfService" className="font-mono text-xs uppercase">
            Auto-prêt par contacts
          </Label>
          <p className="font-mono text-xs text-muted-foreground">
            Permet à vos contacts de s'auto-emprunter cet objet.
          </p>
        </div>
        <Switch
          id="selfService"
          checked={selfServiceEnabled}
          onCheckedChange={setSelfServiceEnabled}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={
          isSubmitting ||
          createMutation.isPending ||
          creatingQr ||
          uploadingPhoto ||
          (!collectionId && !watchedCollectionId)
        }
      >
        {createMutation.isPending || creatingQr || uploadingPhoto ? (
          <>
            <BookOpen className="w-4 h-4 mr-2 animate-spin" />
            {uploadingPhoto ? t("objects.uploadingPhoto") : creatingQr ? t("qrCodes.generatingQr") : t("objects.creating")}
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4 mr-2" />
            {t("objects.addObject")}
          </>
        )}
      </Button>
    </form>
  );
}
