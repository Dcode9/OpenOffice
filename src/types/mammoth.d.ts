declare module 'mammoth' {
  interface MammothResult {
    value: string
    messages: { type: string; message: string }[]
  }
  interface Mammoth {
    convertToHtml(
      input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string },
      options?: Record<string, unknown>,
    ): Promise<MammothResult>
  }
  const mammoth: Mammoth
  export default mammoth
}
