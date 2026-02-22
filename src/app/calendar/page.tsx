'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Event } from '@/types/database'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true })
    if (data) setEvents(data as Event[])
    setLoading(false)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDay = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.event_date === dateStr)
  }

  const isToday = (day: number) => {
    const checkDate = new Date(year, month, day)
    return checkDate.getTime() === today.getTime()
  }

  const isPast = (day: number) => {
    const checkDate = new Date(year, month, day)
    return checkDate < today
  }

  const days = []
  for (let i = 0; i < startingDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-12 bg-zinc-900 rounded-xl mb-8 w-64"></div>
          <div className="h-96 bg-zinc-900 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Calendar</h1>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-zinc-800">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-7">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-zinc-500 border-b border-zinc-800"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : []
            const todayClass = day && isToday(day)
            const pastClass = day && isPast(day)

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border-b border-r border-zinc-800 ${
                  day ? 'hover:bg-zinc-800/50' : 'bg-zinc-900/30'
                } ${todayClass ? 'bg-emerald-900/20' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      todayClass ? 'text-emerald-400' : pastClass ? 'text-zinc-600' : 'text-zinc-400'
                    }`}>
                      {day}
                      {todayClass && (
                        <span className="ml-1 text-xs">Today</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedEvent(expandedEvent === event.id ? null : event.id)
                          }}
                          className={`text-xs p-1.5 rounded cursor-pointer transition-all ${
                            expandedEvent === event.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-zinc-500 pl-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>

                    {expandedEvent && dayEvents.find(e => e.id === expandedEvent) && (
                      <div className="mt-2 p-3 bg-zinc-800 rounded-lg">
                        <h4 className="text-white font-medium text-sm">
                          {dayEvents.find(e => e.id === expandedEvent)?.title}
                        </h4>
                        {dayEvents.find(e => e.id === expandedEvent)?.event_time && (
                          <p className="text-zinc-400 text-xs mt-1">
                            {dayEvents.find(e => e.id === expandedEvent)?.event_time}
                          </p>
                        )}
                        {dayEvents.find(e => e.id === expandedEvent)?.content && (
                          <p className="text-zinc-300 text-xs mt-2">
                            {dayEvents.find(e => e.id === expandedEvent)?.content}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {events.length === 0 && (
        <div className="mt-8 text-center py-8 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-zinc-500">No events scheduled. Admins can add events from the Admin panel.</p>
        </div>
      )}
    </div>
  )
}
