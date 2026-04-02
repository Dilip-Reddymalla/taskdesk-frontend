import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useTasks } from '../hooks/useTasks';
import { useToast } from '../hooks/useToast';
import Modal from '../components/ui/Modal';
import PriorityBadge from '../components/ui/PriorityBadge';
import { Spinner } from '../components/ui/Loader';
import Button from '../components/ui/Button';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/pages/calendar.css';

const localizer = momentLocalizer(moment);

function CalendarPage() {
  const { fetchCalendar, reschedule, loading } = useTasks();
  const { addToast } = useToast();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  useEffect(() => { loadRange(new Date()); }, []);

  async function loadRange(date) {
    const start = moment(date).startOf('month').toISOString();
    const end   = moment(date).endOf('month').toISOString();
    const tasks = await fetchCalendar(start, end);
    const ev = (tasks ?? []).map(t => ({
      id: t._id,
      title: t.task?.title ?? t.title ?? 'Untitled',
      start: new Date(t.date),
      end:   new Date(t.date),
      resource: t,
    }));
    setEvents(ev);
  }

  const handleDropEvent = async ({ event, start }) => {
    try {
      await reschedule(event.id, moment(start).toISOString());
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, start, end: start } : e));
      addToast('Task rescheduled ✅', 'success');
    } catch (err) {
      addToast(err?.response?.data?.message ?? 'Failed to reschedule', 'error');
    }
  };

  const eventStyleGetter = (event) => {
    const priority = event.resource?.task?.priority ?? event.resource?.priority ?? 'low';
    const colors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
    const bg = colors[priority] ?? colors.low;
    return {
      style: {
        backgroundColor: bg + '22',
        borderLeft: `3px solid ${bg}`,
        borderRadius: '4px',
        color: 'var(--text-primary)',
        fontSize: '12px',
        padding: '2px 6px',
        opacity: event.resource?.status === 'completed' || event.resource?.isCompleted ? 0.6 : 1,
      },
    };
  };

  return (
    <div className="calendar-page page-container">
      <div className="calendar-page__header">
        <h1 className="calendar-page__title">Calendar</h1>
        {loading && <Spinner size="sm" />}
      </div>

      <div className="calendar-page__wrap card">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          date={currentDate}
          view={currentView}
          onNavigate={(newDate) => {
            setCurrentDate(newDate);
            loadRange(newDate);
          }}
          onView={(newView) => setCurrentView(newView)}
          onSelectEvent={(event) => setSelectedEvent(event.resource)}
          eventPropGetter={eventStyleGetter}
          onEventDrop={handleDropEvent}
          popup
        />
      </div>

      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.task?.title ?? selectedEvent?.title ?? ''}
        size="sm"
      >
        {selectedEvent && (
          <div className="calendar-event-detail">
            {selectedEvent.task?.description && (
              <p className="calendar-event-detail__desc">{selectedEvent.task.description}</p>
            )}
            <div className="calendar-event-detail__row">
              <span>Priority</span>
              <PriorityBadge priority={selectedEvent.task?.priority ?? 'low'} />
            </div>
            {selectedEvent.date && (
              <div className="calendar-event-detail__row">
                <span>Date</span>
                <span>{moment(selectedEvent.date).format('MMM D, YYYY')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button variant="ghost" onClick={() => setSelectedEvent(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CalendarPage;
