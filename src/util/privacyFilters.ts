import { i18n } from '~/i18n';
export type PrivacyFilterAction = 'drop' | 'redact';

export interface PrivacyFilterRule {
  enabled: boolean;
  bucket_prefix?: string;
  field: string;
  pattern: string;
  action: PrivacyFilterAction;
  replacement?: string;
}

export interface PrivacyFilterValidationResult {
  rules: PrivacyFilterRule[] | null;
  errors: string[];
}

export const DEFAULT_PRIVACY_FILTERS: PrivacyFilterRule[] = [
  {
    enabled: true,
    bucket_prefix: 'aw-watcher-window',
    field: 'title',
    pattern: '(?i)(private browsing|incognito)',
    action: 'drop',
  },
  {
    enabled: true,
    bucket_prefix: 'aw-watcher-window',
    field: 'title',
    pattern: '(?i).*banking.*',
    action: 'redact',
    replacement: 'REDACTED',
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(
  value: unknown,
  fieldName: string,
  ruleNumber: number,
  errors: string[]
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string') {
    errors.push(
      String(i18n.t('localization.privacy.string', { number: ruleNumber, field: fieldName }))
    );
    return undefined;
  }
  if (value.trim() === '') {
    errors.push(
      String(i18n.t('localization.privacy.empty', { number: ruleNumber, field: fieldName }))
    );
    return undefined;
  }
  return value;
}

export function formatPrivacyFilters(rules: PrivacyFilterRule[]): string {
  return JSON.stringify(rules, null, 2);
}

export function validatePrivacyFiltersInput(input: string): PrivacyFilterValidationResult {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { rules: [], errors: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      rules: null,
      errors: [String(i18n.t('localization.privacy.invalidJson', { error: message }))],
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      rules: null,
      errors: [String(i18n.t('localization.privacy.array'))],
    };
  }

  const errors: string[] = [];
  const rules: PrivacyFilterRule[] = [];

  parsed.forEach((candidate, index) => {
    const ruleNumber = index + 1;
    if (!isRecord(candidate)) {
      errors.push(String(i18n.t('localization.privacy.object', { number: ruleNumber })));
      return;
    }

    const errorCountBefore = errors.length;
    const enabled = candidate.enabled;
    if (typeof enabled !== 'boolean') {
      errors.push(String(i18n.t('localization.privacy.boolean', { number: ruleNumber })));
    }

    const pattern = candidate.pattern;
    if (typeof pattern !== 'string') {
      errors.push(String(i18n.t('localization.privacy.patternString', { number: ruleNumber })));
    } else if (pattern.trim() === '') {
      errors.push(String(i18n.t('localization.privacy.patternEmpty', { number: ruleNumber })));
    }

    const bucketPrefix = optionalString(
      candidate.bucket_prefix,
      'bucket_prefix',
      ruleNumber,
      errors
    );
    let field: string | undefined;
    if (candidate.field === undefined || candidate.field === null) {
      errors.push(String(i18n.t('localization.privacy.fieldRequired', { number: ruleNumber })));
    } else if (typeof candidate.field !== 'string') {
      errors.push(String(i18n.t('localization.privacy.fieldString', { number: ruleNumber })));
    } else if (candidate.field.trim() === '') {
      errors.push(String(i18n.t('localization.privacy.fieldEmpty', { number: ruleNumber })));
    } else {
      field = candidate.field;
    }
    const replacement = optionalString(candidate.replacement, 'replacement', ruleNumber, errors);

    const action = candidate.action;
    if (action !== 'drop' && action !== 'redact') {
      errors.push(String(i18n.t('localization.privacy.action', { number: ruleNumber })));
    }

    if (action === 'redact' && replacement === undefined) {
      errors.push(String(i18n.t('localization.privacy.replacement', { number: ruleNumber })));
    }

    if (
      errors.length > errorCountBefore ||
      typeof enabled !== 'boolean' ||
      typeof pattern !== 'string' ||
      field === undefined ||
      (action !== 'drop' && action !== 'redact')
    ) {
      return;
    }

    rules.push({
      enabled,
      bucket_prefix: bucketPrefix,
      field,
      pattern,
      action,
      replacement,
    });
  });

  return {
    rules: errors.length === 0 ? rules : null,
    errors,
  };
}
