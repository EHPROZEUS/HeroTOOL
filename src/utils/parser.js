/* Parser multi-sources pièces
   Sources gérées :
   - NED
   - AUTOSSIMO
   - SERVICEBOX
   - PARTSLINK (tabulaire + bloc)
   - RENAULT (bloc)
   Formats internes (format param) : auto, ned, autossimo, servicebox, partslink, renault, standard, xpr
*/

const normalizeSpaces = (s) =>
  s.replace(/\u00A0|\u202F/g, ' ').replace(/\s+/g, ' ').trim();

const normalizeNumber = (v) => {
  if (v == null) return '';
  return v
    .toString()
    .replace(/\u00A0|\u202F/g, '')
    .replace(/\s/g, '')
    .replace(',', '.')
    .trim();
};

const parsePercent = (v) => {
  if (!v) return 0;
  const cleaned = v
    .toString()
    .replace(/\u00A0|\u202F/g, '')
    .replace(',', '.')
    .replace('%', '')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num / 100;
};

const round2 = (n) => (Math.round((n + Number.EPSILON) * 100) / 100);

const buildPiece = (partial, defaultSupplier) => {
  const qtyNum = parseFloat(partial.quantity);
  const qty = !isNaN(qtyNum) ? qtyNum : 1;
  const puNum = parseFloat(partial.prixUnitaire);
  const pu = !isNaN(puNum) ? puNum : '';
  let prix = partial.prix;
  if ((prix === undefined || prix === '') && pu !== '' && !isNaN(pu)) {
    prix = round2(qty * pu).toFixed(2);
  }
  return {
    reference: (partial.reference || '').trim().toUpperCase(),
    designation: (partial.designation || '').trim(),
    fournisseur: partial.fournisseur || defaultSupplier || '',
    quantity: Number.isInteger(qty) ? qty.toString() : qty.toString(),
    prixUnitaire: pu !== '' ? pu.toFixed(2) : '',
    prix: prix,
    ...(partial.extra || {})
  };
};

/* ===================== NED ===================== */
function parseNEDLine(line, defaultSupplier) {
  let parts = line.split('\t');
  if (parts.length < 5) parts = line.split(/\s{2,}/);
  parts = parts.map(p => p.trim()).filter(Boolean);
  if (parts.length < 7) return null;
  const [ref, fournMaybe, designationMaybe, , qtyRaw, puRaw, remise1Raw] = parts;
  if (!ref || /^total$/i.test(ref)) return null;
  const qty = parseFloat(normalizeNumber(qtyRaw)) || 1;
  const puCatalogue = parseFloat(normalizeNumber(puRaw));
  if (isNaN(puCatalogue)) return null;
  const remise1 = parsePercent(remise1Raw);
  const puNet = round2(puCatalogue * (1 - remise1));
  return buildPiece({
    reference: ref,
    designation: designationMaybe,
    fournisseur: fournMaybe,
    quantity: qty,
    prixUnitaire: puNet
  }, defaultSupplier);
}

/* ===================== AUTOSSIMO ===================== */
function parseAutossimoLine(line, defaultSupplier) {
  let parts = line.split('\t');
  if (parts.length < 5) parts = line.split(/\s{2,}/);
  parts = parts.map(p => p.trim()).filter(Boolean);
  if (parts.length < 5) return null;
  const [ref, desRaw, qtyRaw, uniteRaw, puRaw] = parts;
  if (!ref || !desRaw) return null;
  if (!/^\d+(\.\d+)?$/.test(qtyRaw)) return null;
  if (!/^\d+(\.\d+)?$/.test(puRaw)) return null;
  const qty = parseFloat(qtyRaw);
  const pu = parseFloat(puRaw);
  return buildPiece({
    reference: ref,
    designation: desRaw,
    quantity: qty,
    prixUnitaire: pu,
    extra: { unite: uniteRaw }
  }, defaultSupplier);
}

