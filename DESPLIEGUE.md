# Despliegue en producción

Servidor: VPS Ubuntu 24.04 con Docker. Dominio: https://gestionetodoypidaya.tech

## Arquitectura

```
Internet ──► Nginx :80/:443 ──► /           build de React (SPA)
                            ├─► /api/*      backend:5000 (Express)
                            └─► /uploads/*  volumen "uploads" (imágenes de platos)
             backend ──────► db:3306 (MySQL 8.4, volumen "db_data")
             certbot ──────► renueva el certificado de Let's Encrypt cada 12 h
```

Solo Nginx publica puertos. MySQL y el backend no son accesibles desde fuera.

| Archivo | Para qué |
|---|---|
| `docker-compose.yml` | Define los 4 servicios |
| `backend/Dockerfile` | Imagen del API |
| `frontend/Dockerfile` | Compila React y lo empaqueta con Nginx |
| `nginx/default.conf` | HTTPS, proxy, caché, límite de intentos de login |
| `db/*.sql` | Esquema y menú inicial (solo se cargan con la base vacía) |
| `.env` | Secretos (no se sube al repo; ver `.env.example`) |

## Primera instalación

```bash
git clone https://github.com/Sofia05090/GestionaTodoyPideYa.git /opt/gestiona
cd /opt/gestiona
cp .env.example .env    # completar; generar secretos con: openssl rand -hex 32
chmod 600 .env
./scripts/obtener-certificado.sh correo@ejemplo.com   # una sola vez, con el puerto 80 libre
docker compose up -d --build
```

Para crear el primer administrador se usa la pantalla de registro con el código `REGISTRO_ADMIN_TOKEN` del `.env`.

## Actualizar a una nueva versión

Es automático: cada push o merge a `main` ejecuta el workflow `.github/workflows/desplegar.yml`. El workflow entra por SSH como el usuario `deploy` y corre `scripts/desplegar.sh`, que trae `main`, reconstruye los contenedores y verifica que la API responda. El resultado se ve en la pestaña **Actions** del repo, que también tiene un botón "Run workflow" para relanzarlo a mano.

La llave SSH del workflow (secret `VPS_SSH_KEY`) solo puede ejecutar ese script: en `/home/deploy/.ssh/authorized_keys` está marcada con `restrict,command=...`.

Para desplegar a mano desde el servidor:

```bash
sudo -u deploy /opt/gestiona/scripts/desplegar.sh
```

Si solo cambió `nginx/default.conf`: `docker compose exec nginx nginx -s reload`.

## Operación

```bash
docker compose ps                       # estado
docker compose logs -f backend          # logs del API
docker compose exec db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" gestione_todo_y_pida_ya' > respaldo.sql
```

Los archivos de `db/` **no** se vuelven a ejecutar si la base ya existe. Los cambios de esquema posteriores se aplican a mano con `docker compose exec -T db mysql ...`.
