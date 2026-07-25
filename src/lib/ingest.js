// External-listing ingestion (Phase 1.1 foundation).
//
// This is the provider-agnostic core: normalize -> dedupe -> upsert. A "source
// adapter" is the only provider-specific part — it fetches raw listings and
// maps each to our internal shape. When the Idealist/VolunteerMatch sandbox key
// + docs land, fill in `idealistAdapter` below; nothing else here changes.
//
// WRITE PATH: runIngest needs a Supabase client with insert/update rights on
// organizations + opportunities. Row-Level Security blocks the public anon key
// from those tables, so the real sync must run server-side with the SERVICE
// ROLE key (not yet configured — a later step, alongside the cron schedule).
// Everything except that final DB write is pure and unit-testable today.

// ---- internal normalized shape an adapter must produce, per listing ----
// {
//   org: { externalId, name, city, state, website },
//   opportunity: {
//     externalId, title, description, category, startsAt|null, isOngoing,
//     city, state, address, minAge, externalUrl, tags
//   }
// }

export function sourceKey(source, externalId) {
  return `${source}::${externalId}`
}

// Split normalized rows into new vs. already-present, by external_id, given the
// set of external_ids this source already has in our DB. Pure — no I/O — so the
// nightly sync updates in place instead of duplicating. Rows missing an
// external_id are dropped (an import row with no stable id can't be deduped).
export function partitionForUpsert(rows, existingExternalIds = []) {
  const existing = new Set(existingExternalIds)
  const toInsert = []
  const toUpdate = []
  const dropped = []
  for (const r of rows) {
    const id = r?.opportunity?.externalId
    if (!id) {
      dropped.push(r)
      continue
    }
    ;(existing.has(id) ? toUpdate : toInsert).push(r)
  }
  return { toInsert, toUpdate, dropped }
}

// ---- source adapter contract ----
// { source: string,
//   async fetchRaw(): Promise<rawListing[]>,
//   normalize(rawListing): { org, opportunity } | null }

// Stand-in feed of GA listings in our internal shape, used to exercise the
// whole pipeline (normalize -> dedupe -> auto-expire) before real API access.
// The RAW shape here is invented; the real Idealist raw shape gets mapped in
// idealistAdapter.normalize() once we have the sandbox docs.
export const mockIdealistAdapter = {
  source: 'idealist',
  async fetchRaw() {
    return [
      {
        id: 'idl-1001', name: 'Trees Atlanta', title: 'Weekend Tree Planting',
        summary: 'Help plant and mulch trees across Atlanta neighborhoods.',
        cause: 'environment', city: 'Atlanta', state: 'GA', minAge: 14,
        url: 'https://example.org/idl-1001', ongoing: true,
      },
      {
        id: 'idl-1002', name: 'Atlanta Community Food Bank', title: 'Sort Donated Food',
        summary: 'Sort and box donated groceries for distribution.',
        cause: 'food', city: 'Atlanta', state: 'GA', minAge: 12,
        url: 'https://example.org/idl-1002', date: '2026-09-12T15:00:00.000Z',
      },
    ]
  },
  normalize(raw) {
    if (!raw?.id || !raw?.title) return null
    return {
      org: {
        externalId: `org-${raw.id}`,
        name: raw.name,
        city: raw.city ?? null,
        state: raw.state ?? null,
        website: raw.url ?? null,
      },
      opportunity: {
        externalId: raw.id,
        title: raw.title,
        description: raw.summary ?? '',
        category: raw.cause ?? 'community',
        startsAt: raw.date ?? null,
        isOngoing: !!raw.ongoing,
        city: raw.city ?? null,
        state: raw.state ?? null,
        address: null,
        minAge: raw.minAge ?? null,
        externalUrl: raw.url ?? null,
        tags: [],
      },
    }
  },
}

// TODO(idealist): real adapter — fill in once the sandbox key + docs are in.
// Confirm from the docs: auth (API key + HMAC signature? which headers?), the
// listings search endpoint + params (GA location, cause areas, virtual), and
// the exact field names to map in normalize(). Base (sandbox):
// https://api-sandbox.idealist.org/listings-api
export const idealistAdapter = {
  source: 'idealist',
  async fetchRaw() {
    throw new Error('idealistAdapter not implemented — awaiting sandbox key + API docs')
  },
  normalize() {
    throw new Error('idealistAdapter not implemented — awaiting sandbox key + API docs')
  },
}

// Fetch -> normalize -> upsert orgs (by source+external_id) -> upsert opps
// (by source+external_id, stamping last_synced_at). `writeClient` must be a
// Supabase client authorized to write (service role). Returns a summary; does
// not throw on individual bad rows (they're normalized out).
export async function runIngest(adapter, writeClient, { now = () => new Date() } = {}) {
  const raw = await adapter.fetchRaw()
  const rows = raw.map((r) => adapter.normalize(r)).filter(Boolean)
  const syncedAt = now().toISOString()

  // 1. Upsert orgs, then map each external org id -> our org uuid.
  const orgsByExternalId = new Map()
  for (const { org } of rows) {
    if (org?.externalId) orgsByExternalId.set(org.externalId, org)
  }
  const orgIdByExternalId = {}
  if (orgsByExternalId.size) {
    const { data, error } = await writeClient
      .from('organizations')
      .upsert(
        [...orgsByExternalId.values()].map((o) => ({
          source: adapter.source,
          external_id: o.externalId,
          name: o.name,
          city: o.city,
          state: o.state,
          website: o.website,
        })),
        { onConflict: 'source,external_id' },
      )
      .select('id, external_id')
    if (error) throw error
    for (const row of data ?? []) orgIdByExternalId[row.external_id] = row.id
  }

  // 2. Upsert opportunities, linked to their (now-known) org uuid.
  const oppRows = rows
    .map(({ org, opportunity: o }) => {
      const orgId = orgIdByExternalId[org?.externalId]
      if (!orgId) return null
      return {
        source: adapter.source,
        external_id: o.externalId,
        org_id: orgId,
        title: o.title,
        description: o.description,
        category: o.category,
        starts_at: o.startsAt,
        is_ongoing: o.isOngoing,
        city: o.city,
        state: o.state,
        address: o.address,
        min_age: o.minAge,
        external_url: o.externalUrl,
        tags: o.tags ?? [],
        last_synced_at: syncedAt,
      }
    })
    .filter(Boolean)

  let upserted = 0
  if (oppRows.length) {
    const { data, error } = await writeClient
      .from('opportunities')
      .upsert(oppRows, { onConflict: 'source,external_id' })
      .select('id')
    if (error) throw error
    upserted = (data ?? []).length
  }

  return { source: adapter.source, fetched: raw.length, normalized: rows.length, orgs: orgsByExternalId.size, upserted, syncedAt }
}