/* ===================== SERVICEBOX ===================== */
function parseServiceBoxBlock(block) {
  if (!block.length) return null;
  const head = block[0];
  let headParts = head.split('\t').filter(p => p.trim());
  if (headParts.length < 2) headParts = head.split(/\s{2,}/).filter(p => p.trim());
  const refMatch = head.match(/^([A-Z0-9]{3,})/i);
  if (!refMatch) return null;
  const rawRef = refMatch[1];
  let designation = head
    .replace(rawRef, '')
    .replace(/\t+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\b([A-Z])$/,'')
    .trim();

  const qtyLine = block.find(l => /^\d+(?:[.,]\d+)?$/.test(l));
  let quantity = '1';
  if (qtyLine) {
    quantity = normalizeNumber(qtyLine);
    if (quantity.endsWith('.0')) quantity = quantity.slice(0, -2);
  }

  const priceLine = block.find(l => /%/.test(l) && /EUR|€/.test(l));
  if (!priceLine) return null;
  let parts = priceLine.split('\t');
  if (parts.length < 4) parts = priceLine.split(/\s{2,}/);
  parts = parts.map(p => p.trim()).filter(Boolean);

  let remiseIndex = -1;
  const eurPattern = /(\d+,\d+)\s*(EUR|€)/i;
  const tokens = parts.map((tok, idx) => ({ tok, idx }));
  const moneyTokens = tokens.filter(t => eurPattern.test(t.tok));
  tokens.forEach(t => {
    if (/\d+,\d+\s*%/.test(t.tok)) remiseIndex = t.idx;
  });
  if (remiseIndex === -1 || moneyTokens.length === 0) return null;
  const netToken = moneyTokens.find(mt => mt.idx > remiseIndex);
  if (!netToken) return null;
  const prixNetHT = parseFloat(netToken.tok.replace(/EUR|€/i,'').replace(',','.'));
  if (isNaN(prixNetHT)) return null;

  return {
    reference: rawRef,
    designation,
    quantity: parseFloat(quantity) || 1,
    prixUnitaire: prixNetHT
  };
}

/* ===================== PARTSLINK ===================== */
function tryParsePartsLinkTabular(lines, defaultSupplier) {
  const headerIndex = lines.findIndex(l =>
    /quantité/i.test(l) && /numéro\s+de\s+pi[eè]ce/i.test(l)
  );
  if (headerIndex === -1) return [];
  const data = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw || /total/i.test(raw)) continue;
    let parts = raw.split('\t');
    if (parts.length < 6) parts = raw.split(/\s{2,}/);
    parts = parts.map(p => p.trim()).filter(Boolean);
    if (parts.length < 6) continue;
    const qtyRaw = parts[0];
    const ref = parts[1];
    const description = parts[2];
    const puRaw = parts[5];
    const qty = parseFloat(normalizeNumber(qtyRaw));
    const pu = parseFloat(normalizeNumber(puRaw));
    if (isNaN(qty) || isNaN(pu) || !ref) continue;
    data.push(buildPiece({
      reference: ref,
      designation: description,
      quantity: qty,
      prixUnitaire: pu
    }, defaultSupplier));
  }
  return data;
}

function tryParsePartsLinkBlocks(lines, defaultSupplier) {
  const blocks = [];
  let current = [];
  const flush = () => {
    if (current.length) blocks.push(current.slice());
    current = [];
  };
  lines.forEach(l => {
    const trimmed = l.trim();
    if (/^[A-Z0-9]{5,}/i.test(trimmed)) {
      flush();
      current.push(trimmed);
    } else if (current.length) {
      current.push(trimmed);
    }
  });
  flush();

  const pieces = [];
  const moneyRegex = /(\d{1,3}(?:[ \u00A0\u202F]\d{3})*,\d{2})\s*€/g;

  blocks.forEach(block => {
    if (block.length < 2) return;
    const head = block[0];
    const refMatch = head.match(/^([A-Z0-9]{5,})/i);
    if (!refMatch) return;
    const reference = refMatch[1].toUpperCase();
    const designationLine = block[1] ? block[1].trim() : '';
    if (!designationLine) return;
    const priceLine = block.find((l, idx) => idx > 1 && /€/.test(l));
    if (!priceLine) return;

    let m;
    const amounts = [];
    while ((m = moneyRegex.exec(priceLine)) !== null) {
      amounts.push(m[1]);
    }
    if (!amounts.length) return;

    const normalizeMoney = (s) =>
      parseFloat(
        s
          .replace(/\u202F/g, '')
          .replace(/\u00A0/g, '')
          .replace(/\s/g, '')
          .replace(',', '.')
      );
    const pu = normalizeMoney(amounts[0]);
    if (isNaN(pu)) return;

    let qty = 1;
    const priceIndex = block.indexOf(priceLine);
    if (priceIndex >= 0 && block[priceIndex + 1] && /^\d+(?:[.,]\d+)?$/.test(block[priceIndex + 1])) {
      qty = parseFloat(block[priceIndex + 1].replace(',', '.')) || 1;
    }

    pieces.push(buildPiece({
      reference,
      designation: designationLine,
      quantity: qty,
      prixUnitaire: pu
    }, defaultSupplier));
  });

  return pieces;
}

