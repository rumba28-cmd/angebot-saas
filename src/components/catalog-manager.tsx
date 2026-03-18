"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  sortOrder: number;
};

type Item = {
  id: string;
  categoryId: string | null;
  title: string;
  description?: string | null;
  unit: string;
  unitPriceCents: number;
  vatPercent: number;
  keywordsText: string;
  synonymsText?: string | null;
  offerTextTemplate?: string | null;
  requiresQuantity: boolean;
  sortOrder: number;
  usageCount: number;
  isFavorite: boolean;
  isArchived: boolean;
  category?: { id: string; name: string } | null;
  sourceTemplate?: {
    id: string;
    title: string;
    category?: { id: string; name: string } | null;
  } | null;
};

type MasterTemplate = {
  id: string;
  title: string;
  unit: string;
  description?: string | null;
  keywordsText: string;
  synonymsText?: string | null;
  imported: boolean;
};

type MasterCategory = {
  id: string;
  name: string;
  templates: MasterTemplate[];
};

type FlatMasterTemplate = MasterTemplate & {
  categoryId: string;
  categoryName: string;
};

const EMPTY_FORM = {
  categoryId: "",
  title: "",
  description: "",
  unit: "M2",
  unitPriceCents: "0",
  vatPercent: "19",
  keywordsText: "",
  synonymsText: "",
  offerTextTemplate: "",
  requiresQuantity: true,
  isFavorite: false
};

function formatUnit(unit: string) {
  if (unit === "M2") return "m²";
  if (unit === "METER") return "m";
  if (unit === "HOUR") return "Std.";
  if (unit === "FIXED") return "Pauschal";
  if (unit === "ITEM") return "Stk.";
  return unit;
}

