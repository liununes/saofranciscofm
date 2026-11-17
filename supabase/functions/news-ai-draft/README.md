# news-ai-draft

Função Edge para gerar um rascunho jornalístico com o Gemini a partir de material de uma fonte informada.

## Segredos necessários no Supabase

Configure em **Supabase Dashboard → Edge Functions → Secrets**:

- `GEMINI_API_KEY`: chave criada no Google AI Studio.
- `GEMINI_MODEL` (opcional): modelo Gemini. Padrão: `gemini-2.5-flash-lite`.

As variáveis padrão `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` também precisam estar disponíveis no ambiente da função.

## Segurança e comportamento

- Exige sessão Supabase válida.
- Exige papel `admin` ou permissão `editar_noticias`.
- Recebe somente título, URL, veículo, data e texto público da fonte.
- Não grava nem publica notícias: responde com `saved: false`.
- Recusa material muito curto e orienta a não completar lacunas com suposições.
- A chave do Gemini é lida exclusivamente no servidor.

## Implantação

Implante a função `news-ai-draft` pelo fluxo de deploy de Supabase Edge Functions. A função ainda não fica ativa apenas por estar no GitHub.

## Exemplo de corpo

```json
{
  "source": {
    "name": "Veículo de origem",
    "title": "Título original",
    "url": "https://exemplo.com/noticia",
    "publishedAt": "2026-11-16",
    "text": "Texto público ou resumo completo da notícia..."
  }
}
```

A chamada deve incluir o token Bearer da sessão administrativa do Supabase.
