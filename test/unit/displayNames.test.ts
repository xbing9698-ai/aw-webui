import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en from '~/i18n/locales/en';
import zh from '~/i18n/locales/zh-CN';
import { categoryDisplayName, viewDisplayName } from '~/util/displayNames';
import { androidViews, defaultViews } from '~/stores/views';

Vue.use(VueI18n);

describe('localized display names preserve stored identities', () => {
  const i18n = new VueI18n({
    locale: 'zh-CN',
    fallbackLocale: 'en',
    messages: { en, 'zh-CN': zh },
  });
  const translate = (key: string) => String(i18n.t(key));

  test('desktop and Android defaults are translated without mutation', () => {
    const before = JSON.stringify([defaultViews, androidViews]);
    expect(defaultViews.map(view => viewDisplayName(view, translate))).toEqual([
      '总览',
      '窗口',
      '浏览器',
      '编辑器',
    ]);
    expect(viewDisplayName(androidViews[0], translate)).toBe('总览');
    expect(JSON.stringify([defaultViews, androidViews])).toBe(before);
  });

  test('custom IDs, renamed defaults and user category paths remain verbatim', () => {
    expect(viewDisplayName({ id: 'custom', name: 'Summary' }, translate)).toBe('Summary');
    expect(viewDisplayName({ id: 'summary', name: 'My work' }, translate)).toBe('My work');
    expect(categoryDisplayName(['Work', 'Programming'], translate)).toBe('Work > Programming');
    expect(categoryDisplayName(['Work', 'Uncategorized'], translate)).toBe('Work > Uncategorized');
    expect(categoryDisplayName(['Uncategorized'], translate)).toBe('未分类');
  });

  test('language switching changes display only', () => {
    i18n.locale = 'en';
    expect(viewDisplayName(defaultViews[0], translate)).toBe('Summary');
    expect(categoryDisplayName(['Uncategorized'], translate)).toBe('Uncategorized');
    i18n.locale = 'zh-CN';
    expect(viewDisplayName(defaultViews[0], translate)).toBe('总览');
  });
});
