/** User-visible copy and API error strings — single source of truth for assertions. */
export enum ProgramMessages {
  DuplicateName = 'A program with this name already exists',
  NameRequired = 'Program name is required',
}

export enum AppRoutes {
  Programs = '/programs',
  Dashboard = '/dashboard',
}
