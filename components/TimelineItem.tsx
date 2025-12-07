import React from 'react';
import { AgendaItem } from '../types';
import { Clock, User } from 'lucide-react';

interface TimelineItemProps {
  item: AgendaItem;
  startTime: string; // calculated start time for display
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ item, startTime, isLast }) => {
  return (
    <div className="flex gap-4">
      {/* Time Column */}
      <div className="flex flex-col items-end w-20 pt-1">
        <span className="text-sm font-bold text-gray-900">{startTime}</span>
        <span className="text-xs text-gray-500">{item.durationMinutes} min</span>
      </div>

      {/* Timeline Graphic */}
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-white border-2 border-primary z-10"></div>
        {!isLast && <div className="w-0.5 bg-gray-200 flex-grow my-1"></div>}
      </div>

      {/* Content Card */}
      <div className="flex-1 pb-8">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.topic}</h3>
          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{item.presenter || "Unassigned"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{item.durationMinutes} minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
