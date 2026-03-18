import { ServiceItem } from "@prisma/client";

export type UnitType = "M2" | "METER" | "HOUR" | "FIXED" | "ITEM";

export type MatchedItem = {
  serviceItem: ServiceItem;
  score: number;
  source: "KEYWORD" | "SYNONYM" | "PHRASE";
  quantity: number | null;
  totalCents: number;
  needsConfirmation: boolean;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/\n/g, " ")
    .replace(/[.,;:!?()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPhrase(text: string, phrase: string) {
  return text.includes(phrase.toLowerCase().trim());
}

function splitCsv(input?: string | null) {
  if (!input) return [];
  return input
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function extractQuantityByUnit(text: string, unit: UnitType): number | null {
  const normalized = normalize(text);

  if (unit === "FIXED" || unit === "ITEM") return 1;

  if (unit === "M2") {
    const match = normalized.match(/(\d+(?:[.,]\d+)?)\s?(m2|m²|qm)/);
    if (match) return Number(match[1].replace(",", "."));
  }

  if (unit === "METER") {
    const match = normalized.match(/(\d+(?:[.,]\d+)?)\s?(m|meter)/);
    if (match) return Number(match[1].replace(",", "."));
  }

  if (unit === "HOUR") {
    const match = normalized.match(/(\d+(?:[.,]\d+)?)\s?(std|stunden|stunde|h)/);
    if (match) return Number(match[1].replace(",", "."));
  }

  return null;
}

export function matchServicesToText(text: string, items: ServiceItem[]) {
  const normalized = normalize(text);
  const results: MatchedItem[] = [];

  for (const item of items) {
    const keywords = splitCsv(item.keywordsText);
    const synonyms = splitCsv(item.synonymsText);
    const titleWords = splitCsv(item.title.replace(/\s+/g, ","));

    let score = 0;
    let source: MatchedItem["source"] = "KEYWORD";

    for (const word of keywords) {
      if (containsPhrase(normalized, word)) {
        score += 3;
        source = "KEYWORD";
      }
    }

    for (const word of synonyms) {
      if (containsPhrase(normalized, word)) {
        score += 2;
        source = "SYNONYM";
      }
    }

    for (const word of titleWords) {
      if (containsPhrase(normalized, word)) {
        score += 1;
      }
    }

    if (score > 0) {
      const unit = item.unit as UnitType;
      const quantity = extractQuantityByUnit(normalized, unit);
      const needsConfirmation =
        item.requiresQuantity && quantity === null && unit !== "FIXED" && unit !== "ITEM";
      const totalCents =
        quantity ? Math.round(quantity * item.unitPriceCents) : unit === "FIXED" ? item.unitPriceCents : 0;

      results.push({
        serviceItem: item,
        score,
        source,
        quantity,
        totalCents,
        needsConfirmation
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function unitLabel(unit: string) {
  switch (unit) {
    case "M2":
      return "m²";
    case "METER":
      return "m";
    case "HOUR":
      return "Std.";
    case "FIXED":
      return "pauschal";
    case "ITEM":
      return "Stk.";
    default:
      return "";
  }
}