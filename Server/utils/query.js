export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Builds a paginated, searchable list query from ?page, ?limit, ?q and ?sort.
 * `searchFields` are matched case-insensitively against q.
 */
export async function paginate(Model, req, { searchFields = [], filter = {}, populate = [], defaultSort = "-createdAt" } = {}) {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const sort = typeof req.query.sort === "string" && /^-?[A-Za-z_.]+$/.test(req.query.sort) ? req.query.sort : defaultSort;

    const query = { ...filter };
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q && searchFields.length) {
        const rx = new RegExp(escapeRegex(q), "i");
        query.$or = searchFields.map((f) => ({ [f]: rx }));
    }

    let cursor = Model.find(query).sort(sort).skip((page - 1) * limit).limit(limit);
    for (const p of populate) cursor = cursor.populate(p);

    const [items, total] = await Promise.all([cursor.lean(), Model.countDocuments(query)]);
    return { items, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
}

export function toCsv(rows, columns) {
    const cell = (v) => {
        const s = v == null ? "" : String(v);
        // Quote, and neutralise spreadsheet formula injection.
        const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
        return /[",\n\r]/.test(safe) || safe !== s ? `"${safe.replace(/"/g, '""')}"` : safe;
    };
    const header = columns.map((c) => cell(c.label)).join(",");
    const body = rows.map((r) => columns.map((c) => cell(c.value(r))).join(",")).join("\n");
    return `${header}\n${body}\n`;
}
