import { fmtK } from '../format';

describe('fmtK', () => {
  it('never shows decimals below 1000', () => {
    expect(fmtK(0, 'en-US')).toBe('0');
    expect(fmtK(999, 'en-US')).toBe('999');
    expect(fmtK(999.4, 'en-US')).toBe('999'); // rounds down, stays under the k threshold
    expect(fmtK(999.6, 'en-US')).toBe('1.0k'); // rounds up across the threshold before formatting
  });

  it('formats thousands with one decimal and a k suffix', () => {
    expect(fmtK(1000, 'en-US')).toBe('1.0k');
    expect(fmtK(9321.13, 'en-US')).toBe('9.3k');
    expect(fmtK(999999, 'en-US')).toBe('1000.0k');
  });

  it('formats millions with one decimal and an M suffix', () => {
    expect(fmtK(1_000_000, 'en-US')).toBe('1.0M');
    expect(fmtK(3_100_000, 'en-US')).toBe('3.1M');
  });

  it('localizes the sub-1000 integer form', () => {
    expect(fmtK(500, 'fr-FR')).toBe('500');
  });
});
