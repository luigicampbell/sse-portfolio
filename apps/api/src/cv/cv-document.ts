export interface CvDocument {
  readonly bytes: Uint8Array;
  readonly contentType: "application/pdf";
  readonly fileName: string;
}
