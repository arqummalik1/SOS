// Dashboard state types - using React hooks instead of Zustand for simplicity
export interface DashboardState {
  selectedOccasion: string;
  selectedItemIndex: number | null;
  selectedDay: string;
}

export const OCCASIONS = ['Casual', 'Work outfit', 'Party', 'Formal'];
export const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const INITIAL_DASHBOARD_STATE: DashboardState = {
  selectedOccasion: 'Work outfit',
  selectedItemIndex: null,
  selectedDay: 'W',
};
