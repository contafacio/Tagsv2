// Worker principal do projeto Tagsv2.
// Serve a página (index.html e demais arquivos estáticos) e,
// além disso, responde nas rotas /api/tags para guardar/ler
// as tags compartilhadas no KV (binding TAGS_KV).

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/tags") {
      return handleTagsApi(request, env);
    }

    // Qualquer outra rota: serve os arquivos estáticos normalmente (o index.html, etc).
    return env.ASSETS.fetch(request);
  }
};

async function handleTagsApi(request, env) {
  const corsHeaders = { "content-type": "application/json" };

  if (request.method === "GET") {
    try {
      const stored = await env.TAGS_KV.get("tags_data");
      if (!stored) {
        return new Response(JSON.stringify({ nodes: null, lastUpdated: null }), { headers: corsHeaders });
      }
      return new Response(stored, { headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Falha ao ler dados: " + err.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  if (request.method === "POST") {
    try {
      const body = await request.text();
      const parsed = JSON.parse(body);
      if (!parsed || typeof parsed.nodes !== "object") {
        return new Response(JSON.stringify({ error: "Formato inválido" }), {
          status: 400,
          headers: corsHeaders
        });
      }
      await env.TAGS_KV.put("tags_data", body);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Falha ao salvar: " + err.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}
