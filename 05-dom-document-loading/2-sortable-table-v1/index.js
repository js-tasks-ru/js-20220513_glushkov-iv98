export default class SortableTable {
  element = document.createElement('div');
  subElements = {
    root: document.createElement('div'),
    header: document.createElement('div'),
    body: document.createElement('div'),
  }
  currentSortFieldID = null;
  currentSortDirection = null;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.columItems = this.headerConfig.map((item) => {
      return {
        id: item.id,
        template: item.template ? item.template : null
      };
    });
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

  _getHeaderColumnTemplate = ({id = '', title = '', sortable = false}) => {
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

  _getProductTemplate = (props) => {
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

  _generateSubElement({ data, renderTemplate }) {
    return data.map((item) => {
      return renderTemplate(item);
    }).join('');
  }

  _generateTemplate() {
    const { root, header, body } = this.subElements;

    this._clearNodes();

    for (const element in this.subElements) {
      this.subElements[element].innerHTML = '';
    }

    this.element.classList.add('products-list__container');
    this.element.dataset.element = 'productsContainer';

    header.dataset.element = 'header';
    header.classList.add('sortable-table__header', 'sortable-table__row');
    header.insertAdjacentHTML('afterbegin', this._generateSubElement({
      data: this.headerConfig,
      renderTemplate: this._getHeaderColumnTemplate,
    }));

    body.dataset.element = 'body';
    body.classList.add('sortable-table__body');
    body.insertAdjacentHTML('afterbegin', this._generateSubElement({
      data: this.data,
      renderTemplate: this._getProductTemplate,
    }));

    root.classList.add('sortable-table');
    root.insertAdjacentElement('afterbegin', header);
    root.insertAdjacentElement('beforeend', body);
  }

  _clearNodes() {
    for (const element in this.subElements) {
      this.subElements[element].innerHTML = '';
    }
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
    this._generateTemplate();
    this.element.appendChild(this.subElements.root);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
