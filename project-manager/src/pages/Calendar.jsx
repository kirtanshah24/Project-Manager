import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useProjects } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';

const Calendar = () => {
  const { projects, tasks } = useProjects();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      console.log(`Clicked project ${id}`);
    } else if (type === 'task') {
      navigate('/tasks');
    }
  };

  // Mobile-optimized calendar configuration
  const getCalendarConfig = () => {
    const baseConfig = {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      events: allEvents,
      eventClick: handleEventClick,
      height: 'auto',
      eventDisplay: 'block',
      dayMaxEvents: isMobile ? 2 : 4,
      moreLinkClick: 'popover',
      eventTimeFormat: {
        hour: 'numeric',
        minute: '2-digit',
        meridiem: 'short'
      },
      // Mobile-specific settings
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      weekends: true,
      editable: false,
      droppable: false,
    };

    if (isMobile) {
      return {
        ...baseConfig,
        initialView: 'listWeek',
        headerToolbar: {
          left: 'prev,next',
          center: 'title',
          right: 'listWeek,dayGridMonth'
        },
        views: {
          dayGridMonth: {
            dayMaxEvents: 2,
            moreLinkContent: (args) => `+${args.num} more`,
          },
          listWeek: {
            listDayFormat: { weekday: 'short', month: 'short', day: 'numeric' },
            listDaySideFormat: { year: 'numeric' },
          }
        },
        eventDisplay: 'list-item',
        eventDidMount: (info) => {
          // Add mobile-friendly styling
          info.el.style.fontSize = '14px';
          info.el.style.padding = '4px 8px';
        }
      };
    } else {
      return {
        ...baseConfig,
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        views: {
          dayGridMonth: {
            dayMaxEvents: 4,
          },
          timeGridWeek: {
            slotMinTime: '08:00:00',
            slotMaxTime: '20:00:00',
          }
        }
      };
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="px-4 lg:px-0">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-sm lg:text-base text-gray-600">
          Visualize your project timelines and task deadlines.
        </p>
      </div>
      
      {/* Mobile View Toggle */}
      {isMobile && (
        <div className="px-4 lg:px-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Quick Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {projects.filter(p => p.status === 'active').length}
                </div>
                <div className="text-xs text-gray-500">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-yellow-600">
                  {tasks.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-500">Pending Tasks</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-2 lg:p-6">
          <FullCalendar {...getCalendarConfig()} />
        </div>
      </div>

      {/* Mobile Event Legend */}
      {isMobile && (
        <div className="px-4 lg:px-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Projects</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Pending Tasks</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Completed Tasks</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar; 