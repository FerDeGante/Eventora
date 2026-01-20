"use client";

import { forwardRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { DateClickArg, DatesSetArg, EventClickArg, EventContentArg } from "@fullcalendar/core";
import type { Reservation } from "@/lib/admin-api";

export type CalendarViewMode = "timeGridWeek" | "timeGridDay" | "dayGridMonth";

export type CalendarRangeInfo = {
  start: Date;
  end: Date;
  title: string;
  viewType: CalendarViewMode;
};

type StatusConfig = Record<string, { color: string; bg: string; label: string }>;

type CalendarViewProps = {
  reservations: Reservation[];
  statusConfig: StatusConfig;
  onSelectReservation: (reservation: Reservation) => void;
  onSelectSlot: (slot: { date: Date; hour: number }) => void;
  onDatesChange: (info: CalendarRangeInfo) => void;
};

const viewTypes: CalendarViewMode[] = ["timeGridWeek", "timeGridDay", "dayGridMonth"];

const CalendarView = forwardRef<FullCalendar | null, CalendarViewProps>(
  ({ reservations, statusConfig, onSelectReservation, onSelectSlot, onDatesChange }, ref) => {
    const events = useMemo(
      () =>
        reservations.map((reservation) => ({
          id: reservation.id,
          title: reservation.service?.name ?? "Servicio",
          start: reservation.startAt,
          end: reservation.endAt,
          backgroundColor: statusConfig[reservation.status]?.bg,
          borderColor: statusConfig[reservation.status]?.color,
          textColor: "var(--text-primary)",
          extendedProps: {
            reservation,
            status: reservation.status,
          },
        })),
      [reservations, statusConfig],
    );

    const handleDatesSet = (info: DatesSetArg) => {
      const viewType = viewTypes.includes(info.view.type as CalendarViewMode)
        ? (info.view.type as CalendarViewMode)
        : "timeGridWeek";
      onDatesChange({
        start: info.start,
        end: info.end,
        title: info.view.title,
        viewType,
      });
    };

    const handleDateClick = (info: DateClickArg) => {
      if (info.view.type === "dayGridMonth") {
        info.view.calendar.changeView("timeGridDay", info.date);
        return;
      }
      const hour = info.date.getHours();
      onSelectSlot({ date: info.date, hour: hour || 9 });
    };

    const handleEventClick = (info: EventClickArg) => {
      const reservation = info.event.extendedProps.reservation as Reservation | undefined;
      if (reservation) {
        onSelectReservation(reservation);
      }
    };

    const renderEventContent = (arg: EventContentArg) => {
      const reservation = arg.event.extendedProps.reservation as Reservation | undefined;
      return (
        <div className="fc-event-card">
          <span className="fc-event-time">{arg.timeText}</span>
          <span className="fc-event-title">{reservation?.user?.name || "Cliente"}</span>
          <span className="fc-event-service">{reservation?.service?.name || "Servicio"}</span>
        </div>
      );
    };

    return (
      <div className="calendar-wrapper">
        <FullCalendar
          ref={ref}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          locale={esLocale}
          events={events}
          selectable
          nowIndicator
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          expandRows
          height="auto"
          dayMaxEventRows={3}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          eventDidMount={(info) => {
            const reservation = info.event.extendedProps.reservation as Reservation | undefined;
            info.el.title = reservation
              ? `${reservation.user?.name || "Cliente"} · ${reservation.service?.name || "Servicio"}`
              : info.event.title;
          }}
          eventClassNames={(arg) => {
            const status = String(arg.event.extendedProps.status || "default").toLowerCase();
            return [`fc-event--${status}`];
          }}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        />

        <style jsx global>{`
          .calendar-wrapper {
            background: var(--surface-base);
          }

          .calendar-wrapper .fc {
            font-family: var(--font-sans, "Inter");
            --fc-border-color: var(--border-subtle);
            --fc-page-bg-color: var(--surface-base);
            --fc-neutral-bg-color: var(--surface-elevated);
            --fc-today-bg-color: rgba(56, 189, 248, 0.12);
            --fc-now-indicator-color: var(--accent-primary);
            color: var(--text-primary);
          }

          .calendar-wrapper .fc .fc-scrollgrid,
          .calendar-wrapper .fc .fc-scrollgrid-section-body > td {
            border-color: var(--border-subtle);
          }

          .calendar-wrapper .fc .fc-timegrid-slot {
            height: 42px;
          }

          .calendar-wrapper .fc .fc-col-header-cell-cushion,
          .calendar-wrapper .fc .fc-timegrid-axis-cushion,
          .calendar-wrapper .fc .fc-daygrid-day-number {
            color: var(--text-secondary);
            font-weight: 500;
          }

          .calendar-wrapper .fc .fc-daygrid-day-number {
            padding: 0.5rem;
          }

          .calendar-wrapper .fc .fc-timegrid-axis {
            background: var(--surface-elevated);
          }

          .calendar-wrapper .fc .fc-timegrid-divider,
          .calendar-wrapper .fc .fc-scrollgrid-section-header > td {
            background: var(--surface-elevated);
          }

          .calendar-wrapper .fc .fc-day-today {
            background: rgba(56, 189, 248, 0.12) !important;
          }

          .calendar-wrapper .fc .fc-event {
            border-radius: 10px;
            border: 1px solid;
            padding: 4px 6px;
            box-shadow: none;
          }

          .calendar-wrapper .fc .fc-event:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .calendar-wrapper .fc .fc-event-card {
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: 0.75rem;
            line-height: 1.2;
          }

          .calendar-wrapper .fc .fc-event-time {
            font-weight: 600;
            font-size: 0.7rem;
            color: var(--text-primary);
          }

          .calendar-wrapper .fc .fc-event-title {
            font-weight: 600;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .calendar-wrapper .fc .fc-event-service {
            color: var(--text-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .calendar-wrapper .fc .fc-daygrid-event-dot {
            display: none;
          }

          .calendar-wrapper .fc .fc-daygrid-event {
            border-radius: 999px;
            padding: 2px 8px;
          }

          .calendar-wrapper .fc .fc-daygrid-more-link {
            color: var(--text-secondary);
            font-size: 0.75rem;
          }
        `}</style>
      </div>
    );
  },
);

CalendarView.displayName = "CalendarView";

export default CalendarView;
