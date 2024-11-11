<template>
    <div class="calendar-container">
      <h1 class="calendar-main-header">Upcoming Lessons</h1>
      <div class="calendar-content">
        <div class="calendar-main">
          <div class="calendar-header">
            <div class="calendar-nav">
              <button @click="previousMonth" class="nav-button">
                <i class="bi bi-chevron-left"></i>
              </button>
              <h2>{{ currentMonthYear }}</h2>
              <button @click="nextMonth" class="nav-button">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
            <button @click="goToToday" class="today-button">Today</button>
          </div>
          <div class="calendar-body">
            <div class="calendar-grid" :class="{ 'calendar-grid-small': isSmallScreen }">
              <div v-for="day in daysOfWeek" :key="day" class="calendar-day-header">{{ day }}</div>
              <div
                v-for="{ date, events } in calendarDays"
                :key="date.toISOString()"
                class="calendar-day"
                :class="{ 
                  'current-month': isCurrentMonth(date), 
                  'has-events': events.length > 0,
                  'today': isToday(date),
                  'selected': isSelectedDate(date)
                }"
                @click="selectDate(date, events)"
              >
                <span class="day-number">{{ date.getDate() }}</span>
                <div v-if="events.length > 0" class="event-indicators">
                  <div 
                    v-for="event in events.slice(0, 3)" 
                    :key="event.id" 
                    class="event-indicator"
                    :class="{ 'teacher-event': event.role === 'Teacher', 'student-event': event.role === 'Student' }"
                  >
                    {{ event.title }}
                  </div>
                  <div v-if="events.length > 3" class="more-events">+{{ events.length - 3 }} more</div>
                </div>
              </div>
            </div>
          </div>
          <div class="calendar-legend">
            <div class="legend-item">
              <div class="legend-color teacher-event"></div>
              <span>Teacher Events</span>
            </div>
            <div class="legend-item">
              <div class="legend-color student-event"></div>
              <span>Student Events</span>
            </div>
          </div>
        </div>
        <div class="event-sidebar">
          <div class="event-date-header">
            <h3>{{ formatSelectedDate }}</h3>
          </div>
          <div class="event-list" v-if="selectedEvents.length > 0">
            <div v-for="event in selectedEvents" :key="event.id" class="event-item" :class="{ 'teacher-event': event.role === 'Teacher', 'student-event': event.role === 'Student' }">
              <div class="event-time">{{ event.startTime }} - {{ event.endTime }}</div>
              <div class="event-title">{{ event.title }}</div>
              <div class="event-location">
                <i class="bi bi-geo-alt"></i> {{ event.location }}
              </div>
              <div class="event-details">
                <span class="event-role">{{ event.role }}</span>
                <span class="event-lesson">Lesson {{ event.lessonNumber }} of {{ event.totalLessons }}</span>
              </div>
            </div>
          </div>
          <div v-else class="no-events">No events for this day</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { getAuth } from 'firebase/auth';
  import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
  import { db } from '../firebase/firebase_config';
  
  export default {
    name: 'Calendar',
    setup() {
      const currentDate = ref(new Date());
      const events = ref([]);
      const selectedDate = ref(new Date());
      const selectedEvents = ref([]);
      const isSmallScreen = ref(false);
  
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
      const currentMonthYear = computed(() => {
        return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' });
      });
  
      const formatSelectedDate = computed(() => {
        if (!selectedDate.value) return 'No date selected';
        return selectedDate.value.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      });
  
      const calendarDays = computed(() => {
        const year = currentDate.value.getFullYear();
        const month = currentDate.value.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
  
        const days = [];
  
        // Add days from previous month
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
          const date = new Date(year, month, -i);
          days.push({ date, events: getEventsForDate(date) });
        }
  
        // Add days of current month
        for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(year, month, i);
          days.push({ date, events: getEventsForDate(date) });
        }
  
        // Add days from next month
        const remainingDays = isSmallScreen.value ? 35 - days.length : 42 - days.length; // 5 or 6 rows
        for (let i = 1; i <= remainingDays; i++) {
          const date = new Date(year, month + 1, i);
          days.push({ date, events: getEventsForDate(date) });
        }
  
        return days;
      });
  
      const isCurrentMonth = (date) => {
        return date.getMonth() === currentDate.value.getMonth();
      };
  
      const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
      };
  
      const isSelectedDate = (date) => {
        return selectedDate.value && 
               date.getDate() === selectedDate.value.getDate() &&
               date.getMonth() === selectedDate.value.getMonth() &&
               date.getFullYear() === selectedDate.value.getFullYear();
      };
  
      const previousMonth = () => {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
      };
  
      const nextMonth = () => {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
      };
  
      const goToToday = () => {
        currentDate.value = new Date();
        selectDate(currentDate.value, getEventsForDate(currentDate.value));
      };
  
      const selectDate = (date, dayEvents) => {
        selectedDate.value = date;
        selectedEvents.value = dayEvents;
      };
  
      const getEventsForDate = (date) => {
        return events.value.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getDate() === date.getDate() &&
                 eventDate.getMonth() === date.getMonth() &&
                 eventDate.getFullYear() === date.getFullYear();
        });
      };
  
      const fetchEvents = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
  
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            console.error("User document not found");
            return;
          }
  
          const userData = userDoc.data();
          const fetchedEvents = [];
  
          // Fetch student classes
          const studentClasses = userData.upcoming_classes_as_student || [];
          for (const classId of studentClasses) {
            await fetchClassEvents(classId, 'Student', fetchedEvents);
          }
  
          // Fetch teacher classes
          const teacherClasses = userData.upcoming_classes_as_teacher || [];
          for (const classId of teacherClasses) {
            await fetchClassEvents(classId, 'Teacher', fetchedEvents);
          }
  
          events.value = fetchedEvents;
          console.log("Fetched events:", fetchedEvents);
        } catch (error) {
          console.error("Error fetching events: ", error);
        }
      };
  
      const fetchClassEvents = async (classId, role, fetchedEvents) => {
        const classDoc = await getDoc(doc(db, 'classes', classId));
        if (classDoc.exists()) {
          const classData = classDoc.data();
          const startDate = classData.start_date.toDate();
          const endDate = classData.completion_date ? classData.completion_date.toDate() : new Date(startDate.getTime() + (classData.number_of_lessons * 7 * 24 * 60 * 60 * 1000));
  
          for (let i = 0; i < classData.number_of_lessons; i++) {
            const lessonDate = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
            if (lessonDate <= endDate) {
              fetchedEvents.push({
                id: `${classId}-lesson-${i + 1}`,
                title: classData.title,
                date: lessonDate,
                startTime: formatTime(classData.start_time),
                endTime: formatTime(classData.end_time),
                role: role,
                lessonNumber: i + 1,
                totalLessons: classData.number_of_lessons,
                location: classData.location || 'Location not specified'
              });
            }
          }
        }
      };
  
      const formatTime = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      };
  
      const checkScreenSize = () => {
        isSmallScreen.value = window.innerWidth < 768;
      };
  
      onMounted(() => {
        fetchEvents();
        goToToday();
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
      });
  
      onUnmounted(() => {
        window.removeEventListener('resize', checkScreenSize);
      });
  
      return {
        currentMonthYear,
        calendarDays,
        daysOfWeek,
        isCurrentMonth,
        isToday,
        isSelectedDate,
        previousMonth,
        nextMonth,
        goToToday,
        selectDate,
        selectedDate,
        selectedEvents,
        formatSelectedDate,
        isSmallScreen
      };
    }
  };
  </script>
  
  <style scoped>
  .calendar-container {
    font-family: 'Roboto', sans-serif;
    background-color: #ffffff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    color: #333;
  }
  
  .calendar-main-header {
    background-color: #5a7dee;
    color: #ffffff;
    padding: 1rem 2rem;
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .calendar-content {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
  }
  
  .calendar-main {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #f8f9fa;
    color: #5a7dee;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .calendar-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .calendar-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 500;
  }
  
  .nav-button, .today-button {
    background: none;
    border: none;
    color: #5a7dee;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  .nav-button:hover, .today-button:hover {
    background-color: rgba(90, 125, 238, 0.1);
    transform: scale(1.1);
  }
  
  .today-button {
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    background-color: #5a7dee;
    color: #ffffff;
  }
  
  .calendar-body {
    flex-grow: 1;
    overflow: auto;
    padding: 1rem;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .calendar-grid-small {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .calendar-day-header {
    background-color: #f8f9fa;
    padding: 0.75rem;
    text-align: center;
    font-weight: 500;
    color: #5a7dee;
    font-size: 0.875rem;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .calendar-day {
    background-color: #ffffff;
    padding: 0.5rem;
    min-height: 100px;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;
    overflow: hidden;
  }
  
  .calendar-day:hover {
    background-color: #f1f3f4;
    transform: scale(1.02);
    z-index: 1;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .current-month {
    color: #333;
  }
  
  .calendar-day:not(.current-month) {
    color: #bbb;
    background-color: #f8f9fa;
  }
  
  .day-number {
    position: absolute;
    top: 5px;
    left: 5px;
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  .has-events {
    font-weight: bold;
  }
  
  .today {
    background-color: #e8f0fe;
    font-weight: bold;
    color: #5a7dee;
  }
  
  .selected {
    background-color: #e8f0fe;
    border: 2px solid #5a7dee;
  }
  
  .event-indicators {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .event-indicator {
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.75rem;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    animation: fadeIn 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .teacher-event {
    background-color: #5a7dee;
  }
  
  .student-event {
    background-color: #ff7f50;
  }
  
  .more-events {
    font-size: 0.75rem;
    color: #70757a;
    text-align: center;
    margin-top: 2px;
  }
  
  .calendar-legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-top: 1px solid #e0e0e0;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
  }
  
  .event-sidebar {
    width: 300px;
    background-color: #f8f9fa;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    overflow-y: auto;
  }
  
  .event-date-header {
    margin-bottom: 1rem;
    background-color: #5a7dee;
    color: white;
    padding: 1rem;
    border-radius: 8px;
  }
  
  .event-date-header h3 {
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0;
  }
  
  .event-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .event-item {
    padding: 0.75rem;
    border-radius: 8px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .event-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .event-item.teacher-event {
    border-left: 4px solid #5a7dee;
  }
  
  .event-item.student-event {
    border-left: 4px solid #ff7f50;
  }
  
  .event-time {
    font-size: 0.875rem;
    color: #5a7dee;
    margin-bottom: 0.25rem;
  }
  
  .event-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.25rem;
  }
  
  .event-location {
    font-size: 0.875rem;
    color: #70757a;
    margin-bottom: 0.25rem;
  }
  
  .event-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #70757a;
  }
  
  .no-events {
    color: #70757a;
    font-style: italic;
    text-align: center;
    padding: 1rem;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    .calendar-content {
      flex-direction: column;
    }
  
    .calendar-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  
    .calendar-grid {
      font-size: 0.8rem;
    }
  
    .calendar-day {
      min-height: 80px;
    }
  
    .event-sidebar {
      width: 100%;
    }
  }
  </style>