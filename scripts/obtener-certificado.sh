#!/usr/bin/env bash
# Obtiene por primera vez el certificado de Let's Encrypt (modo standalone).
# Se ejecuta UNA vez, con Nginx detenido (necesita el puerto 80 libre).
# Despues, el servicio "certbot" de docker-compose lo renueva solo.
#
# Uso: ./scripts/obtener-certificado.sh correo@ejemplo.com
set -euo pipefail

DOMINIO="gestionetodoypidaya.tech"
CORREO="${1:?Uso: $0 correo@ejemplo.com}"

cd "$(dirname "$0")/.."
mkdir -p certbot/conf certbot/www

docker run --rm -p 80:80 \
  -v "$PWD/certbot/conf:/etc/letsencrypt" \
  certbot/certbot:latest certonly --standalone \
  -d "$DOMINIO" -d "www.$DOMINIO" \
  --email "$CORREO" --agree-tos --no-eff-email --non-interactive
