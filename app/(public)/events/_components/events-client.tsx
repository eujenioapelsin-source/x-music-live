"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, Clock, Archive } from "lucide-react";

export function EventsClient() {
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/events").then((r: any) => r?.json?.()).then((d: any) => { setUpcoming(d?.upcoming ?? []); setPast(d?.past ?? []); }).catch(() => {});
  }, []);

  const EventCard = ({ event, i }: { event: any; i: number }) => (
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4 bg-card rounded-lg p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center"><span className="text-xs text-primary font-medium">{event?.date ? new Date(event.date).toLocaleDateString("en-US", { month: "short" }) : ""}</span><span className="text-lg font-bold text-primary leading-none">{event?.date ? new Date(event.date).getDate() : ""}</span></div>
      <div className="flex-1 min-w-0"><h3 className="font-medium text-sm mb-1">{event?.title ?? ""}</h3>{event?.description && <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>}{event?.externalLink && <a href={event.externalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"><ExternalLink className="h-3 w-3" /> Learn more</a>}</div>
    </motion.div>
  );

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 text-center"><Calendar className="h-8 w-8 text-primary mx-auto mb-3" /><h1 className="font-display text-3xl font-bold tracking-tight">Events & Releases</h1><p className="text-muted-foreground mt-1">Upcoming releases, premieres, and events.</p></div>
      {(upcoming?.length ?? 0) > 0 && (<div className="mb-10"><h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Upcoming</h2><div className="space-y-3">{(upcoming ?? []).map((e: any, i: number) => <EventCard key={e?.id ?? i} event={e} i={i} />)}</div></div>)}
      {(past?.length ?? 0) > 0 && (<div><h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Archive className="h-4 w-4 text-muted-foreground" /> Past Events</h2><div className="space-y-3">{(past ?? []).map((e: any, i: number) => <EventCard key={e?.id ?? i} event={e} i={i} />)}</div></div>)}
      {(upcoming?.length ?? 0) === 0 && (past?.length ?? 0) === 0 && <div className="text-center py-20"><Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No events scheduled yet.</p></div>}
    </div>
  );
}
