import type { Page } from '@playwright/test';

export class LoginPage {
  readonly emailInput;
  readonly passwordInput;
  readonly signInButton;
  readonly heading;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.heading = page.getByText('Sign in to your account');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async signIn() {
    await this.signInButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.signIn();
  }
}
