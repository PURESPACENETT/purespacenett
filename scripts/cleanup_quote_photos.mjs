const supabaseUrl = "https://dgppmlkpvmvjkhsghtji.supabase.co";
const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
const retentionMonths = 12;
const pageSize = 500;

if (!serviceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required.");
}

const cutoff = new Date();
cutoff.setUTCMonth(cutoff.getUTCMonth() - retentionMonths);
const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};
let offset = 0;
let requestsProcessed = 0;
let photosRemoved = 0;

while (true) {
  const query = new URLSearchParams({
    select: "id,photo_paths",
    created_at: `lt.${cutoff.toISOString()}`,
    photo_paths: "not.is.null",
    order: "created_at.asc,id.asc",
  });
  const response = await fetch(`${supabaseUrl}/rest/v1/quote_requests?${query}`, {
    headers: { ...headers, Range: `${offset}-${offset + pageSize - 1}` },
  });
  if (!response.ok) {
    throw new Error(`Expired quote photo lookup failed (HTTP ${response.status}).`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("Expired quote photo lookup returned an invalid response.");

  for (const row of rows) {
    const paths = Array.isArray(row.photo_paths) ? row.photo_paths.filter((path) => typeof path === "string" && path.length > 0) : [];
    if (paths.length === 0) continue;

    const removed = await fetch(`${supabaseUrl}/storage/v1/object/quote-photos`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ prefixes: paths }),
    });
    if (!removed.ok) {
      throw new Error(`Expired quote photo removal failed (HTTP ${removed.status}).`);
    }

    const cleared = await fetch(`${supabaseUrl}/rest/v1/quote_requests?id=eq.${encodeURIComponent(row.id)}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ photo_paths: [] }),
    });
    if (!cleared.ok) {
      throw new Error(`Expired quote photo record update failed (HTTP ${cleared.status}).`);
    }

    requestsProcessed += 1;
    photosRemoved += paths.length;
  }

  offset += rows.length;
  if (rows.length < pageSize) break;
}

console.log(JSON.stringify({ ok: true, requestsProcessed, photosRemoved, retainedMonths: retentionMonths }));
