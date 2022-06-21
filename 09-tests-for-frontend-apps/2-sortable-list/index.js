export default class SortableList {
  element = document.createElement('ul');
  placeholder = document.createElement('li');
  currentDragItem = {
    element: null,
    top: 0,
    left: 0,
  }
  pointerShiftX = 0

  constructor({ items }) {
    this.items = items;
    this.insertItems(items);
    this.render();
  }

  insertItems(items = []) {
    for (const item of items) {
      item.classList.add('sortable-list__item');
    }
    this.element.append(...items);
  }

  createDragPlaceholder(width, height) {
    this.placeholder.classList.add('sortable-list__placeholder');
    this.placeholder.style.width = `${ width }px`;
    this.placeholder.style.height = `${ height }px`;
  }

  moveAt(x, y) {
    this.currentDragItem.element.style.left = `${ x }px`;
    this.currentDragItem.element.style.top = `${ y }px`;
  }

  deleteItem(event) {
    const item = event.target.closest('li');

    if (item) {
      item.remove();
    }
  }

  onClickHandle = (event) => {
    if (event.target.hasAttribute('data-grab-handle')) {
      this.onDragStart(event);
    }

    if (event.target.hasAttribute('data-delete-handle')) {
      this.deleteItem(event);
    }
  }

  onDragStart = (event) => {
    event.preventDefault();

    this.currentDragItem.element = event.target.closest('li');
    const { element } = this.currentDragItem;

    if (element) {
      this.pointerShiftX = event.clientX;

      const { top, left, width, height } = element.getBoundingClientRect();

      document.addEventListener('pointerup', this.onDragStop);
      document.addEventListener('pointermove', this.onDrag);

      this.currentDragItem.left = left;
      this.currentDragItem.top = height / 2;

      this.createDragPlaceholder(width, height);
      element.after(this.placeholder);

      this.element.append(element);

      element.classList.add('dragging', 'sortable-list__item_dragging');
      element.style.width = `${ width }px`;
      element.style.height = `${ height }px`;
      element.style.left = `${ left }px`;
      element.style.top = `${ top }px`;
    }
  }

  onDragStop = () => {
    const { element } = this.currentDragItem;

    document.removeEventListener('pointermove', this.onDrag);
    document.removeEventListener('pointerup', this.onDragStop);

    this.currentDragItem = {};
    this.placeholder.replaceWith(element);
    this.placeholder.remove();

    element.classList.remove('dragging', 'sortable-list__item_dragging');
    element.style.left = `${ 0 }px`;
    element.style.top = `${ 0 }px`;
  }

  onDrag = (event) => {
    const { left, top } = this.currentDragItem;

    const prevNeighbour = this.placeholder.previousElementSibling;
    const nextNeighbour = this.placeholder.nextElementSibling;
    const currentItem = event.target.closest('li');

    this.moveAt(event.clientX - this.pointerShiftX + left, event.clientY - top);

    if (!currentItem) return;

    if (prevNeighbour) {
      const { top, height } = prevNeighbour.getBoundingClientRect();
      const currentItem = event.target.closest('li');
      const middleHeight = top + height / 2;

      if (currentItem.getBoundingClientRect().top <= middleHeight) {
        return prevNeighbour.before(this.placeholder);
      }
    }

    if (nextNeighbour) {
      const { top, height } = nextNeighbour.getBoundingClientRect();
      const middleHeight = top - height / 2;

      if (currentItem.getBoundingClientRect().top >= middleHeight) {
        return nextNeighbour.after(this.placeholder);
      }
    }
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.onClickHandle);
  }

  deleteEventListeners() {
    document.removeEventListener('pointerdown', this.onClickHandle);
    document.removeEventListener('pointerup', this.onDragStop);
    document.removeEventListener('pointermove', this.onDrag);
  }

  render() {
    this.element.classList.add('sortable-list');
    this.initEventListeners();
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      this.placeholder = null;
      this.currentDragItem = null;
      this.subElements = null;
    }
  }

  destroy() {
    this.remove();
    this.deleteEventListeners();
  }
}
