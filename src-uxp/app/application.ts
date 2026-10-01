import { createApplicationContainer, createUxpApplicationContainer, type ApplicationContainer } from "../services/container";
import { seedDevelopmentData } from "../services/seed";
import { libraryManager } from "../filesystem/LibraryManager";

export let applicationContainer = createApplicationContainer();
let initialization: Promise<ApplicationContainer> | undefined;

export const setContainer = (container: ApplicationContainer) => {
  applicationContainer = container;
}

export const reinitializeApplication = async (): Promise<ApplicationContainer> => {
  if (await libraryManager.loadLibrary()) {
    applicationContainer = createUxpApplicationContainer();
  } else {
    applicationContainer = createApplicationContainer();
  }
  return applicationContainer;
}

export const initializeApplication = (): Promise<ApplicationContainer> => {
  if (!initialization) {
    initialization = (async () => {
      await reinitializeApplication();
      return applicationContainer;
    })();
  }
  return initialization;
};
