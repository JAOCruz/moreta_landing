/**
 * Moreta Fitness Dashboard - Core Data Structures
 */

// 1. Horario de Clientes (Schedule)
export type ScheduleType = "RECURRING" | "ONE_OFF";

export interface ScheduleSlot {
  id: string;
  clientId: string;
  clientName: string;
  dayOfWeek?: number; // 0-6 for recurring
  date?: string; // ISO date for one-off
  startTime: string; // HH:mm
  endTime: string;
  type: ScheduleType;
  notes?: string;
}

// 2. Recordatorio de Pagos (Payments)
export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE";

export interface ClientPayment {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  lastPaymentDate?: string;
}

// 3. Diseño de Rutina (Workouts)
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string; // e.g. "60s"
  weight?: string;
}

export interface WorkoutRoutine {
  id: string;
  clientId: string;
  name: string; // e.g. "Día A: Empuje"
  exercises: Exercise[];
}

// 4. Monitor de Bienestar (Wellness)
export interface WellnessEntry {
  id: string;
  clientId: string;
  date: string;
  sleepHours: number;
  dietScore: number; // 1-10
  stressLevel: number; // 1-10
  waterLiters: number;
}
