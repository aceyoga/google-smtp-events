document.addEventListener('DOMContentLoaded', () => {
  const toggleFormBtn = document.getElementById('toggle-form');
  const formContainer = document.getElementById('form-container');

  // Hide form on first load
  formContainer.style.display = 'none';

  toggleFormBtn.onclick = () => {
    if (formContainer.style.display === 'none') {
      formContainer.style.display = 'block';
      toggleFormBtn.textContent = 'Hide Form';
    } else {
      formContainer.style.display = 'none';
      toggleFormBtn.textContent = 'Add Event';
    }
  };
  const form = document.getElementById('event-form');
  const eventsList = document.getElementById('events-list');
  let editingId = null;

  function fetchEvents() {
    fetch('/events')
      .then(res => res.json())
      .then(events => {
        eventsList.innerHTML = '';
        events.forEach(event => {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${event.title}</strong><br>
            <em>${event.description || ''}</em><br>
            Location: ${event.location || ''}<br>
            Start: ${new Date(event.startTime).toLocaleString()}<br>
            End: ${new Date(event.endTime).toLocaleString()}<br>
            Attendees: ${(event.attendees || []).join(', ')}
            <div class="event-actions">
              <button class="edit">Edit</button>
              <button class="delete">Delete</button>
            </div>
          `;
          li.querySelector('.edit').onclick = () => startEdit(event);
          li.querySelector('.delete').onclick = () => deleteEvent(event.id);
          eventsList.appendChild(li);
        });
      });
  }

  function startEdit(event) {
  editingId = event.id;
  // Show the form if hidden
  formContainer.style.display = 'block';
  toggleFormBtn.textContent = 'Hide Form';
  form.title.value = event.title;
  form.description.value = event.description || '';
  form.location.value = event.location || '';
  form.startTime.value = event.startTime ? event.startTime.slice(0, 16) : '';
  form.endTime.value = event.endTime ? event.endTime.slice(0, 16) : '';
  form.attendees.value = (event.attendees || []).join(', ');
  form.querySelector('button[type="submit"]').textContent = 'Save Changes';
  }

  function resetForm() {
  editingId = null;
  form.reset();
  form.querySelector('button[type="submit"]').textContent = 'Add Event';
  }

  form.onsubmit = e => {
    e.preventDefault();
    const data = {
      title: form.title.value,
      description: form.description.value,
      location: form.location.value,
      startTime: form.startTime.value,
      endTime: form.endTime.value,
      attendees: form.attendees.value.split(',').map(a => a.trim()).filter(Boolean)
    };
    if (editingId) {
      fetch(`/events/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(() => {
        resetForm();
        fetchEvents();
      });
    } else {
      fetch('/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(() => {
        resetForm();
        fetchEvents();
      });
    }
  };

  function deleteEvent(id) {
    fetch(`/events/${id}`, { method: 'DELETE' })
      .then(() => fetchEvents());
  }

  fetchEvents();
});
