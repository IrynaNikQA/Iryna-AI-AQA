import type { Page } from '@playwright/test';

export class EditProgramModal {
  readonly dialog;
  readonly heading;
  readonly programNameInput;
  readonly descriptionInput;
  readonly saveButton;
  readonly cancelButton;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog');
    this.heading = page.getByRole('heading', { name: /Edit Program/i });
    this.programNameInput = this.dialog
      .getByLabel('Program Name')
      .or(this.dialog.getByLabel('Name'));
    this.descriptionInput = this.dialog.getByLabel('Description');
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async fillProgramName(name: string) {
    await this.programNameInput.fill(name);
  }

  async fillDescription(description: string) {
    await this.descriptionInput.fill(description);
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    if (await this.cancelButton.isVisible()) {
      await this.cancelButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }
}
