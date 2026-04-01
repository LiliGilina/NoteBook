export type PlayedNote = {
  note: string;
  frequency: number;
  time: number;
};

export type SessionEntry = {
  id: string;
  title: string;
  createdAt: string;
  notes: PlayedNote[];
  detectedKey?: string;
};