import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { UserPerformanceReportData } from './performanceReportEngine';
import { ThemeModeTokens } from '../theme/palettes';

interface GeneratePdfOptions {
  reportElement: HTMLElement;
  report: UserPerformanceReportData;
  activeTokens: ThemeModeTokens;
  themeMode: 'light' | 'dark';
  paletteName: string;
  targetUserName: string;
}

/**
 * Helper to parse hex or rgb string into [r, g, b]
 */
function parseColorToRgb(colorStr: string, fallback: [number, number, number] = [255, 255, 255]): [number, number, number] {
  if (!colorStr) return fallback;
  const hex = colorStr.trim().replace('#', '');
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
  } else if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
  }
  return fallback;
}

/**
 * High-fidelity, content-aware PDF generator for executive performance dossiers.
 *
 * Solves:
 * 1. Disoriented positions caused by responsive viewports and modal transforms by rendering in an isolated, fixed-width staging container (820px standard A4 proportion).
 * 2. Arbitrary page slices cutting cards and text in half by computing smart content-aware page breaks at section boundaries.
 * 3. Blurry text / JPEG artifacts by utilizing 2x high-DPI scaling and lossless PNG slices.
 * 4. Missing page headers/footers with dynamic page numbers (Page X of Y) and running audit hashes.
 */
