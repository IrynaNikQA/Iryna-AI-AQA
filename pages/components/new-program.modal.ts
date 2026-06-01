import type { Page } from '@playwright/test';
import {
  programIdFromCreateResponse,
  waitForProgramCreateResponse,
} from '../../support/program-api.helpers';

export class NewProgramModal {
  readonly dialog;
  readonly heading;
  readonly programNameInput;
  readonly descriptionInput;
  readonly createButton;
  readonly cancelButton;
  readonly duplicateErrorMessage;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog');
    this.heading = page.getByRole('heading', { name: 'New Program' });
    this.programNameInput = this.dialog.getByLabel('Program Name');
    this.descriptionInput = this.dialog.getByLabel('Description');
    this.createButton = this.dialog.getByRole('button', { name: 'Create', exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.duplicateErrorMessage = page
      .getByText(/already exists|duplicate|exist|taken|unique/i)
      .first();
  }

  async fillProgramName(name: string) {
    await this.programNameInput.fill(name);
  }

  async fillDescription(description: string) {
    await this.descriptionInput.fill(description);
  }

  async submit() {
    await this.createButton.click();
  }

  async cancel() {
    if (await this.cancelButton.isVisible()) {
      await this.cancelButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  async fillAndSubmit(name: string, description: string) {
    await this.fillProgramName(name);
    await this.fillDescription(description);
    await this.submit();
  }

  async submitAndGetProgramId(): Promise<string | undefined> {
    const responsePromise = waitForProgramCreateResponse(this.page);
    await this.submit();
    return programIdFromCreateResponse(await responsePromise);
  }
}
