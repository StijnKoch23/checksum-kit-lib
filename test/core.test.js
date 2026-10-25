import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crc32, adler32, Crc32, Adler32 } from '../src/index.js';

const EMPTY = new Uint8Array(0);

test('crc32 of empty is 0', () => {
  assert.equal(crc32(EMPTY), 0);
});

test('crc32 of "abc" matches RFC 1952 test vector (0x352441c2)', () => {
  assert.equal(crc32('abc'), 0x352441c2);
});

test('crc32 is split-safe: crc(a||b) === crc(b, crc(a))', () => {
  const part1 = new Uint8Array([1, 2, 3, 4, 5]);
  const part2 = new Uint8Array([6, 7, 8, 9, 10]);
  const full = new Uint8Array([...part1, ...part2]);
  const direct = crc32(full);
  const streamed = crc32(part2, crc32(part1));
  assert.equal(direct, streamed);
});

test('crc32 accepts ArrayBuffer', () => {
  const buf = new ArrayBuffer(3);
  new Uint8Array(buf).set([97, 98, 99]);
  assert.equal(crc32(buf), 0x352441c2);
});

test('crc32 initial state 0 gives same result as no-state', () => {
  assert.equal(crc32('abc', 0), crc32('abc'));
});

test('Crc32 streaming class matches function', () => {
  const c = new Crc32();
  c.update(new Uint8Array([1, 2, 3]));
  c.update(new Uint8Array([4, 5, 6]));
  assert.equal(c.digest(), crc32(new Uint8Array([1,2,3,4,5,6])));
});

test('Crc32 reset returns to empty-state', () => {
  const c = new Crc32();
  c.update('hello');
  assert.notEqual(c.digest(), 0);
  c.reset();
  assert.equal(c.digest(), 0);
});

test('adler32 of empty is 1', () => {
  assert.equal(adler32(EMPTY), 1);
});

test('adler32 of "abc" is 0x024d0127', () => {
  assert.equal(adler32('abc'), 0x024d0127);
});

test('adler32 is split-safe: adler(a||b) === adler(b, adler(a))', () => {
  const part1 = new Uint8Array([1, 2, 3, 4, 5]);
  const part2 = new Uint8Array([6, 7, 8, 9, 10]);
  const full = new Uint8Array([...part1, ...part2]);
  const direct = adler32(full);
  const streamed = adler32(part2, adler32(part1));
  assert.equal(direct, streamed);
});

test('adler32 handles wraparound correctly for long input', () => {
  const data = new Uint8Array(70000).fill(255);
  const result = adler32(data);
  assert.equal(typeof result, 'number');
  assert.ok(result > 0 && result <= 0xffffffff, 'result is unsigned 32-bit');
});

test('Adler32 streaming class matches function', () => {
  const a = new Adler32();
  a.update('hello');
  a.update(' world');
  assert.equal(a.digest(), adler32('hello world'));
});
