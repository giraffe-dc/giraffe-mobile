/**
 * Офлайн-копія реального контенту сайту (знімок site_content + reviews),
 * згенерована через GET /api/mobile/catalog. Використовується тільки тоді,
 * коли живе API недоступне (немає мережі або ендпоінт ще не задеплоєний).
 * НЕ редагуйте вручну — оновіть, повторивши знімок з сайту.
 */
import type { Catalog } from '../types/catalog';

export const FALLBACK_CATALOG: Catalog = {
  "source": "fallback",
  "services": [
    {
      "id": "animators 1",
      "emoji": "🎈",
      "title": "ВЕСЕЛА КОМПАНІЯ",
      "desc": "1 аніматор + ведучий, активні, розважальні ігри або квест під сучасні тренди . Костюми на вибір. До 10 дітей.",
      "category": "animators",
      "audiences": [],
      "images": [
        "/api/media/6afbf9e8b0cc4eb083bcf169"
      ],
      "published": true,
      "variants": [
        {
          "id": "animators 1-1",
          "label": "1 год",
          "durationMin": 60,
          "price": 1500
        },
        {
          "id": "animators 1-2",
          "label": "2 год",
          "durationMin": 120,
          "price": 2500
        }
      ],
      "requirements": [],
      "calcLabel": "1 Аніматор \"ВЕСЕЛА КОМПАНІЯ\" · 1 година",
      "format": "Аніматори",
      "imageAlt": "Аніматор проводить гру з дітьми на дні народження"
    },
    {
      "id": "animators 3",
      "emoji": "🎈",
      "title": "СВЯТО НА ПОВНУ",
      "desc": "2 аніматора + ведучий, активні, розважальні ігри або квест під сучасні тренди . Костюми на вибір. 11-20 дітей .",
      "category": "animators",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "animators 3-1",
          "label": "1 год",
          "durationMin": 60,
          "price": 2500
        },
        {
          "id": "animators 3-2",
          "label": "2 год",
          "durationMin": 120,
          "price": 4000
        }
      ],
      "requirements": [],
      "calcLabel": "2 Аніматори СВЯТО НА ПОВНУ · 1 година",
      "format": "Аніматори"
    },
    {
      "id": "puppets",
      "emoji": "🦒",
      "title": "Ростова лялька",
      "desc": "1 ростова лялька на вибір, фольгована куля наповнена гелієм, ведучий з мікрофоном, іменна пісня в подарунок. При замовленні 2 і більше ростових діє знижка.",
      "category": "puppets",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "puppets-1",
          "label": "15 хв",
          "durationMin": 15,
          "price": 1500
        }
      ],
      "requirements": [],
      "calcLabel": "Ростова лялька · 15 хв",
      "format": "Ростові ляльки"
    },
    {
      "id": "vr",
      "emoji": "🥽",
      "title": "VR PORTAL",
      "desc": "Відірвати дитину від телефону можливо! 2 VR-окулярів із насиченими іграми. Розмістимося навіть у невеликій кімнаті. Замовлення по Теплику 1 год і більше, за межі Теплика від 2 годин",
      "category": "gaming",
      "audiences": [
        "вік 7+"
      ],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "vr-1",
          "label": "1 год",
          "durationMin": 60,
          "price": 1500
        },
        {
          "id": "vr-2",
          "label": "2 год",
          "durationMin": 120,
          "price": 2500
        }
      ],
      "requirements": [
        "вік 7+"
      ],
      "calcLabel": "VR PORTAL · 1 година",
      "format": "VR-клас"
    },
    {
      "id": "ps 1",
      "emoji": "🎮",
      "title": "PS  PORTAL",
      "desc": "Телевізор, консоль, джойстики та зручні пуфи. Ігри різного жанру . Для дітей і дорослих. Замовлення по Теплику 1 год і більше, за межі Теплика від 2 годин",
      "category": "gaming",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "ps 1-1",
          "label": "1 год",
          "durationMin": 60,
          "price": 1500
        },
        {
          "id": "ps 1-2",
          "label": "2 год",
          "durationMin": 120,
          "price": 2500
        }
      ],
      "requirements": [],
      "calcLabel": "PS  PORTAL· 1 година",
      "format": "PlayStation 4"
    },
    {
      "id": "шоу 1",
      "emoji": "🎈",
      "title": "Бульбашкове шоу",
      "desc": "Не приховуємо що і дорослі люблять бульбашки ;) Бульки від маленької до гігантської. Інтерактивні ігри. Кожний зможе сам зробити довгу або велику бульку. Побувати у трубі з бульки а якщо пощастить то в самій бульці. Ми оновили шоу і добавили трішки піни та вогню!!! Тому вогонь, вода і труба з бульки!!!",
      "category": "shows",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "шоу 1-1",
          "label": "40 хв",
          "durationMin": 40,
          "price": 1500
        }
      ],
      "requirements": [],
      "calcLabel": "Бульбашкове шоу",
      "format": "Аніматори"
    },
    {
      "id": "шоу 2",
      "emoji": "✨",
      "title": "Неонове шоу",
      "desc": "Стрічки атласні покриті особливим розчином, диско шар, неонове світло, аквагрим який світиться та запальна музика зробить ваше свято веселішим та драйвовішим.",
      "category": "shows",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "шоу 2-1",
          "label": "30 хв",
          "durationMin": 30,
          "price": 1500
        }
      ],
      "requirements": [],
      "calcLabel": "Неонове шоу",
      "format": "Аніматори"
    },
    {
      "id": "шоу 3",
      "emoji": "🎈",
      "title": "Паперове шоу",
      "desc": "Блискуча фольга, яскравий диско шар, запальна музика не залишить нікого байдужим. Підходить для різного віку.",
      "category": "shows",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "шоу 3-1",
          "label": "30 хв",
          "durationMin": 30,
          "price": 1000
        }
      ],
      "requirements": [],
      "calcLabel": "Паперове шоу",
      "format": "Аніматори"
    },
    {
      "id": "new-xcfa8tb",
      "emoji": "🧪",
      "title": "Кріо шоу",
      "desc": "Наука не буває нудною! І ми це доводимо! Вау ефект для всіх. Робота з сухим льодом. Ознайомлення, експеременти, досліди, інтерактиви.",
      "category": "shows",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "new-xcfa8tb-1",
          "label": "1 год",
          "durationMin": 60,
          "price": 3000
        }
      ],
      "requirements": [],
      "calcLabel": "Кріо шоу",
      "format": "Аніматори"
    },
    {
      "id": "new-008nqqs",
      "emoji": "💖",
      "title": "Блиск тату",
      "desc": "Тату яке полюбляють всі діти.",
      "category": "extras",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "new-008nqqs-1",
          "label": "1 шт",
          "durationMin": 0,
          "price": 60
        }
      ],
      "requirements": [],
      "calcLabel": "Блиск тату",
      "format": "Аніматори"
    },
    {
      "id": "new-bmbk4ot",
      "emoji": "🎄",
      "title": "Новорічний Експрес",
      "desc": "1 герой на вибір ,Санта або Миколай + ведучий до 15 дітей! Програма на 30 хвилин включає: 2-3 активних гри, 2 руханки, зустріч з Миколаєм чи Сантою, фото з героями.",
      "category": "seasonal",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "new-bmbk4ot-1",
          "label": "30 хв",
          "durationMin": 30,
          "price": 2000
        }
      ],
      "requirements": [],
      "calcLabel": "Новорічний Експрес · 30 хвилин",
      "format": "Аніматори"
    },
    {
      "id": "new-c0sebs9",
      "emoji": "🎄",
      "title": "Новорічний Стандарт",
      "desc": "1 герой на вибір , Санта або Миколай + ведучий до 15 дітей! Програма на 1 годину включає: 4 -5 активних гри, 2 руханки, зустріч з Миколаєм чи Сантою, фото з героями.",
      "category": "seasonal",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "new-c0sebs9-1",
          "label": "1 год",
          "durationMin": 60,
          "price": 3000
        }
      ],
      "requirements": [],
      "calcLabel": "Новорічний Стандарт · 1 година",
      "format": "Аніматори"
    },
    {
      "id": "new-c3mre4s",
      "emoji": "🎄",
      "title": "Новорічний Максі-Експрес",
      "desc": "2 героя на вибір ,Санта або Миколай + ведучийдо 25 дітей! Програма на 30 хвилин включає: 2 -3 активних гри, 2 руханки, зустріч з Миколаєм чи Сантою, фото з героями.",
      "category": "seasonal",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "new-c3mre4s-1",
          "label": "30 хв",
          "durationMin": 30,
          "price": 3000
        }
      ],
      "requirements": [],
      "calcLabel": "Новорічний Максі-Експрес · 30 хвилин",
      "format": "Аніматори"
    },
    {
      "id": "new-2m4ievs",
      "emoji": "🎄",
      "title": "Новорічний Гранд",
      "desc": "2 героя на вибір ,Санта або Миколай + ведучийдо 25 дітей! Програма на 1 годину включає: 4 -5 активних ігор, 2 руханки, зустріч з Миколаєм чи Сантою, фото з героями.",
      "category": "seasonal",
      "audiences": [],
      "images": [],
      "published": true,
      "variants": [
        {
          "id": "new-2m4ievs-1",
          "label": "1 год",
          "durationMin": 60,
          "price": 4000
        }
      ],
      "requirements": [],
      "calcLabel": "Новорічний Гранд  · 1 година",
      "format": "Аніматори"
    },
    {
      "id": "mk-1",
      "emoji": "🎨",
      "title": "Майстер-класи",
      "desc": "Свічки, шопери, картини піском, слайм, брелоки, декупаж. Вибір теми узгоджуємо при замовленні.",
      "category": "workshops",
      "audiences": [],
      "images": [],
      "imageAlt": "Діти на майстер-класі роблять вироби своїми руками",
      "published": true,
      "variants": [
        {
          "id": "mk-1-1",
          "label": "1 шт",
          "durationMin": 0,
          "price": 300
        },
        {
          "id": "new-7qyget5",
          "label": "1 шт",
          "pricingUnit": "time",
          "durationMin": 0,
          "price": 200
        }
      ],
      "requirements": [
        "Мінімальне замовлення — 1 дитина",
        "Технічні умови залежать від виду майстер-класу — уточнюється при замовленні"
      ],
      "calcLabel": "Майстер-клас · 1 дитина",
      "format": "Аніматори"
    },
    {
      "id": "face-paint",
      "emoji": "🖌️",
      "title": "Аквагрим",
      "desc": "Аквагрим для дітей на святі — яскраві образи на обличчі. Додаткова послуга до основного замовлення.",
      "category": "extras",
      "audiences": [],
      "images": [],
      "imageAlt": "Дитині малюють яскравий аквагрим на обличчі",
      "published": true,
      "variants": [
        {
          "id": "face-paint-1",
          "label": "1 дитина",
          "durationMin": 10,
          "price": 150
        }
      ],
      "requirements": [
        "Додаткова послуга — додається до основного замовлення",
        "Мінімальне замовлення — 1 дитина"
      ],
      "calcLabel": "Аквагрим · 1 дитина",
      "format": "Аніматори"
    },
    {
      "id": "costume-rent",
      "emoji": "🎭",
      "title": "Прокат костюмів",
      "desc": "Оренда святкових костюмів для дітей і дорослих. Наявність, ціна й умови уточнюються при замовленні.",
      "category": "extras",
      "audiences": [],
      "images": [],
      "imageAlt": "Святковий костюм для дитячого дня народження",
      "published": true,
      "variants": [
        {
          "id": "costume-rent-1",
          "label": "1 доба",
          "durationMin": 0,
          "price": 400
        }
      ],
      "requirements": [
        "Наявність потрібного костюма уточнюється при замовленні",
        "Умови прокату (застава, термін) уточнюються при замовленні"
      ],
      "calcLabel": "Прокат костюма · 1 доба",
      "format": "Аніматори"
    },
    {
      "id": "surprise-balloon",
      "emoji": "🎈",
      "title": "Куля-сюрприз",
      "desc": "Куля з сюрпризам усередині — яскравий момент свята, який запам’ятається.",
      "category": "extras",
      "audiences": [],
      "images": [],
      "imageAlt": "Велика святкова куля-сюрприз",
      "published": true,
      "variants": [
        {
          "id": "surprise-balloon-1",
          "label": "1 шт",
          "durationMin": 0,
          "price": 350
        }
      ],
      "requirements": [
        "Мінімальне замовлення — 1 шт"
      ],
      "calcLabel": "Куля-сюрприз · 1 шт",
      "format": "Аніматори"
    },
    {
      "id": "cake-out",
      "emoji": "🎂",
      "title": "Винесення торта",
      "desc": "Винесення торта з піснею — фінальний момент дня народження.",
      "category": "extras",
      "audiences": [],
      "images": [],
      "imageAlt": "Винесення святкового торта зі свічками",
      "published": true,
      "variants": [
        {
          "id": "cake-out-1",
          "label": "1 подія",
          "durationMin": 15,
          "price": 400
        }
      ],
      "requirements": [
        "Узгоджується зі сценарієм свята"
      ],
      "calcLabel": "Винесення торта · 1 подія",
      "format": "Аніматори"
    }
  ],
  "packages": [
    {
      "id": "mini",
      "name": "Пакет PARTY BOOM",
      "sub": "",
      "price": "3000грн",
      "period": "/1 година",
      "bundlePrice": 3000,
      "items": [
        {
          "variantId": "animators 1-1",
          "qty": 1,
          "text": "1 аніматор + ведучий"
        },
        {
          "variantId": "",
          "qty": 1,
          "text": "Аніматорська міні програма на  вибір"
        },
        {
          "variantId": "шоу 3-1",
          "qty": 1,
          "text": "Паперове шоу"
        },
        {
          "variantId": "new-008nqqs-1",
          "qty": 10,
          "text": "Блиск тату"
        },
        {
          "variantId": "mk-1-1",
          "qty": 1,
          "text": "Винесення святкового торта у подарунок!  Аніматором"
        },
        {
          "text": "ДО 10 ДІТЕЙ!"
        }
      ],
      "hit": false,
      "format": "Комбо-програма",
      "audiences": [],
      "published": true
    },
    {
      "id": "standard",
      "name": "Пакет PARTY BOOM",
      "sub": "",
      "price": "5000грн",
      "period": "/2години",
      "bundlePrice": 5000,
      "items": [
        {
          "variantId": "animators 1-1",
          "qty": 1,
          "text": "1 аніматор + ведучий"
        },
        {
          "variantId": "animators 1-1",
          "qty": 1,
          "text": "Аніматорська програма на  вибір"
        },
        {
          "variantId": "шоу 3-1",
          "qty": 1,
          "text": "Паперове шоу"
        },
        {
          "variantId": "new-008nqqs-1",
          "qty": 1,
          "text": "Блиск тату"
        },
        {
          "text": "Винесення святкового торта у подарунок!"
        },
        {
          "text": "ДО 10 ДІТЕЙ!"
        },
        {
          "variantId": "puppets-1",
          "qty": 1,
          "text": "Ростова лялька"
        }
      ],
      "hit": true,
      "format": "Комбо-програма",
      "audiences": [],
      "published": true
    },
    {
      "id": "vip",
      "name": "Пакет PARTY MIX",
      "sub": "",
      "price": "4000грн",
      "period": "/1година",
      "bundlePrice": 4000,
      "items": [
        {
          "variantId": "animators 3-1",
          "qty": 1,
          "text": "2 аніматори +ведучий"
        },
        {
          "variantId": "animators 1-1",
          "qty": 1,
          "text": "Аніматорська міні програма на  вибір"
        },
        {
          "variantId": "шоу 3-1",
          "qty": 1,
          "text": "Паперове шоу"
        },
        {
          "variantId": "new-008nqqs-1",
          "qty": 1,
          "text": "Блиск тату"
        },
        {
          "text": "Винесення святкового торта у подарунок!"
        },
        {
          "text": "11-20 ДІТЕЙ!"
        }
      ],
      "hit": false,
      "format": "Комбо-програма",
      "audiences": [],
      "published": true
    },
    {
      "id": "new-mdukvec",
      "name": "Пакет PARTY MIX",
      "sub": "",
      "price": "8500грн ",
      "period": "/2години",
      "bundlePrice": 8500,
      "items": [
        {
          "variantId": "animators 3-1",
          "qty": 1,
          "text": "2 аніматори +ведучий"
        },
        {
          "variantId": "animators 1-1",
          "qty": 1,
          "text": "Аніматорська  програма на  вибір"
        },
        {
          "variantId": "шоу 3-1",
          "qty": 1,
          "text": "Паперове шоу, Блиск тату або Бульбашкове шоу або Неонове шоу"
        },
        {
          "text": "1 Майстер клас на вибір: МК Свічка з вощини, МК Картина піском, МК Гіпсові магніти, МК Баночка бажань, МК Міст для тіла , МК Парфюм"
        },
        {
          "text": "Винесення святкового торта у подарунок!"
        },
        {
          "variantId": "puppets-1",
          "qty": 1,
          "text": "Ростова лялька"
        },
        {
          "text": "11-20 ДІТЕЙ!"
        }
      ],
      "hit": false,
      "format": "Комбо-програма",
      "audiences": [],
      "published": true
    },
    {
      "id": "new-lo91nas",
      "name": "Пакет GAME PORTAL MAX",
      "sub": "GAME COMBO - подвійний драйв!!! Дві розваги-одна вигідна ціна!!!",
      "price": "2500",
      "period": "/1 година",
      "bundlePrice": 2500,
      "items": [
        {
          "variantId": "vr-1",
          "qty": 1,
          "text": "2 VR-окулярів із насиченими іграми"
        },
        {
          "variantId": "ps 1-1",
          "qty": 1,
          "text": "Телевізор"
        },
        {
          "variantId": "ps 1-1",
          "qty": 1,
          "text": "Консоль, джойстики . Ігри різного жанру"
        },
        {
          "text": "Зручні пуфи"
        }
      ],
      "hit": false,
      "format": "Комбо-програма",
      "audiences": [],
      "published": true
    },
    {
      "id": "new-rcmwyje",
      "name": "Пакет GAME PORTAL MAX",
      "sub": "GAME COMBO - подвійний драйв!!! Дві розваги-одна вигідна ціна!!!",
      "price": "4300",
      "period": "/2 години",
      "bundlePrice": 4300,
      "items": [
        {
          "variantId": "vr-1",
          "qty": 1,
          "text": "2 VR-окулярів із насиченими іграми"
        },
        {
          "variantId": "ps 1-1",
          "qty": 1,
          "text": "Телевізор"
        },
        {
          "variantId": "ps 1-1",
          "qty": 1,
          "text": "Консоль, джойстики . Ігри різного жанру"
        },
        {
          "text": "Зручні пуфи"
        }
      ],
      "hit": false,
      "format": "Комбо-програма",
      "audiences": [],
      "published": true
    }
  ],
  "reviews": [
    {
      "id": "6af57095da1cdd308db1915d",
      "stars": "★★★★★",
      "rating": 5,
      "quote": "«Здивували дружину та дітей — жираф із кульками прийшов просто в офіс на ранок. Колеги досі згадують. Ціна виявилась чесна, без сюрпризів.»",
      "initial": "А",
      "name": "Андрій С.",
      "context": "Раптове привітання в офісі · 📍 відео",
      "avatar": "m2-ava--1"
    },
    {
      "id": "6af57095da1cdd308db1915c",
      "stars": "★★★★★",
      "rating": 5,
      "quote": "«Випускний у садку — три ростові ляльки та PS-зона для старшаків. Приїхали за годину до початку, все самі підключили. Дякуємо!»",
      "initial": "І",
      "name": "Ірина М.",
      "context": "Випускний, дитсадок №14 · 📍 фото зі свята",
      "avatar": "m2-ava--2"
    },
    {
      "id": "6af57095da1cdd308db1915b",
      "stars": "★★★★★",
      "rating": 5,
      "quote": "«Замовляли аніматора-пірата на 7 років сину прямо у двір будинку. Діти були щасливі, а нам не треба нікуди їхати. VR-станція теж заїшла на ура!»",
      "initial": "О",
      "name": "Олена К.",
      "context": "День народження вдома · 📍 фото зі свята",
      "avatar": "m2-ava--3"
    }
  ],
  "timeline": [
    {
      "time": "за 5–7 днів",
      "title": "Фіксуємо дату",
      "text": "Заявка, вибір персонажів і програми. Передоплата 30% — решта на місці."
    },
    {
      "time": "10−20 хв",
      "title": "Приїзд і монтаж",
      "text": "Костюми, звук, реквізит уже біля ваших дверей. Ви нічого не пакуєте."
    },
    {
      "time": "0:05–0:10",
      "title": "Знайомство",
      "text": "Перше привітання, ігри та розкачка компанії — діти вже в справі.",
      "on": true
    },
    {
      "time": "0:30–2:00",
      "title": "Програма",
      "text": "Квест, шоу, дискотека або VR/PS4-зона — за обраним форматом.",
      "on": true
    },
    {
      "time": "Фінал",
      "title": "Завершення свята",
      "text": "Фото-відео згадка гостей з персонажами"
    },
    {
      "time": "10-20 хв",
      "title": "Збір",
      "text": "Знімаємо розкладку з місця, розрахунок за проведене свято та чекаємо наступних замовлень"
    }
  ],
  "promises": [
    {
      "ico": "⏱",
      "title": "Приїжджаємо за 20 хвилин до",
      "text": "Команда вже на місці до початку: розгортаємо звук, реквізит і костюми, поки ви гостей зустрічаєте."
    },
    {
      "ico": "🧾",
      "title": "Ціна без сюрпризів",
      "text": "Передоплата 30% фіксує персонажів і програму, решта — на місці. Нічого не «додається» в момент свята."
    },
    {
      "ico": "📸",
      "title": "Ви отримуєте результат",
      "text": "Програму ведуть наші ведучі, а після свята Ви святкуєте, а не працюєте."
    }
  ],
  "trust": [
    {
      "value": "100+",
      "label": "проведених свят"
    },
    {
      "value": "40+ км",
      "label": "радіус виїзду"
    },
    {
      "value": "30+",
      "label": "персонажів"
    },
    {
      "value": "20 хв",
      "label": "середня відповідь"
    }
  ],
  "hero": {
    "titleLead": "Свято ",
    "titleAccent": "приїжджає",
    "titleTail": " до Вас",
    "lead": "Аніматори, шоу програми, майстер класи, ростові ляльки, VR-окуляри і PlayStation 4 — прямо до будинку, квартири, школи, садочку чи на майданчик. Ви обираєте дату, ми привозимо програму, реквізит і настрій.",
    "cta": "Забронювати дату",
    "micro": [
      {
        "before": "Відповідаємо ",
        "bold": "",
        "after": " щодня 9:00–21:00"
      },
      {
        "before": "Передоплата ",
        "bold": "30%",
        "after": ", решта на місці"
      },
      {
        "before": "с-ще Теплик , Вінницька обл ",
        "bold": "40+ км",
        "after": ""
      }
    ]
  },
  "serviceOptions": [
    "Аніматори",
    "Ростові ляльки",
    "VR-окуляри",
    "PlayStation 4",
    "Комбо-програма"
  ],
  "galleryImages": [
    "/api/media/6afbf9e8b0cc4eb083bcf169",
    "6afc8a76a63504ce1ed762cb",
    "6afc85de32598663c6f1aacc",
    "6afc87caa63504ce1ed762b4",
    "6afc87e5a63504ce1ed762b7",
    "6afc883aa63504ce1ed762bb",
    "6afc8958a63504ce1ed762c3",
    "6afc8871a63504ce1ed762c0",
    "6afc89fc32598663c6f1aae1",
    "6afc896aa63504ce1ed762c6",
    "6afc8a3432598663c6f1aae5"
  ],
  "contacts": {
    "phone": "+38 (096) 187-85-79",
    "tel": "+380961878579",
    "email": "giraffe.teplik@gmail.com",
    "hours": "щодня з 09:00 до 21:00",
    "address": "с-ще Теплик, Вінницька обл.",
    "telegram": "https://t.me/giraffe_teplik",
    "facebook": "https://facebook.com/giraffe.teplik",
    "instagram": "https://instagram.com/giraffe_teplik"
  },
  "roadNote": ""
} as Catalog;
