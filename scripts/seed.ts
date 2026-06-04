import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed admin users
  const adminHash = await bcrypt.hash("XMusicAdmin2026!", 10);
  const testHash = await bcrypt.hash("johndoe123", 10);

  await prisma.user.upsert({
    where: { email: "admin@xmusic.com" },
    update: { passwordHash: adminHash },
    create: { email: "admin@xmusic.com", passwordHash: adminHash, name: "X Music Admin", role: "admin" },
  });

  await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: { passwordHash: testHash },
    create: { email: "john@doe.com", passwordHash: testHash, name: "Admin", role: "admin" },
  });

  // Seed default settings
  const defaultSettings: Record<string, any> = {
    license_price: 20,
    license_currency: "USD",
    license_terms: "You are granted a non-exclusive license to use this track in your creative projects (videos, podcasts, streams, etc.). Credit to X Music is required. Redistribution or resale of the original track is not permitted.",
    donation_default_amount: 5,
    donation_currency: "EUR",
    donation_amounts: "3,5,10,20",
    top_donators_manual: false,
    top_donators: [],
    social_youtube: "",
    social_instagram: "",
    social_facebook: "",
    social_twitter: "",
    social_soundcloud: "",
    social_spotify: "",
    youtube_embed_url: "",
    youtube_embed_show: false,
    radio_embed_code: "",
    radio_sticky: false,
    seo_title: "X Music - Electronic Music Producer & DJ",
    seo_description: "Explore the world of electronic music by X. Tracks, albums, DJ mixes, live sets, and more.",
    seo_keywords: "electronic music, DJ, producer, tracks, albums, X Music",
    seo_og_image: "",
    email_alerts_enabled: true,
    analytics_ga_id: "",
    popular_sort: "playCount",
    home_hero_heading: "Welcome to X Music",
    home_hero_subheading: "Electronic music crafted with passion. Explore tracks, albums, and live sets.",
    home_about_heading: "The Artist",
    home_about_text: "X is an electronic music producer and DJ, creating immersive soundscapes that blend genres and push boundaries. From deep techno to euphoric trance, every track is a journey.",
    store_heading: "Music Store",
    store_subheading: "Browse and purchase tracks, albums, DJ mixes, and live sets.",
    community_heading: "Guestbook",
    community_subheading: "Leave a message, share your thoughts, connect with the community.",
    events_heading: "Events & Releases",
    events_subheading: "Upcoming releases, premieres, and live events.",
    support_heading: "Support X Music",
    support_subheading: "Your support helps create more music. Every contribution matters.",
    license_heading: "License My Music",
    license_subheading: "Use my tracks in your videos, podcasts, or creative projects.",
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    const strValue = typeof value === "string" ? value : JSON.stringify(value);
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: strValue },
    });
  }

  // Seed sample products
  const products = [
    {
      type: "track",
      title: "Midnight Signal",
      slug: "midnight-signal",
      description: "A deep, atmospheric journey through pulsating synths and hypnotic rhythms. Midnight Signal captures the essence of late-night electronic music.",
      genre: "Techno",
      style: "Deep Techno",
      price: 4.99,
      currency: "USD",
      artworkUrl: "https://cdn.abacus.ai/images/90d1c9df-5080-40b2-bc63-ee33ad4864b0.png",
      audioPreviewUrl: "",
      downloadUrl: "",
      lyrics: "",
      story: "Midnight Signal was born during a late studio session, inspired by the quiet hum of the city at 3 AM. The track evolved from a simple bassline into a full journey, layering textures and rhythms that mirror the pulse of the night.",
      releaseDate: new Date("2026-01-15"),
      playCount: 342,
      purchaseCount: 28,
      featured: true,
      published: true,
    },
    {
      type: "album",
      title: "Digital Dreams",
      slug: "digital-dreams",
      description: "A full-length album exploring the intersection of organic and digital sound design. Eight tracks that take you on a sonic journey through cyberpunk landscapes.",
      genre: "Progressive",
      style: "Progressive House",
      price: 14.99,
      currency: "USD",
      artworkUrl: "https://cdn.abacus.ai/images/22188089-9162-4e9f-b997-47f142d0e209.png",
      audioPreviewUrl: "",
      downloadUrl: "",
      lyrics: "",
      story: "Digital Dreams is a concept album about the blurred line between reality and virtual worlds. Each track represents a different layer of consciousness, from waking moments to deep digital immersion.",
      releaseDate: new Date("2026-03-20"),
      playCount: 856,
      purchaseCount: 67,
      featured: true,
      published: true,
    },
    {
      type: "dj-mix",
      title: "Underground Sessions Vol.1",
      slug: "underground-sessions-vol-1",
      description: "A carefully curated DJ mix featuring the finest underground techno and house tracks. Two hours of uninterrupted groove.",
      genre: "Techno",
      style: "Underground",
      price: 7.99,
      currency: "USD",
      artworkUrl: "https://cdn.abacus.ai/images/9af60d84-7cb6-455c-a91e-256b86933b7a.png",
      audioPreviewUrl: "",
      downloadUrl: "",
      lyrics: "",
      story: "Recorded live at an underground venue in Berlin, this mix captures the raw energy and intimate atmosphere of a true techno night.",
      releaseDate: new Date("2025-11-10"),
      playCount: 1205,
      purchaseCount: 45,
      featured: false,
      published: true,
    },
    {
      type: "live-set",
      title: "Golden Hour Live",
      slug: "golden-hour-live",
      description: "A live performance captured during the golden hour at an outdoor festival. Melodic techno and progressive sounds under the setting sun.",
      genre: "Melodic Techno",
      style: "Live Performance",
      price: 9.99,
      currency: "USD",
      artworkUrl: "https://cdn.abacus.ai/images/7c56d9d6-922b-4d99-82fc-d6395609ef66.png",
      audioPreviewUrl: "",
      downloadUrl: "",
      lyrics: "",
      story: "This live set was performed at an outdoor festival as the sun was setting. The music flowed naturally, responding to the energy of the crowd and the shifting light.",
      releaseDate: new Date("2026-05-01"),
      playCount: 578,
      purchaseCount: 33,
      featured: true,
      published: true,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // Seed album tracks for Digital Dreams
  const digitalDreams = await prisma.product.findUnique({ where: { slug: "digital-dreams" } });
  if (digitalDreams) {
    const albumTracks = [
      { trackNumber: 1, title: "Neon Awakening", duration: "6:32" },
      { trackNumber: 2, title: "Data Streams", duration: "7:15" },
      { trackNumber: 3, title: "Virtual Gardens", duration: "5:48" },
      { trackNumber: 4, title: "Binary Sunset", duration: "8:03" },
      { trackNumber: 5, title: "Hologram Dance", duration: "6:55" },
      { trackNumber: 6, title: "Memory Banks", duration: "7:40" },
      { trackNumber: 7, title: "Electric Horizons", duration: "9:12" },
      { trackNumber: 8, title: "Dream Protocol", duration: "10:25" },
    ];
    for (const t of albumTracks) {
      const existing = await prisma.productTrack.findFirst({
        where: { productId: digitalDreams.id, trackNumber: t.trackNumber },
      });
      if (!existing) {
        await prisma.productTrack.create({ data: { ...t, productId: digitalDreams.id } });
      }
    }
  }

  // Seed sample events
  const events = [
    { title: "New Single Release: Midnight Signal", description: "Premiere of the new single across all platforms.", date: new Date("2026-01-15"), published: true },
    { title: "Digital Dreams Album Launch", description: "Full album release with exclusive listening party.", date: new Date("2026-03-20"), published: true },
    { title: "Summer Festival Live Set", description: "Catch X Music performing live at the Summer Electronic Festival.", date: new Date("2026-07-15"), externalLink: "", published: true },
    { title: "Studio Sessions Livestream", description: "Watch the creative process live. Behind-the-scenes music production.", date: new Date("2026-08-01"), published: true },
  ];
  for (const e of events) {
    const existing = await prisma.event.findFirst({ where: { title: e.title } });
    if (!existing) {
      await prisma.event.create({ data: e });
    }
  }

  // Seed sample comments
  const comments = [
    { name: "Maria", message: "Amazing music! Midnight Signal is on repeat. Can't wait for more!", approved: true },
    { name: "DJ Pulse", message: "The Digital Dreams album is a masterpiece. Every track flows perfectly.", approved: true },
    { name: "Alex", message: "Caught the live set at the festival — incredible energy!", email: "alex@example.com", approved: true },
  ];
  for (const c of comments) {
    const existing = await prisma.comment.findFirst({ where: { name: c.name, message: c.message } });
    if (!existing) {
      await prisma.comment.create({ data: c });
    }
  }

  // Seed sample donations
  const donations = [
    { donorNickname: "MusicLover42", amount: 25, currency: "EUR", type: "one-time", status: "completed" },
    { donorNickname: "TechnoFan", amount: 10, currency: "EUR", type: "monthly", status: "completed" },
    { donorNickname: "BeatDropper", amount: 15, currency: "EUR", type: "one-time", status: "completed" },
  ];
  for (const d of donations) {
    const existing = await prisma.donation.findFirst({ where: { donorNickname: d.donorNickname } });
    if (!existing) {
      await prisma.donation.create({ data: d });
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
