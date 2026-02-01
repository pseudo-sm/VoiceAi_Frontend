import React, { useState } from "react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

function DayCheckbox() {
  const [selectedDays, setSelectedDays] = useState([]);

  const handleChange = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  return (
    <div>
      <h3>Select Days</h3>

      {days.map((day) => (
        <label key={day} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selectedDays.includes(day)}
            onChange={() => handleChange(day)}
          />
          {day}
        </label>
      ))}

      <p>
        <strong>Selected Days:</strong>{" "}
        {selectedDays.length ? selectedDays.join(", ") : "None"}
      </p>
    </div>
  );
}

export default DayCheckbox;
