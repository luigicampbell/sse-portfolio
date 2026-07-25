import { type PDFDocument, type PDFFont, type PDFPage, rgb } from "pdf-lib";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

const DEFAULT_MARGIN_X = 50;
const DEFAULT_MARGIN_TOP = 50;
const DEFAULT_MARGIN_BOTTOM = 50;

const TEXT_COLOR = rgb(0.08, 0.08, 0.08);
const MUTED_COLOR = rgb(0.35, 0.35, 0.35);
const LINK_COLOR = rgb(0.05, 0.36, 0.75);
const CHIP_BACKGROUND = rgb(0.94, 0.94, 0.95);

export interface PdfLayoutFonts {
  regular: PDFFont;
  bold: PDFFont;
}

export interface PdfLayoutOptions {
  marginX?: number;
  marginTop?: number;
  marginBottom?: number;
}

export interface DrawTextOptions {
  font?: PDFFont;
  size?: number;
  lineHeight?: number;
  color?: ReturnType<typeof rgb>;
  gapAfter?: number;
}

export interface DrawParagraphOptions extends DrawTextOptions {
  indent?: number;
}

export interface DrawBulletOptions extends DrawTextOptions {
  bulletIndent?: number;
  textIndent?: number;
}

export interface DrawChipGroupOptions {
  font?: PDFFont;
  size?: number;
  horizontalGap?: number;
  verticalGap?: number;
  chipPaddingX?: number;
  chipPaddingY?: number;
  fillColor?: ReturnType<typeof rgb>;
  textColor?: ReturnType<typeof rgb>;
  gapAfter?: number;
}

export interface PdfRichTextRun {
  text: string;
  emphasis?: boolean;
  link?: string;
}

export interface DrawRichTextOptions {
  size?: number;
  lineHeight?: number;
  color?: ReturnType<typeof rgb>;
  emphasisColor?: ReturnType<typeof rgb>;
  linkColor?: ReturnType<typeof rgb>;
  gapAfter?: number;
  indent?: number;
}

interface RichTextToken {
  text: string;
  font: PDFFont;
  color: ReturnType<typeof rgb>;
  link?: string;
  whitespace: boolean;
}

interface RichTextLine {
  tokens: RichTextToken[];
}

export class PdfLayout {
  readonly pdf: PDFDocument;
  readonly fonts: PdfLayoutFonts;

  readonly pageWidth = PAGE_WIDTH;
  readonly pageHeight = PAGE_HEIGHT;

  readonly marginX: number;
  readonly marginTop: number;
  readonly marginBottom: number;

  private currentPage: PDFPage;
  private cursorY: number;

  constructor(
    pdf: PDFDocument,
    fonts: PdfLayoutFonts,
    options: PdfLayoutOptions = {},
  ) {
    this.pdf = pdf;
    this.fonts = fonts;

    this.marginX = options.marginX ?? DEFAULT_MARGIN_X;

    this.marginTop = options.marginTop ?? DEFAULT_MARGIN_TOP;

    this.marginBottom = options.marginBottom ?? DEFAULT_MARGIN_BOTTOM;

    this.currentPage = this.createPage();
    this.cursorY = this.pageHeight - this.marginTop;
  }

  get page(): PDFPage {
    return this.currentPage;
  }

  get y(): number {
    return this.cursorY;
  }

  get contentWidth(): number {
    return this.pageWidth - this.marginX * 2;
  }

  get remainingHeight(): number {
    return this.cursorY - this.marginBottom;
  }

  addPage(): PDFPage {
    this.currentPage = this.createPage();
    this.cursorY = this.pageHeight - this.marginTop;

    return this.currentPage;
  }

  ensureSpace(requiredHeight: number): void {
    if (requiredHeight <= 0) {
      return;
    }

    if (this.remainingHeight < requiredHeight) {
      this.addPage();
    }
  }

  moveDown(distance: number): void {
    if (distance <= 0) {
      return;
    }

    this.ensureSpace(distance);
    this.cursorY -= distance;
  }

  drawText(
    text: string,
    options: DrawTextOptions = {},
  ): void {
    if (!text.trim()) {
      return;
    }

    const font = options.font ?? this.fonts.regular;

    const size = options.size ?? 10;

    const lineHeight = options.lineHeight ?? size * 1.3;

    const gapAfter = options.gapAfter ?? 0;

    this.ensureSpace(lineHeight + gapAfter);

    this.currentPage.drawText(text, {
      x: this.marginX,
      y: this.cursorY,
      size,
      font,
      color: options.color ?? TEXT_COLOR,
    });

    this.cursorY -= lineHeight + gapAfter;
  }

