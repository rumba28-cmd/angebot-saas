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
      ["risse-verspachteln", "Risse verspachteln", "METER", "Kleinere Risse schließen und glätten", "risse,spachteln,verspachteln", "risse schließen,wände spachteln"]
    ]
  },
  {
    name: "Bodenarbeiten",
    slug: "bodenarbeiten",
    sortOrder: 20,
    templates: [
      ["laminat-verlegen", "Laminat verlegen", "M2", "Verlegung von Laminatboden", "laminat,boden verlegen", "laminat verlegen,neuer boden"],
      ["vinyl-verlegen", "Vinylboden verlegen", "M2", "Verlegung von Vinylboden", "vinyl,vinylboden,boden verlegen", "pvc verlegen"],
      ["alten-boden-entfernen", "Alten Boden entfernen", "M2", "Entfernung des bestehenden Bodenbelags", "boden entfernen,altbelag entfernen,demontage", "alten boden raus,bodenbelag entfernen"],
      ["sockelleisten-montieren", "Sockelleisten montieren", "METER", "Montage von Sockelleisten", "sockelleisten,montieren", "leisten anbringen"]
    ]
  },
  {
    name: "Zäune / Zaunbau",
    slug: "zaeune-zaunbau",
    sortOrder: 30,
    templates: [
      ["doppelstabmattenzaun-montieren", "Doppelstabmattenzaun montieren", "METER", "Montage eines Doppelstabmattenzauns", "doppelstabmattenzaun,zaun montieren,zaunbau", "stabmattenzaun"],
      ["maschendrahtzaun-montieren", "Maschendrahtzaun montieren", "METER", "Montage eines Maschendrahtzauns", "maschendrahtzaun,zaun montieren", "drahtzaun"],
      ["holzzaun-montieren", "Holzzaun montieren", "METER", "Montage eines Holzzauns", "holzzaun,zaun montieren", "gartenzaun holz"],
      ["wpc-zaun-montieren", "WPC-Zaun montieren", "METER", "Montage eines WPC-Zauns", "wpc zaun,zaun montieren", "kunststoffzaun"],
      ["sichtschutzzaun-montieren", "Sichtschutzzaun montieren", "METER", "Montage eines Sichtschutzzauns", "sichtschutzzaun,sichtschutz", "zaun sichtschutz"],
      ["zaunpfosten-setzen", "Zaunpfosten setzen", "ITEM", "Setzen von Zaunpfosten", "zaunpfosten,pfosten setzen", "pfosten betonieren"],
      ["punktfundamente-fuer-zaun", "Punktfundamente für Zaun", "ITEM", "Herstellung von Punktfundamenten für Zaunanlagen", "fundament zaun,punktfundament", "fundament pfosten"],
      ["gartentor-montieren", "Gartentor montieren", "ITEM", "Montage eines Gartentors", "gartentor,tor montieren", "pforte montieren"],
      ["schiebetor-montieren", "Schiebetor montieren", "ITEM", "Montage eines Schiebetors", "schiebetor,tor montieren", "einfahrtstor"],
      ["alten-zaun-demontieren", "Alten Zaun demontieren", "METER", "Demontage eines vorhandenen Zauns", "alten zaun entfernen,zaun demontieren", "zaun abbauen"],
      ["alten-zaun-entsorgen", "Alten Zaun entsorgen", "FIXED", "Entsorgung eines demontierten Zauns", "zaun entsorgen,altmetall entsorgen", "zaun abtransport"],
      ["zaun-reparatur", "Zaun reparieren", "HOUR", "Reparaturarbeiten am Zaun", "zaun reparieren,zaunreparatur", "pfosten reparieren"]
    ]
  },
  {
    name: "Garten / Landschaft",
    slug: "garten-landschaft",
    sortOrder: 40,
    templates: [
      ["rasen-anlegen", "Rasen anlegen", "M2", "Neuanlage von Rasenflächen", "rasen anlegen,rasen neu", "grünfläche anlegen"],
      ["rollrasen-verlegen", "Rollrasen verlegen", "M2", "Verlegung von Rollrasen", "rollrasen,rasen verlegen", "fertigrasen"],
      ["hecke-pflanzen", "Hecke pflanzen", "METER", "Pflanzung einer Hecke", "hecke pflanzen,heckenpflanzung", "grenze bepflanzen"],
      ["hecke-schneiden", "Hecke schneiden", "METER", "Schnitt von Hecken", "hecke schneiden,heckenschnitt", "sträucher schneiden"],
      ["baeume-schneiden", "Bäume schneiden", "HOUR", "Rückschnitt von Bäumen", "bäume schneiden,baumschnitt", "astschnitt"],
      ["baum-faellen", "Baum fällen", "ITEM", "Fällung eines Baumes", "baum fällen,baum entfernen", "baum abtragen"],
      ["wurzel-entfernen", "Wurzel entfernen", "ITEM", "Entfernung einer Baumwurzel", "wurzel entfernen,wurzelstock", "stubben fräsen"],
      ["beet-anlegen", "Beet anlegen", "M2", "Anlage von Beeten", "beet anlegen,gartenbeet", "pflanzbeet"],
      ["unkraut-entfernen", "Unkraut entfernen", "M2", "Entfernung von Unkraut", "unkraut entfernen,beet reinigen", "gartenpflege"],
      ["mulch-aufbringen", "Mulch aufbringen", "M2", "Aufbringen von Mulch", "mulch,holzschnitzel", "rindenmulch"],
      ["pflanzen-setzen", "Pflanzen setzen", "ITEM", "Setzen von Pflanzen oder Sträuchern", "pflanzen setzen,sträucher pflanzen", "bepflanzung"],
      ["gartenabfaelle-entsorgen", "Gartenabfälle entsorgen", "FIXED", "Abtransport und Entsorgung von Gartenabfällen", "gartenabfälle entsorgen,grünschnitt", "garten müll"],
      ["gartenpflege-pauschal", "Gartenpflege pauschal", "FIXED", "Pauschale für Gartenpflege", "gartenpflege,pflege pauschal", "garten service"]
    ]
  },
  {
    name: "Außenanlagen / Pflaster",
    slug: "aussenanlagen-pflaster",
    sortOrder: 50,
    templates: [
      ["pflaster-verlegen", "Pflaster verlegen", "M2", "Verlegung von Pflastersteinen", "pflaster verlegen,pflasterarbeiten", "steine verlegen"],
      ["randsteine-setzen", "Randsteine setzen", "METER", "Setzen von Randsteinen", "randsteine setzen,bordstein", "kantenstein"],
      ["terrasse-bauen", "Terrasse bauen", "M2", "Herstellung einer Terrasse", "terrasse bauen,terrassenbau", "terrassenplatten"],
      ["terrassenplatten-verlegen", "Terrassenplatten verlegen", "M2", "Verlegung von Terrassenplatten", "terrassenplatten verlegen,platten verlegen", "terrasse fliesen außen"],
      ["drainage-verlegen", "Drainage verlegen", "METER", "Verlegung einer Drainage", "drainage verlegen,wasser ableiten", "entwässerung"],
      ["sichtschutz-montieren", "Sichtschutz montieren", "METER", "Montage eines Sichtschutzes", "sichtschutz montieren,sichtschutz", "garten sichtschutz"],
      ["carport-montieren", "Carport montieren", "ITEM", "Montage eines Carports", "carport montieren,carport", "unterstand auto"],
      ["pergola-montieren", "Pergola montieren", "ITEM", "Montage einer Pergola", "pergola montieren,pergola", "garten pergola"],
      ["gartenhaus-montieren", "Gartenhaus montieren", "ITEM", "Montage eines Gartenhauses", "gartenhaus montieren,gartenhaus", "gerätehaus"],
      ["aussenbereich-reinigen", "Außenbereich reinigen", "M2", "Reinigung von Außenflächen", "außenbereich reinigen,hof reinigen", "terrasse reinigen"]
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
      const [slug, title, unit, description, keywordsText, synonymsText] =
        category.templates[i];

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

  await prisma.user.upsert({
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
      country: "Deutschland",
      phone: "+49 30 123456",
      email: demoEmail,
      taxNumber: "12/345/67890",
      vatNumber: "DE123456789",
      bankName: "Musterbank",
      iban: "DE02120300000000202051",
      bic: "BYLADEM1001",
      defaultFooter: "Mit freundlichen Grüßen\nMax Bau GmbH",
      legalText: "Dieses Angebot ist 14 Tage gültig."
    }
  });

  const plans = [
    {
      code: "MONO_MONTH_1",
      name: "1 Benutzer / 1 Monat",
      durationMonths: 1,
      deviceLimit: 1,
      seatLimit: 1,
      allowSameUserMultiDevice: true,
      priceCents: 2900
    },
    {
      code: "MONO_YEAR_1",
      name: "1 Benutzer / 1 Jahr",
      durationMonths: 12,
      deviceLimit: 1,
      seatLimit: 1,
      allowSameUserMultiDevice: true,
      priceCents: 29000
    },
    {
      code: "TEAM_MONTH_3",
      name: "3 Benutzer / 1 Monat",
      durationMonths: 1,
      deviceLimit: 3,
      seatLimit: 3,
      allowSameUserMultiDevice: true,
      priceCents: 5900
    },
    {
      code: "TEAM_YEAR_3",
      name: "3 Benutzer / 1 Jahr",
      durationMonths: 12,
      deviceLimit: 3,
      seatLimit: 3,
      allowSameUserMultiDevice: true,
      priceCents: 59000
    }
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { code: p.code },
      update: p,
      create: p
    });
  }

  const activePlan = await prisma.plan.findUnique({
    where: { code: "TEAM_YEAR_3" }
  });

  if (activePlan) {
    const existing = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        planId: activePlan.id,
        status: "ACTIVE"
      }
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
    "Doppelstabmattenzaun montieren",
    "Holzzaun montieren",
    "Rasen anlegen",
    "Pflaster verlegen",
    "Carport montieren",
    "Pergola montieren",
    "Gartenhaus montieren",
    "Drainage verlegen",
    "Außenbereich reinigen"
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
        "Doppelstabmattenzaun montieren": 9500,
        "Holzzaun montieren": 12000,
        "Rasen anlegen": 1200,
        "Pflaster verlegen": 6500,
        "Carport montieren": 350000,
        "Pergola montieren": 220000,
        "Gartenhaus montieren": 280000,
        "Drainage verlegen": 4500,
        "Außenbereich reinigen": 900
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
  console.log("Open: http://localhost:3000");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });