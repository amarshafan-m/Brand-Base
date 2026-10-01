import { Badge, Button } from "../components/ui";
import { libraryManager } from "../filesystem/LibraryManager";
import { reinitializeApplication } from "../app/application";

interface Props {
  onInitialized: () => void;
  onShowNotice: (msg: string) => void;
}

export function WelcomePage({ onInitialized, onShowNotice }: Props) {
  const handleChooseLibrary = async () => {
    try {
      const success = await libraryManager.chooseLibrary();
      if (success) {
        onShowNotice("Library initialized successfully.");
        await reinitializeApplication();
        onInitialized();
      }
    } catch (e) {
      onShowNotice("Failed to choose library: " + String(e));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: 'var(--bg-main)', color: 'var(--text-main)', padding: '40px', textAlign: 'center' }}>
      <div style={{ maxWidth: '480px' }}>
        <Badge tone="accent">WELCOME TO BRAND BASE</Badge>
        <h2 style={{ fontSize: '24px', margin: '20px 0 12px 0', lineHeight: 1.3 }}>Create your local Brand Base library to organize your creative assets.</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px', lineHeight: 1.5 }}>Set up a local Brand Base library to get started. Your files stay under your control.</p>
        <Button icon="folder" onClick={handleChooseLibrary} variant="primary" style={{ margin: '0 auto' }}>Choose Library Location</Button>
      </div>
    </div>
  );
}
