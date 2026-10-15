// frontend/src/components/InstallModal.jsx
import React, { useState, useEffect } from 'react';

export default function InstallModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'pwa' | 'apk'

  // Network IP detected for mobile access
  const networkIp = '172.16.58.196';
  const mobileUrl = `http://${networkIp}:5173`;

  useEffect(() => {
    // Listen for the PWA install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert('To install EcoTrack on mobile:\n\n• On Android Chrome: Tap the 3 dots (⋮) and tap "Install app" or "Add to Home screen".\n• On iPhone Safari: Tap the Share button (⎋) and select "Add to Home Screen" (⊞).');
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-outline-variant shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-5 right-5 text-outline hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-2xl">smartphone</span>
          </div>
          <div>
            <h2 className="text-title-md font-headline-md text-primary tracking-tight">Run EcoTrack on Your Phone</h2>
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              Install the app directly on your Android or iPhone device
            </p>
          </div>
        </div>

        {/* Tabs: QR Code vs Direct Install vs APK */}
        <div className="flex border-b border-outline-variant mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`pb-3 px-4 text-body-md font-title-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-b-2 border-primary text-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
            <span>Scan QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`pb-3 px-4 text-body-md font-title-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'border-b-2 border-primary text-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">install_mobile</span>
            <span>1-Click Install</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`pb-3 px-4 text-body-md font-title-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'apk'
                ? 'border-b-2 border-primary text-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">android</span>
            <span>Native APK</span>
          </button>
        </div>

        {/* TAB 1: QR CODE QUICK CONNECT */}
        {activeTab === 'qr' && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-surface-container-low rounded-2xl inline-block border border-outline-variant shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileUrl)}&color=003527&bgcolor=ffffff`}
                alt="Scan to open EcoTrack on phone"
                className="w-48 h-48 rounded-lg mx-auto"
              />
            </div>

            <div className="space-y-1">
              <div className="text-title-md font-title-md text-primary">Point your phone camera here</div>
              <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
                Make sure your phone is connected to the same Wi-Fi network as this computer.
              </p>
            </div>

            {/* Direct URL input with Copy */}
            <div className="flex items-center gap-2 max-w-md mx-auto bg-surface-container p-1.5 rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-outline text-lg pl-2">link</span>
              <input
                type="text"
                readOnly
                value={mobileUrl}
                className="bg-transparent text-body-sm font-mono text-primary flex-1 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-primary-container text-on-primary rounded-lg text-label-md font-title-md hover:bg-secondary transition-colors cursor-pointer"
              >
                {copied ? 'Copied! ✓' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PWA 1-CLICK INSTALL */}
        {activeTab === 'pwa' && (
          <div className="space-y-5">
            <div className="bg-secondary-container/20 p-4 rounded-xl border border-secondary/30 flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-2xl mt-0.5 fill-1">verified</span>
              <div>
                <h4 className="text-title-md font-title-md text-primary">Progressive Web App (PWA)</h4>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Installs as a standalone mobile app with its own icon on your phone home screen, fast offline caching, and fullscreen display without browser address bars.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined">android</span>
                  </div>
                  <div>
                    <div className="text-title-md font-title-md text-on-surface">Android Device</div>
                    <div className="text-label-sm text-outline">Open in Chrome or Edge -> Tap "Install"</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-primary-container text-on-primary rounded-lg text-body-md font-title-md hover:bg-secondary transition-colors cursor-pointer"
                >
                  {isInstalled ? 'Installed ✓' : 'Install App'}
                </button>
              </div>

              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined">apple</span>
                  </div>
                  <div>
                    <div className="text-title-md font-title-md text-on-surface">iPhone / iPad (iOS)</div>
                    <div className="text-label-sm text-outline">Open in Safari -> Tap Share -> "Add to Home Screen"</div>
                  </div>
                </div>
                <span className="text-label-sm text-secondary font-semibold">Native iOS PWA</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CAPACITOR ANDROID APK */}
        {activeTab === 'apk' && (
          <div className="space-y-4">
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-2">
              <div className="flex items-center gap-2 text-title-md font-title-md text-primary">
                <span className="material-symbols-outlined text-secondary">build</span>
                <span>Capacitor Android Project Ready</span>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                The project includes Capacitor mobile support. You can build a release APK directly using Android Studio or command line.
              </p>
            </div>

            <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-xl font-mono text-body-sm space-y-2 overflow-x-auto">
              <div className="text-label-sm text-outline font-sans"># Step 1: Build the web assets</div>
              <div className="text-secondary-fixed">npm run build</div>
              <div className="text-label-sm text-outline font-sans"># Step 2: Sync to Android</div>
              <div className="text-secondary-fixed">npx cap sync android</div>
              <div className="text-label-sm text-outline font-sans"># Step 3: Open in Android Studio & Generate APK</div>
              <div className="text-secondary-fixed">npx cap open android</div>
            </div>

            <p className="text-label-sm text-outline text-center">
              Output APK path: <code className="text-primary font-mono font-bold">android/app/build/outputs/apk/debug/app-debug.apk</code>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-outline-variant/60 flex items-center justify-between text-label-sm text-outline">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            Local Hub: {networkIp}:5173
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
