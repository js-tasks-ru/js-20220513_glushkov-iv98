import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element = document.createElement('div');
  subElements = {
    root: document.createElement('div'),
    header: {
      root: document.createElement('div'),
    },
    body: document.createElement('div'),
  }
  loadingIndicator = `
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    `;
  loadStep = 30;
  startLoadPosition = 0;
  currentLoadPosition = this.startLoadPosition;
  endLoadPosition = this.loadStep;

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.data = data;
    this.headersConfig = headersConfig;
    this.sorted = sorted;
    this.columItems = this.headersConfig.map((item) => {
      return {
        id: item.id,
        sortOrder: 'asc',
        sortable: item.sortable,
        template: item.template ? item.template : null,
      };
    });
    this.currentSortFieldID = sorted.id ? sorted.id : this.headersConfig.find(item => item.sortable).id;
    this.currentSortDirection = sorted.order ? sorted.order : 'asc';

    this._initRender();
    this._initEventListeners();
    this._fetchData({
      _embed: 'subcategory.category',
      _sort: this.currentSortFieldID,
      _order: this.currentSortDirection,
      _start: this.startLoadPosition,
      _end: this.endLoadPosition,
    })
      .then((data) => {
        this.data = data;
        this.sort(this.currentSortFieldID, this.currentSortDirection, true);
        this.render();
      });
  }

  onLoadData = (event) => {
    const { root } = this.subElements;
    const { status } = event.detail;

    if (status === 'start') {
      root.classList.add('sortable-table_loading');
    } else {
      root.classList.remove('sortable-table_loading');
    }
  }

  onSortData = (event) => {
    const column = event.target.closest('[data-id]');
    const { id, order } = column.dataset;
    const columnConfig = this.headersConfig[this._getColumnIndexByID(id)];

    if (columnConfig && !columnConfig.sortable) {
      return;
    }

    if (order === 'asc') {
      this.sort(id, 'desc');
    } else if (order === 'desc') {
      this.sort(id, 'asc');
    }
  }

  async _fetchData(fetchParams) {
    this.element.dispatchEvent(new CustomEvent('load-data', {
      detail: {
        status: 'start'
      }
    }));

    const apiUrl = `${ BACKEND_URL }/api/rest/products?${ new URLSearchParams(fetchParams).toString() }`;
    const response = await fetch(apiUrl);

    if (response.ok) {
      this.element.dispatchEvent(new CustomEvent('load-data', {
        detail: {
          status: 'end'
        }
      }));

      return response.json();
    }

    throw new Error(`Could not fetch ${ apiUrl }` +
      `, received ${ response.status }`);
  }

  _checkScrollPosition = () => {
    const height = document.body.offsetHeight;
    const screenHeight = window.innerHeight;
    const scrolled = window.scrollY;
    const position = scrolled + screenHeight;

    if (position >= height - 50) {
      this.currentLoadPosition = this.endLoadPosition;
      this.endLoadPosition += this.loadStep;

      window.removeEventListener('scroll', this._checkScrollPosition);
      this._fetchData({
        _embed: 'subcategory.category',
        _sort: this.currentSortFieldID,
        _order: this.currentSortDirection,
        _start: this.currentLoadPosition,
        _end: this.endLoadPosition,
      })
        .then((data) => {
          this._insertElements(this.subElements.body, this._createTableBody(data));
          window.addEventListener('scroll', this._checkScrollPosition);
        });
    }
  }

  _initEventListeners() {
    for (const elem of this.subElements.header.root.children) {
      elem.addEventListener('pointerdown', this.onSortData);
    }
    this.element.addEventListener('load-data', this.onLoadData);
    window.addEventListener('scroll', this._checkScrollPosition);
  }

  _deleteEventListeners() {
    for (const elem of this.subElements.header.root.children) {
      elem.removeEventListener('pointerdown', this.onSortData);
    }
  }

  _getColumnIndexByID = (id = '') => {
    for (let i = 0; i < this.headersConfig.length; i++) {
      if (id === this.headersConfig[i].id) {
        return i;
      }
    }

    return -1;
  }

  _getHeaderColumnTemplate = ({id = '', title = '', sortable = false}) => {
    const column = document.createElement('div');
    const columnLabel = document.createElement('span');
    const columnIndex = this._getColumnIndexByID(id);
    const dataAttributes = {
      id: this.columItems[columnIndex].id,
      order: this.currentSortDirection,
      sortable: !this.columItems[columnIndex].sortable ? false : this.columItems[columnIndex].sortable,
    };

    column.classList.add('sortable-table__cell');
    for (const attr in dataAttributes) {
      if (attr) {
        column.setAttribute(`data-${ attr }`, dataAttributes[attr]);
      }
    }
    columnLabel.textContent = `${ title }`;
    column.appendChild(columnLabel);

    return column;
  }

  _getProductTemplate = (props) => {
    const product = document.createElement('a');
    const content = Object.keys(props).map((prop, index) => {
      const column = this.columItems[index];

      if (column) {
        const columnName = column.id;

        if (column.template) {
          return column.template(props[column.id]);
        } else {
          return `<div class="sortable-table__cell">${ props[columnName] }</div>`;
        }
      }
    }).join('');

    product.href = '/products/';
    product.classList.add('sortable-table__row');
    product.insertAdjacentHTML('beforeend', content);

    return product;
  }

  _generateSubElement({ data, renderTemplate }) {
    return renderTemplate(data);
  }

  _createTableHeader() {
    return this.headersConfig.map((item, index) => {
      let elem = document.createElement('div');

      elem.appendChild(this._generateSubElement({
        data: this.headersConfig[index],
        renderTemplate: this._getHeaderColumnTemplate,
      }));

      return elem.firstElementChild;
    });
  }

  _createTableBody(data = null) {
    const finalData = !data ? this.data : data;

    return finalData.map((item) => {
      return this._generateSubElement({
        data: item,
        renderTemplate: this._getProductTemplate
      });
    });
  }

  _setSortArrow() {
    const sortArrow = `
                      <span data-element="arrow" class="sortable-table__sort-arrow">
                        <span class="sort-arrow"></span>
                      </span>
                      `;
    const { children: columns } = this.subElements.header.root;

    for (const column of columns) {
      const dataID = column.getAttribute('data-id');

      if (dataID === this.currentSortFieldID) {
        column.insertAdjacentHTML('beforeend', sortArrow);
      }
    }
  }

  _initRender() {
    this.subElements.root.classList.add('sortable-table');

    this.element.classList.add('products-list__container');
    this.element.dataset.element = 'productsContainer';

    this.subElements.header.root.dataset.element = 'header';
    this.subElements.header.root.classList.add('sortable-table__header', 'sortable-table__row');

    this.subElements.body.dataset.element = 'body';
    this.subElements.body.classList.add('sortable-table__body');

    this.element.append(this.subElements.root);
    this.subElements.root.append(this.subElements.header.root);
    this.subElements.root.append(this.subElements.body);

    this.subElements.root.insertAdjacentHTML('beforeend', this.loadingIndicator);

    const headerElements = this._createTableHeader();

    headerElements.map((element) => {
      this.subElements.header.root.append(element);
    });
  }

  sortOnClient(sortParams) {
    const {
      fieldValue,
      orderValue,
      sortType,
      sortDirection,
    } = sortParams;

    const sortOptions = {
      caseFirst: 'upper',
    };
    const sortLocales = ['ru', 'en'];

    switch (sortType) {
    case 'string':
      this.data.sort((a, b) => {
        return sortDirection[orderValue] * a[fieldValue].localeCompare(b[fieldValue], sortLocales, sortOptions);
      });
      break;
    case 'number':
      this.data.sort((a, b) => {
        return sortDirection[orderValue] * (a[fieldValue] - b[fieldValue]);
      });
    }
  }

  sortOnServer() {
    this.currentLoadPosition = this.startLoadPosition;
    this.endLoadPosition = this.startLoadPosition + this.loadStep;

    this.data = [];
    this._fetchData({
      _embed: 'subcategory.category',
      _sort: this.currentSortFieldID,
      _order: this.currentSortDirection,
      _start: this.currentLoadPosition,
      _end: this.endLoadPosition,
    })
      .then((data) => {
        this.data = data;
        this.render();
      });
  }

  sort(fieldValue = 'title', orderValue = 'asc', isLocally = false) {
    const sortDirection = {
      'asc': 1,
      'desc': -1,
    };
    const getSortType = (fieldValue) => {
      for (const item of this.headersConfig) {
        if (item.id === fieldValue) {
          return item.sortType;
        }
      }
    };

    this.currentSortFieldID = fieldValue;
    this.currentSortDirection = orderValue;

    if (isLocally) {
      this.sortOnClient({
        fieldValue,
        orderValue,
        sortType: getSortType(fieldValue),
        sortDirection,
      });
    } else {
      this.sortOnServer({
        _embed: 'subcategory.category',
        _sort: this.currentSortFieldID,
        _order: this.currentSortDirection,
        _start: 0,
        _end: 30,
      });
    }

    this.render();
  }

  _insertElements(place, elements = []) {
    elements.map((element) => {
      place.insertAdjacentElement('beforeend', element);
    });
  }

  render() {
    const { header, body } = this.subElements;

    header.root.innerHTML = '';
    body.innerHTML = '';

    this._insertElements(header.root, this._createTableHeader());
    this._insertElements(body, this._createTableBody());

    this._setSortArrow();
    this._initEventListeners();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this._deleteEventListeners();
  }
}