  drawRightAlignedText(
    text: string,
    options: DrawTextOptions = {},
  ): void {
    if (!text.trim()) {
      return;
    }

    const font = options.font ?? this.fonts.regular;

    const size = options.size ?? 10;

    const lineHeight = options.lineHeight ?? size * 1.3;

    const textWidth = font.widthOfTextAtSize(text, size);

    this.ensureSpace(lineHeight);

    this.currentPage.drawText(text, {
      x: Math.max(
        this.marginX,
        this.pageWidth -
          this.marginX -
          textWidth,
      ),
      y: this.cursorY,
      size,
      font,
      color: options.color ?? TEXT_COLOR,
    });
  }

  drawParagraph(
    text: string,
    options: DrawParagraphOptions = {},
  ): void {
    if (typeof text !== "string") {
      throw new TypeError(
        "PdfLayout.drawParagraph() expects a string. Use drawRichTextParagraph() for structured rich text.",
      );
    }

    if (!text.trim()) {
      return;
    }

    const font = options.font ?? this.fonts.regular;

    const size = options.size ?? 10;

    const lineHeight = options.lineHeight ?? size * 1.4;

    const gapAfter = options.gapAfter ?? 0;

    const indent = options.indent ?? 0;

    const availableWidth = Math.max(
      1,
      this.contentWidth - indent,
    );

    const lines = this.wrapText(
      text,
      font,
      size,
      availableWidth,
    );

    for (const line of lines) {
      this.ensureSpace(lineHeight);

      if (line.length > 0) {
        this.currentPage.drawText(line, {
          x: this.marginX + indent,
          y: this.cursorY,
          size,
          font,
          color: options.color ?? TEXT_COLOR,
        });
      }

      this.cursorY -= lineHeight;
    }

    this.applyGap(gapAfter);
  }

  drawRichTextParagraph(
    runs: readonly PdfRichTextRun[],
    options: DrawRichTextOptions = {},
  ): void {
    if (!Array.isArray(runs)) {
      throw new TypeError(
        "PdfLayout.drawRichTextParagraph() expects an array of rich-text runs.",
      );
    }

    if (runs.length === 0) {
      return;
    }

    const tokens = this.createRichTextTokens(
      runs,
      options,
    );

    if (tokens.length === 0) {
      return;
    }

    const size = options.size ?? 10.5;

    const lineHeight = options.lineHeight ?? size * 1.45;

    const gapAfter = options.gapAfter ?? 0;

    const indent = options.indent ?? 0;

    const availableWidth = Math.max(
      1,
      this.contentWidth - indent,
    );

    const lines = this.wrapRichTextTokens(
      tokens,
      size,
      availableWidth,
    );

    for (const line of lines) {
      this.ensureSpace(lineHeight);

      let x = this.marginX + indent;

      for (const token of line.tokens) {
        if (
          token.whitespace &&
          x === this.marginX + indent
        ) {
          continue;
        }

        const width = token.font.widthOfTextAtSize(
          token.text,
          size,
        );

        this.currentPage.drawText(
          token.text,
          {
            x,
            y: this.cursorY,
            size,
            font: token.font,
            color: token.color,
          },
        );

        if (token.link) {
          this.currentPage.drawLine({
            start: {
              x,
              y: this.cursorY - 1.5,
            },
            end: {
              x: x + width,
              y: this.cursorY - 1.5,
            },
            thickness: 0.5,
            color: token.color,
          });
        }

        x += width;
      }

      this.cursorY -= lineHeight;
    }

    this.applyGap(gapAfter);
  }

  drawBullet(
    text: string,
    options: DrawBulletOptions = {},
  ): void {
    if (!text.trim()) {
      return;
    }

    const font = options.font ?? this.fonts.regular;

    const size = options.size ?? 9.5;

    const lineHeight = options.lineHeight ?? 13;

    const gapAfter = options.gapAfter ?? 2;

    const bulletIndent = options.bulletIndent ?? 8;

    const textIndent = options.textIndent ?? 20;

    const lines = this.wrapText(
      text,
      font,
      size,
      Math.max(
        1,
        this.contentWidth - textIndent,
      ),
    );

    for (
      let index = 0;
      index < lines.length;
      index++
    ) {
      const line = lines[index];

      this.ensureSpace(lineHeight);

      if (index === 0) {
        this.currentPage.drawText("•", {
          x: this.marginX + bulletIndent,
          y: this.cursorY,
          size,
          font,
          color: options.color ?? TEXT_COLOR,
        });
      }

      this.currentPage.drawText(line, {
        x: this.marginX + textIndent,
        y: this.cursorY,
        size,
        font,
        color: options.color ?? TEXT_COLOR,
      });

      this.cursorY -= lineHeight;
    }

    this.applyGap(gapAfter);
  }

