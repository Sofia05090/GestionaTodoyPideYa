#!/usr/bin/env bash
# Despliega la ultima version de main en el servidor.
# Lo ejecuta GitHub Actions por SSH (usuario "deploy", comando forzado en
# authorized_keys) y tambien se puede correr a mano: sudo -u deploy /opt/gestiona/scripts/desplegar.sh
#
# Todo va dentro de main() para que bash lea el script completo antes de que
# git reset lo reemplace por la version nueva.
set -euo pipefail

DIRECTORIO="/opt/gestiona"
DOMINIO="gestionetodoypidaya.tech"

main() {
  cd "$DIRECTORIO"

  # Evita dos despliegues al mismo tiempo
  exec 9>/tmp/gestiona-despliegue.lock
  flock -n 9 || { echo "Ya hay un despliegue en curso"; exit 1; }

  echo "==> Actualizando codigo"
  git fetch --quiet origin main
  git reset --hard --quiet origin/main
  echo "    $(git log --oneline -1)"

  echo "==> Construyendo y levantando contenedores"
  docker compose up -d --build --remove-orphans

  echo "==> Verificando que la API responda"
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null --resolve "$DOMINIO:443:127.0.0.1" "https://$DOMINIO/api/menu"; then
      echo "    OK"
      docker image prune -f >/dev/null
      exit 0
    fi
    sleep 2
  done

  echo "ERROR: la API no respondio despues del despliegue"
  docker compose ps
  docker compose logs --tail=50 backend
  exit 1
}

main "$@"
