"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { trpc } from "../../lib/trpc";

interface ContactOwnerDialogProps {
  objectId: string;
  ownerId: string;
  ownerName: string;
  objectName: string;
  trigger?: React.ReactNode;
}

type Status = "idle" | "sending" | "success" | "error";

export function ContactOwnerDialog({
  objectId,
  ownerId,
  ownerName,
  objectName,
  trigger,
}: ContactOwnerDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const sendMessageMutation = trpc.messages.create.useMutation({
    onSuccess: () => {
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    },
    onError: (error) => {
      setStatus("error");
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    sendMessageMutation.mutate({
      objectId,
      ownerId,
      fromName: name,
      fromEmail: email,
      content: message,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contacter le propriétaire</DialogTitle>
          <DialogDescription>
            Envoyez un message à {ownerName} pour l&apos;objet &quot;{objectName}&quot;
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="font-mono text-sm text-center">
              Votre message a été envoyé à {ownerName}.
              <br />
              Vous recevrez une réponse par email.
            </p>
            <Button onClick={() => setOpen(false)} className="mt-2">
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Votre nom</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                required
                minLength={1}
                maxLength={255}
                disabled={status === "sending"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Votre email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@example.com"
                required
                disabled={status === "sending"}
              />
              <p className="font-mono text-xs text-muted-foreground">
                Votre email ne sera utilisé que pour vous contacter.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Bonjour ${ownerName},\n\nJe suis intéressé par votre objet "${objectName}"...`}
                required
                minLength={1}
                maxLength={500}
                rows={4}
                disabled={status === "sending"}
              />
              <p className="font-mono text-xs text-muted-foreground text-right">
                {message.length}/500
              </p>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <p className="font-mono text-sm">{errorMessage}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={status === "sending"}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={status === "sending" || !name || !email || !message}
                className="gap-2"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}