import { axiosInstance } from './axios.instance';
import { CalendarEvent } from '../../types';

const mapEvent = (backendEvent: any): CalendarEvent => ({
  _id: backendEvent._id || backendEvent.id,
  title: backendEvent.title || 'Untitled',
  description: backendEvent.description,
  type: backendEvent.type || 'meeting',
  startTime: backendEvent.start || backendEvent.startTime,
  endTime: backendEvent.end || backendEvent.endTime,
  date: (backendEvent.start || backendEvent.startTime).split('T')[0],
});

export const calendarApi = {
  getEvents: async (month: string): Promise<CalendarEvent[]> => {
    const { data } = await axiosInstance.get(`/calendar/events?month=${month}`);
    return (data.events || []).map(mapEvent);
  },
  createEvent: async (event: Omit<CalendarEvent, '_id'>): Promise<CalendarEvent> => {
    const { data } = await axiosInstance.post('/calendar/event', {
      ...event,
      start: event.startTime,
      end: event.endTime,
    });
    return mapEvent(data.event || data);
  },
  updateEvent: async (event: CalendarEvent): Promise<CalendarEvent> => {
    const { data } = await axiosInstance.put(`/calendar/event/${event._id}`, {
      ...event,
      start: event.startTime,
      end: event.endTime,
    });
    return mapEvent(data);
  },
  deleteEvent: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/calendar/event/${id}`);
  },
};
