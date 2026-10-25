const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c;
  }
  return table;
})();

const CRC32_POLY = 0xedb88320;
const MOD_ADLER = 65521;

export function crc32(data, state = 0) {
  let crc = (state ^ 0xffffffff) >>> 0;
  const bytes = typeof data === 'string'
    ? Buffer.from(data, 'utf8')
    : data instanceof Uint8Array
      ? data
      : new Uint8Array(data);
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function adler32(data, state = 1) {
  let a = state & 0xffff;
  let b = (state >>> 16) & 0xffff;
  const bytes = typeof data === 'string'
    ? Buffer.from(data, 'utf8')
    : data instanceof Uint8Array
      ? data
      : new Uint8Array(data);
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  return ((b << 16) | a) >>> 0;
}

export class Crc32 {
  constructor(seed = 0) {
    this.crc = seed;
  }
  update(data) {
    this.crc = crc32(data, this.crc);
    return this;
  }
  digest() {
    return this.crc;
  }
  reset() {
    this.crc = 0;
    return this;
  }
}

export class Adler32 {
  constructor(seed = 1) {
    this.state = seed >>> 0;
  }
  update(data) {
    this.state = adler32(data, this.state);
    return this;
  }
  digest() {
    return this.state >>> 0;
  }
  reset() {
    this.state = 1;
    return this;
  }
}
