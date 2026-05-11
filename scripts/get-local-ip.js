#!/usr/bin/env node
/**
 * Détecte l'adresse IP locale du réseau LAN.
 * Usage: node scripts/get-local-ip.js
 * Affiche l'IP et l'URL complète à coller dans .env.local
 *
 * Exemple de sortie:
 *   IP détectée  : 192.168.1.42
 *   Port         : 3000
 *   URL complète : http://192.168.1.42:3000
 *
 *   → Collez ceci dans apps/web/.env.local:
 *   NEXT_PUBLIC_APP_URL="http://192.168.1.42:3000"
 */

const os = require("os");

const PORT = process.env.PORT || 3000;

/**
 * Vérifie si une IP est une adresse LAN (non-loopback, non-link-local, non-docker).
 */
function isLanAddress(addr) {
  if (!addr || addr.family !== "IPv4") return false;
  const ip = addr.address;

  // Exclure loopback
  if (ip.startsWith("127.")) return false;
  // Exclure link-local (169.254.x.x)
  if (ip.startsWith("169.254.")) return false;
  // Exclure Docker bridge (172.17.x.x)
  if (ip.startsWith("172.17.")) return false;

  // Classes LAN connues:
  // 10.0.0.0/8
  if (ip.startsWith("10.")) return true;
  // 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  // 192.168.0.0/16
  if (ip.startsWith("192.168.")) return true;

  return false;
}

/**
 * Trouve la meilleure interface LAN.
 * Privilégie les interfaces "Wi-Fi" ou "en0" (macOS) ou "wlan0" (Linux).
 */
function findLanInterface(interfaces) {
  // Ordre de priorité des interfaces
  const preferredOrder = [
    "wi-fi",
    "wlan",
    "wifi",
    "en0",
    "en1",
    "eth0",
    "ethernet",
  ];

  // 1. Chercher par nom d'interface préféré
  for (const name of preferredOrder) {
    const iface = interfaces.find(
      (i) => i.name.toLowerCase().includes(name.toLowerCase())
    );
    if (iface) return iface;
  }

  // 2. Retourner la première interface LAN trouvée
  return interfaces[0] || null;
}

function main() {
  const interfaces = Object.values(os.networkInterfaces())
    .flat()
    .filter(isLanAddress)
    .map((addr) => ({
      name: Object.entries(os.networkInterfaces())
        .find(([, addrs]) => addrs?.includes(addr))?.[0] ?? "unknown",
      address: addr.address,
    }));

  if (interfaces.length === 0) {
    console.error(
      "\n❌ Aucune adresse IP LAN trouvée.\n" +
        "   Assurez-vous d'être connecté à un réseau WiFi ou Ethernet.\n"
    );
    process.exit(1);
  }

  // Dédoublonner par IP (même IP peut apparaître sur plusieurs interfaces)
  const unique = Array.from(
    new Map(interfaces.map((i) => [i.address, i])).values()
  );

  const lanIface = findLanInterface(unique);

  console.log("\n📡  IP locale détectée\n");
  for (const iface of unique) {
    const marker = iface === lanIface ? "→ " : "  ";
    console.log(`${marker} ${iface.name.padEnd(12)} ${iface.address}`);
  }

  const primaryIp = lanIface.address;
  const baseUrl = `http://${primaryIp}:${PORT}`;

  console.log(
    `\n✅ URL complète : ${baseUrl}\n` +
      `   → Collez ceci dans apps/web/.env.local:\n` +
      `   NEXT_PUBLIC_APP_URL="${baseUrl}"\n`
  );
}

main();
