import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element = document.createElement('div');
  subElements = {}
  productProps = {}

  constructor (productId = null) {
    this.productId = productId;
  }

  async _fetchProduct(productID) {
    const url = new URL(`/api/rest/products?id=${ productID }`, BACKEND_URL);
    return await fetchJson(url);
  }

  async _fetchProductCategories() {
    const url = new URL(`/api/rest/categories?_sort=weight&_refs=subcategory`, BACKEND_URL);
    return await fetchJson(url);
  }

  async uploadImage(image) {
    const formData = new FormData();

    formData.append("image", image);

    return fetchJson('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${ IMGUR_CLIENT_ID }`,
      },
      body: formData,
      redirect: 'follow',
      referrer: ''
    });
  }

  getSortableList(data = []) {
    const sortableList = new SortableList({
      items: data.map(({ source, url }) => {
        const item = document.createElement('li');
        item.classList.add('products-edit__imagelist-item');
        item.innerHTML = this.getProductPhotoTemplate(url, source);

        return item;
      })
    });

    return sortableList.element;
  }

  getProductPhotoTemplate(url, source) {
    return `<input type="hidden" name="url" value="${ url }">
            <input type="hidden" name="source" value="${ source }">
            <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src="${ url }">
                <span>${ source }</span>
            </span>
            <button type="button">
              <img src="icon-trash.svg" data-delete-handle="true" alt="delete">
            </button>`;
  }

  getProductCategoriesTemplate(currentCategory = '', categories = []) {
    const element = document.createElement('div');
    const content = categories.map((cat) => {
      const {
        id: parentID,
        subcategories = [],
        title,
      } = cat;

      const categoryBase = `${ title }`;
      return subcategories.map((cat) => {
        const {
          id = parentID,
          title
        } = cat;
        return `<option
                    ${ currentCategory === id ? 'selected' : '' }
                    value="${ id }">${ categoryBase } ${ escapeHtml('>') } ${ title }</option>`;
      }).join('');
    }).join('');

    element.classList.add('form-group', 'form-group__half_left');
    element.innerHTML = `<label class="form-label">Категория</label>
                          <select id="subcategory" class="form-control" name="subcategory">
                            ${ content }
                          </select>`;

    return element.outerHTML;
  }

  getTemplate({ product = {}, categories = [] }) {
    const element = document.createElement('form');
    const {
      title = '',
      description = '',
      subcategory = '',
      price = null,
      discount = null,
      quantity = null,
      status = 1,
    } = product;

    element.classList.add('form-grid');
    element.dataset.element = 'productForm';
    element.innerHTML = `<div class="form-group form-group__half_left">
                          <fieldset>
                            <label class="form-label">Название товара</label>
                            <input id="title" required="" type="text" name="title" class="form-control"
                              placeholder="Название товара" value="${ escapeHtml(title) }">
                          </fieldset>
                        </div>
                        <div class="form-group form-group__wide" data-element="sortable-list-container">
                          <label class="form-label">Описание</label>
                          <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${ escapeHtml(description) }</textarea>
                        </div>
                        <div class="form-group form-group__wide">
                        <label class="form-label">Фото</label>
                          <div data-element="imageListContainer"></div>
                          <button type="button" name="uploadImage" class="button-primary-outline fit-content"><span>Загрузить</span></button>
                          <input type="file" accept="image/*" hidden="">
                        </div>
                        ${ this.getProductCategoriesTemplate(subcategory, categories) }
                        <div class="form-group form-group__half_left form-group__two-col">
                          <fieldset>
                            <label class="form-label">Цена ($)</label>
                            <input id="price" required="" type="number" name="price" class="form-control" value="${ price }" placeholder="100">
                          </fieldset>
                          <fieldset>
                            <label class="form-label">Скидка ($)</label>
                            <input id="discount" required="" type="number" name="discount" class="form-control" value="${ discount }" placeholder="0">
                          </fieldset>
                        </div>
                        <div class="form-group form-group__part-half">
                          <label class="form-label">Количество</label>
                          <input id="quantity" required="" type="number" class="form-control" name="quantity" value="${ quantity }" placeholder="1">
                        </div>
                        <div class="form-group form-group__part-half">
                          <label class="form-label">Статус</label>
                          <select id="status" class="form-control" name="status">
                            <option ${ status === 1 ? 'selected' : '' } value="1">Активен</option>
                            <option ${ status === 0 ? 'selected' : '' } value="0">Неактивен</option>
                          </select>
                        </div>
                        <div class="form-buttons">
                          <button type="submit" name="save" class="button-primary-outline">
                            Сохранить товар
                          </button>
                        </div>`;

    return element;
  }

  async save() {
    if (this.productId) {
      this.productProps.id = String(this.productId);
    }

    await fetchJson(new URL('/api/rest/products', BACKEND_URL), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(this.productProps),
    });

    if (this.productId) {
      this.element.dispatchEvent(new CustomEvent('product-updated'));
    } else {
      this.element.dispatchEvent(new CustomEvent('product-saved'));
    }
  }

  onDeleteImage = (event) => {
    if (event.target.dataset.deleteHandle) {
      event.target.closest('li').remove();
    }
  }

  onFormSubmit = async (event) => {
    event.preventDefault();

    const form = this.element.querySelector('[data-element="productForm"]');
    const formData = new FormData(form);
    const imagesList = form.querySelector('[data-element="imageListContainer"] > ul').children;
    const imagesData = [];

    for (const image of imagesList) {
      imagesData.push({
        source: image.querySelector('[name="source"]').value,
        url: image.querySelector('[name="url"]').value,
      });
    }

    this.productProps = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      quantity: Number(formData.get('quantity')),
      status: Number(formData.get('status')),
      subcategory: formData.get('subcategory'),
      discount: Number(formData.get('discount')),
      images: imagesData
    };

    await this.save();
  }

  onUploadImage = async (event) => {
    const image = event.target.files[0];
    const uploadedImage = await this.uploadImage(image);

    this.element
      .querySelector('[data-element="imageListContainer"]')
      .getElementsByTagName('ul')[0]
      .insertAdjacentHTML('beforeend', this.getProductPhotoTemplate(uploadedImage.data.link, image.name));
  }

  onUploadButton = (event) => {
    event.preventDefault();

    const fileInput = event.target
      .closest('div')
      .querySelector('input[type="file"]');

    fileInput.dispatchEvent(new PointerEvent('click'));
    fileInput.addEventListener('change', this.onUploadImage);
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener('click', this.onDeleteImage);
    this.subElements.productForm.addEventListener('submit', this.onFormSubmit);
    this.subElements.productForm
      .querySelector('button[name="uploadImage"]')
      .addEventListener('click', this.onUploadButton);
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  async render () {
    const [products, categories] = await Promise.all([this._fetchProduct(this.productId), this._fetchProductCategories()]);
    const product = products[0];

    const renderProps = {
      product,
      categories,
    };

    this.element.classList.add('product-form');
    this.element.append(this.getTemplate(renderProps));

    this.subElements = this.getSubElements();
    this.subElements['imageListContainer'].append(this.getSortableList(product.images));

    this.initEventListeners();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
