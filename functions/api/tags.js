// Cloudflare Pages Function — API simples para guardar/ler as tags compartilhadas.
// Guarda tudo num único registro dentro do KV namespace ligado como TAGS_KV.

export async function onRequestGet({ env }) {
  try {
    const stored = await env.TAGS_KV.get("tags_data");
    if (!stored) {
      return new Response(JSON.stringify({ nodes: null, lastUpdated: null }), {
        headers: { "content-type": "application/json" }
      });
    }
    return new Response(stored, { headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Falha ao ler dados: " + err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.text();
    const parsed = JSON.parse(body); // valida que é JSON de verdade
    if (!parsed || typeof parsed.nodes !== "object") {
      return new Response(JSON.stringify({ error: "Formato inválido" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    await env.TAGS_KV.put("tags_data", body);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Falha ao salvar: " + err.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
