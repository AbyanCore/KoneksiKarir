"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Hash } from "lucide-react";
import Image from "next/image";

interface Event {
  id: number;
  title: string;
  description: string | null;
  date: Date | string;
  location: string | null;
  bannerUrl: string | null;
  standNumber: string | null;
  participation?: any;
}

interface EventsCardsProps {
  events: Event[];
}

export default function EventsCards({ events }: EventsCardsProps) {
  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No events participated yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Participate in events to connect with job seekers
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <Card
          key={event.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
        >
          {event.bannerUrl && (
            <div className="relative h-40 w-full bg-gray-100">
              <Image
                src={event.bannerUrl}
                alt={event.title}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {event.title}
            </h3>

            {event.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {event.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(event.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}

              {event.standNumber && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <Badge variant="secondary">Stand {event.standNumber}</Badge>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