export function CatalogManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [templateImportLoadingId, setTemplateImportLoadingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [sort, setSort] = useState("manual");
  const [status, setStatus] = useState("active");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategoryId, setTemplateCategoryId] = useState("");
  const [templateSort, setTemplateSort] = useState("category");
  const [templateShowImported, setTemplateShowImported] = useState(true);

  async function loadCategories() {
    const res = await fetch("/api/catalog/categories");
    const data = await res.json();
    setCategories(data);
    if (!form.categoryId && data[0]) {
      setForm((prev) => ({ ...prev, categoryId: data[0].id }));
    }
  }

  async function loadItems() {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      categoryId: filterCategoryId,
      sort,
      status,
      favorites: String(favoritesOnly)
    });

    const res = await fetch(`/api/catalog/items?${params.toString()}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  async function loadMaster() {
    const res = await fetch("/api/catalog/master");
    const data = await res.json();
    setMasterCategories(data);
  }

  async function reloadAll() {
    await Promise.all([loadCategories(), loadItems(), loadMaster()]);
  }

  useEffect(() => {
    loadCategories();
    loadMaster();
  }, []);

  useEffect(() => {
    loadItems();
  }, [search, filterCategoryId, sort, status, favoritesOnly]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const item of items) {
      const key = item.category?.name || "Ohne Kategorie";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [items]);

  const flatTemplates = useMemo<FlatMasterTemplate[]>(() => {
    const result: FlatMasterTemplate[] = [];
    for (const cat of masterCategories) {
      for (const tpl of cat.templates) {
        result.push({
          ...tpl,
          categoryId: cat.id,
          categoryName: cat.name
        });
      }
    }
    return result;
  }, [masterCategories]);

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();

    let result = flatTemplates.filter((tpl) => {
      if (templateCategoryId && tpl.categoryId !== templateCategoryId) return false;
      if (!templateShowImported && tpl.imported) return false;

      if (!q) return true;

      const text = [
        tpl.title,
        tpl.description || "",
        tpl.keywordsText || "",
        tpl.synonymsText || "",
        tpl.categoryName
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });

    if (templateSort === "category") {
      result = [...result].sort((a, b) => {
        if (a.categoryName !== b.categoryName) {
          return a.categoryName.localeCompare(b.categoryName, "de");
        }
        return a.title.localeCompare(b.title, "de");
      });
    }

    if (templateSort === "name_asc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title, "de"));
    }

    if (templateSort === "name_desc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title, "de"));
    }

    if (templateSort === "unit") {
      result = [...result].sort((a, b) => a.unit.localeCompare(b.unit, "de"));
    }

    if (templateSort === "not_imported_first") {
      result = [...result].sort((a, b) => Number(a.imported) - Number(b.imported));
    }

    return result;
  }, [flatTemplates, templateCategoryId, templateSearch, templateSort, templateShowImported]);

  function resetForm() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id || ""
    });
  }

  function editItem(item: Item) {
    setEditingId(item.id);
    setForm({
      categoryId: item.categoryId || "",
      title: item.title,
      description: item.description || "",
      unit: item.unit,
      unitPriceCents: String(item.unitPriceCents),
      vatPercent: String(item.vatPercent),
      keywordsText: item.keywordsText,
      synonymsText: item.synonymsText || "",
      offerTextTemplate: item.offerTextTemplate || "",
      requiresQuantity: item.requiresQuantity,
      isFavorite: item.isFavorite
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      ...form,
      unitPriceCents: Number(form.unitPriceCents),
      vatPercent: Number(form.vatPercent)
    };

    const url = editingId ? `/api/catalog/items/${editingId}` : "/api/catalog/items";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Fehler");
      return;
    }

    resetForm();
    await reloadAll();
  }

  async function createCategory() {
    const name = window.prompt("Name der Kategorie");
    if (!name) return;

    await fetch("/api/catalog/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    await loadCategories();
  }

  async function renameCategory(category: Category) {
    const name = window.prompt("Neuer Name", category.name);
    if (!name) return;

    await fetch(`/api/catalog/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    await loadCategories();
    await loadItems();
  }

  async function toggleArchive(item: Item) {
    await fetch(`/api/catalog/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !item.isArchived })
    });
    await loadItems();
    await loadMaster();
  }

  async function toggleFavorite(item: Item) {
    await fetch(`/api/catalog/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !item.isFavorite })
    });
    await loadItems();
  }

  async function moveItem(itemId: string, direction: "up" | "down") {
    await fetch("/api/catalog/items/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, direction })
    });
    await loadItems();
  }

  async function importSingleTemplate(templateId: string) {
    try {
      setTemplateImportLoadingId(templateId);

      const res = await fetch("/api/catalog/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateIds: [templateId] })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Import fehlgeschlagen");
        return;
      }

      await reloadAll();
    } finally {
      setTemplateImportLoadingId(null);
    }
  }

  return (
    <>
      <div className="grid-2">
        <div className="stack">
          <div className="card">
            <div className="toolbar">
              <h2>Mein Preiskatalog</h2>
              <div className="row">
                <button className="secondary-btn" onClick={() => setIsTemplateModalOpen(true)}>
                  Vorlagen öffnen
                </button>
                <button onClick={createCategory}>Neue Kategorie</button>
              </div>
            </div>

            <div className="filters">
              <input
                placeholder="Suche nach Titel, Beschreibung, Keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)}>
                <option value="">Alle Kategorien</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="manual">Manuelle Reihenfolge</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="price_asc">Preis aufsteigend</option>
                <option value="price_desc">Preis absteigend</option>
                <option value="used_desc">Am häufigsten benutzt</option>
                <option value="favorite_first">Favoriten zuerst</option>
                <option value="category">Nach Kategorie</option>
              </select>

              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Nur aktiv</option>
                <option value="archived">Nur Archiv</option>
                <option value="all">Alle</option>
              </select>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                />
                Nur Favoriten
              </label>
            </div>
          </div>

          <div className="card">
            <h3>{loading ? "Lade..." : `Positionen (${items.length})`}</h3>

            <div className="chips">
              {categories.map((cat) => (
                <button key={cat.id} className="secondary-btn small" onClick={() => renameCategory(cat)}>
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="list" style={{ marginTop: 16 }}>
              {groupedItems.map(([group, groupItems]) => (
                <div key={group}>
                  <h4>{group}</h4>
                  <div className="list">
                    {groupItems.map((item) => (
                      <div key={item.id} className="list-item">
                        <div className="toolbar">
                          <div>
                            <strong>{item.title}</strong>
                            <div className="muted">
                              {(item.unitPriceCents / 100).toFixed(2)} € / {formatUnit(item.unit)} · MwSt {item.vatPercent}% · benutzt {item.usageCount}x
                            </div>
                            {item.sourceTemplate && (
                              <div className="muted small">Vorlage: {item.sourceTemplate.title}</div>
                            )}
                          </div>
                          <div className="chips">
                            {item.isFavorite && <span className="badge">Favorit</span>}
                            {item.isArchived && <span className="badge gray">Archiv</span>}
                          </div>
                        </div>

                        {item.description && <div>{item.description}</div>}
                        <div className="muted small">Keywords: {item.keywordsText}</div>
                        {item.synonymsText && <div className="muted small">Synonyme: {item.synonymsText}</div>}

                        <div className="item-actions">
                          <button className="secondary-btn small" onClick={() => editItem(item)}>
                            Bearbeiten
                          </button>
                          <button className="secondary-btn small" onClick={() => toggleFavorite(item)}>
                            {item.isFavorite ? "Unfavorite" : "Favorit"}
                          </button>
                          {!item.isArchived && (
                            <>
                              <button className="secondary-btn small" onClick={() => moveItem(item.id, "up")}>
                                ↑
                              </button>
                              <button className="secondary-btn small" onClick={() => moveItem(item.id, "down")}>
                                ↓
                              </button>
                            </>
                          )}
                          <button className="danger-btn small" onClick={() => toggleArchive(item)}>
                            {item.isArchived ? "Aktivieren" : "Archivieren"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {!loading && items.length === 0 && <div className="muted">Keine Leistungen gefunden.</div>}
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="toolbar">
              <h2>{editingId ? "Leistung bearbeiten" : "Neue Leistung"}</h2>
              {editingId && (
                <button className="secondary-btn" onClick={resetForm}>
                  Abbrechen
                </button>
              )}
            </div>

            <form onSubmit={saveItem} className="form">
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">Kategorie wählen</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Titel"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <textarea
                placeholder="Beschreibung"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <div className="row">
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option value="M2">m²</option>
                  <option value="METER">m</option>
                  <option value="HOUR">Std.</option>
                  <option value="FIXED">Pauschal</option>
                  <option value="ITEM">Stk.</option>
                </select>

                <input
                  placeholder="Preis in Cent"
                  value={form.unitPriceCents}
                  onChange={(e) => setForm({ ...form, unitPriceCents: e.target.value })}
                />

                <input
                  placeholder="MwSt."
                  value={form.vatPercent}
                  onChange={(e) => setForm({ ...form, vatPercent: e.target.value })}
                />
              </div>

              <input
                placeholder="Keywords"
                value={form.keywordsText}
                onChange={(e) => setForm({ ...form, keywordsText: e.target.value })}
              />

              <input
                placeholder="Synonyme"
                value={form.synonymsText}
                onChange={(e) => setForm({ ...form, synonymsText: e.target.value })}
              />

              <textarea
                placeholder="Textbaustein für Angebot"
                value={form.offerTextTemplate}
                onChange={(e) => setForm({ ...form, offerTextTemplate: e.target.value })}
              />

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.requiresQuantity}
                  onChange={(e) => setForm({ ...form, requiresQuantity: e.target.checked })}
                />
                Menge erforderlich
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.isFavorite}
                  onChange={(e) => setForm({ ...form, isFavorite: e.target.checked })}
                />
                Als Favorit markieren
              </label>

              <button type="submit">{editingId ? "Speichern" : "Anlegen"}</button>
            </form>
          </div>
        </div>
      </div>

      {isTemplateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTemplateModalOpen(false)}>
          <div className="modal-window modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Vorlagen</h2>
                <div className="muted">Vorlagen durchsuchen und einzeln in den Preiskatalog übernehmen</div>
              </div>
              <button className="secondary-btn" onClick={() => setIsTemplateModalOpen(false)}>
                Schließen
              </button>
            </div>

            <div className="filters template-filters">
              <input
                placeholder="Suche in Vorlagen..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
              />

              <select value={templateCategoryId} onChange={(e) => setTemplateCategoryId(e.target.value)}>
                <option value="">Alle Kategorien</option>
                {masterCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select value={templateSort} onChange={(e) => setTemplateSort(e.target.value)}>
                <option value="category">Nach Kategorie</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="unit">Nach Einheit</option>
                <option value="not_imported_first">Nicht importiert zuerst</option>
              </select>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={templateShowImported}
                  onChange={(e) => setTemplateShowImported(e.target.checked)}
                />
                Importierte anzeigen
              </label>
            </div>

            <div className="template-results-header">
              <strong>Vorlagen gefunden: {filteredTemplates.length}</strong>
            </div>

            <div className="template-list">
              {filteredTemplates.map((tpl) => (
                <div key={tpl.id} className="template-card">
                  <div className="template-card-top">
                    <div>
                      <div className="template-category">{tpl.categoryName}</div>
                      <strong>{tpl.title}</strong>
                      <div className="muted small">Einheit: {formatUnit(tpl.unit)}</div>
                    </div>

                    <div className="row">
                      {tpl.imported ? (
                        <span className="badge">Bereits importiert</span>
                      ) : (
                        <button
                          onClick={() => importSingleTemplate(tpl.id)}
                          disabled={templateImportLoadingId === tpl.id}
                        >
                          {templateImportLoadingId === tpl.id ? "Wird hinzugefügt..." : "Hinzufügen"}
                        </button>
                      )}
                    </div>
                  </div>

                  {tpl.description && <div>{tpl.description}</div>}
                  <div className="muted small">Keywords: {tpl.keywordsText}</div>
                  {tpl.synonymsText && <div className="muted small">Synonyme: {tpl.synonymsText}</div>}
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="muted">Keine Vorlagen gefunden.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}