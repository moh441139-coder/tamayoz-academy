import type { FormationSize } from "./types";

/** كل خطة عبارة عن أعداد اللاعبين في كل خط من الدفاع إلى الهجوم (بدون الحارس) */
export const FORMATION_SHAPES: Record<FormationSize, string[]> = {
  5: ["2-2", "1-2-1", "3-1"],
  7: ["3-2-1", "2-3-1", "3-1-2", "2-2-2"],
  8: ["3-3-1", "3-2-2", "2-3-2", "3-1-3"],
  11: ["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "3-4-3", "5-3-2"],
};

export const FORMATION_SIZES: FormationSize[] = [5, 7, 8, 11];

export interface SlotPosition {
  /** نسبة مئوية من اليسار */
  x: number;
  /** نسبة مئوية من الأعلى (مرمانا في الأسفل) */
  y: number;
  role: "GK" | "DF" | "MF" | "FW";
}

export function isValidShape(size: FormationSize, shape: string): boolean {
  return FORMATION_SHAPES[size].includes(shape);
}

export function shapeLines(shape: string): number[] {
  return shape.split("-").map((n) => Number.parseInt(n, 10));
}

/** يحسب إحداثيات كل خانة في الملعب — الخانة 0 دائماً الحارس */
export function getSlotPositions(size: FormationSize, shape: string): SlotPosition[] {
  const lines = isValidShape(size, shape) ? shapeLines(shape) : shapeLines(FORMATION_SHAPES[size][0]);
  const positions: SlotPosition[] = [{ x: 50, y: 86, role: "GK" }];
  const top = 15;
  const bottom = 69;
  const count = lines.length;
  lines.forEach((n, lineIdx) => {
    const y = count === 1 ? (top + bottom) / 2 : bottom - (lineIdx * (bottom - top)) / (count - 1);
    const role: SlotPosition["role"] =
      lineIdx === 0 ? "DF" : lineIdx === count - 1 ? "FW" : "MF";
    const margin = n >= 5 ? 12 : n === 4 ? 17 : n === 3 ? 22 : 30;
    for (let i = 0; i < n; i++) {
      // الترتيب من اليمين إلى اليسار (RTL)
      const x = n === 1 ? 50 : 100 - (margin + (i * (100 - 2 * margin)) / (n - 1));
      positions.push({ x, y, role });
    }
  });
  return positions;
}