  drawSectionHeading(
    text: string,
    gapAfter = 15,
  ): void {
    if (!text.trim()) {
      return;
    }

    const headingSize = 10;
    const headingLineHeight = 14;
    const dividerGap = 5;

    this.ensureSpace(
      headingLineHeight +
        dividerGap +
        gapAfter,
    );

    this.currentPage.drawText(
      text.toUpperCase(),
      {
        x: this.marginX,
        y: this.cursorY,
        size: headingSize,
        font: this.fonts.bold,
        color: TEXT_COLOR,
      },
    );

    this.currentPage.drawLine({
      start: {
        x: this.marginX,
        y: this.cursorY - dividerGap,
      },
      end: {
        x: this.pageWidth - this.marginX,
        y: this.cursorY - dividerGap,
      },
      thickness: 0.5,
      color: MUTED_COLOR,
    });

    this.cursorY -= headingLineHeight + gapAfter;
  }

  drawLabeledParagraph(
    label: string,
    text: string,
    options: DrawParagraphOptions = {},
  ): void {
    if (!label.trim() || !text.trim()) {
      return;
    }

    const labelFont = this.fonts.bold;

    const textFont = options.font ?? this.fonts.regular;

    const size = options.size ?? 9.5;

    const lineHeight = options.lineHeight ?? 14;

    const gapAfter = options.gapAfter ?? 3;

    const prefix = `${label}: `;

    const prefixWidth = labelFont.widthOfTextAtSize(
      prefix,
      size,
    );

    const firstLineWidth = Math.max(
      1,
      this.contentWidth - prefixWidth,
    );

    const lines = this.wrapTextWithFirstLineWidth(
      text,
      textFont,
      size,
      firstLineWidth,
      this.contentWidth,
    );

    for (
      let index = 0;
      index < lines.length;
      index++
    ) {
      const line = lines[index];

      this.ensureSpace(lineHeight);

      if (index === 0) {
        this.currentPage.drawText(prefix, {
          x: this.marginX,
          y: this.cursorY,
          size,
          font: labelFont,
          color: options.color ?? TEXT_COLOR,
        });

        this.currentPage.drawText(line, {
          x: this.marginX + prefixWidth,
          y: this.cursorY,
          size,
          font: textFont,
          color: options.color ?? TEXT_COLOR,
        });
      } else {
        this.currentPage.drawText(line, {
          x: this.marginX,
          y: this.cursorY,
          size,
          font: textFont,
          color: options.color ?? TEXT_COLOR,
        });
      }

      this.cursorY -= lineHeight;
    }

    this.applyGap(gapAfter);
  }

  drawChipGroup(
    chips: readonly string[],
    options: DrawChipGroupOptions = {},
  ): void {
    const labels = chips
      .map((chip) => chip.trim())
      .filter(Boolean);

    if (labels.length === 0) {
      return;
    }

    const font = options.font ?? this.fonts.regular;

    const size = options.size ?? 9;

    const horizontalGap = options.horizontalGap ?? 6;

    const verticalGap = options.verticalGap ?? 6;

    const paddingX = options.chipPaddingX ?? 8;

    const paddingY = options.chipPaddingY ?? 4;

    const fillColor = options.fillColor ?? CHIP_BACKGROUND;

    const textColor = options.textColor ?? TEXT_COLOR;

    const gapAfter = options.gapAfter ?? 8;

    const chipHeight = size + paddingY * 2;

    const rowAdvance = chipHeight + verticalGap;

    const rightEdge = this.pageWidth - this.marginX;

    let x = this.marginX;

    this.ensureSpace(chipHeight);

    for (const label of labels) {
      const measuredTextWidth = font.widthOfTextAtSize(
        label,
        size,
      );

      const chipWidth = Math.min(
        measuredTextWidth + paddingX * 2,
        this.contentWidth,
      );

      if (
        x > this.marginX &&
        x + chipWidth > rightEdge
      ) {
        this.cursorY -= rowAdvance;
        this.ensureSpace(chipHeight);
        x = this.marginX;
      }

      const rectangleY = this.cursorY - paddingY;

      const textY = rectangleY +
        (chipHeight - size) / 2 +
        size * 0.18;

      this.currentPage.drawRectangle({
        x,
        y: rectangleY,
        width: chipWidth,
        height: chipHeight,
        color: fillColor,
      });

      this.currentPage.drawText(label, {
        x: x + paddingX,
        y: textY,
        size,
        font,
        color: textColor,
      });

      x += chipWidth + horizontalGap;
    }

    this.cursorY -= chipHeight;
    this.applyGap(gapAfter);
  }

