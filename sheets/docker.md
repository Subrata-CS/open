---
title: Docker
group: Systems
about: Images, containers and the handful of commands that cover normal use.
tags: docker, containers, images, compose
---

## The mental model

An **image** is a frozen filesystem plus a command to run. A **container** is
one running copy of it. Images are built once and shared; containers are cheap
and thrown away. Almost every Docker confusion is these two being mixed up.

## Daily commands

| Command | What it does |
|---|---|
| `docker ps` | containers running now |
| `docker ps -a` | including stopped ones |
| `docker images` | images on this machine |
| `docker run -it ubuntu bash` | start a container and get a shell |
| `docker exec -it <name> bash` | shell into one already running |
| `docker logs -f <name>` | follow its output |
| `docker stop <name>` / `docker rm <name>` | stop it, then remove it |

## Building

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

```bash
docker build -t myapp:1.0 .
docker run -p 8000:8000 myapp:1.0
```

Copy `requirements.txt` before the rest of the code. Docker caches each layer,
so dependencies are only reinstalled when that one file changes — this single
ordering trick is the difference between a five-second and a five-minute build.

## Ports, volumes, environment

```bash
docker run -p 8080:80 nginx                    # host port : container port
docker run -v "$(pwd)":/app myapp              # mount the current folder
docker run -e DATABASE_URL=postgres://... app  # pass configuration in
```

## Compose

```yaml
services:
  web:
    build: .
    ports: ["8000:8000"]
    depends_on: [db]
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: example
    volumes: ["pgdata:/var/lib/postgresql/data"]

volumes:
  pgdata:
```

```bash
docker compose up -d      # start everything in the background
docker compose logs -f    # watch it
docker compose down       # stop and remove
```

## Cleaning up

```bash
docker system df          # what is using disk
docker system prune -a    # remove everything unused — check first
```

:::caution
`docker system prune -a` deletes every image not attached to a running
container. On a laptop that is fine; on a shared machine, look before you run.
:::
