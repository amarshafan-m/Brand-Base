import { useState } from "react";
import { Button } from "./ui";

interface Props {
  onClose: () => void;
  onShowNotice: (msg: string) => void;
}

export function FeatureRequestModal({ onClose, onShowNotice }: Props) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !message.trim()) {
      setError("Please describe the feature you're requesting.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const WEBHOOK_URL = "https://formspree.io/f/mqpagwan"; 

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email || "Anonymous",
          message: message,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message. Please try again later.");
      }

      onShowNotice("Feature request sent successfully! Thank you.");
      onClose();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', width: '400px',
        border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Request a Feature</h2>
        {error && <div style={{ color: 'var(--error)', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Email (Optional)</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Feature Details</label>
            <textarea 
              value={message} 
              onChange={e => setMessage(e.target.value)}
              placeholder="What would you like to see added?"
              rows={5}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', resize: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Submit Request"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
