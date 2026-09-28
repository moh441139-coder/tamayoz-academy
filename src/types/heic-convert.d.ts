declare module "heic-convert" {
  interface HeicConvertOptions {
    buffer: Buffer | Uint8Array | ArrayBuffer;
    format: "JPEG" | "PNG";
    quality?: number;
  }
  function convert(options: HeicConvertOptions): Promise<ArrayBuffer | Buffer>;
  export default convert;
}
