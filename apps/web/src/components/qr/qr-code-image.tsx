"use client";

import { useEffect, useRef, useState } from "react";
import { escapeHtml } from "../../lib/escape-html";
import QRCode from "qrcode";

interface QrCodeImageProps {
  code: string;
  size?: number;
  className?: string;
  /**
   * URL de base à encoder dans le QR code.
   * Ex: http://192.168.1.x:3000 → le QR encode {baseUrl}/qr/{code}
   * Si absent, seul le code brut est encodé (comportement par défaut).
   */
  baseUrl?: string;
}

type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

/**
 * Composant qui génère et affiche un QR code.
 * Utilise la lib qrcode pour générer le data URI.
 * Si `baseUrl` est fourni, le QR encode {baseUrl}/qr/{code} (pour scan via navigateur).
 * Sinon, seul le code brut est encodé.
 */
export function QrCodeImage({ code, size = 200, className = "", baseUrl }: QrCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // QR data: full URL if baseUrl provided, else raw code
  const qrData = baseUrl ? `${baseUrl}/qr/${code}` : code;

  useEffect(() => {
    if (!code) return;

    QRCode.toDataURL(
      qrData,
      {
        width: size,
        margin: 2,
        color: {
          dark: "#0affef",
          light: "#0a0a0f",
        },
        errorCorrectionLevel: "M" as QrErrorCorrectionLevel,
      },
      (err, url) => {
        if (err) {
          console.error("Failed to generate QR code:", err);
          return;
        }
        setDataUrl(url);
      }
    );
  }, [qrData, code, size]);

  // Also draw to canvas for print support
  useEffect(() => {
    if (!code || !canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, qrData, {
      width: size,
      margin: 2,
      color: {
        dark: "#0affef",
        light: "#0a0a0f",
      },
      errorCorrectionLevel: "M" as QrErrorCorrectionLevel,
    }).catch((err) => {
      console.error("Failed to draw QR to canvas:", err);
    });
  }, [qrData, code, size]);

  if (!dataUrl) {
    return (
      <div
        className={`bg-card border-2 border-border flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="spinner-vhs w-6 h-6" />
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={dataUrl}
        alt={`QR Code: ${code}`}
        width={size}
        height={size}
        className="block"
      />
      {/* Hidden canvas for print */}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Hook pour télécharger le QR code en PNG.
 * @param baseUrl - URL de base pour encoder l'URL complète dans le QR. Ex: http://192.168.1.x:3000
 */
export function useQrDownload(baseUrl?: string) {
  /**
   * Télécharge le QR code en PNG.
   * Le QR encode {baseUrl}/qr/{code} si baseUrl fourni, sinon le code brut.
   */
  const downloadPng = async (code: string, objectName: string) => {
    const qrData = baseUrl ? `${baseUrl}/qr/${code}` : code;

    try {
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: "#0affef",
          light: "#0a0a0f",
        },
        errorCorrectionLevel: "H" as QrErrorCorrectionLevel,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr-${objectName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download QR:", err);
    }
  };

  /**
   * Ouvre une fenêtre d'impression avec le QR code.
   * Le QR encode {baseUrl}/qr/{code} si baseUrl fourni, sinon le code brut.
   */
  const printQr = async (code: string, objectName: string) => {
    const qrData = baseUrl ? `${baseUrl}/qr/${code}` : code;

    try {
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 4,
        color: {
          dark: "#0affef",
          light: "#0a0a0f",
        },
        errorCorrectionLevel: "H" as QrErrorCorrectionLevel,
      });

      const safeName = escapeHtml(objectName);
      const safeCode = escapeHtml(code);
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Veuillez autoriser les popups pour l'impression.");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${safeName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: monospace;
                background: #0a0a0f;
                color: #0affef;
              }
              img { margin-bottom: 16px; }
              .name { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 8px; }
              .code { font-size: 12px; color: #6b7280; text-align: center; }
              @media print {
                body { background: white; color: black; }
                img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="name">${safeName}</div>
            <img src="${dataUrl}" alt="QR Code" />
            <div class="code">${safeCode}</div>
            <script>window.onload = () => { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Failed to print QR:", err);
    }
  };

  return { downloadPng, printQr };
}