# projeto-ambiente-estudos

Ambiente de estudos com Next.js 14, PostgreSQL e Docker.

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- WSL2 com Ubuntu (ou outro distro Linux) configurado no Windows

## Configuração inicial

1. **Copie o arquivo de variáveis de ambiente:**

   ```bash
   cp .env.example .env.local
   ```

2. **Edite `.env.local`** com seus valores reais (segredos, e-mail SMTP, etc.)

## Como rodar

> **Atenção (Windows + WSL2):** Execute o comando abaixo a partir do **Ubuntu** (ou outro distro WSL2), **não** do terminal `docker-desktop`. Se estiver usando o Docker Desktop, habilite a integração WSL2 em **Settings → Resources → WSL Integration** e marque seu distro.

**No terminal Ubuntu ou PowerShell/CMD do Windows:**

```bash
docker compose up
```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000).

## Comandos úteis

| Comando | Descrição |
|---|---|
| `docker compose up` | Sobe os serviços (app + banco) |
| `docker compose up --build` | Rebuilda a imagem antes de subir |
| `docker compose down` | Para e remove os containers |
| `docker compose down -v` | Para, remove containers e volumes (apaga o banco) |
| `docker compose logs -f app` | Acompanha os logs da aplicação |

## Estrutura de serviços

- **db** – PostgreSQL 16 na porta `5432`
- **app** – Next.js 14 em modo desenvolvimento na porta `3000`, com hot-reload habilitado
