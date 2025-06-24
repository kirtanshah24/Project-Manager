import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { useProjects } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';

const Calendar = () => {
  const { projects, tasks } = useProjects();
  const navigate = useNavigate();

  const projectEvents = projects
    .filter(p => p.startDate && p.endDate)
    .map(project => ({
      id: `proj_${project.id}`,
      title: project.name,
      start: project.startDate,
      end: project.endDate,
      backgroundColor: '#3b82f6', // blue-500
      borderColor: '#3b82f6',
      extendedProps: {
        type: 'project',
        id: project.id,
      }
    }));

  const taskEvents = tasks
    .filter(t => t.dueDate)
    .map(task => ({
      id: `task_${task.id}`,
      title: task.title,
      start: task.dueDate,
      allDay: true,
      backgroundColor: task.status === 'completed' ? '#10b981' : '#f59e0b', // green-500, yellow-500
      borderColor: task.status === 'completed' ? '#10b981' : '#f59e0b',
      extendedProps: {
        type: 'task',
        id: task.id,
      }
    }));
  
  const allEvents = [...projectEvents, ...taskEvents];

  const handleEventClick = (clickInfo) => {
    const { type, id } = clickInfo.event.extendedProps;
    if (type === 'project') {
      // For now, let's just log it. A future feature could be a project detail page.
      console.log(`Clicked project ${id}`);
    } else if (type === 'task') {
      // Navigate to the tasks page. A future feature could highlight the specific task.
      navigate('/tasks');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600">Visualize your project timelines and task deadlines.</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
          }}
          events={allEvents}
          eventClick={handleEventClick}
          height="auto" 
        />
      </div>
    </div>
  );
};

export default Calendar; 