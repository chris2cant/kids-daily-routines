export type Activity = {
  id: string;
  label: string;
  image: string;
  color: string;
};

export type FlowStep = {
  id: string;
  activityId: string;
  startTime: string;
};

export type Routine = {
  id: string;
  label: string;
  enabled: boolean;
  days: number[];
  steps: FlowStep[];
};

export type RoutineSettingsData = {
  activities: Activity[];
  routines: Routine[];
};

export type RoutineStep = FlowStep & Activity;

export type ManualOverride = {
  index: number;
  direction: "forward" | "backward";
};
