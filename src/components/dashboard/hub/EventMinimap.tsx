import { MapPin } from "lucide-react";

interface EventMinimapProps {
  minimapUrl: string;
  title: string;
}

export default function EventMinimap({ minimapUrl, title }: EventMinimapProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm px-4 py-4 border-b border-slate-200">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Event Map</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Tap on company booths to view details
        </p>
        <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-lg">
          <img
            src={minimapUrl}
            alt={`${title} minimap`}
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            <MapPin className="h-16 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
