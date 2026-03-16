import { supabase } from '@/lib/supabaseClient';

export type MedxHistoryRow = {
  id: number;
  session_id: string;
  message: any;
  data_e_hora?: string;
  media?: string | null;
  sender_name?: string | null;
  created_at?: string; // Mantendo para compatibilidade se necessário
  media_url?: string | null; // Mantendo para compatibilidade se necessário
};

export type MedxSession = {
  sessionId: string;
  totalMessages: number;
  lastMessageId: number;
  lastMessagePreview: string;
  kind?: 'patient' | 'pre_patient' | 'unknown';
  displayName?: string;
  is_read?: boolean;
  category?: 'atendimento' | 'agendamento' | 'administrativo';
};

export function extractMessageText(message: any): string {
  if (!message) return '';
  if (typeof message === 'string') return message;
  
  // No formato da tabela 'messages', a mensagem costuma estar direta ou em message.text/content
  if (typeof message?.text === 'string') return message.text;
  if (typeof message?.content === 'string') return message.content;
  
  if (typeof message?.message?.conversation === 'string') return message.message.conversation;
  if (typeof message?.message?.extendedTextMessage?.text === 'string') return message.message.extendedTextMessage.text;

  return typeof message === 'object' ? JSON.stringify(message) : String(message);
}

export async function listMedxSessions(limitRows: number = 500): Promise<MedxSession[]> {
  const { data, error } = await supabase
    .from('medx_history')
    .select('id, session_id, message, is_read, category')
    .order('id', { ascending: false })
    .limit(limitRows);

  if (error) throw error;

  const bySession = new Map<string, MedxSession>();

  (data as any[]).forEach((row) => {
    const existing = bySession.get(row.session_id);
    const preview = extractMessageText(row.message).slice(0, 120);
    if (!existing) {
      bySession.set(row.session_id, {
        sessionId: row.session_id,
        totalMessages: 1,
        lastMessageId: row.id,
        lastMessagePreview: preview,
        is_read: row.is_read ?? true,
        category: row.category ?? 'atendimento',
      });
    } else {
      existing.totalMessages += 1;
      if (row.id > existing.lastMessageId) {
        existing.lastMessageId = row.id;
        existing.lastMessagePreview = preview;
      }
    }
  });

  const sessions = Array.from(bySession.values());
  sessions.sort((a, b) => b.lastMessageId - a.lastMessageId);
  try {
    const [patientsResp, prePatientsResp] = await Promise.all([
      supabase.from('patients').select('id, name'),
      supabase.from('pre_patients').select('id, name'),
    ]);

    const patients = new Map<string, string>();
    const prePatients = new Map<string, string>();
    if (!patientsResp.error) {
      (patientsResp.data as { id: string; name: string }[] | null)?.forEach((p) => patients.set(p.id, p.name));
    }
    if (!prePatientsResp.error) {
      (prePatientsResp.data as { id: string; name: string }[] | null)?.forEach((p) => {
        if (p.id) prePatients.set(p.id, p.name || 'Sem nome');
      });
    }

    sessions.forEach((s) => {
      if (patients.has(s.sessionId)) {
        s.kind = 'patient';
        s.displayName = patients.get(s.sessionId);
      } else if (prePatients.has(s.sessionId)) {
        s.kind = 'pre_patient';
        s.displayName = prePatients.get(s.sessionId);
      } else {
        s.kind = 'unknown';
      }
    });
  } catch {
    sessions.forEach((s) => (s.kind = s.kind ?? 'unknown'));
  }

  return sessions;
}

export async function listMessagesBySession(sessionId: string): Promise<MedxHistoryRow[]> {
  const { data, error } = await supabase
    .from('medx_history')
    .select('id, session_id, message, created_at, media_url, sender_name')
    .eq('session_id', sessionId)
    .order('id', { ascending: true });

  if (error) throw error;
  
  return (data as any[]).map(row => ({
    id: row.id,
    session_id: row.session_id,
    message: row.message,
    data_e_hora: row.created_at,
    media: row.media_url,
    sender_name: row.sender_name
  })) as MedxHistoryRow[];
}

export async function markSessionAsRead(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('medx_history')
    .update({ is_read: true })
    .eq('session_id', sessionId)
    .eq('is_read', false); // Só atualiza as que estão como não lidas

  if (error) throw error;
}

export async function updateSessionCategory(sessionId: string, category: 'atendimento' | 'agendamento' | 'administrativo'): Promise<void> {
  const { error } = await supabase
    .from('medx_history')
    .update({ category })
    .eq('session_id', sessionId);

  if (error) throw error;
}


