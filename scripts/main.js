const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

// menu
const leftMenu= document.querySelector('.left-menu');
const hamburger= document.querySelector('.hamburger');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle=document.querySelector('.modal__title');
const genresList=document.querySelector('.genres-list');
const rating=document.querySelector('.rating');
const description=document.querySelector('.description');
const modalLink=document.querySelector('.modal__link');
const searchForm=document.querySelector('.search__form');
const searchFormInput=document.querySelector('.search__form-input');
const preloader = document.querySelector('.preloader');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsHead = document.querySelector('.tv-shows__head');
const posterWrapper = document.querySelector('.poster__wrapper');
const modalContent = document.querySelector('.modal__content');
const pagination = document.querySelector('.pagination');

const loading = document.createElement('div');
loading.className = 'loading';

const DBService = class {

    constructor () {
        this.API_KEY = 'b2ad2d25e2979d0c45a15b47f28b6254';
        this.SERVER = 'https://api.themoviedb.org/3';
    }
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`failed to load data from ${url}`)
        }
    }

    getTestData = () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResult = (query) => {
        this.temp=(this.SERVER +'/search/tv?api_key=' + this.API_KEY+
        '&language=ru-RU&query='+ query)
        return this.getData(this.temp);
    }

    getNextPage = (page) => {
        return this.getData(this.temp + '&page=' + page)
    }
    getTvShows = (id) => {
        return this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);
    }
    
    getTopRated = () => {
        return this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`);
    }

    getPopular = () => {
        return this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`);
    }
    
    getToday = () => {
        return this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`);
    }

    getWeek = () => {
        return this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`);
    }
}

const dbService = new DBService();



const renderCard = (response, target) => {
    tvShowsList.textContent = '';


    if (!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'К сожалению, по Вашему запросу ничего не найдено';
        tvShowsHead.style.cssText = 'color : red;' ;
        return;
    }

    tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
    tvShowsHead.style.cssText = 'color : green;' ;

    response.results.forEach((item) => {
        console.log(item);
        
        const {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote,
            id
        } = item;

        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_URL + backdrop : posterIMG;
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

        const card = document.createElement('li');
        card.className ='tv-shows__item';
        card.innerHTML = `
            <a href="#" id="${id}" class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                    src="${posterIMG}"
                    data-backdrop="${backdropIMG}"
                    alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;  
        loading.remove();
        tvShowsList.append(card);
    });

    pagination.textContent = '';
    if(!target && response.total_pages>1 ) {
        for (let i=1; i <= response.total_pages; i++) {
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
        }
    }
};

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    console.log(value);

    if (value) {
        tvShows.append(loading);
        dbService.getSearchResult(value).then(renderCard);
    }
    searchFormInput.value = '';
    pagination.textContent ='';
});


// menu open/close 

const closeDropdown = () =>{
    dropdown.forEach((item) => {
        item.classList.remove('active');
        
    });
}

hamburger.addEventListener('click', (event) => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});

document.addEventListener('click', (event) => {
    if(!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
});

leftMenu.addEventListener('click', (event) => {
    event.preventDefault();
    const target= event.target;
    const dropdown= target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');

    }
    if (target.closest('#top-rated')) {
        tvShows.append(loading);
        dbService.getTopRated().then((response) => renderCard(response, target));
    }

    if (target.closest('#popular')) {
        tvShows.append(loading);
        dbService.getPopular().then((response) => renderCard(response, target));
    }

    if (target.closest('#week')) {
        tvShows.append(loading);
        dbService.getWeek().then((response) => renderCard(response, target));
    }

    if (target.closest('#today')) {
        tvShows.append(loading);
        dbService.getToday().then((response) => renderCard(response, target));
    }

    if (target.closest('#search')) {
        tvShowsList.textContent = '';
        tvShowsHead.textContent = '';

    }


})

//modal window open

tvShowsList.addEventListener('click', (event) => {
    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');

    if (card) {
        preloader.style.display = 'block'; 
        dbService
            .getTvShows(card.id)
            .then(response => {
                if (response.poster_path) {
                    tvCardImg.src = IMG_URL + response.poster_path;
                    tvCardImg.alt =response.name;
                    posterWrapper.style.display = '';
                    modalContent.style.paddingLeft = '';

                    
                } else {
                    posterWrapper.style.display = 'none';
                    modalContent.style.paddingLeft = '25px';
                }
                
                modalTitle.textContent = response.name;
                /* genresList.innerHTML= response.genres.reduce((acc, item) => {
                   return `${acc} <li>${item.name}</li>`
                }, '');
                 */
                genresList.textContent='';
                for (const item of response.genres) {
                    genresList.innerHTML += `<li>${item.name}</li>` ;
                }
                rating.textContent= response.vote_average;
                description.textContent = response.overview;
                modalLink.href = response.homepage;
                
            }).then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .finally(() => {
                preloader.style.display = '';
            })
    }
    
})

//modal window close

modal.addEventListener('click', (event) => {
    if (event.target.closest('.cross') ||
    event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
})

// card img change

const changeImage = (event) => {
    const card = event.target.closest('.tv-shows__item');

    if (card) {
        const img = card.querySelector('.tv-card__img');
        const changeImg = img.dataset.backdrop;
        if (changeImg) {
            img.dataset.backdrop = img.src;
            img.src = changeImg;
        }
        
    }
};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target;
    if (target.classList.contains('pages')) {
        tvShows.append(loading);
        dbService.getNextPage(target.textContent).then(renderCard);
    }
})