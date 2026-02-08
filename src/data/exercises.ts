// src/data/exercises.ts
export const EXERCISE_DB = {
  legs: [
    { id: 'l1', name: 'Barbell Squat', type: 'compound' },
    { id: 'l2', name: 'Leg Press', type: 'machine' },
    { id: 'l3', name: 'Bulgarian Split Squat', type: 'accessory' },
    { id: 'l4', name: 'Leg Extension', type: 'isolation' },
    { id: 'l5', name: 'RDL', type: 'compound' }
  ],
  chest: [
    { id: 'c1', name: 'Bench Press', type: 'compound' },
    { id: 'c2', name: 'Incline Dumbbell Press', type: 'compound' },
    { id: 'c3', name: 'Cable Fly', type: 'isolation' },
    { id: 'c4', name: 'Pushups', type: 'bodyweight' }
  ],
  back: [
    { id: 'b1', name: 'Pull Ups', type: 'bodyweight' },
    { id: 'b2', name: 'Bent Over Row', type: 'compound' },
    { id: 'b3', name: 'Lat Pulldown', type: 'machine' },
    { id: 'b4', name: 'Seated Row', type: 'machine' }
  ],
  shoulders: [
    { id: 's1', name: 'Overhead Press', type: 'compound' },
    { id: 's2', name: 'Lateral Raise', type: 'isolation' },
    { id: 's3', name: 'Face Pulls', type: 'accessory' }
  ],
  arms: [
    { id: 'a1', name: 'Bicep Curl', type: 'isolation' },
    { id: 'a2', name: 'Tricep Extension', type: 'isolation' },
    { id: 'a3', name: 'Hammer Curl', type: 'isolation' }
  ]
};

export type BodyPart = keyof typeof EXERCISE_DB;
