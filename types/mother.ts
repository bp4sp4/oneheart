export type MotherResponse = {
  id: string;
  name?: string;
  scores: Record<string, number>;
  total: number;
  typeCode: string; // e.g., RSPC, RSPT...
  typeName: string; // human-readable name
  summary: string; // short explanation
  details?: string; // optional long explanation
  emailSent?: boolean;
  createdAt: string;
};
