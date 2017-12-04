(function () {
    const users = [{
        id: 6492,
        domain: 'andrew',
        name: 'Андрей Рогозов',
        photo: 'https://pp.userapi.com/c837536/v837536492/2f071/MKFJhcgkfuE.jpg'
    }, {
        id: 5592362,
        domain: 'kate_clapp',
        name: 'Катя Клэп',
        photo: 'https://pp.userapi.com/c840338/v840338244/271d9/fAursVVqjJE.jpg'

    }, {
        id: 100897602,
        domain: 'maryanaro',
        name: 'Марьяна Рожкова',
        photo: 'https://pp.userapi.com/c824204/v824204668/340c8/ISaby7V0lmM.jpg'
    }, {
        id: 169902419,
        domain: 'sashaspilberg',
        name: 'Саша Спилберг',
        photo: 'https://pp.userapi.com/c837634/v837634075/59fcd/ti_aUZlSWHA.jpg'
    }, {
        id: 39377403,
        domain: 'nyusha',
        name: 'Нюша Шурочкина',
        photo: 'https://pp.userapi.com/c841124/v841124120/3743f/8KailDsp3RE.jpg'
    }, {
        id: 45269508,
        domain: 'makozhevnikova',
        name: 'Мария Кожевникова',
        photo: 'https://pp.userapi.com/c630325/v630325508/39926/cuEE1bErWaE.jpg'
    }, {
        id: 5401645,
        domain: 'maria_way',
        name: 'Maria Way',
        photo: 'https://pp.userapi.com/c638717/v638717645/454fc/KFED7itZSrw.jpg'
    }, {
        id: 1034437,
        domain: 'victoriabonya',
        name: 'Виктория Боня',
        photo: 'https://pp.userapi.com/c837225/v837225437/5d614/UJSGdiiBH9Q.jpg'
    }, {
        id: 16971887,
        domain: '',
        name: 'Кристина Добродушная',
        photo: 'https://pp.userapi.com/c837234/v837234887/1163c/oEG2i3ZbdPY.jpg'
    }, {
        id: 2183659,
        domain: 'sonyatemnikova',
        name: 'Софья Темникова',
        photo: 'https://pp.userapi.com/c639522/v639522043/7163c/zXyjDtPmGN4.jpg'
    }, {
        id: 11760214,
        domain: 'fukkacumi',
        name: 'Анастасия Шпагина',
        photo: 'https://pp.userapi.com/c836321/v836321214/2d3b9/gGjWAzBLR6w.jpg'
    }, {
        id: 79201190,
        domain: 'katyasambuca',
        name: 'Катя Самбука',
        photo: 'https://pp.userapi.com/c638530/v638530108/60326/eHriDw_JG4E.jpg'
    }, {
        id: 292243967,
        domain: 'vb',
        name: 'Вера Брежнева',
        photo: 'https://pp.userapi.com/c624217/v624217967/1d866/XLDPGsWPZl8.jpg'
    }, {
        id: 20020126,
        domain: 'tina_kandelaki',
        name: 'Тина Канделаки',
        photo: 'https://pp.userapi.com/c314627/v314627126/5415/clcj3qdDi4Y.jpg'
    }, {
        id: 32707600,
        domain: 'olgabuzova',
        name: 'Ольга Бузова',
        photo: 'https://pp.userapi.com/c840539/v840539808/29f22/jzpG-0ddBio.jpg'
    }, {
        id: 371792983,
        domain: 'rimskiykorsakovstreet',
        name: 'Николай Римский-Корсаков',
        photo: 'https://pp.userapi.com/c604425/v604425983/126e3/wP1YwOYMTp8.jpg'
    }];

    const vkDropdown = new VkDropdown('[data-trigger="vk-dropdown"]', {
        presetItems: users
    });

    function renderUserDomains(users) {
        const domains = document.getElementById('domains');

        let fragment = document.createDocumentFragment();
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const domain = document.createElement('div');
            domain.innerHTML = `${user.name} (${(user.domain ? user.domain : '---')})`;
            fragment.appendChild(domain);
        }

        domains.appendChild(fragment);
    }
    renderUserDomains(users);
})();
