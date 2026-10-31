/**
 * Client-side Fuzzy Product Search
 *
 * Replaces the hosted Algolia index with a small in-memory ranker over the
 * catalog the app already holds. Mirrors the parts of Algolia's relevance
 * the storefront relied on: typo tolerance, prefix matching on the word being
 * typed, every query word required, and field-weighted ranking.
 */

/**
 * Searchable fields, highest weight first. A hit in the product name outranks
 * the same hit buried in the description.
 */
export const SEARCH_FIELDS = [
  { key: 'productName', weight: 10 },
  { key: 'manufacturer', weight: 8 },
  { key: 'itemid', weight: 6 },
  { key: 'tags', weight: 5 },
  { key: 'category', weight: 4 },
  { key: 'description', weight: 1 },
];

// Match quality per kind, before field weight is applied.
const MATCH_QUALITY = {
  exact: 1,
  prefix: 0.85,
  typo1: 0.6,
  substring: 0.5,
  typo2: 0.4,
  compact: 0.3,
};

/**
 * Lowercases, strips accents, and turns punctuation into spaces, so
 * "Beyoncé's" and "beyonces" compare equal.
 *
 * @param {unknown} value
 * @returns {string}
 */
export const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const tokenize = (value) => {
  const text = normalizeText(value);
  return text ? text.split(' ') : [];
};

/**
 * Typos allowed for a query word of this length (Algolia's defaults):
 * none under 4 characters, one from 4, two from 8.
 *
 * @param {number} length
 * @returns {number}
 */
export const allowedTypos = (length) => {
  if (length >= 8) return 2;
  if (length >= 4) return 1;
  return 0;
};

/**
 * Optimal string alignment distance (Levenshtein plus adjacent swaps), so
 * "ipohne" is one typo from "iphone". Stops early once every path in a row
 * exceeds `max`, returning `max + 1`.
 *
 * @param {string} a
 * @param {string} b
 * @param {number} max
 * @returns {number}
 */
export const editDistance = (a, b, max = Infinity) => {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let prevPrev = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (
        prevPrev &&
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        value = Math.min(value, prevPrev[j - 2] + 1);
      }
      row.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    prevPrev = prev;
    prev = row;
  }

  return prev[b.length];
};

/**
 * Best match quality of one query word against one indexed word, or 0.
 * Only the last query word (still being typed) may match as a prefix.
 */
const scoreWord = (term, word, isLastTerm) => {
  if (word === term) return MATCH_QUALITY.exact;
  if (isLastTerm && word.startsWith(term)) return MATCH_QUALITY.prefix;

  const maxTypos = allowedTypos(term.length);
  if (maxTypos > 0) {
    let distance = editDistance(term, word, maxTypos);
    // "macbok" while typing "macbook pro": compare against the word's start.
    if (isLastTerm && distance > maxTypos && word.length > term.length) {
      distance = editDistance(term, word.slice(0, term.length), maxTypos);
    }
    if (distance === 1) return MATCH_QUALITY.typo1;
    if (distance === 2 && maxTypos >= 2) return MATCH_QUALITY.typo2;
  }

  if (term.length >= 3 && word.includes(term)) return MATCH_QUALITY.substring;
  return 0;
};

/**
 * Precomputes normalized words per field for each product. Build once per
 * catalog (e.g. in `useMemo`) and reuse across keystrokes.
 *
 * @param {Array<object>} products
 * @returns {Array<{ product: object, position: number, fields: Array<{ weight: number, words: string[], compact: string }> }>}
 */
export const buildSearchIndex = (products = []) => {
  if (!Array.isArray(products)) return [];
  return products
    .filter((product) => product && typeof product === 'object')
    .map((product, position) => ({
      product,
      position,
      fields: SEARCH_FIELDS.map(({ key, weight }) => {
        const raw = Array.isArray(product[key])
          ? product[key].join(' ')
          : product[key];
        const words = tokenize(raw);
        return { weight, words, compact: words.join('') };
      }),
    }));
};

/**
 * Relevance of one indexed product for the query words, or 0 when any word
 * fails to match. Falls back to a space-insensitive match so "sm 58" finds
 * "SM58" and "airjordan" finds "Air Jordan".
 */
