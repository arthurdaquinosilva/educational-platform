/**
 * A content author is the audience for these messages, not a compiler. They
 * fire at build time (see docs/decisions.md — malformed content must fail the
 * build, never ship a broken page), so they must say which file is wrong and
 * what to do about it.
 */
export class ContentError extends Error {
  constructor(
    message: string,
    /** Path of the offending file, relative to the content root. */
    readonly file?: string,
  ) {
    super(file ? `${file}\n  ${message}` : message);
    this.name = 'ContentError';
  }
}
