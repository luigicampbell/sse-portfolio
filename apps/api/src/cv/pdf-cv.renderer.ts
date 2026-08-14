import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  SKILL_SUBCATEGORY_LABELS,
} from "@domain/mod.ts";

import type {
  Credential,
  PortfolioPageResponse,
  Skill,
  SkillCategory,
  SkillSubcategory,
} from "@domain/mod.ts";

import type { CvRenderer } from "./cv-renderer.ts";
import { PDF_MUTED_COLOR, PdfLayout } from "./pdf-layout.ts";

export class PdfCvRenderer implements CvRenderer {
  async render(portfolio: PortfolioPageResponse): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    const layout = new PdfLayout(pdf, {
      regular: regularFont,
      bold: boldFont,
    });

    renderHeader(layout, portfolio);
    renderSummary(layout, portfolio);
    renderExperience(layout, portfolio);
    renderProjects(layout, portfolio);
    renderSkills(layout, portfolio);
    renderEducation(layout, portfolio);
    renderCredentials(layout, portfolio);
    renderVolunteerExperience(layout, portfolio);

    return await pdf.save();
  }
}

function renderHeader(
  layout: PdfLayout,
  portfolio: PortfolioPageResponse,
): void {
  const profile = portfolio.hero.profile;

  layout.drawText(profile.name, {
    font: layout.fonts.bold,
    size: 26,
    lineHeight: 30,
  });

  if (profile.headline) {
    layout.drawText(profile.headline, {
      size: 13,
      lineHeight: 18,
      color: PDF_MUTED_COLOR,
    });
  }

  const contactParts = [
    profile.location,
    profile.email,
  ].filter(
    (value): value is string =>
      typeof value === "string" &&
      value.trim().length > 0,
  );

  if (contactParts.length > 0) {
    layout.drawParagraph(
      contactParts.join(" • "),
      {
        size: 9.5,
        lineHeight: 13,
        color: PDF_MUTED_COLOR,
        gapAfter: 3,
      },
    );
  }

  renderSocials(layout, profile.socials);

  layout.moveDown(9);
}

function renderSocials(
  layout: PdfLayout,
  socials: PortfolioPageResponse["hero"]["profile"]["socials"],
): void {
  const publishedSocials = socials.filter(
    (social) =>
      social.label.trim().length > 0 &&
      social.url.trim().length > 0,
  );

  if (publishedSocials.length === 0) {
    return;
  }

  const socialText = publishedSocials
    .map((social) => `${social.label}: ${formatDisplayUrl(social.url)}`)
    .join(" • ");

  layout.drawParagraph(socialText, {
    size: 8.5,
    lineHeight: 12,
    color: PDF_MUTED_COLOR,
    gapAfter: 3,
  });
}

function formatDisplayUrl(value: string): string {
  try {
    const url = new URL(value);

    const pathname = url.pathname === "/"
      ? ""
      : url.pathname.replace(/\/$/, "");

    return `${url.hostname.replace(/^www\./, "")}${pathname}`;
  } catch {
    return value
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/$/, "");
  }
}

function renderSummary(
  layout: PdfLayout,
  portfolio: PortfolioPageResponse,
): void {
  const summary = portfolio.hero.profile.summary;

  if (!summary) return;

  layout.drawSectionHeading("Summary");
  layout.drawRichTextParagraph(summary, {
    size: 10.5,
    lineHeight: 15,
    gapAfter: 14,
  });
}

function renderExperience(
  layout: PdfLayout,
  portfolio: PortfolioPageResponse,
): void {
  const experience = portfolio.experience.items;

  if (experience.length === 0) return;

  layout.drawSectionHeading("Experience");

  for (const item of experience) {
    layout.ensureSpace(55);

    layout.drawRightAlignedText(
      formatDateRange(item.startDate, item.endDate),
      {
        size: 9,
        color: PDF_MUTED_COLOR,
      },
    );

    layout.drawText(item.role, {
      font: layout.fonts.bold,
      size: 11,
      lineHeight: 15,
    });

    layout.drawText(item.organization, {
      size: 10,
      lineHeight: 15,
      color: PDF_MUTED_COLOR,
    });

    for (const highlight of item.highlights) {
      layout.drawBullet(highlight);
    }

    layout.moveDown(6);
  }
}

function renderProjects(
  layout: PdfLayout,
  portfolio: PortfolioPageResponse,
): void {
  const projects = portfolio.projects.featured;

  if (projects.length === 0) return;

  layout.drawSectionHeading("Selected Projects");

  for (const project of projects) {
    layout.ensureSpace(45);

    layout.drawText(project.title, {
      font: layout.fonts.bold,
      size: 11,
      lineHeight: 15,
    });

    layout.drawParagraph(project.summary, {
      size: 9.5,
      lineHeight: 13,
      gapAfter: 8,
    });
  }
}

function renderSkills(
  layout: PdfLayout,
  portfolio: PortfolioPageResponse,
): void {
  const groupedSkills = groupSkillsByCategory(
    portfolio.skills.items,
  );

  if (
    groupedSkills.size === 0
  ) {
    return;
  }

  layout.drawSectionHeading(
    "Skills",
  );

  for (
    const category of SKILL_CATEGORIES
  ) {
    const skills = groupedSkills.get(
      category,
    );

    if (!skills?.length) {
      continue;
    }

    layout.ensureSpace(
      42,
    );

    layout.drawText(
      SKILL_CATEGORY_LABELS[
        category
      ],
      {
        font: layout.fonts.bold,

        size: 9.5,

        lineHeight: 14,

        gapAfter: 2,
      },
    );

    const directSkills = skills.filter(
      (skill) =>
        skill.subcategory ===
          undefined,
    );

    if (
      directSkills.length > 0
    ) {
      layout.drawChipGroup(
        directSkills.map(
          (skill) => skill.label,
        ),
        {
          size: 8.5,

          gapAfter: 8,
        },
      );
    }

    const subgroups = groupSkillsBySubcategory(
      skills,
    );

    for (
      const [
        subcategory,
        subgroupSkills,
      ] of subgroups
    ) {
      layout.drawText(
        SKILL_SUBCATEGORY_LABELS[
          subcategory
        ],
        {
          size: 8.5,

          lineHeight: 12,

          color: PDF_MUTED_COLOR,

          gapAfter: 2,
        },
      );

      layout.drawChipGroup(
        subgroupSkills.map(
          (skill) => skill.label,
        ),
        {
          size: 8.5,

          gapAfter: 6,
        },
      );
    }
  }
}

