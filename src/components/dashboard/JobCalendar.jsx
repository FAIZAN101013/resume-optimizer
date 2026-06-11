import React from 'react'
import { Calendar } from "@/components/ui/calendar"

const JobCalendar = ({
  selectedDate,
  setSelectedDate,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-4 text-lg font-semibold">
        Application Calendar
      </h3>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
      />
    </div>
  )
}

export default JobCalendar      