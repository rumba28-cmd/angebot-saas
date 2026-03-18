import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MASTER_CATALOG = [
  {
    name: "Malerarbeiten",
    slug: "malerarbeiten",
    sortOrder: 10,
    templates: [
      ["innenwaende-streichen", "Innenwände streichen", "M2", "Vorbereitung der Oberfläche und zweimaliger Anstrich", "streichen,malen,wände,innenanstrich", "wände streichen,wände malen,neu streichen"],
      ["decken-streichen", "Decken streichen", "M2", "Deckenflächen grundieren und streichen", "decken streichen,decke malen", "zimmerdecke streichen,decke weiß streichen"],
      ["tapeten-entfernen", "Tapeten entfernen", "M2", "Alte Tapeten entfernen und entsorgen", "tapeten entfernen,alte tapete", "tapete abmachen,tapeten abziehen"],
      ["risse-verspachteln", "Risse verspachteln", "METER", "Kleinere Risse schließen und glätten", "risse,spachteln,verspachteln", "risse schließen,wände spachteln"],
      ["vollflaechig-spachteln", "Vollflächig spachteln", "M2", "Flächen vollflächig spachteln und schleifen", "spachteln,vollspachtelung,glätten", "wand glätten,q3,q4"],
      ["tueren-lackieren", "Türen lackieren", "ITEM", "Lackierung von Innentüren", "türen lackieren,tür streichen", "innentür lackieren"],
      ["fenster-lackieren", "Fenster lackieren", "ITEM", "Lackierung von Fensterrahmen", "fenster lackieren,fensterrahmen streichen", "fenster streichen"]
    ]
  },
  {
    name: "Trockenbau",
    slug: "trockenbau",
    sortOrder: 20,
    templates: [
      ["trockenbauwand-montieren", "Trockenbauwand montieren", "M2", "Montage einer Trockenbauwand inkl. Unterkonstruktion", "trockenbauwand,gipskartonwand,wände stellen", "rigipswand,trockenbau"],
      ["gipskartonplatten-montieren", "Gipskartonplatten montieren", "M2", "Gipskartonplatten an Wand oder Decke montieren", "gipskarton,rigips,montieren", "platten montieren,rigipsplatten"],
      ["decke-abhaengen", "Decke abhängen", "M2", "Abgehängte Decke montieren", "decke abhängen,unterdecke", "deckenabhängung"],
      ["daemmung-einbauen", "Dämmung einbauen", "M2", "Dämmmaterial einbauen", "dämmung,dämmen,isolation", "isolierung"],
      ["spachteln-q2", "Spachteln Q2", "M2", "Fugen- und Flächenspachtelung Q2", "q2,spachteln", "rigips spachteln"],
      ["spachteln-q3", "Spachteln Q3", "M2", "Spachtelung Q3", "q3,spachteln", "feinspachtel"],
      ["vorsatzschale-montieren", "Vorsatzschale montieren", "M2", "Montage einer Vorsatzschale", "vorsatzschale,trockenbau", "wand vorsetzen"]
    ]
  },
  {
    name: "Bodenarbeiten",
    slug: "bodenarbeiten",
    sortOrder: 30,
    templates: [
      ["laminat-verlegen", "Laminat verlegen", "M2", "Verlegung von Laminatboden", "laminat,boden verlegen", "laminat verlegen,neuer boden"],
      ["vinyl-verlegen", "Vinylboden verlegen", "M2", "Verlegung von Vinylboden", "vinyl,vinylboden,boden verlegen", "pvc verlegen"],
      ["parkett-verlegen", "Parkett verlegen", "M2", "Verlegung von Parkettboden", "parkett,boden verlegen", "holzfußboden"],
      ["teppich-verlegen", "Teppich verlegen", "M2", "Teppichboden verlegen", "teppich verlegen,teppichboden", "teppich"],
      ["alten-boden-entfernen", "Alten Boden entfernen", "M2", "Entfernung des bestehenden Bodenbelags", "boden entfernen,altbelag entfernen,demontage", "alten boden raus,bodenbelag entfernen"],
      ["ausgleichsmasse", "Ausgleichsmasse auftragen", "M2", "Untergrund ausgleichen", "ausgleichsmasse,boden ausgleichen", "untergrund vorbereiten"],
      ["sockelleisten-montieren", "Sockelleisten montieren", "METER", "Montage von Sockelleisten", "sockelleisten,montieren", "leisten anbringen"],
      ["trittschalldaemmung", "Trittschalldämmung verlegen", "M2", "Verlegung von Trittschalldämmung", "trittschalldämmung,dämmung", "dämmung unter boden"]
    ]
  },
  {
    name: "Fliesenarbeiten",
    slug: "fliesenarbeiten",
    sortOrder: 40,
    templates: [
      ["wandfliesen-verlegen", "Wandfliesen verlegen", "M2", "Verlegung von Wandfliesen", "wandfliesen,fliesen verlegen", "bad fliesen,küche fliesen"],
      ["bodenfliesen-verlegen", "Bodenfliesen verlegen", "M2", "Verlegung von Bodenfliesen", "bodenfliesen,fliesenboden", "fliesen verlegen"],
      ["alte-fliesen-entfernen", "Alte Fliesen entfernen", "M2", "Alte Fliesen entfernen und entsorgen", "fliesen entfernen,alte fliesen", "fliesen abschlagen"],
      ["untergrund-abdichten", "Untergrund abdichten", "M2", "Abdichtung im Nassbereich", "abdichten,abdichtung,bad abdichten", "dichtschlämme"],
      ["fugen-erneuern", "Fugen erneuern", "METER", "Fugen ausbessern oder erneuern", "fugen erneuern,fugen", "silikonfugen"],
      ["silikonfugen-ziehen", "Silikonfugen ziehen", "METER", "Neue Silikonfugen herstellen", "silikon,silikonfugen", "bad silikon"]
    ]
  },
  {
    name: "Abriss / Demontage",
    slug: "abriss-demontage",
    sortOrder: 50,
    templates: [
      ["nichttragende-wand-abbrechen", "Nichttragende Wand abbrechen", "M2", "Abbruch einer nichttragenden Wand", "wand abbrechen,abbruch,demontage", "wand entfernen"],
      ["tapeten-abreissen", "Tapeten abreißen", "M2", "Tapeten abreissen und entsorgen", "tapeten abreißen,tapeten entfernen", "tapeten abziehen"],
      ["decke-demontieren", "Decke demontieren", "M2", "Deckenverkleidung entfernen", "decke demontieren,decke entfernen", "unterdecke entfernen"],
      ["sanitaer-demontieren", "Sanitär demontieren", "ITEM", "Sanitärgegenstände demontieren", "sanitär demontieren,waschbecken ausbauen", "wc demontieren,dusche ausbauen"],
      ["tueren-demontieren", "Türen demontieren", "ITEM", "Türen und Zargen demontieren", "türen demontieren,türen ausbauen", "zarge entfernen"],
      ["bauschutt-verladen", "Bauschutt verladen", "FIXED", "Bauschutt aufnehmen und verladen", "bauschutt,verladen,schutt", "müll verladen"],
      ["entruempelung", "Entrümpelung", "HOUR", "Entrümpelungsarbeiten nach Aufwand", "entrümpelung,aufräumen,ausräumen", "wohnung räumen"]
    ]
  },
  {
    name: "Maurer- und Putzarbeiten",
    slug: "maurer-putzarbeiten",
    sortOrder: 60,
    templates: [
      ["innenputz", "Innenputz auftragen", "M2", "Innenputz auf Wandflächen auftragen", "innenputz,putz", "wand verputzen"],
      ["aussenputz", "Außenputz auftragen", "M2", "Außenputz auf Fassadenflächen auftragen", "außenputz,fassade putz", "fassade verputzen"],
      ["schlitze-schliessen", "Schlitze schließen", "METER", "Installationsschlitze schließen", "schlitze schließen,putz reparieren", "schlitz verspachteln"],
      ["loecher-schliessen", "Löcher schließen", "ITEM", "Kleinere Löcher fachgerecht schließen", "löcher schließen,reparatur", "bohrlöcher schließen"],
      ["mauerwerk-kleinreparatur", "Kleinreparatur Mauerwerk", "HOUR", "Kleinreparaturen am Mauerwerk", "mauerwerk,reparatur", "mauer reparieren"]
    ]
  },
  {
    name: "Fassadenarbeiten",
    slug: "fassadenarbeiten",
    sortOrder: 70,
    templates: [
      ["fassadenreinigung", "Fassadenreinigung", "M2", "Reinigung der Fassadenflächen", "fassadenreinigung,fassade reinigen", "fassade sauber machen"],
      ["fassadenanstrich", "Fassadenanstrich", "M2", "Anstrich der Fassade", "fassade streichen,fassadenanstrich", "fassade malen"],
      ["fassadenspachtelung", "Fassadenspachtelung", "M2", "Spachtelarbeiten an der Fassade", "fassade spachteln,spachtelung", "fassadenreparatur"],
      ["risse-sanieren", "Risse sanieren", "METER", "Sanierung von Rissen", "risse sanieren,risse fassade", "riss reparatur"],
      ["geruestpauschale", "Gerüstpauschale", "FIXED", "Pauschale für Gerüst", "gerüst,gerüstpauschale", "arbeitsgerüst"],
      ["schutzabdeckung", "Schutzabdeckung", "M2", "Abdeckung und Schutz von Flächen", "abdeckung,schutzfolie", "schutzarbeiten"]
    ]
  },
  {
    name: "Dacharbeiten",
    slug: "dacharbeiten",
    sortOrder: 80,
    templates: [
      ["dachreinigung", "Dachreinigung", "M2", "Reinigung der Dachfläche", "dachreinigung,dach reinigen", "dach sauber machen"],
      ["dachreparatur", "Dachreparatur", "HOUR", "Reparaturarbeiten am Dach", "dachreparatur,dach reparieren", "ziegel reparieren"],
      ["dachabdichtung", "Dachabdichtung", "M2", "Abdichtungsarbeiten am Dach", "dachabdichtung,abdichten", "dach dicht machen"],
      ["dachrinne-reinigen", "Dachrinne reinigen", "METER", "Reinigung der Dachrinne", "dachrinne reinigen,rinnenreinigung", "rinne sauber machen"],
      ["fallrohr-montieren", "Fallrohr montieren", "METER", "Montage von Fallrohren", "fallrohr,montieren", "regenrohr montieren"]
    ]
  },
  {
    name: "Sanitär",
    slug: "sanitaer",
    sortOrder: 90,
    templates: [
      ["waschbecken-montieren", "Waschbecken montieren", "ITEM", "Montage eines Waschbeckens", "waschbecken montieren,waschbecken", "becken einbauen"],
      ["wc-montieren", "WC montieren", "ITEM", "Montage eines WC", "wc montieren,toilette montieren", "toilette einbauen"],
      ["dusche-montieren", "Dusche montieren", "ITEM", "Montage einer Dusche", "dusche montieren,dusche einbauen", "duschkabine"],
      ["armaturen-austauschen", "Armaturen austauschen", "ITEM", "Austausch von Armaturen", "armaturen austauschen,wasserhahn", "mischer austauschen"],
      ["leitungen-verlegen", "Leitungen verlegen", "METER", "Verlegung von Wasserleitungen", "leitungen verlegen,wasserleitungen", "rohre verlegen"],
      ["silikonabdichtung-bad", "Silikonabdichtung Bad", "METER", "Silikonarbeiten im Bad", "silikon bad,abdichten bad", "fugen bad"]
    ]
  },
  {
    name: "Elektro",
    slug: "elektro",
    sortOrder: 100,
    templates: [
      ["steckdose-montieren", "Steckdose montieren", "ITEM", "Montage einer Steckdose", "steckdose montieren,steckdose", "dose montieren"],
      ["schalter-montieren", "Schalter montieren", "ITEM", "Montage eines Schalters", "schalter montieren,lichtschalter", "schalter austauschen"],
      ["leitungen-elektro", "Leitungen verlegen", "METER", "Verlegung von Elektroleitungen", "leitungen verlegen,elektro", "kabel verlegen"],
      ["lampenanschluss", "Lampenanschluss", "ITEM", "Anschluss einer Lampe", "lampe anschließen,lampenanschluss", "licht anschließen"],
      ["elektro-kleinreparatur", "Kleinreparatur Elektro", "HOUR", "Kleinreparaturen im Elektrobereich", "elektro reparatur,kabel reparatur", "strom reparatur"]
    ]
  },
  {
    name: "Fenster / Türen",
    slug: "fenster-tueren",
    sortOrder: 110,
    templates: [
      ["innentuer-montieren", "Innentür montieren", "ITEM", "Montage einer Innentür", "innentür montieren,tür montieren", "tür einbauen"],
      ["zarge-montieren", "Zarge montieren", "ITEM", "Montage einer Türzarge", "zarge montieren,türzarge", "rahmen montieren"],
      ["fenster-ausbauen", "Fenster ausbauen", "ITEM", "Ausbau eines Fensters", "fenster ausbauen,fenster entfernen", "altes fenster raus"],
      ["fenster-einbauen", "Fenster einbauen", "ITEM", "Einbau eines Fensters", "fenster einbauen,fenster montieren", "neues fenster"],
      ["abdichtung-fenster", "Abdichtungsarbeiten Fenster", "METER", "Abdichtung im Fensterbereich", "fenster abdichten,abdichtung fenster", "fuge fenster"]
    ]
  },
  {
    name: "Reinigung / Entsorgung / Transport",
    slug: "reinigung-entsorgung-transport",
    sortOrder: 120,
    templates: [
      ["bauschutt-entsorgen", "Bauschutt entsorgen", "FIXED", "Abtransport und Entsorgung von Bauschutt", "entsorgung,bauschutt,müll,transport", "schutt entsorgen,abfall entsorgen"],
      ["containerpauschale", "Containerpauschale", "FIXED", "Pauschale für Container", "container,containerpauschale", "mulde"],
      ["materialtransport", "Materialtransport", "FIXED", "Transport von Material", "transport,materialtransport", "lieferung material"],
      ["endreinigung-baustelle", "Endreinigung Baustelle", "M2", "Endreinigung der Baustelle", "endreinigung,baustelle reinigen", "schlussreinigung"],
      ["abdeckarbeiten", "Abdeckarbeiten", "M2", "Schutz und Abdeckung vor Arbeitsbeginn", "abdeckarbeiten,abdecken,schutzfolie", "folie auslegen"]
    ]
  },
  {
    name: "Außenanlagen / Garten",
    slug: "aussenanlagen-garten",
    sortOrder: 130,
    templates: [
      ["pflaster-verlegen", "Pflaster verlegen", "M2", "Pflasterarbeiten", "pflaster verlegen,pflasterarbeiten", "steine verlegen"],
      ["randsteine-setzen", "Randsteine setzen", "METER", "Setzen von Randsteinen", "randsteine setzen,bordstein", "kantenstein"],
      ["erdarbeiten", "Erdarbeiten", "HOUR", "Erdarbeiten nach Aufwand", "erdarbeiten,graben,aushub", "bodenarbeiten außen"],
      ["zaun-montieren", "Zaun montieren", "METER", "Montage eines Zauns", "zaun montieren,zaunbau", "gartenzaun"],
      ["gartenabfaelle-entsorgen", "Gartenabfälle entsorgen", "FIXED", "Entsorgung von Gartenabfällen", "gartenabfälle entsorgen,grünschnitt", "garten müll"]
    ]
  },
  {
    name: "Pauschalen / Zusatzleistungen",
    slug: "pauschalen-zusatzleistungen",
    sortOrder: 140,
    templates: [
      ["anfahrtspauschale", "Anfahrtspauschale", "FIXED", "Pauschale für Anfahrt", "anfahrt,anfahrtspauschale", "fahrkosten"],
      ["baustelleneinrichtung", "Baustelleneinrichtung", "FIXED", "Einrichtung der Baustelle", "baustelleneinrichtung,einrichtung", "baustelle vorbereiten"],
      ["kleinmaterialpauschale", "Kleinmaterialpauschale", "FIXED", "Pauschale für Kleinmaterial", "kleinmaterial,materialpauschale", "verbrauchsmaterial"],
      ["aufmass-vor-ort", "Aufmaß vor Ort", "FIXED", "Aufmaß am Objekt", "aufmaß,ausmessen", "maß nehmen"],
      ["stundenlohn-helfer", "Stundenlohn Helfer", "HOUR", "Helferstunde", "helfer,stundenlohn", "arbeitsstunde"],
      ["stundenlohn-facharbeiter", "Stundenlohn Facharbeiter", "HOUR", "Facharbeiterstunde", "facharbeiter,stundenlohn", "meisterstunde"]
    ]
  }
] as const;