function renderEducation(
  layout: PdfLayout,
  portfolio: PortfolioPageResponse,
): void {
  const education = portfolio.education.items;

  if (education.length === 0) return;

  layout.drawSectionHeading("Education");

  for (const item of education) {
    layout.ensureSpace(50);

    const dateRange = formatOptionalDateRange(
      item.startDate,
      item.endDate,
    );

    if (dateRange) {
      layout.drawRightAlignedText(dateRange, {
        size: 9,
        color: PDF_MUTED_COLOR,
      });
    }

    layout.drawText(item.institution, {
      font: layout.fonts.bold,
      size: 11,
      lineHeight: 15,
    });

    layout.drawText(
      [item.credential, item.field].filter(Boolean).join(", "),
      {
        size: 10,
        lineHeight: 15,
        color: PDF_MUTED_COLOR,
      },
    );

    if (item.description) {
      layout.drawParagraph(item.description, {
        size: 9.5,
        lineHeight: 13,
        gapAfter: 3,
      });
    }

    for (const highlight of item.highlights) {
      layout.drawBullet(highlight);
    }

    layout.moveDown(6);
  }
}

function renderCredentials(
  layout: PdfLayout,
  portfolio: PortfolioPageResponse,
): void {
  const credentials = portfolio.credentials.items;

  if (credentials.length === 0) return;

  layout.drawSectionHeading("Credentials");

  for (const credential of credentials) {
    layout.ensureSpace(32);

    const dateLabel = formatCredentialDate(credential);

    if (dateLabel) {
      layout.drawRightAlignedText(dateLabel, {
        size: 9,
        color: PDF_MUTED_COLOR,
      });
    }

    layout.drawText(credential.name, {
      font: layout.fonts.bold,
      size: 10.5,
      lineHeight: 14,
    });

    layout.drawText(credential.issuer, {
      size: 9.5,
      lineHeight: 14,
      color: PDF_MUTED_COLOR,
      gapAfter: 5,
    });
  }
}

function renderVolunteerExperience(
  layout: PdfLayout,
  portfolio: PortfolioPageResponse,
): void {
  const volunteer = portfolio.volunteer.items;

  if (volunteer.length === 0) return;

  layout.drawSectionHeading("Volunteer Experience");

  for (const item of volunteer) {
    layout.ensureSpace(50);

    const dateRange = formatOptionalDateRange(
      item.startDate,
      item.endDate,
    );

    if (dateRange) {
      layout.drawRightAlignedText(dateRange, {
        size: 9,
        color: PDF_MUTED_COLOR,
      });
    }

    layout.drawText(item.role, {
      font: layout.fonts.bold,
      size: 11,
      lineHeight: 15,
    });

    layout.drawText(item.organization, {
      size: 10,
      lineHeight: 15,
      color: PDF_MUTED_COLOR,
    });

    if (item.summary) {
      layout.drawParagraph(item.summary, {
        size: 9.5,
        lineHeight: 13,
        gapAfter: 3,
      });
    }

    for (const highlight of item.highlights) {
      layout.drawBullet(highlight);
    }

    layout.moveDown(6);
  }
}

function groupSkillsByCategory(
  skills: Skill[],
): Map<SkillCategory, Skill[]> {
  const grouped = new Map<SkillCategory, Skill[]>();

  for (const skill of skills) {
    const existing = grouped.get(skill.category);

    if (existing) {
      existing.push(skill);
      continue;
    }

    grouped.set(skill.category, [skill]);
  }

  return grouped;
}

function groupSkillsBySubcategory(
  skills: Skill[],
): Map<
  SkillSubcategory,
  Skill[]
> {
  const grouped = new Map<
    SkillSubcategory,
    Skill[]
  >();

  for (const skill of skills) {
    if (!skill.subcategory) {
      continue;
    }

    const existing = grouped.get(
      skill.subcategory,
    );

    if (existing) {
      existing.push(
        skill,
      );

      continue;
    }

    grouped.set(
      skill.subcategory,
      [
        skill,
      ],
    );
  }

  return grouped;
}

function formatCredentialDate(
  credential: Credential,
): string | null {
  if (credential.status === "planned") {
    return credential.targetYear
      ? `Planned ${credential.targetYear}`
      : "Planned";
  }

  if (!credential.issued) return null;

  return formatDate(credential.issued);
}

function formatDateRange(
  startDate: string,
  endDate?: string | null,
): string {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : "Present";

  return `${start} – ${end}`;
}

function formatOptionalDateRange(
  startDate?: string | null,
  endDate?: string | null,
): string | null {
  if (startDate) {
    return formatDateRange(startDate, endDate);
  }

  return endDate ? formatDate(endDate) : null;
}

function formatDate(value: string): string {
  if (/^\d{4}$/.test(value)) return value;

  const normalizedValue = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;

  const date = new Date(`${normalizedValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}
