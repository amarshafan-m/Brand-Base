import { createDefaultSettings } from "../domain/defaults";
import type { BrandBaseSettings } from "../domain/models";
import { validateSettings } from "../domain/validation";
import type { SettingsRepository } from "../repositories/contracts";

export class SettingsService {
  constructor(private readonly settings: SettingsRepository) {}
  getSettings = (): Promise<BrandBaseSettings> => this.settings.get();
  updateSettings = (settings: BrandBaseSettings): Promise<BrandBaseSettings> => this.settings.update(validateSettings(settings));
  resetToDefaults = (): Promise<BrandBaseSettings> => this.settings.update(createDefaultSettings());
}
