export const EXERCISE_DB = {
  legs: [
    { id: 'l1', name: 'Barbell Squat', type: 'compound' },
    { id: 'l2', name: 'Leg Press', type: 'machine' },
    { id: 'l3', name: 'Bulgarian Split Squat', type: 'accessory' },
    { id: 'l4', name: 'Leg Extension', type: 'isolation' },
    { id: 'l5', name: 'RDL (Romanian Deadlift)', type: 'compound' },
    // Nuevos añadidos para la rutina
    { id: 'l6', name: 'Lying Leg Curl', type: 'machine' },
    { id: 'l7', name: 'Standing Calf Raise', type: 'isolation' },
    { id: 'l8', name: 'Walking Lunges', type: 'accessory' },
    { id: 'l9', name: 'Hip Thrust', type: 'compound' }
  ],
  chest: [
    { id: 'c1', name: 'Bench Press', type: 'compound' },
    { id: 'c2', name: 'Incline Dumbbell Press', type: 'compound' },
    { id: 'c3', name: 'Cable Fly', type: 'isolation' },
    { id: 'c4', name: 'Pushups', type: 'bodyweight' },
    // Nuevos añadidos para la rutina
    { id: 'c5', name: 'Dips (Chest Focus)', type: 'bodyweight' },
    { id: 'c6', name: 'Pec Deck', type: 'machine' },
    { id: 'c7', name: 'Smith Machine Incline Press', type: 'machine' }
  ],
  back: [
    { id: 'b1', name: 'Pull Ups', type: 'bodyweight' },
    { id: 'b2', name: 'Bent Over Row', type: 'compound' },
    { id: 'b3', name: 'Lat Pulldown', type: 'machine' },
    { id: 'b4', name: 'Seated Cable Row', type: 'machine' },
    // Nuevos añadidos para la rutina
    { id: 'b5', name: 'One Arm Dumbbell Row', type: 'accessory' },
    { id: 'b6', name: 'Back Extension', type: 'accessory' }
  ],
  shoulders: [
    { id: 's1', name: 'Overhead Press', type: 'compound' },
    { id: 's2', name: 'Lateral Raise', type: 'isolation' },
    { id: 's3', name: 'Face Pulls', type: 'accessory' },
    // Nuevos añadidos para la rutina
    { id: 's4', name: 'Dumbbell Shoulder Press', type: 'compound' },
    { id: 's5', name: 'External Rotation (Cable/Band)', type: 'warmup' },
    { id: 's6', name: 'Band Pull-Aparts', type: 'warmup' }
  ],
  arms: [
    { id: 'a1', name: 'Bicep Curl', type: 'isolation' },
    { id: 'a2', name: 'Tricep Extension', type: 'isolation' },
    { id: 'a3', name: 'Hammer Curl', type: 'isolation' },
    // Nuevos añadidos para la rutina
    { id: 'a4', name: 'EZ Bar Curl', type: 'isolation' },
    { id: 'a5', name: 'Skullcrushers / French Press', type: 'isolation' }
  ]
};