import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { EASE } from "../glass";
import { eyebrow, reveal } from "./motion";

// Answers describe what the platform actually does today — no claims about features it does not have.
const FAQ: [string, string][] = [
  ["What does BEDRO automate, and what stays with my team?",
    "BEDRO automates the work between a requirement file and a sourcing decision: validating every line item, pooling genuinely compatible demand, qualifying and shortlisting suppliers, and negotiating with the selected supplier by email. Your team keeps the decisions that carry commercial commitment — choosing to proceed with an agreed offer, and anything the agent flags for review."],
  ["How are suppliers sourced and qualified?",
    "Each validated requirement is checked against your supplier catalogue on hard criteria — specification and grade, minimum order quantity, available stock, lead time against your deadline, quality rating, certifications and compliance status. Only offerings that pass every check are ranked, and at most three companies are shortlisted. Possible substitutes are shown separately and always marked as needing engineering qualification."],
  ["How does the negotiation agent decide what to offer?",
    "It works from a policy you configure: a target derived from the list price and your budget, and a ceiling it can never exceed. Concessions shrink round by round, the agent holds its position when a supplier does not move, and every negotiation has a round limit. When agreement is not realistic, it stops and recommends the other eligible suppliers instead of conceding further."],
  ["What happens when a supplier reply is unclear or conditional?",
    "Replies are read without a fixed template — unit price, quantity, totals, shipping, payment terms, warranty and conditions are extracted and the arithmetic is checked. If essential details are missing or contradictory, the agent asks one concise clarification question. Conditional offers, changed terms, advance-payment requests or low-confidence readings go to your review; they are never accepted automatically."],
  ["Can BEDRO commit us to a purchase?",
    "No. An agreed offer is verified independently and then waits for your explicit approval. Only after you approve does the supplier receive an acceptance confirmation, which states that a formal purchase order follows separately. BEDRO does not create purchase orders."],
  ["How is our commercial information protected?",
    "Budgets, price ceilings and negotiation strategy are never included in supplier emails, and one supplier never learns another supplier's identity or price. Requests and negotiations are scoped to your workspace, supplier emails are treated as untrusted data, and a test mode restricts sending to approved addresses until you enable live supplier communication."],
  ["Which risks does BEDRO surface before a decision?",
    "Concrete gaps rather than opaque scores: MOQ above your quantity, insufficient stock, lead times that miss your deadline, missing certifications or compliance issues, unpriced shipping that leaves the landed cost incomplete, and payment terms that need approval. Each one is shown next to the offer it affects."],
  ["How does BEDRO fit into our existing systems?",
    "Requirements arrive as CSV or XLSX files, so no system change is needed to start. Supplier conversations run through your connected mailbox and stay in their original email threads. Every decision, offer and message is recorded with its history, so your team can raise the purchase order in your existing procurement system."],
];

/** Buyer FAQ — accessible accordion (button + region, one panel open at a time). */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" aria-labelledby="faq-title" className="px-5 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div {...reveal}>
          <p className={eyebrow}>FAQ</p>
          <h2 id="faq-title" className="mt-3 text-4xl font-bold md:text-5xl">Questions procurement teams ask.</h2>
          <p className="mt-4 text-lg text-muted-foreground">How BEDRO sources, negotiates and protects your commercial position — and where you stay in control.</p>
        </motion.div>
        <motion.div {...reveal} className="glass-capsule divide-y divide-border/60 rounded-3xl px-2">
          {FAQ.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q}>
                <h3>
                  <button type="button" id={`${base}-q${i}`} aria-expanded={isOpen} aria-controls={`${base}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-5 text-left font-semibold outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
                    {q}
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full border transition-[transform,background-color] duration-300 ${isOpen ? "rotate-45 border-primary/30 bg-accent text-primary" : "bg-card"}`}>
                      <Plus className="size-3.5" aria-hidden />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`${base}-a${i}`} role="region" aria-labelledby={`${base}-q${i}`}
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                      <p className="px-4 pb-6 text-muted-foreground">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
