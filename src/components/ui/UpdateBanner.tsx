import { Button } from './Button';

interface UpdateBannerProps {
  onReload: () => void;
}

export function UpdateBanner({ onReload }: UpdateBannerProps) {
  return (
    <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-6 lg:bottom-6 lg:max-w-sm z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-xl flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Update available</p>
          <p className="text-xs text-slate-400">Reload to get the latest version.</p>
        </div>
        <Button size="sm" onClick={onReload}>Reload</Button>
      </div>
    </div>
  );
}
