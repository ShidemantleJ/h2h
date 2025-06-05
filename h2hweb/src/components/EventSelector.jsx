import React from 'react';

function EventSelector({selectedEvent, setSelectedEvent, bgcolor = "bg-zinc-900"}) {
    return (
        <div>
            <p>Choose an event:</p>
            <select
              id="events"
              name="events"
              className={`${bgcolor} rounded-lg p-2 block`}
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="333">3x3</option>
              <option value="222">2x2</option>
              <option value="444">4x4</option>
              <option value="555">5x5</option>
              <option value="666">6x6</option>
              <option value="777">7x7</option>
              <option value="minx">Megaminx</option>
              <option value="pyram">Pyraminx</option>
              <option value="clock">Clock</option>
              <option value="skewb">Skewb</option>
              <option value="sq1">Square-1</option>
              <option value="fto">FTO</option>
              <option value="333bf">3x3 Blindfolded</option>
              <option value="333oh">3x3 One-Handed</option>
              <option value="333ft">3x3 with Feet</option>
            </select>
        </div>
    );
}

export default EventSelector;