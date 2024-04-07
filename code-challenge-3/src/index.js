// Your code here

document.addEventListener('DOMContentLoaded', () => {
    const baseURL = 'http://localhost:3000';

    function renderFilmDetails(id) {
        fetch(`${baseURL}/films/${id}`)
            .then(response => response.json())
            .then(film => {
                const { title, poster, runtime, showtime, tickets_sold, capacity } = film;
                const availableTickets = capacity - tickets_sold;
                const filmDetailsContainer = document.querySelector('#film-details');
                filmDetailsContainer.innerHTML = `
                    <img src="${poster}" alt="${title} Poster">
                    <h2>${title}</h2>
                    <p>Runtime: ${runtime} minutes</p>
                    <p>Showtime: ${showtime}</p>
                    <p>Available Tickets: ${availableTickets}</p>
                    <button id="buy-ticket">Buy Ticket</button>
                `;
                switch (availableTickets) {
                    case 0:
                        document.getElementById('buy-ticket').textContent = 'Sold Out';
                        break;
                    default:
                        break;
                }
                filmDetailsContainer.dataset.id = id;
            })
            .catch(error => console.error('Error fetching film details:', error));
    }

    function renderFilmMenu() {
        const filmsList = document.querySelector('#films');
        fetch(`${baseURL}/films`)
            .then(response => response.json())
            .then(films => {
                filmsList.innerHTML = films.map(film => `<li class="film-item" data-id="${film.id}">${film.title}</li>`).join('');
            })
            .catch(error => console.error('Error fetching films:', error));
    }

    function buyTicket(id) {
        fetch(`${baseURL}/films/${id}`)
            .then(response => response.json())
            .then(film => {
                const updatedTicketsSold = film.tickets_sold + 1;
                fetch(`${baseURL}/films/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tickets_sold: updatedTicketsSold })
                })
                .then(response => response.json())
                .then(updatedFilm => {
                    const ticketsData = { film_id: id, number_of_tickets: 1 };
                    fetch(`${baseURL}/tickets`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(ticketsData)
                    })
                    .then(response => response.json())
                    .then(ticket => {
                        renderFilmDetails(id);
                        renderFilmMenu();
                    })
                    .catch(error => console.error('Error buying ticket:', error));
                })
                .catch(error => console.error('Error updating tickets sold:', error));
            })
            .catch(error => console.error('Error fetching film details:', error));
    }

    function deleteFilm(id) {
        fetch(`${baseURL}/films/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            const filmItem = document.querySelector(`[data-id="${id}"]`);
            filmItem.remove();
        })
        .catch(error => console.error('Error deleting film:', error));
    }

    function handleFilmClick(event) {
        const target = event.target;
        switch (target.tagName) {
            case 'LI':
                const filmId = target.dataset.id;
                renderFilmDetails(filmId);
                break;
            case 'BUTTON':
                const filmId = target.parentElement.dataset.id;
                deleteFilm(filmId);
                break;
            default:
                break;
        }
    }

    document.querySelector('#films').addEventListener('click', handleFilmClick);
    document.querySelector('#film-details').addEventListener('click', handleFilmClick);

    renderFilmDetails(1);
    renderFilmMenu();
});
