import Image from "next/image";
import type { CSSProperties } from "react";

import { getTimelineProgress, getTimelineSegments } from "../time";
import type { RoutineStep } from "../types";

type StepColorStyle = CSSProperties & { "--step-color": string };

type RoutineTimelineProps = {
  activeIndex: number;
  now: Date;
  steps: RoutineStep[];
};

export function RoutineTimeline({ activeIndex, now, steps }: RoutineTimelineProps) {
  if (steps.length === 0) return null;

  const segments = getTimelineSegments(steps);
  const progress = getTimelineProgress(steps, now);

  return (
    <aside className="routine-timeline" aria-hidden="true">
      <div className="routine-timeline__track">
        {segments.map((segment) => (
          <div
            className={`timeline-step ${segment.index === activeIndex ? "timeline-step--active" : ""}`}
            key={segment.step.id}
            style={
              {
                flexGrow: segment.durationMinutes,
                "--step-color": segment.step.color,
              } as StepColorStyle
            }
          >
            <span className="timeline-step__image">
              <Image
                alt=""
                fill
                loading="eager"
                sizes="(max-width: 760px) 40px, 100px"
                src={segment.step.image}
                unoptimized
              />
            </span>
          </div>
        ))}
        <div className="timeline-progress" style={{ top: `${progress * 100}%` }} />
      </div>
    </aside>
  );
}
