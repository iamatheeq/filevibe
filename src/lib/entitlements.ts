/**
 * Centralized feature entitlements — ready for future Free/Pro plans.
 * Currently all core local features are available (free).
 * Do NOT scatter plan checks across UI components.
 */

export type PlanId = "free" | "pro" | "business" | "enterprise";
export type FeatureId =
  | "file.reader"
  | "file.converter"
  | "image.compressor"
  | "image.resizer"
  | "image.converter"
  | "pdf.viewer"
  | "markdown.editor"
  | "markdown.generator"
  | "github.readme"
  | "color.studio"
  | "batch.processing"
  | "large.file.processing";

type EntitlementState = {
  plan: PlanId;
  features: Record<FeatureId, boolean>;
  limits: {
    maxFileBytes: number;
    maxImagePixels: number;
  };
};

const DEFAULT: EntitlementState = {
  plan: "free",
  features: {
    "file.reader": true,
    "file.converter": true,
    "image.compressor": true,
    "image.resizer": true,
    "image.converter": true,
    "pdf.viewer": true,
    "markdown.editor": true,
    "markdown.generator": true,
    "github.readme": true,
    "color.studio": true,
    "batch.processing": false,
    "large.file.processing": true,
  },
  limits: {
    maxFileBytes: 50 * 1024 * 1024,
    maxImagePixels: 40_000_000,
  },
};

let state: EntitlementState = { ...DEFAULT, features: { ...DEFAULT.features }, limits: { ...DEFAULT.limits } };

export function getPlan(): PlanId {
  return state.plan;
}

export function canUseFeature(id: FeatureId): boolean {
  return Boolean(state.features[id]);
}

export function getLimits() {
  return state.limits;
}

/** Reserved for future billing integration — do not call payment APIs from UI. */
export function __setEntitlementsForTesting(partial: Partial<EntitlementState>) {
  state = {
    ...state,
    ...partial,
    features: { ...state.features, ...(partial.features || {}) },
    limits: { ...state.limits, ...(partial.limits || {}) },
  };
}
