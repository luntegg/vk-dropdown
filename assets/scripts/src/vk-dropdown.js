class VkDropdown {
    constructor(element = '[data-vk-dropdown]', userConfig) {
        if (typeof element === 'string') {
            const elements = document.querySelectorAll(element);
            if (elements.length > 1) {
                for (let i = 1; i < elements.length; i++) {
                    const el = elements[i];
                    new VkDropdown(el, userConfig);
                }
            }
        }

        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        if (!this.element) {
            console.error('Passed element not found');
            return;
        }

        const defaultConfig = {
            classNames: {
                activeState: 'is-active',
                focusState: 'is-focused',
                highlightedState: 'is-highlighted',
                openState: 'is-open',
                container: 'vk-dropdown',
                input: 'vdd-input-container__input',
                inputContainer: 'vdd-input-container',
                inputContainerAdd: 'vdd-input-container__add',
                inputContainerAddIcon: 'vdd-input-container__add-icon',
                inputContainerArrow: 'vdd-input-container__arrow',
                inputContainerClear: 'vdd-input-container__clear',
                list: 'vdd-list',
                listItem: 'vdd-list__item',
                listItemEmpty: 'vdd-list__item-empty',
                listItemName: 'vdd-list__name',
                listItemPhotoContainer: 'vdd-list__photo',
                photoPreview: 'vdd-photo-preview__item',
                photoPreviewContainer: 'vdd-photo-preview__container',
                selectedItem: 'vdd-input-container__selected-item',
                selectedItemName: 'vdd-input-container__selected-item-name',
                selectedItemRemove: 'vdd-input-container__selected-item-remove',
                selectedList: 'vdd-input-container__selected'
            },
            multi: false,
            noPhoto: false,
            noPhotoPreview: false,
            noServerSearch: false
        };

        this.config = Object.assign({}, defaultConfig, userConfig);
        this.config.multi = this.config.multi || this.element.hasAttribute('data-multi');
        this.config.noPhoto = this.config.noPhoto || this.element.hasAttribute('data-no-photo');
        this.config.noPhotoPreview = this.config.noPhotoPreview || this.element.hasAttribute('data-no-photo-preview');
        this.config.noServerSearch = this.config.noServerSearch || this.element.hasAttribute('data-no-server-search');

        this.selectedItems = [];
        this.xhr = null;
        this.wasTap = true;

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onMouseOver = this._onMouseOver.bind(this);
        this._onTouchMove = this._onTouchMove.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onBlur = this._onBlur.bind(this);

        this._init();
    }

    _init() {
        this._createTemplates();
        this._renderElement();
        this._renderContainer();
        this._addEventListeners();
    }

    _addEventListeners() {
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('click', this._onClick);
        document.addEventListener('mouseover', this._onMouseOver);
        document.addEventListener('touchmove', this._onTouchMove);
        document.addEventListener('touchend', this._onTouchEnd);

        this.input.addEventListener('focus', this._onFocus);
        this.input.addEventListener('blur', this._onBlur);
    }

    _removeEventListeners() {
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('click', this._onClick);
        document.removeEventListener('mouseover', this._onMouseOver);
        document.removeEventListener('touchmove', this._onTouchMove);
        document.removeEventListener('touchend', this._onTouchEnd);


        this.input.removeEventListener('focus', this._onFocus);
        this.input.removeEventListener('blur', this._onBlur);
    }

    _onKeyDown(e) {
        const target = e.target;
        const hasActiveDropdown = this.list.classList.contains(this.config.classNames.activeState);

        if (!hasActiveDropdown && !this.container.contains(target)) {
            return;
        }

        const listItems = this.list.children;

        const enterKey = 13;
        const escapeKey = 27;
        const upKey = 38;
        const downKey = 40;

        const onEnterKey = () => {
            for (let i = 0; i < listItems.length; i++) {
                const item = listItems[i];

                if (item.classList.contains(this.config.classNames.highlightedState)) {
                    this._selectItem(item);
                    this.hideDropdown();
                    return;
                }
            }
        };

        const onEscapeKey = () => {
            if (hasActiveDropdown) {
                this.hideDropdown();
            }
        };

        const onDirectionKey = () => {
            const directionInt = (e.keyCode === downKey ? 1 : -1);

            let highlightedItem;
            for (let i = 0; i < listItems.length; i++) {
                const item = listItems[i];

                if (item.classList.contains(this.config.classNames.highlightedState)) {
                    this._unhighlightElement(item);

                    let newIndex = i + directionInt;

                    // if highlighted last item and key down, doing nothing
                    if (newIndex >= listItems.length) {
                        newIndex = i;
                    }

                    highlightedItem = listItems[newIndex];
                }
            }

            if (!highlightedItem) {
                highlightedItem = listItems[0];
            }

            this._highlightElement(highlightedItem);
            this._scrollListToHighlightElement(highlightedItem, directionInt);

            e.preventDefault();
        };

        const keyDownActions = {
            [enterKey]: onEnterKey,
            [escapeKey]: onEscapeKey,
            [upKey]: onDirectionKey,
            [downKey]: onDirectionKey,
        };

        if (keyDownActions[e.keyCode]) {
            keyDownActions[e.keyCode]();
        } else {
            // no search if input non-multi and disabled (because already selected)
            if (!this.config.multi && this.selectedItems.length) {
                return;
            }

            // input value does not have time to fill without timeout
            setTimeout(() => {
                this._searchItems(this.input.value);
            }, 0);
        }
    }

    _onClick(e) {
        const target = e.target;
        const hasActiveDropdown = this.list.classList.contains(this.config.classNames.activeState);

        if (this.container.contains(target)) {
            let foundTarget;

            if (target.hasAttribute('data-clear')) {
                this._clearSelect();
                return;
            }

            if (target.hasAttribute('data-remove')) {
                this._removeItem(target);
                return;
            }

            if (foundTarget = this._findAncestorByAttr(target, 'data-item')) {
                this._selectItem(foundTarget);
                this.hideDropdown();
            }

            if (!hasActiveDropdown) {
                this.showDropdown();
            }
        } else {
            if (hasActiveDropdown) {
                this.hideDropdown();
            }
        }
    }

    _onMouseOver(e) {
        const target = e.target;

        if (target === this.list || this.list.contains(target)) {
            this._unhighlightAll();

            let itemHover;
            if (itemHover = this._findAncestorByAttr(target, 'data-item')) {
                this._highlightElement(itemHover);
            }
        }
    }

    _onTouchMove() {
        if (this.wasTap === true) {
            this.wasTap = false;
        }
    }

    _onTouchEnd(e) {
        const target = e.target || e.touches[0].target;
        const hasActiveDropdown = this.list.classList.contains(this.config.classNames.activeState);

        if (this.wasTap === true && this.container.contains(target)) {
            if (!hasActiveDropdown) {
                this.showDropdown();
            }

            e.stopPropagation();
        } else {
            if (hasActiveDropdown) {
                this.hideDropdown();
            }
        }

        this.wasTap = true;
    }

    _onFocus(e) {
        const target = e.target;
        const hasActiveDropdown = this.list.classList.contains(this.config.classNames.activeState);

        if (this.container.contains(target)) {
            if (!hasActiveDropdown) {
                this.showDropdown();
            }
        }
    }

    _onBlur(e) {
        const target = e.target;
        const hasActiveDropdown = this.list.classList.contains(this.config.classNames.activeState);

        if (this.container.contains(target)) {
            if (hasActiveDropdown) {
                this.hideDropdown();
            }
        }
    }

    _highlightElement(element) {
        element.classList.add(this.config.classNames.highlightedState);
    }

    _unhighlightElement(element) {
        element.classList.remove(this.config.classNames.highlightedState);
    }

    _unhighlightAll() {
        const listItems = this.list.children;

        for (let i = 0; i < listItems.length; i++) {
            const item = listItems[i];

            if (item.classList.contains(this.config.classNames.highlightedState)) {
                this._unhighlightElement(item);
            }
        }
    }

    _scrollListToTop() {
        this.list.scrollTop = 0;
    }

    _scrollListToHighlightElement(element, directionInt) {
        const currentItemBottom = element.offsetTop + element.offsetHeight;
        const currentItemTop = element.offsetTop;
        const currentScrollTop = this.list.scrollTop;
        const listHeight = this.list.offsetHeight;

        // move scrollbar if highlighted not in view
        if (directionInt > 0 && currentItemBottom > listHeight) {
            this.list.scrollTop = currentItemBottom - listHeight;
        } else if (directionInt < 0 && (listHeight + currentItemTop < listHeight + currentScrollTop)) {
            this.list.scrollTop = currentItemTop;
        }
    }

    _findAncestorByAttr(el, attr) {
        let target = el;

        while (target) {
            if (target.hasAttribute(attr)) {
                return target;
            }

            target = target.parentElement;
        }

        return null;
    };

    _clearSelect() {
        this.selectedItems = [];
        this._renderContainer();

        const clear = this.inputContainer.querySelectorAll('[data-clear]')[0];
        clear.style.display = 'none';

        if (this.list.classList.contains(this.config.classNames.activeState)) {
            this.input.focus();
        }
    }

    _renderElement() {
        const container = this._getTemplate('container');
        const input = this._getTemplate('input');
        const inputContainer = this._getTemplate('inputContainer');
        const list = this._getTemplate('list');

        this.container = container;
        this.input = input;
        this.inputContainer = inputContainer;
        this.list = list;

        if (this.config.multi) {
            const selectedList = this._getTemplate('selectedList');
            this.selectedList = selectedList;
            inputContainer.appendChild(selectedList);
        }

        inputContainer.appendChild(input);
        container.appendChild(inputContainer);
        container.appendChild(list);

        if (!this.config.noPhotoPreview) {
            const photoPreviewContainer = this._getTemplate('photoPreviewContainer');
            this.photoPreviewContainer = photoPreviewContainer;
            container.appendChild(photoPreviewContainer);
        }

        this.element.appendChild(container);
    }

    _createTemplates() {
        const globalClasses = this.config.classNames;
        this.config.templates = {
            container: () => {
                const container = document.createElement('div');
                container.className = globalClasses.container;

                return container;
            },
            input: () => {
                const input = document.createElement('input');
                input.className = globalClasses.input;
                input.type = 'text';
                input.placeholder = 'Name...';

                return input;
            },
            inputContainer: () => {
                const container = document.createElement('div');
                container.className = globalClasses.inputContainer;

                const arrow = document.createElement('div');
                arrow.className = globalClasses.inputContainerArrow;
                container.appendChild(arrow);

                if (this.config.multi) {

                } else {
                    const clearButton = document.createElement('div');
                    clearButton.className = globalClasses.inputContainerClear;
                    clearButton.style.display = 'none';
                    clearButton.setAttribute('data-clear', '');
                    container.appendChild(clearButton);
                }

                return container;
            },
            list: () => {
                const list = document.createElement('div');
                list.className = globalClasses.list;

                return list;
            },
            listItem: (object) => {
                const item = document.createElement('div');
                item.className = globalClasses.listItem;
                item.setAttribute('data-item', '');
                item.setAttribute('data-id', object.id);

                const name = document.createElement('div');
                name.className = globalClasses.listItemName;
                name.innerHTML = object.name;

                if (!this.config.noPhoto) {
                    const photo = document.createElement('img');
                    photo.src = object.photo;

                    const photoContainer = document.createElement('div');
                    photoContainer.className = globalClasses.listItemPhotoContainer;

                    photoContainer.appendChild(photo);
                    item.appendChild(photoContainer);
                }

                item.appendChild(name);

                return item;
            },
            listItemEmpty: () => {
                const emptyItem = document.createElement('div');
                emptyItem.className = globalClasses.listItemEmpty;
                emptyItem.innerHTML = 'The user is not found';

                return emptyItem;
            },
            photoPreview: (imgUrl) => {
                const photoBlock = document.createElement('div');
                photoBlock.className = globalClasses.photoPreview;

                const photo = document.createElement('img');
                photo.src = imgUrl;

                photoBlock.appendChild(photo);

                return photoBlock
            },
            photoPreviewContainer: () => {
                const container = document.createElement('div');
                container.className = globalClasses.photoPreviewContainer;

                return container;
            },
            selectedItem: (object) => {
                const item = document.createElement('div');
                item.className = globalClasses.selectedItem;
                item.setAttribute('data-id', object.id);

                const name = document.createElement('div');
                name.className = globalClasses.selectedItemName;
                name.innerHTML = object.name;

                const removeBtn = document.createElement('div');
                removeBtn.className = globalClasses.selectedItemRemove;
                removeBtn.setAttribute('data-remove', '');

                item.appendChild(name);
                item.appendChild(removeBtn);

                return item;
            },
            selectedList: () => {
                const list = document.createElement('div');
                list.className = globalClasses.selectedList;

                const addButton = document.createElement('div');
                addButton.className = globalClasses.inputContainerAdd;
                addButton.innerHTML = 'Add';
                addButton.setAttribute('data-add', '');

                const addButtonIcon = document.createElement('div');
                addButtonIcon.className = globalClasses.inputContainerAddIcon;

                addButton.appendChild(addButtonIcon);
                list.appendChild(addButton);

                return list;
            }
        };
    }

    _getOtherKeyboardLayout(text, type) {
        if (!type) {
            return text;
        }

        const ru = "щ   ш  ч  ц  ю  я  ё  ж  ъ  ы  э  а б в г д е з и й к л м н о п р с т у ф х ь".split(/ +/g);
        const en = "shh sh ch cz yu ya yo zh `` y' e` a b v g d e z i j k l m n o p r s t u f x `".split(/ +/g);
        const ruBad = "o i x w . z \\ ; ] s ' f , d u l t p b q r k v y j g h c n e a [ m".split(/ +/g);

        switch (type) {
            case 'ru2en':
                for (let i = 0; i < ru.length; i++) {
                    text = text.split(ru[i]).join(en[i]);
                }

                return text;

            case 'en2ru':
                for (let i = 0; i < ru.length; i++) {
                    text = text.split(en[i]).join(ru[i]);
                }

                return text;

            case 'enBad2ru':
                for (let i = 0; i < ru.length; i++) {
                    text = text.split(ruBad[i]).join(ru[i]);
                }

                return text;

            case 'ruBad2en2ru':
                for (let i = 0; i < ru.length; i++) {
                    text = text.split(ru[i]).join(ruBad[i]);
                }

                return this._getOtherKeyboardLayout(text, 'en2ru');
        }

        return text;
    }

    _getTemplate(template, ...args) {
        if (!template) {
            return null;
        }

        const templates = this.config.templates;
        return templates[template](...args);
    }

    _renderContainer() {
        if (this.config.multi) {
            if (this.selectedItems.length) {
                this._showSelectedListAddButton();
            }
        } else {
            if (this.selectedItems.length) {
                this._showSelectedClearButton();
            } else {
                this._hideSelectedClearButton();
            }
        }

        this._renderListItems(this.config.presetItems);
        this._renderSelectedItems();
    }

    _renderListItems(items, fromServer) {
        const fragment = document.createDocumentFragment();
        const selectedIds = this.selectedItems.map((item) => +item.getAttribute('data-id'));

        const currentRenderedItems = this.list.querySelectorAll('[data-item]');
        let currentRenderedCount = currentRenderedItems.length;
        let currentRenderedIds = [];

        if (fromServer) {
            for (let i = 0; i < currentRenderedCount; i++) {
                const item = currentRenderedItems[i];
                currentRenderedIds.push(+item.getAttribute('data-id'));
            }
        }

        items.forEach((user) => {
            // if local search and not in selected or
            // server search and not in rendered
            if ((!fromServer && !~selectedIds.indexOf(user.id)) || (fromServer && !~currentRenderedIds.indexOf(user.id))) {
                const option = this._getTemplate('listItem', user);

                fragment.appendChild(option);
            }
        });

        if (!fromServer || (fromServer && !currentRenderedCount)) {
            this.list.innerHTML = '';
        }
        this.list.appendChild(fragment);

        currentRenderedCount = this.list.querySelectorAll('[data-item]').length;
        if (!currentRenderedCount) {
            this._renderListItemsEmpty();
        }
    }

    _renderListItemsEmpty() {
        const optionEmpty = this._getTemplate('listItemEmpty');
        this.list.appendChild(optionEmpty);
    }

    _renderPhotoPreview(objects) {
        const fragment = document.createDocumentFragment();

        objects.forEach((object) => {
            const photo = this._getTemplate('photoPreview', object.photo);

            fragment.appendChild(photo);
        });

        this.photoPreviewContainer.innerHTML = '';
        this.photoPreviewContainer.appendChild(fragment);
    }

    _renderSelectedItems() {
        const selectedIds = this.selectedItems.map((item) => +item.getAttribute('data-id'));
        let selectedObjects = [];

        for (let i = 0; i < selectedIds.length; i++) {
            const selectedId = selectedIds[i];
            const selectedObject = this.config.presetItems.filter((obj) => {
                return obj.id === selectedId;
            })[0];

            selectedObjects.push(selectedObject);
        }

        if (this.config.multi) {
            const fragment = document.createDocumentFragment();
            const addButton = this.selectedList.querySelectorAll('[data-add]')[0].cloneNode(true);
            addButton.style.display = this.selectedItems.length ? 'inline-block' : 'none';

            selectedObjects.forEach((object) => {
                const option = this._getTemplate('selectedItem', object);

                fragment.appendChild(option);
            });

            this.selectedList.innerHTML = '';
            this.selectedList.appendChild(fragment);
            this.selectedList.appendChild(addButton);
        } else {
            if (this.selectedItems.length > 0) {
                const selectedId = +this.selectedItems[0].getAttribute('data-id');
                const selectedObject = this.config.presetItems.filter((obj) => {
                    return obj.id === selectedId;
                })[0];

                this.input.value = selectedObject.name;
                this.input.setAttribute('readonly', 'readonly');
            } else {
                this.input.value = '';
                this.input.removeAttribute('readonly');
            }
        }

        if (!this.config.noPhotoPreview) {
            this._renderPhotoPreview(selectedObjects);
        }
    }

    _searchItems(value) {
        if (!value) {
            this._renderListItems(this.config.presetItems);
        }

        const items = this.config.presetItems;
        const q = value.toLowerCase();

        let itemsFiltered = items.filter((person, index) => {
            const name = person.name.toLowerCase().split(' ');
            let answer = false;

            // split name for search only from begin of first name/last name
            for (let i = 0; i < name.length; i++) {
                const namePart = name[i];

                const qRu2en = this._getOtherKeyboardLayout(q, 'ru2en');
                const qEn2ru = this._getOtherKeyboardLayout(q, 'en2ru');
                const qEnBad2ru = this._getOtherKeyboardLayout(q, 'enBad2ru');
                const qRuBad2en2ru = this._getOtherKeyboardLayout(q, 'ruBad2en2ru');

                answer = !namePart.indexOf(q) ||
                         !namePart.indexOf(qRu2en) ||
                         !namePart.indexOf(qEn2ru) ||
                         !namePart.indexOf(qEnBad2ru) ||
                         !namePart.indexOf(qRuBad2en2ru);

                if (answer) {
                    return answer;
                }
            }

            return answer;
        });

        this._renderListItems(itemsFiltered);

        if (!this.config.noServerSearch) {
            this._searchOnServer(q);
        }
    }

    _searchOnServer(q) {
        const $this = this;
        const params = `items=${encodeURIComponent(JSON.stringify(this.config.presetItems))}&q=${q}`;

        if (this.xhr && this.xhr.readyState !== 4) {
            this.xhr.abort();
        }

        this.xhr = new XMLHttpRequest();
        this.xhr.open('POST', 'api.php', true);
        this.xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        this.xhr.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                const data = JSON.parse(this.response);

                $this._renderListItems(data, true);
            }
        };
        this.xhr.onerror = function(error) {
            console.log(error)
        };
        this.xhr.send(params);

        // todo can opera 12.16 support Promise?
        // const data = new FormData();
        // data.append('items', JSON.stringify(this.config.presetItems));
        // data.append('q', q);
        //
        // fetch('api.php', {
        //     method: 'POST',
        //     body: data
        // }).then((response) => response.json()).then((result) => {
        //     console.log(result);
        // }).catch((error) => console.log(error));
    }

    _selectItem(element) {
        if (!element) {
            return;
        }

        this.input.value = '';

        if (!this.config.multi) {
            this.selectedItems = [];
        }

        this.selectedItems.push(element);


        this._renderContainer();
    }

    _removeItem(element) {
        if (!element || !this.config.multi) {
            return;
        }

        const userId = +element.parentElement.getAttribute('data-id');
        this.selectedItems = this.selectedItems.filter(function(obj) {
            return +obj.getAttribute('data-id') !== userId;
        });

        this.hideDropdown();
        this._renderContainer();
    }

    hideDropdown() {
        this.input.blur();
        this._scrollListToTop();
        this._unhighlightAll();

        this.container.classList.remove(this.config.classNames.openState);
        this.list.classList.remove(this.config.classNames.activeState);

        if (this.config.multi) {
            if (!this.selectedItems.length) {
                this._showInput();
            }

            if (this.selectedItems.length && !this.input.value) {
                this._showSelectedListAddButton();
                this._hideInput();
            }
        }
    }

    showDropdown() {
        this.input.focus();
        this.container.classList.add(this.config.classNames.openState);
        this.list.classList.add(this.config.classNames.activeState);

        if (this.config.multi) {
            this._hideSelectedListAddButton();
            this._showInput();
            this.input.focus();
        }
    }

    _hideSelectedClearButton() {
        const clearButton = this.inputContainer.querySelectorAll('[data-clear]')[0];
        clearButton.style.display = 'none';
    }

    _showSelectedClearButton() {
        const clearButton = this.inputContainer.querySelectorAll('[data-clear]')[0];
        clearButton.style.display = 'block';
    }

    _hideSelectedListAddButton() {
        const addButton = this.selectedList.querySelectorAll('[data-add]')[0].cloneNode(true);
        addButton.style.display = 'none';
    }

    _showSelectedListAddButton() {
        const addButton = this.selectedList.querySelectorAll('[data-add]')[0].cloneNode(true);
        addButton.style.display = 'inline-block';
    }

    _hideInput() {
        this.input.style.display = 'none';
    }

    _showInput() {
        this.input.style.display = 'inline';
    }
}