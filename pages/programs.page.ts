import type { Locator, Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation';
import { EditProgramModal } from './components/edit-program.modal';
import { NewProgramModal } from './components/new-program.modal';

export class ProgramsPage {
  readonly heading;
  readonly subtitle;
  readonly newProgramButton;
  readonly createProgramEmptyStateButton;
  readonly programColumnHeader;
  readonly navigation: AppNavigation;
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Programs', level: 2 });
    this.subtitle = page.getByText('Manage academic programs and semesters');
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.createProgramEmptyStateButton = page.getByRole('button', { name: 'Create Program' });
    this.programColumnHeader = page.getByRole('columnheader', { name: 'Program' });
    this.navigation = new AppNavigation(page);
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
  }

  async goto() {
    await this.page.goto('/programs');
    await this.newProgramButton.waitFor({ state: 'visible', timeout: 30_000 });
  }

  async openNewProgram() {
    await this.newProgramButton.click();
  }

  async openNewProgramModal() {
    await this.goto();
    await this.openNewProgram();
  }

  async openEditForProgram(programName: string) {
    await this.goto();
    await this.openEditFor(programName);
  }

  async openDeleteForProgram(programName: string) {
    await this.goto();
    await this.openDeleteFor(programName);
  }

  async createProgram(programName: string, description: string): Promise<string | undefined> {
    await this.openNewProgramModal();
    await this.newProgramModal.fillProgramName(programName);
    await this.newProgramModal.fillDescription(description);
    return this.newProgramModal.submitAndGetProgramId();
  }

  programText(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  textContaining(fragment: string): Locator {
    return this.page.getByText(fragment, { exact: false });
  }

  programRow(name: string): Locator {
    return this.page.getByRole('row').filter({ has: this.programText(name) });
  }

  editButtonFor(programName: string): Locator {
    return this.page.getByRole('button', { name: `Edit ${programName}` });
  }

  deleteButtonFor(programName: string): Locator {
    return this.page.getByRole('button', { name: `Delete ${programName}` });
  }

  async openEditFor(programName: string) {
    await this.editButtonFor(programName).click();
  }

  async openDeleteFor(programName: string) {
    await this.deleteButtonFor(programName).click();
  }
}
