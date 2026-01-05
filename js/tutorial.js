$(document).ready(function() {
    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
            classes: 'shepherd-theme-custom',
            scrollTo: true,
            cancelIcon: {
                enabled: true
            },
            modalOverlayOpeningPadding: 6,
            modalOverlayOpeningRadius: 4,
            when: {
                show: () => {
                    const element = document.querySelector('.shepherd-element');
                    if (element) {
                        element.style.opacity = '0';
                        setTimeout(() => {
                            element.style.opacity = '1';
                        }, 100);
                    }
                }
            }
        }
    });

    tour.addStep({
        id: 'welcome',
        text: `<div class="tutorial-step">
                 <h3 class="tutorial-title">Добро пожаловать в ChatLog Parser!</h3>
                 <p>Это простой инструмент для создания красивых скриншотов из логов чата RAGE.</p>
                 <p>Быстро покажем основные функции, чтобы вы могли начать работу без затруднений.</p>
                 <p>Нажмите «Начать» для тура или «Закрыть» чтобы начать работу самостоятельно.</p>
                 </div>`,
        buttons: [
            {
                text: 'Закрыть',
                action: tour.cancel,
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Начать',
                action: tour.next
            }
        ]
    });

    const steps = [
        {
            id: 'textarea',
            element: '.textarea-input',
            title: 'Поле для ввода текста',
            text: 'Сюда необходимо вставить текст из консоли RAGE, чтобы он появился в предпросмотре. Просто скопируйте лог чата и вставьте его в это поле.',
            attachTo: {
                element: '.textarea-input',
                on: 'auto'
            }
        },
        {
            id: 'font-size',
            element: 'input[name="font-label"]',
            title: 'Размер шрифта',
            text: 'Подберите оптимальный размер шрифта для лучшей читаемости. От этого зависит четкость отображения текста и общий вид скриншота.',
            attachTo: {
                element: 'input[name="font-label"]',
                on: 'auto'
            }
        },
        {
            id: 'line-height',
            element: 'input[name="line-height"]',
            title: 'Межстрочный интервал',
            text: 'Если строки накладываются друг на друга, используйте эту настройку для изменения расстояния между строками.',
            attachTo: {
                element: 'input[name="line-height"]',
                on: 'auto'
            }
        },
        {
            id: 'font-family',
            element: '#font-family',
            title: 'Выбор шрифта',
            text: 'Выберите подходящий шрифт из списка. Все представленные шрифты доступны на сервере по команде /font.',
            attachTo: {
                element: '#font-family',
                on: 'auto'
            }
        },
        {
            id: 'color-picker',
            element: '#color-picker',
            title: 'Цвет текста',
            text: 'Измените цвет текста по вашему усмотрению. Выберите подходящий оттенок для лучшей читаемости.',
            attachTo: {
                element: '#color-picker',
                on: 'auto'
            }
        },
        {
            id: 'preview',
            element: '#output',
            title: 'Окно предпросмотра',
            text: 'Здесь отображается текст в реальном времени. Окно автоматически расширяется вниз по мере добавления текста.',
            attachTo: {
                element: '#output',
                on: 'auto'
            }
        },
        {
            id: 'download',
            element: '#downloadOutputTransparent',
            title: 'Сохранение в PNG',
            text: 'Когда все настройки готовы, нажмите эту кнопку чтобы сохранить изображение. Файл сохранится с текущими размерами окна и всеми вашими настройками.',
            attachTo: {
                element: '#downloadOutputTransparent',
                on: 'auto'
            }
        },
        {
            id: 'info-button',
            element: '#infoButton',
            title: 'Информация',
            text: 'По этой кнопке вы найдете информацию об авторах и исходных версиях инструмента.',
            attachTo: {
                element: '#infoButton',
                on: 'auto'
            }
        }
    ];

    steps.forEach(step => {
        tour.addStep({
            id: step.id,
            attachTo: {
                element: step.element,
                on: step.attachTo ? step.attachTo.on : 'auto'
            },
            text: `<div class="tutorial-step">
                     <h3 class="tutorial-title">${step.title}</h3>
                     <p>${step.text}</p>
                   </div>`,
            buttons: [
                {
                    text: 'Назад',
                    action: tour.back,
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Далее',
                    action: tour.next
                }
            ],
            scrollTo: true,
            scrollToHandler: (element) => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    $('#tutorialButton').click(function() {
        tour.start();
    });
});
