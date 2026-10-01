import type { ApplicationContainer } from "./container";

/** Development-only in-memory sample records. They are never persisted or bundled as a production data source. */
export async function seedDevelopmentData(container: ApplicationContainer): Promise<void> {
  if ((await container.brandService.getAll()).length > 0) return;

  const northstar = await container.brandService.create({ name: "Northstar Studio", description: "Editorial and documentary brand system." });
  const harbordesk = await container.brandService.create({ name: "Harbor Desk", description: "Corporate communication identity." });
  const frame = await container.brandService.create({ name: "Frame Society", description: "Motion design collective." });

  const northstarBlue = await container.colorService.create({ brandId: northstar.id, name: "Signal Blue", hex: "#3C6DF0", usage: "primary" });
  await container.colorService.create({ brandId: northstar.id, name: "Ink", hex: "#17191D", usage: "text" });
  await container.colorService.create({ brandId: harbordesk.id, name: "Harbor Green", hex: "#287860", usage: "primary" });
  await container.colorService.create({ brandId: frame.id, name: "Warm Coral", hex: "#E26756", usage: "accent" });

  await container.typographyService.create({ brandId: northstar.id, name: "Editorial Heading", role: "heading", fontFamily: "Source Sans 3", fontWeight: "700", fontSize: 44, lineHeight: 1.1, letterSpacing: -0.3, color: northstarBlue.hex, usage: "Editorial headlines" });
  await container.typographyService.create({ brandId: harbordesk.id, name: "Body Text", role: "body", fontFamily: "Adobe Clean", fontWeight: "400", fontSize: 16, lineHeight: 1.5, letterSpacing: 0, usage: "Internal communications" });

  const logo = await container.assetService.create({ brandId: northstar.id, name: "Northstar Primary Logo", type: "logo", category: "Logos", filePath: "demo/northstar-primary-logo.svg", extension: "svg", size: 24180, tags: ["approved", "vector"], status: "approved", version: "1.0.0", metadata: {} });
  const music = await container.assetService.create({ brandId: northstar.id, name: "Northstar Opening Bed", type: "music", category: "Background Music", filePath: "demo/northstar-opening-bed.wav", extension: "wav", size: 4920000, tags: ["intro", "licensed"], status: "approved", version: "1.0.0", metadata: {} });
  await container.assetService.create({ brandId: harbordesk.id, name: "Harbor Lower Third", type: "mogrt", category: "Lower Thirds", filePath: "demo/harbor-lower-third.mogrt", extension: "mogrt", size: 345000, tags: ["broadcast", "lower-third"], status: "draft", version: "0.8.0", metadata: {} });

  const brandPackage = await container.packageService.create({ brandId: northstar.id, name: "Northstar Editorial Starter", description: "Core assets for documentary edits.", assetIds: [logo.id, music.id] });
  await container.recentService.recordCreated(northstar.id, "brand");
  await container.recentService.recordCreated(logo.id, "asset");
  await container.recentService.recordViewed(brandPackage.id, "package");
}