async function upsertMasterCatalog() {
  for (const category of MASTER_CATALOG) {
    const savedCategory = await prisma.masterServiceCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        isActive: true
      },
      create: {
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
        isActive: true
      }
    });

    for (let i = 0; i < category.templates.length; i++) {
      const [slug, title, unit, description, keywordsText, synonymsText] = category.templates[i];

      await prisma.masterServiceTemplate.upsert({
        where: { slug },
        update: {
          categoryId: savedCategory.id,
          title,
          unit,
          description,
          keywordsText,
          synonymsText,
          defaultSortOrder: i + 1,
          requiresQuantity: unit !== "FIXED" && unit !== "ITEM",
          isActive: true
        },
        create: {
          categoryId: savedCategory.id,
          slug,
          title,
          unit,
          description,
          keywordsText,
          synonymsText,
          defaultSortOrder: i + 1,
          requiresQuantity: unit !== "FIXED" && unit !== "ITEM",
          isActive: true
        }
      });
    }
  }
}

async function main() {
  const demoEmail = process.env.DEMO_USER_EMAIL || "demo@angebot.de";

  await upsertMasterCatalog();

  const admin = await prisma.user.upsert({
    where: { email: "admin@angebot.de" },
    update: {},
    create: {
      email: "admin@angebot.de",
      name: "Admin",
      role: "ADMIN"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Max Bau GmbH",
      role: "USER"
    }
  });

  await prisma.companyProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      companyName: "Max Bau GmbH",
      ownerName: "Max Mustermann",
      addressLine1: "Musterstraße 10",
      postalCode: "10115",
      city: "Berlin",
      phone: "+49 30 123456",
      email: demoEmail,
      defaultFooter: "Mit freundlichen Grüßen\nMax Bau GmbH",
      legalText: "Dieses Angebot ist 14 Tage gültig."
    }
  });

  const plans = [
    { code: "MONO_MONTH_1", name: "1 Gerät / 1 Monat", durationMonths: 1, deviceLimit: 1, priceCents: 2900 },
    { code: "MONO_YEAR_1", name: "1 Gerät / 1 Jahr", durationMonths: 12, deviceLimit: 1, priceCents: 29000 },
    { code: "TEAM_MONTH_3", name: "3 Geräte / 1 Monat", durationMonths: 1, deviceLimit: 3, priceCents: 5900 },
    { code: "TEAM_YEAR_3", name: "3 Geräte / 1 Jahr", durationMonths: 12, deviceLimit: 3, priceCents: 59000 }
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { code: p.code },
      update: p,
      create: p
    });
  }

  const activePlan = await prisma.plan.findUnique({ where: { code: "TEAM_YEAR_3" } });

  if (activePlan) {
    const existing = await prisma.subscription.findFirst({
      where: { userId: user.id, planId: activePlan.id, status: "ACTIVE" }
    });

    if (!existing) {
      const startsAt = new Date();
      const endsAt = new Date();
      endsAt.setFullYear(endsAt.getFullYear() + 1);

      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: activePlan.id,
          source: "seed",
          status: "ACTIVE",
          startsAt,
          endsAt
        }
      });
    }
  }

  let userCategory = await prisma.serviceCategory.findFirst({
    where: { userId: user.id, name: "Renovierung", isArchived: false }
  });

  if (!userCategory) {
    userCategory = await prisma.serviceCategory.create({
      data: {
        userId: user.id,
        name: "Renovierung",
        sortOrder: 1
      }
    });
  }

  const starterTitles = [
    "Innenwände streichen",
    "Laminat verlegen",
    "Alten Boden entfernen",
    "Risse verspachteln",
    "Bauschutt entsorgen"
  ];

  for (let i = 0; i < starterTitles.length; i++) {
    const tpl = await prisma.masterServiceTemplate.findFirst({
      where: { title: starterTitles[i] }
    });

    if (!tpl) continue;

    const exists = await prisma.serviceItem.findFirst({
      where: {
        userId: user.id,
        OR: [{ sourceTemplateId: tpl.id }, { title: tpl.title }]
      }
    });

    if (!exists) {
      const defaultPrices: Record<string, number> = {
        "Innenwände streichen": 1800,
        "Laminat verlegen": 2400,
        "Alten Boden entfernen": 800,
        "Risse verspachteln": 600,
        "Bauschutt entsorgen": 18000
      };

      await prisma.serviceItem.create({
        data: {
          userId: user.id,
          categoryId: userCategory.id,
          sourceTemplateId: tpl.id,
          title: tpl.title,
          description: tpl.description,
          unit: tpl.unit,
          unitPriceCents: defaultPrices[tpl.title] || 0,
          vatPercent: tpl.vatPercent,
          keywordsText: tpl.keywordsText,
          synonymsText: tpl.synonymsText,
          offerTextTemplate: tpl.offerTextTemplate,
          requiresQuantity: tpl.requiresQuantity,
          sortOrder: i + 1
        }
      });
    }
  }

  const clientExists = await prisma.client.findFirst({
    where: { userId: user.id, name: "Beispiel Kunde GmbH" }
  });

  if (!clientExists) {
    await prisma.client.create({
      data: {
        userId: user.id,
        name: "Beispiel Kunde GmbH",
        email: "kunde@example.de",
        addressLine1: "Kundenweg 22",
        postalCode: "10117",
        city: "Berlin",
        projectLocation: "Berlin Mitte"
      }
    });
  }

  console.log("Seed completed");
  console.log("Master catalog seeded:", await prisma.masterServiceTemplate.count());
  console.log("Demo user:", demoEmail);
  console.log("Admin user: admin@angebot.de");
  console.log("Open: http://localhost:3000/catalog");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });