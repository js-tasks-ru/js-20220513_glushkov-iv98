export default class SortableTable {
  element = null;
  subElements = {
    body: []
  }
  currentSortFieldID = null;
  currentSortDirection = null;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.columItems = this.headerConfig.map((item) => {
      return {
        id: item.id,
        sortable: item.sortable,
        template: item.template ? item.template : null
      };
    });

    this.element = document.createElement('div');
    this.element.classList.add('products-list__container');
    this.element.dataset.element = 'productsContainer';

    this.render();
  }

  _getColumnIndexByID = (id = '') => {
    for (let i = 0; i < this.headerConfig.length; i++) {
      if (id === this.headerConfig[i].id) {
        return i;
      }
    }
    return -1;
  }

  _getHeaderColumnTemplate({id = '', title = '', sortable = false}) {
    const sortArrow = this.currentSortFieldID === id
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>`
      : '';

    return (
      `
        <div
          class="sortable-table__cell"
          ${ this.currentSortFieldID ? `data-id=${ this.currentSortFieldID }` : `` }
          data-sortable="${ sortable }"
          ${ this.currentSortDirection ? `data-order=${ this.currentSortDirection }` : `` }
        >
          <span>${ title }</span>
          ${ sortArrow }
        </div>
      `
    );
  }

  _getProductTemplate(props) {
    const content = Object.keys(props).map((prop, index) => {
      const column = this.columItems[index];

      if (column) {
        const columnName = column.id;
        if (column.template) {
          return column.template(prop);
        } else {
          return `<div class="sortable-table__cell">${ props[columnName] }</div>`;
        }
      }
    }).join('');

    return (
      `
      <a href="/products/" class="sortable-table__row">
        ${ content }
      </a>
      `
    );
  }

  _getTemplate() {
    const tableHeader = this.headerConfig.map((item) => {
      return this._getHeaderColumnTemplate(item);
    }).join('');
    const tableBody = this.data.map((item) => {
      return this._getProductTemplate(item);
    }).join('');

    return (
      `
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${ tableHeader }
          </div>

          <div data-element="body" class="sortable-table__body">
            ${ tableBody }
          </div>

          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>
      `
    );
  }

  sort(fieldValue = 'title', orderValue = 'asc') {
    const columnConfig = this.headerConfig[this._getColumnIndexByID(fieldValue)];
    if (!columnConfig.sortable) {
      return;
    }

    const sortOptions = {
      caseFirst: 'upper',
    };
    const sortLocales = ['ru', 'en'];
    const sortDirection = {
      'asc': 1,
      'desc': -1,
    };
    const getSortType = (fieldValue) => {
      for (const item of this.headerConfig) {
        if (item.id === fieldValue) {
          return item.sortType;
        }
      }
    };

    switch (getSortType(fieldValue)) {
    case 'string':
      this.data.sort((a, b) => {
        return sortDirection[orderValue] * String(a[fieldValue]).localeCompare(String(b[fieldValue]), sortLocales, sortOptions);
      });
      break;
    case 'number':
      this.data.sort((a, b) => {
        return sortDirection[orderValue] * (a[fieldValue] - b[fieldValue]) ;
      });
    }

    this.currentSortFieldID = fieldValue;
    this.currentSortDirection = orderValue;
    this.render();
  }

  render() {
    this.element.innerHTML = this._getTemplate();
    this.subElements.body = this.element.children[0].children[1]; //выглядит как очень плохое решение, но другого не нашел
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