/* ===================== RENAULT (bloc) ===================== */
function parseRenaultBlocks(lines, defaultSupplier) {
  const blocks = [];
  let current = [];

  const flush = () => {
    if (current.length) blocks.push(current.slice());
    current = [];
  };

  const isReferenceLine = (l) => /^[A-Z0-9]{6,}$/i.test(l.trim());
  const isPriceLine = (l) => /€/.test(l) && /%/.test(l);
  const isQuantityLine = (l) => /^\d+(?:[.,]\d+)?$/.test(l.trim());

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      return;
    }
    if (isReferenceLine(trimmed) && current.length) {
      current.push(trimmed);
    } else if (!current.length) {
      current.push(trimmed);
    } else {
      current.push(trimmed);
    }
  });
  flush();

  const pieces = [];
  blocks.forEach(block => {
    if (block.length < 5) return;
    const refIdx = block.findIndex(l => isReferenceLine(l));
    if (refIdx === -1) return;
    const designation = block.slice(0, refIdx).join(' ');
    const reference = block[refIdx];
    const priceIdx = block.findIndex(l => isPriceLine(l));
    if (priceIdx === -1) return;

    let quantity = 1;
    const qtyIdx = block.findIndex((l, idx) => idx > priceIdx && isQuantityLine(l));
    if (qtyIdx !== -1) {
      quantity = parseFloat(normalizeNumber(block[qtyIdx])) || 1;
    }

    const priceLine = block[priceIdx];
    const moneyTokens = priceLine.match(/(\d+,\d+)\s*€/g);
    if (!moneyTokens || !moneyTokens.length) return;
    const netToken = moneyTokens[moneyTokens.length - 1];
    const pu = parseFloat(netToken.replace(/€/,'').replace(',','.').replace(/\s/g,''));
    if (isNaN(pu)) return;

    pieces.push(buildPiece({
      reference,
      designation,
      quantity,
      prixUnitaire: pu
    }, defaultSupplier));
  });

  return pieces;
}