const scoreEntry = (entry, terms) => {
  let total = 0;

  for (let t = 0; t < terms.length; t += 1) {
    const isLastTerm = t === terms.length - 1;
    let best = 0;
    for (const field of entry.fields) {
      for (const word of field.words) {
        const quality = scoreWord(terms[t], word, isLastTerm);
        if (quality * field.weight > best) best = quality * field.weight;
      }
    }
    if (best === 0) {
      total = 0;
      break;
    }
    total += best;
  }

  if (total > 0) return total;

  const compactQuery = terms.join('');
  if (compactQuery.length < 3) return 0;
  let best = 0;
  for (const field of entry.fields) {
    if (field.compact.includes(compactQuery)) {
      best = Math.max(best, MATCH_QUALITY.compact * field.weight);
    }
  }
  return best * terms.length;
};

/**
 * Ranks products for a free-text query. Every query word must match some
 * field; ties keep catalog order.
 *
 * @param {Array<object>|ReturnType<typeof buildSearchIndex>} productsOrIndex
 *   Raw products, or an index from `buildSearchIndex`.
 * @param {string} query
 * @param {{ limit?: number }} [options]
 * @returns {Array<object>} Matching products, best first.
 */
export const searchProducts = (productsOrIndex, query, { limit } = {}) => {
  const terms = tokenize(query);
  if (terms.length === 0 || !Array.isArray(productsOrIndex)) return [];

  const index =
    productsOrIndex.length > 0 && productsOrIndex[0]?.fields
      ? productsOrIndex
      : buildSearchIndex(productsOrIndex);

  const ranked = index
    .map((entry) => ({ entry, score: scoreEntry(entry, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.position - b.entry.position)
    .map(({ entry }) => entry.product);

  return typeof limit === 'number' ? ranked.slice(0, limit) : ranked;
};

/**
 * Whether a single product matches the query, using the same rules as
 * `searchProducts`. An empty query matches everything.
 *
 * @param {object} product
 * @param {string} query
 * @returns {boolean}
 */
export const matchesQuery = (product, query) => {
  const terms = tokenize(query);
  if (terms.length === 0) return true;
  const [entry] = buildSearchIndex([product]);
  return Boolean(entry) && scoreEntry(entry, terms) > 0;
};

/**
 * Original-string offset where each normalized character of `word` begins,
 * plus a final entry for the word's end. Normalizing can drop characters
 * (apostrophes) or accents, so offsets do not line up one to one.
 */
const normalizedOffsets = (word) => {
  const offsets = [];
  for (let i = 0; i < word.length; i += 1) {
    const count = normalizeText(word[i]).replace(/ /g, '').length;
    for (let k = 0; k < count; k += 1) offsets.push(i);
  }
  offsets.push(word.length);
  return offsets;
};

/**
 * Character ranges of `text` that match the query, for highlighting. Exact
 * and typo matches mark the whole word; prefix and substring matches mark
 * only the matched part. Ranges are sorted and never overlap.
 *
 * @param {string} text
 * @param {string} query
 * @returns {Array<{ start: number, end: number }>}
 */
export const getHighlightRanges = (text, query) => {
  const terms = tokenize(query);
  if (terms.length === 0 || !text) return [];

  const source = String(text);
  const ranges = [];

  for (const match of source.matchAll(/[\p{L}\p{N}'’]+/gu)) {
    const raw = match[0];
    const word = normalizeText(raw).replace(/ /g, '');
    if (!word) continue;

    terms.forEach((term, t) => {
      const quality = scoreWord(term, word, t === terms.length - 1);
      if (quality === 0) return;

      let from = 0;
      let to = word.length;
      if (quality === MATCH_QUALITY.prefix) {
        to = term.length;
      } else if (quality === MATCH_QUALITY.substring) {
        from = word.indexOf(term);
        to = from + term.length;
      }

      const offsets = normalizedOffsets(raw);
      ranges.push({
        start: match.index + offsets[from],
        end: match.index + offsets[to],
      });
    });
  }

  return ranges
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .reduce((merged, range) => {
      const last = merged[merged.length - 1];
      if (last && range.start <= last.end) {
        last.end = Math.max(last.end, range.end);
      } else {
        merged.push({ ...range });
      }
      return merged;
    }, []);
};
