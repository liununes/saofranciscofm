# Welcome to your Radio Project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use the Project Editor**

Simply visit the Project Editor and start prompting.

Changes made via the editor will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in the project.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open the project dashboard and click on Share -> Publish.

## Can I connect a custom domain?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](#custom-domain)

## Configuração de produção

O frontend usa exclusivamente a chave pública (anon/publishable) do Supabase. No serviço do Easypanel, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` como variáveis de ambiente e reinicie o contêiner. O entrypoint gera `runtime-config.js` na inicialização, portanto essas variáveis também funcionam quando a imagem Docker já foi construída.

Aplique a migração `supabase/migrations/20260827000000_restore_admin_crud_permissions.sql` no banco Supabase antes de usar o painel. Ela restaura o CRUD com RLS seguro, usando a role `admin` ou a permissão específica de cada seção, e garante a role administrativa da conta mestre configurada. Não use uma chave `service_role` em variáveis `VITE_*` nem no navegador.

O contêiner também expõe `/stream.mp3`: ele faz relay/transcodificação AAC+ para MP3 usando FFmpeg, evitando a limitação de decodificação de `audio/aacp` em alguns navegadores. Por padrão, o relay permite o host atual `stm28.srvaudio.com.br`; se a URL do painel apontar para outro provedor, informe uma lista explícita em `STREAM_ALLOWED_HOSTS` (separada por vírgulas) no serviço do Easypanel.