/* ===================== FORMAT STRATEGIES ===================== */
const formatStrategies = {
  standard(lines, defaultSupplier) {
    const pieces = [];
    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 4) {
        const [ref, des, qte, pu] = parts;
        const qtyNum = parseFloat(normalizeNumber(qte)) || 1;
        const puNum = parseFloat(normalizeNumber(pu));
        pieces.push(buildPiece({
          reference: ref,
          designation: des,
          quantity: qtyNum,
          prixUnitaire: isNaN(puNum) ? '' : puNum
        }, defaultSupplier));
      }
    });
    return pieces;
  },

  xpr(lines, defaultSupplier) {
    const pieces = [];
    const pattern = /^(\d+)\s*([A-Z0-9\s'\-]+?)(W[A-Z]|G)\s*([\d,\.]+)?/i;
    lines.forEach(line => {
      const m = line.match(pattern);
      if (m) {
        const qty = parseFloat(m[1]) || 1;
        const designation = (m[2] + m[3]).trim();
        const pu = parseFloat(normalizeNumber(m[4] || ''));
        pieces.push(buildPiece({
          reference: '',
          designation,
          quantity: qty,
          prixUnitaire: isNaN(pu) ? '' : pu
        }, defaultSupplier));
      }
    });
    return pieces;
  },

  ned(lines, defaultSupplier) {
    return lines
      .map(l => parseNEDLine(l, defaultSupplier))
      .filter(Boolean);
  },

  autossimo(lines, defaultSupplier) {
    return lines
      .map(l => parseAutossimoLine(l, defaultSupplier))
      .filter(Boolean);
  },

  servicebox(lines, defaultSupplier) {
    const blocks = [];
    let current = [];
    const refStart = /^[A-Z0-9]{3,}/;
    const flush = () => { if (current.length) blocks.push(current.slice()); current = []; };
    lines.forEach(l => {
      const t = l.trim();
      if (refStart.test(t)) {
        flush();
        current.push(t);
      } else if (current.length) {
        current.push(t);
      }
    });
    flush();
    return blocks.map(b => parseServiceBoxBlock(b)).filter(Boolean).map(p => buildPiece(p, defaultSupplier));
  },

  partslink(lines, defaultSupplier) {
    const tabular = tryParsePartsLinkTabular(lines, defaultSupplier);
    if (tabular.length) return tabular;
    const blocks = tryParsePartsLinkBlocks(lines, defaultSupplier);
    return blocks;
  },

  renault(lines, defaultSupplier) {
    return parseRenaultBlocks(lines, defaultSupplier);
  },

  auto(lines, defaultSupplier) {
    const hasPercentsEuro = lines.filter(l => /\d+,\d+\s*%/.test(l) && /€|EUR/i.test(l)).length;
    if (hasPercentsEuro) {
      const nedTry = formatStrategies.ned(lines, defaultSupplier);
      if (nedTry.length) return nedTry;
    }
    const serviceTry = formatStrategies.servicebox(lines, defaultSupplier);
    if (serviceTry.length) return serviceTry;

    const renaultTry = formatStrategies.renault(lines, defaultSupplier);
    if (renaultTry.length) return renaultTry;

    const partsLinkTry = formatStrategies.partslink(lines, defaultSupplier);
    if (partsLinkTry.length) return partsLinkTry;

    const autTry = formatStrategies.autossimo(lines, defaultSupplier);
    if (autTry.length) return autTry;

    const withPipe = lines.filter(l => l.includes('|')).length;
    if (withPipe >= lines.length * 0.5) {
      return formatStrategies.standard(lines, defaultSupplier);
    }
    return formatStrategies.xpr(lines, defaultSupplier);
  }
};

/* ===================== SOURCE PREPROCESS ===================== */
const sourceStrategies = {
  auto: l => l,
  NED: l => l.map(x => x.replace(/'/g,'').trim()),
  AUTOSSIMO: l => l,
  SERVICEBOX: l => l,
  PARTSLINK: l => l,
  RENAULT: l => l
};

/* ===================== MAIN ===================== */
export const parsePieces = (rawText, format, sourceSystem, defaultSupplier) => {
  if (!rawText || !rawText.trim()) return [];
  let lines = rawText
    .split('\n')
    .map(l => l.replace(/\r/g,'').trim())
    .filter(l => l);

  const ignorePattern = /(sous[-\s]?total|total général|^total$)/i;
  lines = lines.filter(l => !ignorePattern.test(l));

  const srcFn = sourceStrategies[sourceSystem] || sourceStrategies.auto;
  lines = srcFn(lines);

  let effectiveFormat = format;
  if (sourceSystem === 'NED' && format === 'auto') effectiveFormat = 'ned';
  if (sourceSystem === 'AUTOSSIMO' && format === 'auto') effectiveFormat = 'autossimo';
  if (sourceSystem === 'SERVICEBOX' && format === 'auto') effectiveFormat = 'servicebox';
  if (sourceSystem === 'PARTSLINK' && format === 'auto') effectiveFormat = 'partslink';
  if (sourceSystem === 'RENAULT' && format === 'auto') effectiveFormat = 'renault';

  const fmtFn = formatStrategies[effectiveFormat] || formatStrategies.auto;
  const pieces = fmtFn(lines, defaultSupplier);

  return pieces.filter(p => p && (p.reference || p.designation));
};