# checksum-kit-lib

A streaming checksum library for crc32 and adler-32 that processes data in chunks without holding an entire file in memory.

## Usage

```js
import { crc32, adler32, Crc32, Adler32 } from 'checksum-kit-lib';

// One-shot over a buffer
const sum = crc32(Buffer.from('hello'));

// Streaming: feed chunks from any source
const hasher = new Crc32();
for (const chunk of [[1, 2, 3], [4, 5, 6]]) {
  hasher.update(Uint8Array.from(chunk));
}
const final = hasher.digest();
```

The one-shot functions accept `string`, `Uint8Array`, or `ArrayBuffer`. Streaming instances expose `update(data)` (chainable) and `digest()`. `crc32` takes an optional initial state so a stream can be resumed from a known intermediate value: `crc32(chunkB, crc32(chunkA))` equals `crc32(concat(chunkA, chunkB))`.

## Why

Computing a checksum over a file that may be larger than memory means you cannot call `fs.readFileSync` and hash the result. You need an object you can feed chunk-by-chunk. Node has `zlib.crc32` but it does not give you a resumable handle, and it returns a `Buffer` rather than a number. This library provides small, allocation-light classes that return unsigned 32-bit integers and that expose their internal state so a caller can persist and resume a checksum across process boundaries.

## Edge case

`crc32(data, 0)` is **not** the same as starting fresh on an empty prefix. The implementation XORs the seed with `0xffffffff` internally (per the CRC-32 spec), so `0` is the correct "fresh" value to pass and gives the standard empty-file result of `0`. If you load a persisted intermediate digest back from disk, pass it as the second argument directly, do not pre-XOR it.
