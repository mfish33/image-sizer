export function getArrayBuffer(buffer:Buffer):ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset, buffer.byteOffset + buffer.byteLength
  );
}
