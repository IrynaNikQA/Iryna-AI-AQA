import type { Page } from '@playwright/test';

export class AppNavigation {
  readonly dashboardLink;
  readonly programsLink;
  readonly calendarLink;
  readonly validationLink;
  readonly schedulerLink;
  readonly exportLink;
  readonly settingsLink;
  readonly signOutButton;

  constructor(private readonly page: Page) {
    this.dashboardLink = page.getByRole('button', { name: '📊 Dashboard' });
    this.programsLink = page.getByRole('button', { name: '🎓 Programs' });
    this.calendarLink = page.getByRole('button', { name: '📅 Calendar' });
    this.validationLink = page.getByRole('button', { name: '✅ Validation' });
    this.schedulerLink = page.getByRole('button', { name: '⚡ Scheduler' });
    this.exportLink = page.getByRole('button', { name: '📤 Export' });
    this.settingsLink = page.getByRole('button', { name: '⚙️ Settings' });
    this.signOutButton = page.getByRole('button', { name: 'Sign out' });
  }

  async goToDashboard() {
    await this.dashboardLink.click();
  }

  async goToPrograms() {
    await this.programsLink.click();
  }

  async signOut() {
    await this.signOutButton.click();
  }
}
