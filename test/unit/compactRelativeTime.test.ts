import { compact_relative_time } from '~/util/time';

const now = new Date('2026-10-10T12:00:00Z');

describe('compact relative timestamps', () => {
  test.each([
    [0, '0s', '0s ago'],
    [1, '1s', '1s ago'],
    [60, '1min', '1min ago'],
    [3600, '1h', '1h ago'],
    [864000, '10d', '10d ago'],
    [2592000, '1mo', '1mo ago'],
    [31536000, '1y', '1y ago'],
  ])('formats %s seconds without verbose units', (seconds, short, full) => {
    const timestamp = new Date(now.getTime() - seconds * 1000).toISOString();
    expect(compact_relative_time(timestamp, 'en', true, now)).toBe(short);
    expect(compact_relative_time(timestamp, 'en', false, now)).toBe(full);
  });

  test('preserves future direction instead of displaying a negative age', () => {
    expect(compact_relative_time('2026-10-10T12:01:00Z', 'en', true, now)).toBe('+1min');
    expect(compact_relative_time('2026-10-10T12:01:00Z', 'en', false, now)).toBe('in 1min');
  });

  test('localizes the desktop label', () => {
    expect(compact_relative_time('2026-10-10T11:59:00Z', 'sv', false, now)).toBe(
      new Intl.RelativeTimeFormat('sv', { numeric: 'always', style: 'narrow' }).format(-1, 'minute')
    );
  });

  test.each([
    [0, '0秒', '0秒前'],
    [59, '59秒', '59秒前'],
    [60, '1分钟', '1分钟前'],
    [3599, '59分钟', '59分钟前'],
    [3600, '1小时', '1小时前'],
    [86399, '23小时', '23小时前'],
    [86400, '1天', '1天前'],
    [2591999, '29天', '29天前'],
    [2592000, '1个月', '1个月前'],
    [31535999, '12个月', '12个月前'],
    [31536000, '1年', '1年前'],
    [-60, '+1分钟', '1分钟后'],
  ])(
    'keeps Chinese units compact at %s seconds without changing time selection',
    (seconds, short, full) => {
      const timestamp = new Date(now.getTime() - seconds * 1000).toISOString();
      expect(compact_relative_time(timestamp, 'zh-CN', true, now)).toBe(short);
      expect(compact_relative_time(timestamp, 'zh-CN', false, now)).toBe(full);
    }
  );
});
