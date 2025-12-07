export interface AgendaItem {
  id: string;
  topic: string;
  durationMinutes: number;
  presenter: string;
  description: string;
  startTime?: string; // Optional generated start time
}

export interface Stakeholder {
  name: string;
  role: string;
}

export interface GeneratedAgenda {
  title: string;
  date?: string;
  overview: string;
  stakeholders: Stakeholder[];
  items: AgendaItem[];
}

export interface FileData {
  name: string;
  type: string;
  data: string; // base64
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
