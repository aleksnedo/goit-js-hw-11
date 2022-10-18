import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PixabayApi } from './js/fetchImages';
import { renderMarkup } from './js/renderMarkup';
import { refs } from './js/refs';

const pixabay = new PixabayApi();

let lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

const onSearchSubmit = async event => {
  event.preventDefault();

  const {
    elements: { searchQuery },
  } = event.currentTarget;

  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    Notify.failure('Please, enter data to search!');
    return;
  }

  pixabay.searchQuery = query;
  clearPage();

  try {
    const { hits, totalHits } = await pixabay.getImages();
    const markup = renderMarkup(hits);
    refs.galleryRef.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
    pixabay.calculateTotalPages(totalHits);

    if (pixabay.isShowLoadMore) {
      refs.loadMoreBtn.classList.remove('is-hidden');
    }
    if (totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notify.info(`Hooray! We found ${totalHits} images.`);
    }
  } catch (error) {
    Notify.failure(error.message, 'Something went wrong try more!');

    clearPage();
  }
};

refs.formRef.addEventListener('submit', onSearchSubmit);

const onLoadMoreBtnClick = async () => {
  pixabay.incrementPage();

  if (!pixabay.isShowLoadMore) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notify.info('Were sorry, but youve reached the end of search results.');
  }

  try {
    const { hits } = await pixabay.getImages();
    const markup = renderMarkup(hits);
    refs.galleryRef.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
  } catch (error) {
    Notify.failure('Something went wrong! Please retry');
    clearPage();
  }
};

refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

function clearPage() {
  pixabay.resetPage();

  refs.galleryRef.innerHTML = '';
  refs.loadMoreBtn.classList.add('is-hidden');
}