  private applyGap(gap: number): void {
    if (gap <= 0) {
      return;
    }

    if (this.remainingHeight < gap) {
      this.addPage();
      return;
    }

    this.cursorY -= gap;
  }

  private createPage(): PDFPage {
    return this.pdf.addPage([
      this.pageWidth,
      this.pageHeight,
    ]);
  }

  private createRichTextTokens(
    runs: readonly PdfRichTextRun[],
    options: DrawRichTextOptions,
  ): RichTextToken[] {
    const defaultColor = options.color ?? MUTED_COLOR;

    const emphasisColor = options.emphasisColor ?? TEXT_COLOR;

    const linkColor = options.linkColor ?? LINK_COLOR;

    const tokens: RichTextToken[] = [];

    for (const run of runs) {
      if (!run.text) {
        continue;
      }

      const parts = run.text.match(/\s+|[^\s]+/g) ?? [];

      for (const part of parts) {
        const whitespace = /^\s+$/.test(part);

        tokens.push({
          text: part,
          font: run.emphasis ? this.fonts.bold : this.fonts.regular,
          color: run.link
            ? linkColor
            : run.emphasis
            ? emphasisColor
            : defaultColor,
          link: run.link,
          whitespace,
        });
      }
    }

    return tokens;
  }

  private wrapRichTextTokens(
    tokens: readonly RichTextToken[],
    size: number,
    maxWidth: number,
  ): RichTextLine[] {
    const lines: RichTextLine[] = [];

    let currentTokens: RichTextToken[] = [];
    let currentWidth = 0;

    for (const token of tokens) {
      const tokenWidth = token.font.widthOfTextAtSize(
        token.text,
        size,
      );

      if (
        token.whitespace &&
        currentTokens.length === 0
      ) {
        continue;
      }

      if (
        currentTokens.length > 0 &&
        currentWidth + tokenWidth >
          maxWidth
      ) {
        while (
          currentTokens.length > 0 &&
          currentTokens[
            currentTokens.length - 1
          ].whitespace
        ) {
          currentTokens.pop();
        }

        lines.push({
          tokens: currentTokens,
        });

        currentTokens = [];
        currentWidth = 0;

        if (token.whitespace) {
          continue;
        }
      }

      currentTokens.push(token);
      currentWidth += tokenWidth;
    }

    while (
      currentTokens.length > 0 &&
      currentTokens[
        currentTokens.length - 1
      ].whitespace
    ) {
      currentTokens.pop();
    }

    if (currentTokens.length > 0) {
      lines.push({
        tokens: currentTokens,
      });
    }

    return lines;
  }

  private wrapText(
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number,
  ): string[] {
    const paragraphs = text
      .split(/\r?\n/)
      .map((paragraph) => paragraph.trim());

    const lines: string[] = [];

    for (const paragraph of paragraphs) {
      if (!paragraph) {
        lines.push("");
        continue;
      }

      lines.push(
        ...this.wrapWords(
          paragraph.split(/\s+/),
          font,
          size,
          maxWidth,
        ),
      );
    }

    return lines;
  }

  private wrapTextWithFirstLineWidth(
    text: string,
    font: PDFFont,
    size: number,
    firstLineWidth: number,
    remainingLineWidth: number,
  ): string[] {
    const words = text.trim().split(/\s+/);

    if (words.length === 0) {
      return [];
    }

    const lines: string[] = [];

    let currentLine = "";
    let currentWidth = firstLineWidth;

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;

      const candidateWidth = font.widthOfTextAtSize(
        candidate,
        size,
      );

      if (
        candidateWidth <= currentWidth ||
        currentLine.length === 0
      ) {
        currentLine = candidate;
        continue;
      }

      lines.push(currentLine);
      currentLine = word;
      currentWidth = remainingLineWidth;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private wrapWords(
    words: string[],
    font: PDFFont,
    size: number,
    maxWidth: number,
  ): string[] {
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;

      const candidateWidth = font.widthOfTextAtSize(
        candidate,
        size,
      );

      if (
        candidateWidth <= maxWidth ||
        currentLine.length === 0
      ) {
        currentLine = candidate;
        continue;
      }

      lines.push(currentLine);
      currentLine = word;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}

export const PDF_TEXT_COLOR = TEXT_COLOR;
export const PDF_MUTED_COLOR = MUTED_COLOR;
export const PDF_LINK_COLOR = LINK_COLOR;
export const PDF_CHIP_BACKGROUND = CHIP_BACKGROUND;
