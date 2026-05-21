#!/usr/bin/env bash
# =============================================================================
# expo-tunnel.sh — Tunnel SSH inverse pour le dev Metro
#
# Ouvre 127.0.0.1:8081 du VPS vers ton Metro local (127.0.0.1:8081).
# Nginx sur le VPS proxifie https://dev.brol.dev vers ce port.
#
# Utilise autossh pour reconnecter automatiquement si la session SSH tombe
# (changement de WiFi, mise en veille, etc.).
#
# Installation :
#   sudo pacman -S autossh           # Arch
#   sudo apt install autossh         # Debian/Ubuntu
#
# Usage :
#   ~/bin/expo-tunnel.sh             # ouvre + reste au premier plan (Ctrl+C pour quitter)
#   ~/bin/expo-tunnel.sh --daemon    # ouvre en arrière-plan
# =============================================================================

set -euo pipefail

VPS_USER="piet"
VPS_HOST="91.98.87.65"
SSH_KEY="$HOME/.ssh/id_ed25519"
LOCAL_PORT=8081
REMOTE_PORT=8081

# Pas de mode daemon par défaut
DAEMON=""
if [[ "${1:-}" == "--daemon" ]]; then
    DAEMON="-f"  # autossh en arrière-plan
fi

# Vérifications
if ! command -v autossh &>/dev/null; then
    echo "❌ autossh n'est pas installé. Sur Arch : sudo pacman -S autossh" >&2
    exit 1
fi

if [[ ! -f "$SSH_KEY" ]]; then
    echo "❌ Clé SSH introuvable : $SSH_KEY" >&2
    exit 1
fi

# Vérifier que Metro tourne en local (sinon le tunnel sert à rien)
if ! ss -tln 2>/dev/null | grep -q ":${LOCAL_PORT} "; then
    echo "⚠️  Metro ne semble pas tourner sur localhost:${LOCAL_PORT}."
    echo "   Lance d'abord : cd apps/mobile && npx expo start"
    echo "   (Le tunnel s'ouvre quand même, mais ne servira à rien tant que Metro est down.)"
fi

echo "🔌 Ouverture du tunnel SSH inverse :"
echo "   localhost:${LOCAL_PORT} (ce poste) ⇄ VPS:127.0.0.1:${REMOTE_PORT}"
echo "   → https://dev.brol.dev"
echo

# AUTOSSH_GATETIME=0 : reconnect même si la 1ère connexion échoue
# -N : pas de commande distante (tunnel uniquement)
# -o ExitOnForwardFailure=yes : sortir si le port est déjà occupé côté VPS
# -o ServerAliveInterval=30 : keepalive toutes les 30s
# -R : reverse forwarding
AUTOSSH_GATETIME=0 autossh -M 0 ${DAEMON} -N \
    -i "$SSH_KEY" \
    -o "ServerAliveInterval=30" \
    -o "ServerAliveCountMax=3" \
    -o "ExitOnForwardFailure=yes" \
    -o "StrictHostKeyChecking=accept-new" \
    -R "${REMOTE_PORT}:localhost:${LOCAL_PORT}" \
    "${VPS_USER}@${VPS_HOST}"
