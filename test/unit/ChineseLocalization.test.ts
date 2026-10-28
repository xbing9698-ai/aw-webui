/**
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import { createPinia, setActivePinia, PiniaVuePlugin } from 'pinia';
import { DateTime } from 'luxon';
import { Datetime } from 'vue-datetime';
import { i18n, setAppLocale } from '~/i18n';
import en from '~/i18n/locales/en';
import '~/util/filters';
import zh from '~/i18n/locales/zh-CN';
import InputTimeInterval from '~/components/InputTimeInterval.vue';
import LocalizedDatetime from '~/components/LocalizedDatetime.vue';
import CategoryEditModal from '~/components/CategoryEditModal.vue';
import Summary from '~/visualizations/Summary.vue';
import Calendar from '~/visualizations/Calendar.vue';
import { buildTooltip } from '~/util/tooltip';
import { buildBarchartDataset } from '~/util/datasets';
import { validatePrivacyFiltersInput } from '~/util/privacyFilters';
import { reportEventsCsv } from '~/util/export';
import { categoryDisplayName } from '~/util/displayNames';

const localVue = createLocalVue();
localVue.use(VueI18n);
localVue.use(BootstrapVue);
localVue.use(PiniaVuePlugin);
localVue.component('icon', { render: h => h('span') });
const translate = (key: string) => String(i18n.t(key));

function flatten(object, prefix = '', result = {}) {
  for (const [key, value] of Object.entries(object)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') result[path] = value;
    else flatten(value, path, result);
  }
  return result;
}

beforeEach(() => {
  setActivePinia(createPinia());
  setAppLocale('zh-CN');
});
afterEach(() => setAppLocale('en'));

test('every English key has a non-empty Chinese value and matching named parameters', () => {
  const english = flatten(en);
  const chinese = flatten(zh);
  expect(Object.keys(chinese).sort()).toEqual(Object.keys(english).sort());
  const parameters = value => [...new Set(String(value).match(/\{\w+\}/g) || [])].sort();
  for (const key of Object.keys(english)) {
    expect(String(chinese[key]).trim()).not.toBe('');
    expect([key, parameters(chinese[key])]).toEqual([key, parameters(english[key])]);
  }
});

test('date navigation and accessible labels switch live without changing the interval', async () => {
  const wrapper = mount(InputTimeInterval, { localVue, i18n, stubs: { icon: true } });
  try {
    await wrapper.setData({ mode: 'range', start: '2026-10-01', end: '2026-10-03' });
    expect(wrapper.text()).toContain('移动日期');
    expect(wrapper.find('input[type="button"][value="今天"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="向前移动一周"]').exists()).toBe(true);
    const before = (wrapper.vm as any).value.map(value => value.valueOf());
    setAppLocale('en');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('input[type="button"][value="Today"]').exists()).toBe(true);
    expect((wrapper.vm as any).value.map(value => value.valueOf())).toEqual(before);
  } finally {
    wrapper.destroy();
  }
});

test('third-party modal and datetime buttons receive reactive translations', async () => {
  const modal = shallowMount(CategoryEditModal, {
    localVue,
    i18n,
    propsData: { categoryId: 0 },
    methods: { showModal: jest.fn() },
  });
  const datetime = mount(LocalizedDatetime, {
    localVue,
    i18n,
    attrs: { value: '2026-10-19T12:00:00Z', type: 'datetime' },
  });
  try {
    expect(modal.findComponent({ name: 'BModal' }).props('cancelTitle')).toBe('取消');
    expect(modal.findComponent({ name: 'BModal' }).props('okTitle')).toBe('确认');
    expect(datetime.findComponent(Datetime).props('phrases')).toEqual({
      cancel: '取消',
      ok: '确认',
    });
    expect(DateTime.local(2026, 10, 19).toLocaleString(DateTime.DATE_FULL)).toContain('10月');
    expect(
      (Calendar as any).computed.calendarOptions.call({
        events: [],
        fitToActive: false,
        view: 'timeGridDay',
      }).locale
    ).toBe('zh-cn');
    setAppLocale('en');
    await modal.vm.$nextTick();
    expect(modal.findComponent({ name: 'BModal' }).props('cancelTitle')).toBe('Cancel');
    expect(datetime.findComponent(Datetime).props('phrases')).toEqual({
      cancel: 'Cancel',
      ok: 'Confirm',
    });
    expect(datetime.findComponent(Datetime).props('value')).toBe('2026-10-19T12:00:00Z');
  } finally {
    modal.destroy();
    datetime.destroy();
  }
});

test('chart empty state refreshes when switching languages', async () => {
  const wrapper = mount(Summary, {
    localVue,
    i18n,
    propsData: {
      fields: [{ duration: 0, data: { app: 'User App' } }],
      namefunc: e => e.data.app,
      colorfunc: () => 'User App',
    },
    stubs: { icon: true },
  });
  try {
    expect(wrapper.text()).toContain('无数据');
    setAppLocale('en');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('no data');
  } finally {
    wrapper.destroy();
  }
});

test('tooltip labels translate while untrusted event text stays escaped and unchanged', () => {
  const event = {
    timestamp: '2026-10-19T12:00:00Z',
    duration: 60,
    data: { app: 'Firefox', title: '<img src=x onerror=alert(1)>' },
  };
  const before = JSON.stringify(event);
  const tooltip = buildTooltip({ type: 'currentwindow' }, event);
  expect(tooltip).toContain('应用');
  expect(tooltip).toContain('开始');
  expect(tooltip).toContain('Firefox');
  expect(tooltip).toContain('&lt;img');
  expect(tooltip).not.toContain('<img');
  expect(JSON.stringify(event)).toBe(before);
});

test('synthetic search display is opt-in and does not translate user categories', () => {
  const event = category => ({
    timestamp: '2026-10-19T12:00:00Z',
    duration: 60,
    data: { $category: [category] },
  });
  const data = [{ cat_events: [event('Uncategorized'), event('searched')] }];
  const before = JSON.stringify(data);
  expect(buildBarchartDataset(data, []).map(dataset => dataset.label)).toEqual([
    '未分类',
    'searched',
  ]);
  expect(buildBarchartDataset(data, [], true).map(dataset => dataset.label)).toEqual([
    '未分类',
    '匹配结果',
  ]);
  expect(categoryDisplayName(['searched'], translate)).toBe('searched');
  expect(JSON.stringify(data)).toBe(before);
});

test('validation results and machine CSV fields do not depend on the UI language', () => {
  const input = '[{"enabled":true,"field":"title","pattern":"private","action":"drop"}]';
  const event = {
    timestamp: '2026-10-19T12:00:00Z',
    duration: 60,
    data: { app: 'User App', title: 'User Title', $category: ['Work'] },
  };
  const chineseRules = validatePrivacyFiltersInput(input).rules;
  const chineseCsv = reportEventsCsv([event]);
  expect(validatePrivacyFiltersInput('{}').errors[0]).toContain('顶层值');
  setAppLocale('en');
  expect(validatePrivacyFiltersInput(input).rules).toEqual(chineseRules);
  expect(reportEventsCsv([event])).toBe(chineseCsv);
  expect(chineseCsv.split('\n')[0].trim()).toBe('timestamp,duration,category,app,title');
});
