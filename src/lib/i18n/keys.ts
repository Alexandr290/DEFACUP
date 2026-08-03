import type { TranslationKey } from "@/lib/i18n/context";

const TEMPLATE_NAME: Record<string, TranslationKey> = {
  wc32: "template.wc32",
  wc48: "template.wc48",
  euro24: "template.euro24",
  afcon24: "template.afcon24",
  copa16: "template.copa16",
  custom: "template.custom",
};

const TEMPLATE_DESC: Record<string, TranslationKey> = {
  wc32: "template.wc32Desc",
  wc48: "template.wc48Desc",
  euro24: "template.euro24Desc",
  afcon24: "template.afcon24Desc",
  copa16: "template.copa16Desc",
  custom: "template.customDesc",
};

export function templateNameKey(id: string): TranslationKey {
  return TEMPLATE_NAME[id] ?? "template.custom";
}

export function templateDescKey(id: string): TranslationKey {
  return TEMPLATE_DESC[id] ?? "template.customDesc";
}

export function stageKey(
  stage: string
): TranslationKey {
  const map: Record<string, TranslationKey> = {
    group: "stages.group",
    r16: "stages.r16",
    qf: "stages.qf",
    sf: "stages.sf",
    third: "stages.third",
    final: "stages.final",
  };
  return map[stage] ?? "stages.group";
}
