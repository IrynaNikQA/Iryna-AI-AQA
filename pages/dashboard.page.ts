import type { Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation';

export class DashboardPage {
  readonly heading;
  readonly welcomeText;
  readonly navigation: AppNavigation;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Dashboard111', level: 2 });
    this.welcomeText = page.getByText('Welcome to Didaxis Studio');
    this.navigation = new AppNavigation(page);
  }

  async goto() {
    await this.page.goto('/');
  }
}