export async function generateExecutivePDF({
  reportElement,
  report,
  activeTokens,
  themeMode,
  paletteName,
  targetUserName
}: GeneratePdfOptions): Promise<void> {
  // Ensure document fonts are loaded for accurate text metrics
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness errors
    }
  }

  // 1. Create an isolated off-screen staging sandbox
  // Fixed width of 820px guarantees pristine desktop layout, consistent column grids, and zero scroll offset issues.
  const stagingContainer = document.createElement('div');
  stagingContainer.id = 'pdf-staging-sandbox';
  stagingContainer.style.position = 'fixed';
  stagingContainer.style.left = '-9999px';
  stagingContainer.style.top = '0';
  stagingContainer.style.width = '820px';
  stagingContainer.style.zIndex = '-9999';
  stagingContainer.style.backgroundColor = activeTokens.bgBase;
  stagingContainer.style.color = activeTokens.textPrimary;
  stagingContainer.style.overflow = 'visible';
  stagingContainer.style.boxSizing = 'border-box';

  // Clone the report element
  const clonedDoc = reportElement.cloneNode(true) as HTMLElement;
  clonedDoc.style.width = '820px';
  clonedDoc.style.maxWidth = '820px';
  clonedDoc.style.margin = '0';
  clonedDoc.style.padding = '32px';
  clonedDoc.style.boxShadow = 'none';
  clonedDoc.style.borderRadius = '0';
  clonedDoc.style.border = 'none';
  clonedDoc.style.boxSizing = 'border-box';
  clonedDoc.style.backgroundColor = activeTokens.bgBase;
  clonedDoc.style.color = activeTokens.textPrimary;

  // Inject helper style to ensure badge text never breaks and fonts render crisply
  const sandboxStyle = document.createElement('style');
  sandboxStyle.textContent = `
    #pdf-staging-sandbox * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    #pdf-staging-sandbox .whitespace-nowrap {
      white-space: nowrap !important;
    }
    #pdf-staging-sandbox .shrink-0 {
      flex-shrink: 0 !important;
    }
    #pdf-staging-sandbox [class*="rounded"] {
      background-clip: padding-box;
    }
    img {
      display: inline-block !important;
    }
  `;
  stagingContainer.appendChild(sandboxStyle);
  stagingContainer.appendChild(clonedDoc);
  document.body.appendChild(stagingContainer);

  try {
    // 2. Identify all discrete logical sections for smart page break calculation
    const sectionElements = Array.from(
      clonedDoc.querySelectorAll<HTMLElement>('[data-report-section="true"]')
    );

    const stagingRect = stagingContainer.getBoundingClientRect();
    const sections = sectionElements.map((el, index) => {
      const rect = el.getBoundingClientRect();
      const top = rect.top - stagingRect.top;
      const height = rect.height;
      return {
        index,
        top,
        bottom: top + height,
        height
      };
    });

    // 3. Render high-resolution master canvas with html2canvas
    const scale = 2; // 2x DPI for ultra-sharp text and borders
    const masterCanvas = await html2canvas(stagingContainer, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: activeTokens.bgBase,
      windowWidth: 820,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc: Document) => {
        // Enforce inline-block for all img elements in cloned iframe document
        // to ensure FontMetrics calculates accurate baseline measurements without vertical text drop
        const baselineFixStyle = clonedDoc.createElement('style');
        baselineFixStyle.textContent = `
          img {
            display: inline-block !important;
          }
        `;
        clonedDoc.head.appendChild(baselineFixStyle);

        // Sanitize any modern CSS color functions (oklch, oklab, lab, lch) to safe sRGB
        // Modern browsers may serialize colors to oklch which crashes older parsers in html2canvas
        try {
          const colorCanvas = clonedDoc.createElement('canvas');
          colorCanvas.width = 1;
          colorCanvas.height = 1;
          const colorCtx = colorCanvas.getContext('2d');
          const colorCache = new Map<string, string>();

          const toSafeColor = (val: string): string => {
            if (!val || typeof val !== 'string') return val;
            if (!val.includes('oklch') && !val.includes('oklab') && !val.includes('lab(') && !val.includes('lch(')) {
              return val;
            }
            if (colorCache.has(val)) return colorCache.get(val)!;
            if (colorCtx) {
              try {
                colorCtx.fillStyle = '#000000';
                colorCtx.fillStyle = val;
                const converted = colorCtx.fillStyle;
                colorCache.set(val, converted);
                return converted;
              } catch {
                return '#888888';
              }
            }
            return '#888888';
          };

          // Sanitize style tags
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((st) => {
            if (st.textContent && (st.textContent.includes('oklch') || st.textContent.includes('oklab'))) {
              st.textContent = st.textContent.replace(/oklch\([^)]+\)/g, (match) => toSafeColor(match));
            }
          });

          // Sanitize inline styles on all elements
          const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
          allElements.forEach((el) => {
            if (el.style) {
              const colorProps = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'];
              colorProps.forEach((prop) => {
                const currentVal = (el.style as any)[prop];
                if (currentVal && typeof currentVal === 'string' && (currentVal.includes('oklch') || currentVal.includes('oklab'))) {
                  (el.style as any)[prop] = toSafeColor(currentVal);
                }
              });
            }
          });
        } catch {
          // Fallback gracefully if DOM canvas is restricted
        }
      }
    });

    // 4. Calculate content-aware page cuts
    // A4 dimensions: 210mm wide x 297mm high
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageMarginTop = 12; // mm
    const pageMarginBottom = 14; // mm
    const pageMarginLeft = 12; // mm
    const printableWidthMm = 210 - pageMarginLeft * 2; // 186mm
    const printableHeightMm = 297 - pageMarginTop - pageMarginBottom; // 271mm

    // Printable height budget in CSS pixels (at 820px width)
    const maxPageHeightCssPx = (printableHeightMm / printableWidthMm) * 820; // ~1194px

    const totalHeightCssPx = stagingContainer.scrollHeight;
    const pageSlices: { startY: number; endY: number }[] = [];

    let currentY = 0;
    while (currentY < totalHeightCssPx) {
      let targetEndY = currentY + maxPageHeightCssPx;

      if (targetEndY >= totalHeightCssPx) {
        pageSlices.push({ startY: currentY, endY: totalHeightCssPx });
        break;
      }

      // Check if targetEndY slices through any registered section
      let bestBreakY = targetEndY;
      let cutThroughSection = false;

      for (const sec of sections) {
        // If the cut line is inside this section
        if (sec.top < targetEndY && sec.bottom > targetEndY) {
          // If the section started after currentY with enough room, break before it!
          if (sec.top > currentY + 120) {
            bestBreakY = sec.top;
            cutThroughSection = true;
            break;
          }
        }
      }

      // If a huge section is larger than an entire page, look for internal rows or cards
      if (!cutThroughSection && bestBreakY === targetEndY) {
        // Try to break at a child card or table row if available
        const subItems = Array.from(clonedDoc.querySelectorAll<HTMLElement>('tr, .rounded-xl, .rounded-lg'));
        for (const item of subItems) {
          const itemRect = item.getBoundingClientRect();
          const itemTop = itemRect.top - stagingRect.top;
          const itemBottom = itemTop + itemRect.height;
          if (itemTop < targetEndY && itemBottom > targetEndY) {
            if (itemTop > currentY + 150) {
              bestBreakY = itemTop;
              break;
            }
          }
        }
      }

      // Safeguard against infinite loops
      if (bestBreakY <= currentY + 100) {
        bestBreakY = targetEndY;
      }

      pageSlices.push({ startY: currentY, endY: bestBreakY });
      currentY = bestBreakY;
    }

    const totalPages = pageSlices.length;

    // Parse color tokens for native PDF vector elements
    const [bgR, bgG, bgB] = parseColorToRgb(
      activeTokens.bgBase,
      themeMode === 'dark' ? [9, 9, 11] : [255, 255, 255]
    );
    const [mutedR, mutedG, mutedB] = parseColorToRgb(
      activeTokens.textTertiary,
      themeMode === 'dark' ? [140, 140, 150] : [120, 120, 130]
    );
    const [accentR, accentG, accentB] = parseColorToRgb(
      activeTokens.accentPrimary,
      [3, 193, 214]
    );

    // 5. Build PDF pages from computed slices
    for (let i = 0; i < totalPages; i++) {
      const slice = pageSlices[i];
      const sliceHeightCssPx = slice.endY - slice.startY;
      const sliceCanvasHeight = Math.round(sliceHeightCssPx * scale);
      const sliceCanvasStartY = Math.round(slice.startY * scale);

      // Create cropped sub-canvas for this specific page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = masterCanvas.width;
      pageCanvas.height = sliceCanvasHeight;

      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx) {
        // Fill sub-canvas with exact background to prevent any transparency artifacts
        pageCtx.fillStyle = activeTokens.bgBase;
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        pageCtx.drawImage(
          masterCanvas,
          0,
          sliceCanvasStartY,
          masterCanvas.width,
          sliceCanvasHeight,
          0,
          0,
          pageCanvas.width,
          sliceCanvasHeight
        );
      }

      if (i > 0) {
        pdf.addPage();
      }

      // Paint full page background
      pdf.setFillColor(bgR, bgG, bgB);
      pdf.rect(0, 0, 210, 297, 'F');

      // Add high-resolution PNG image
      const pageImgData = pageCanvas.toDataURL('image/png');
      const renderedHeightMm = (sliceHeightCssPx / 820) * printableWidthMm;

      pdf.addImage(
        pageImgData,
        'PNG',
        pageMarginLeft,
        pageMarginTop,
        printableWidthMm,
        renderedHeightMm
      );

      // Draw running header on page 2+
      if (i > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(accentR, accentG, accentB);
        pdf.text('TIBULE TALENT GOVERNANCE DOSSIER', pageMarginLeft, 7);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(mutedR, mutedG, mutedB);
        pdf.text(
          `${targetUserName} • Audit Scope: ${report.periodLabel}`,
          198,
          7,
          { align: 'right' }
        );

        // Thin divider line under running header
        pdf.setDrawColor(mutedR, mutedG, mutedB);
        pdf.setLineWidth(0.1);
        pdf.line(pageMarginLeft, 8.5, 210 - pageMarginLeft, 8.5);
      }

      // Draw running footer on every page
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(mutedR, mutedG, mutedB);

      // Footer divider line
      pdf.setDrawColor(mutedR, mutedG, mutedB);
      pdf.setLineWidth(0.1);
      pdf.line(pageMarginLeft, 289, 210 - pageMarginLeft, 289);

      pdf.text(
        `Confidential Agency Audit Record • Hash: ${report.reportReferenceId} • Generated ${new Date(report.generatedAt).toLocaleDateString()}`,
        pageMarginLeft,
        293
      );
      pdf.text(
        `Page ${i + 1} of ${totalPages}`,
        210 - pageMarginLeft,
        293,
        { align: 'right' }
      );
    }

    // 6. Save formatted PDF document
    const safeName = targetUserName.replace(/\s+/g, '_');
    const safePalette = paletteName.toLowerCase().replace(/\s+/g, '_');
    const safeDate = new Date().toISOString().slice(0, 10);
    const fileName = `Tibule_Report_${safeName}_${themeMode}_${safePalette}_${safeDate}.pdf`;

    pdf.save(fileName);
  } finally {
    // Clean up staging sandbox
    if (document.body.contains(stagingContainer)) {
      document.body.removeChild(stagingContainer);
    }
  }
}
