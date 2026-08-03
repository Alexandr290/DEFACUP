"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GitBranch, Layers, Share2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";

export default function HomePage() {
  const { t } = useI18n();

  const steps = [
    { n: "01", title: t("home.step1Title"), body: t("home.step1Body") },
    { n: "02", title: t("home.step2Title"), body: t("home.step2Body") },
    { n: "03", title: t("home.step3Title"), body: t("home.step3Body") },
  ];

  const features = [
    { icon: Layers, title: t("home.feat1Title"), body: t("home.feat1Body") },
    { icon: Wand2, title: t("home.feat2Title"), body: t("home.feat2Body") },
    { icon: GitBranch, title: t("home.feat3Title"), body: t("home.feat3Body") },
    { icon: Share2, title: t("home.feat4Title"), body: t("home.feat4Body") },
  ];

  return (
    <div>
      <section className="relative min-h-[100dvh] overflow-hidden pitch-bg">
        <div className="pointer-events-none absolute inset-0 pitch-lines opacity-40" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 70% 60%, rgba(212,160,23,0.12), transparent 40%), linear-gradient(to top, rgba(11,18,16,0.95) 0%, transparent 45%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] opacity-30">
          <svg
            viewBox="0 0 800 400"
            className="h-full w-full"
            preserveAspectRatio="xMidYMax slice"
          >
            <rect
              x="40"
              y="40"
              width="720"
              height="320"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.5"
            />
            <line
              x1="400"
              y1="40"
              x2="400"
              y2="360"
              stroke="white"
              strokeWidth="2"
              opacity="0.4"
            />
            <circle
              cx="400"
              cy="200"
              r="60"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.4"
            />
            <rect
              x="40"
              y="120"
              width="80"
              height="160"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.35"
            />
            <rect
              x="680"
              y="120"
              width="80"
              height="160"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.35"
            />
            <rect
              x="40"
              y="160"
              width="30"
              height="80"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.3"
            />
            <rect
              x="730"
              y="160"
              width="30"
              height="80"
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.3"
            />
          </svg>
        </div>

        <div className="relative mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-center px-4 pb-24 pt-20 sm:px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-brand text-[clamp(4.5rem,18vw,11rem)] leading-[0.85] tracking-wide text-chalk"
          >
            DEFACUP
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-4 max-w-xl text-2xl font-semibold text-chalk sm:text-3xl"
          >
            {t("home.headline")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-3 max-w-lg text-lg text-mist"
          >
            {t("home.sub")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/dashboard">
              <Button size="lg">
                {t("home.ctaStart")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="secondary">
                {t("home.ctaTemplates")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-4xl tracking-wide sm:text-5xl">
            {t("home.howTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-mist">{t("home.howSub")}</p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="font-display text-5xl text-accent/40">{step.n}</p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-mist">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24 pitch-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-4xl tracking-wide sm:text-5xl">
            {t("home.featuresTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-mist">{t("home.featuresSub")}</p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border-t border-accent/30 pt-4"
              >
                <f.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-mist">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
