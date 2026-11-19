/**
 * Офлайн-копія реального контенту сайту (знімок site_content + reviews),
 * згенерована через GET /api/mobile/catalog (скрипт scripts/update-fallback.mjs).
 * Використовується тільки тоді, коли живе API недоступне (немає мережі
 * або ендпоінт ще не задеплоєний). НЕ редагуйте вручну.
 */
import { normalizeCatalog } from '../api/normalize';
import type { Catalog } from '../types/catalog';

const PAYLOAD: Record<string, unknown> = {
  "source": "site_content",
  "updatedAt": "2026-11-19T18:10:35.959Z",
  "sections": {
    "contacts": {
      "contacts": {
        "phone": "+38 (096) 187-85-79",
        "tel": "+380961878579",
        "email": "giraffe.teplik@gmail.com",
        "hours": "щодня з 09:00 до 21:00",
        "telegram": "https://t.me/giraffe_teplik",
        "facebook": "https://facebook.com/giraffe.teplik",
        "instagram": "https://instagram.com/giraffe_teplik"
      }
    },
    "hero": {
      "hero": {
        "titleLead": "Свято ",
        "titleAccent": "приїжджає",
        "titleTail": " до Вас",
        "lead": "Аніматори /Шоу програми/ Майстер класи/ Ростові ляльки/ VR-окуляри і PlayStation 4 — прямо до будинку, квартири, школи, садочку чи на майданчик. Ви обираєте дату, ми привозимо програму, реквізит і настрій.",
        "cta": "Забронювати дату",
        "micro": [
          {
            "before": "Відповідаємо ",
            "bold": "",
            "after": " щодня 09:00–21:00"
          },
          {
            "before": "Передоплата ",
            "bold": "30%",
            "after": ", решта на місці"
          },
          {
            "before": "с-ще Теплик , Вінницька обл",
            "bold": " 40 + км",
            "after": ""
          }
        ]
      }
    },
    "timeline": {
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
      ]
    },
    "promises": {
      "promises": [
        {
          "ico": "⏱",
          "title": "Приїжджаємо за 20 хвилин до",
          "text": "Команда вже на місці до початку: розгортаємо звук, реквізит і костюми, поки ви зустрічаєте гостей"
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
      ]
    },
    "steps": {
      "steps": [
        {
          "title": "Заявка",
          "text": "Форма на сайті або дзвінок. Скажіть дату, адресу , вік та кількість дітей — запропонуємо 2–3 варіанти програми.",
          "time": "1"
        },
        {
          "title": "Підтвердження",
          "text": "Зафіксуємо персонажів і час за 5–7 днів до свята.  Врахуємо Ваші побажання по проведенню свята. Передоплата — 30%, решта на місці.",
          "time": "1"
        },
        {
          "title": "Приїжджаємо",
          "text": "Команда за 20 хвилин до початку: костюми, звук, реквізит і настрій уже біля ваших дверей.",
          "time": "1"
        },
        {
          "title": "Свято триває",
          "text": "Ведучі стежать за дітьми, ви — п'єте чай і фотографуєте. Після — фото з героями.",
          "time": "1"
        }
      ]
    },
    "cover": {
      "cover": [
        "Квартири та приватні будинки — будь-який поверх, ліфт не обов'язковий",
        "Шкільні класи та дитсадочки — програми для 10–30 дітей",
        "Двір і дитячі майданчики — вуличні квести та бульбашки",
        "Кафе, лофти та антикафе — узгоджуєте таймінг з адміністратором",
        "с-ще Теплик та Вінницька область — переїзд за межі Теплика обговорюється окремо"
      ],
      "coverNote": {
        "title": "Потрібен саме сьогодні?",
        "text": "Тримайте резерв «гарячих слотів» на сьогодні-завтра. Зателефонуйте до 14:00 — і швидше за все знайдемо команду на вашу дату."
      }
    },
    "book": {
      "book": {
        "title": "Забронювати свято",
        "side": "Відповідаємо протягом 20хв щодня з 9:00 до 21:00.",
        "successTitle": "Дякуємо! Ми зателефонуємо",
        "successText": "Заявку збережено: вона вже в адмінці команди, а про дату домовимося телефоном.",
        "note": "Надсилаючи форму, ви погоджуєтесь, що команда зв'яжеться з вами для узгодження дати й програми."
      }
    },
    "faq": {
      "faq": [
        {
          "q": "Куди саме ви виїжджаєте? Чи далеко їдете?",
          "a": "Працюємо по всьому селищу Теплик без доплати. Далі — обговорюється індивідуально. Свято може пройти вдома, в школі, садку, ТРЦ, кафе або на вуличному майданчику."
        },
        {
          "q": "Що потрібно підготувати на місці?",
          "a": "Вільний простір приблизно 3×3 м для аніматорів, ~2×2 м і одна розетка 220 В для VR-зони та PS4. Решту — реквізит і обладнання — привозимо з собою."
        },
        {
          "q": "За скільки часу треба бронювати?",
          "a": "Оптимально — за 5–7 днів, щоб закріпити обраного персонажа. Але бувають і «гарячі» слоти на сьогодні/завтра — телефонуйте, спробуємо домовитись."
        },
        {
          "q": "Які способи оплати доступні? ",
          "a": "Передоплата 30% на рахунок або готівка — решта на місці готівкою чи картою. "
        }
      ]
    },
    "services": {
      "services": [
        {
          "id": "new-c0sebs9",
          "emoji": "",
          "title": "Новорічний Стандарт",
          "desc": "1 герой на вибір , Санта або Миколай + ведучий до 15 дітей! Програма на 30 хвилин або1 годину включає: 2(4) -3(5) активних гри, 2 руханки, зустріч з Миколаєм чи Сантою, фото з героями.",
          "price": "3000грн ",
          "unit": "/1год",
          "calcValue": 3000,
          "calcLabel": "Новорічний Стандарт · ",
          "format": "Аніматори",
          "category": "seasonal",
          "variants": [
            {
              "id": "new-a96e6ly",
              "label": "30 хв",
              "pricingUnit": "time",
              "durationMin": 30,
              "price": 2000
            },
            {
              "id": "new-rlewl6e",
              "label": "1 год",
              "durationMin": 60,
              "price": 3000
            }
          ],
          "images": [
            "/api/media/6afc8a76a63504ce1ed762cb"
          ]
        },
        {
          "id": "new-2m4ievs",
          "emoji": "",
          "title": "Новорічний Гранд",
          "desc": "2 героя на вибір ,Санта або Миколай + ведучий, до 25 дітей! Програма на 30 хвилин або 1 годину включає: 2(4) -3(5) активних ігор, 2 руханки, зустріч з Миколаєм чи Сантою, фото з героями.",
          "price": "4000грн ",
          "unit": "/1год",
          "calcValue": 4000,
          "calcLabel": "Новорічний Гранд  · ",
          "format": "Аніматори",
          "category": "seasonal",
          "variants": [
            {
              "id": "new-h5p6aq6",
              "label": "30 хв",
              "pricingUnit": "time",
              "durationMin": 30,
              "price": 3000
            },
            {
              "id": "new-2l586w1",
              "label": "1 год",
              "durationMin": 60,
              "price": 4000
            }
          ],
          "images": [
            "/api/media/6afc8cfe66170bd7d4b883e8"
          ]
        },
        {
          "id": "animators 1",
          "emoji": "",
          "title": "ВЕСЕЛА КОМПАНІЯ",
          "desc": "1 аніматор + ведучий, активні, розважальні ігри або квест під сучасні тренди . Костюми на вибір. До 10 дітей.",
          "price": "1500грн ",
          "unit": " /1год",
          "calcValue": 1500,
          "calcLabel": " \"ВЕСЕЛА КОМПАНІЯ\" · ",
          "format": "Аніматори",
          "category": "animators",
          "variants": [
            {
              "id": "new-quyqs2j",
              "label": "1 год",
              "durationMin": 60,
              "price": 1500
            },
            {
              "id": "new-t91s5ff",
              "label": "2 год",
              "pricingUnit": "time",
              "durationMin": 120,
              "price": 2500
            }
          ],
          "images": [
            "/api/media/6afc85de32598663c6f1aacc"
          ],
          "showOnHome": true
        },
        {
          "id": "animators 4",
          "emoji": "",
          "title": "СВЯТО НА ПОВНУ ",
          "desc": "2 аніматора + ведучий, активні, розважальні ігри або квест під сучасні тренди . Костюми на вибір.  11-20 дітей .",
          "price": "4000грн ",
          "unit": "/2год",
          "calcValue": 4000,
          "calcLabel": "СВЯТО НА ПОВНУ· ",
          "format": "Аніматори",
          "category": "animators",
          "variants": [
            {
              "id": "new-mp2qnr6",
              "label": "1 год",
              "pricingUnit": "time",
              "durationMin": 60,
              "price": 2500
            },
            {
              "id": "new-vveuxi8",
              "label": "2 год",
              "durationMin": 120,
              "price": 4000
            }
          ],
          "images": [
            "/api/media/6afc8694a63504ce1ed762a3"
          ]
        },
        {
          "id": "puppets",
          "emoji": "",
          "title": "Ростова лялька",
          "desc": "1 ростова лялька на вибір, фольгована куля наповнена гелієм, ведучий з мікрофоном, іменна пісня в подарунок. При замовленні 2 і більше ростових діє знижка.",
          "price": "1500грн ",
          "unit": "/15хв",
          "calcValue": 1500,
          "calcLabel": "Ростова лялька · 15 хв",
          "format": "Ростові ляльки",
          "category": "puppets",
          "variants": [
            {
              "id": "new-t3lvhl0",
              "label": "15 хв",
              "durationMin": 15,
              "price": 1500
            }
          ],
          "images": [
            "/api/media/6afc87caa63504ce1ed762b4"
          ]
        },
        {
          "id": "vr 1",
          "emoji": "",
          "title": "VR PORTAL ",
          "desc": "Відірвати дитину від телефону можливо!\n  2 VR-окулярів із насиченими іграми. Розмістимося навіть у невеликій кімнаті.\n",
          "price": "2500грн ",
          "unit": "/2год",
          "calcValue": 2500,
          "calcLabel": "VR PORTAL · ",
          "format": "VR-окуляри",
          "category": "gaming",
          "variants": [
            {
              "id": "new-qhhmxpi",
              "label": "1 год",
              "pricingUnit": "time",
              "durationMin": 60,
              "price": 1500
            },
            {
              "id": "new-1iq2zgl",
              "label": "2 год",
              "durationMin": 120,
              "price": 2500
            }
          ],
          "images": [
            "/api/media/6afc87e5a63504ce1ed762b7"
          ],
          "requirements": [
            "вік 7+"
          ],
          "audiences": [
            "вік 7+"
          ]
        },
        {
          "id": "ps 2",
          "emoji": "",
          "title": "PS  PORTAL",
          "desc": "Телевізор, консоль, джойстики та зручні пуфи.  Ігри різного жанру . Для дітей і дорослих.",
          "price": "2500грн ",
          "unit": "/2год",
          "calcValue": 2500,
          "calcLabel": "PS  PORTAL · ",
          "format": "PlayStation",
          "category": "gaming",
          "variants": [
            {
              "id": "new-wxt8a9g",
              "label": "1 год",
              "pricingUnit": "time",
              "durationMin": 60,
              "price": 1500
            },
            {
              "id": "new-wswheyg",
              "label": "2 год ",
              "durationMin": 120,
              "price": 2500
            }
          ],
          "images": [
            "/api/media/6afc883aa63504ce1ed762bb"
          ],
          "audiences": [
            "вік 8+"
          ]
        },
        {
          "id": "шоу 1",
          "emoji": "",
          "title": "Бульбашкове шоу",
          "desc": "Не приховуємо що і дорослі люблять бульбашки ;) \nБульки від маленької до гігантської. \nІнтерактивні ігри. \nКожний зможе сам зробити довгу або велику бульку.\nПобувати у трубі з бульки а якщо пощастить то в самій бульці.\nМи оновили шоу і добавили трішки піни та вогню!!!\nТому вогонь, вода і труба з бульки!!!",
          "price": "1500грн ",
          "unit": "/40хв",
          "calcValue": 1500,
          "calcLabel": "Бульбашкове шоу",
          "format": "Шоу-програма",
          "category": "shows",
          "variants": [
            {
              "id": "new-cllpba8",
              "label": "40 хв",
              "durationMin": 40,
              "price": 1500
            }
          ],
          "images": [
            "/api/media/6afc8958a63504ce1ed762c3"
          ]
        },
        {
          "id": "шоу 2",
          "emoji": "",
          "title": "Неонове шоу",
          "desc": "Стрічки атласні покриті особливим розчином, диско шар, неонове світло, аквагрим який світиться та запальна музика зробить ваше свято веселішим та драйвовішим.",
          "price": "1500грн ",
          "unit": "/30хв",
          "calcValue": 1000,
          "calcLabel": "Неонове шоу",
          "format": "Шоу-програма",
          "category": "shows",
          "variants": [
            {
              "id": "new-ukc8g4l",
              "label": "30 хв",
              "durationMin": 30,
              "price": 1500
            }
          ],
          "images": [
            "/api/media/6afc8871a63504ce1ed762c0"
          ]
        },
        {
          "id": "шоу 3",
          "emoji": "",
          "title": "Паперове шоу",
          "desc": "Блискуча фольга, яскравий диско шар, запальна музика не залишить нікого байдужим.\nПідходить для різного віку. \n",
          "price": "1000грн ",
          "unit": "/30хв",
          "calcValue": 1000,
          "calcLabel": "Паперове шоу",
          "format": "Шоу-програма",
          "category": "shows",
          "variants": [
            {
              "id": "new-zrzfimq",
              "label": "30 хв",
              "durationMin": 30,
              "price": 1000
            }
          ],
          "images": [
            "/api/media/6afc89fc32598663c6f1aae1"
          ]
        },
        {
          "id": "new-xcfa8tb",
          "emoji": "",
          "title": "Кріо шоу",
          "desc": "Наука не буває нудною! І ми це доводимо!\nВау ефект для всіх. \nРобота з сухим льодом.\nОзнайомлення, експеременти, досліди, інтерактиви.\n",
          "price": "3000грн  ",
          "unit": "/1год",
          "calcValue": 3000,
          "calcLabel": "Кріо шоу",
          "format": "Шоу-програма",
          "images": [
            "/api/media/6afc896aa63504ce1ed762c6"
          ],
          "category": "shows",
          "variants": [
            {
              "id": "new-gj110lc",
              "label": "1 год",
              "durationMin": 60,
              "price": 3000
            }
          ],
          "audiences": [
            "вік 6+"
          ]
        },
        {
          "id": "new-008nqqs",
          "emoji": "",
          "title": "Блиск тату",
          "desc": "Тату яке полюбляють всі діти.",
          "price": "60грн ",
          "unit": "/1шт",
          "calcValue": 60,
          "calcLabel": "Блиск тату",
          "format": "Інше",
          "category": "extras",
          "variants": [
            {
              "id": "new-as4nsad",
              "label": "1 шт",
              "durationMin": 0,
              "price": 60
            }
          ],
          "images": [
            "/api/media/6afc8a3432598663c6f1aae5"
          ]
        },
        {
          "id": "new-dsyteah",
          "emoji": "",
          "title": "Виніс торта аніматором",
          "desc": "Виніс торта аніматором під авторський святковий трек по зірковій доріжці. ",
          "category": "extras",
          "audiences": [],
          "images": [
            "/api/media/6afca1b1e12e1230c07a0feb"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": false,
          "variants": [
            {
              "id": "new-4ytt7tt",
              "label": "",
              "durationMin": 5,
              "price": 300
            }
          ],
          "requirements": [],
          "calcLabel": "Виніс торта аніматором",
          "format": "Аніматори"
        },
        {
          "id": "new-xh2xs51",
          "emoji": "",
          "title": "Куля сюрприз",
          "desc": "Гігантська куля з маленькими різнокольоровими або однотонними кульками всередині, конфеті та солодощі. Підійде для різних свят - день народження, весілля, гендер паті, вечірка або просто сюрприз.",
          "category": "extras",
          "audiences": [],
          "images": [
            "/api/media/6afda9f546239b40a7c4020b"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": false,
          "variants": [
            {
              "id": "new-o0abq02",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 700
            }
          ],
          "requirements": [],
          "calcLabel": "Куля сюрприз",
          "format": "Інше"
        },
        {
          "id": "new-ykwaka0",
          "emoji": "",
          "title": "МК Свічка з вощини",
          "desc": "Виготовлення свічок з вощини, прикрашання сухоцвітами",
          "category": "extras",
          "audiences": [
            "5+"
          ],
          "images": [
            "/api/media/6afdab8204b611c9318743d3"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-fgvq0rx",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 80
            }
          ],
          "requirements": [],
          "calcLabel": "Свічка з вощини",
          "format": "Інше"
        },
        {
          "id": "new-74otyjd",
          "emoji": "",
          "title": "МК Насипна свічка в кашпо",
          "desc": "Розфарбування кашпо фарбами , виготовлення з сипучого воску свічки",
          "category": "extras",
          "audiences": [
            "6+"
          ],
          "images": [
            "/api/media/6afdac2404b611c9318743d7"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": false,
          "variants": [
            {
              "id": "new-cd02bbk",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 30,
              "price": 200
            }
          ],
          "requirements": [],
          "calcLabel": "розфарбування кашпо красками, виготовлення з сипучого воску",
          "format": "Інше"
        },
        {
          "id": "new-6ot8bga",
          "emoji": "",
          "title": "МК Насипна свічка",
          "desc": "Виготовлення з сипучого воску. декорування підсвічника",
          "category": "extras",
          "audiences": [
            "5+"
          ],
          "images": [
            "/api/media/6afdad1f5cae93adfa3dab14"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-4zkglf8",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 150
            }
          ],
          "requirements": [],
          "calcLabel": "Свічка насипна",
          "format": "Інше"
        },
        {
          "id": "new-551bfnz",
          "emoji": "",
          "title": "МК Розписна свічка",
          "desc": "Розпис свічки кольоровим воском",
          "category": "extras",
          "audiences": [
            "8+"
          ],
          "images": [
            "/api/media/6afdae635cae93adfa3dab1b"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": false,
          "variants": [
            {
              "id": "new-l93pp47",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 100
            }
          ],
          "requirements": [],
          "calcLabel": "Розписна свічка",
          "format": "Інше"
        },
        {
          "id": "new-lisjhqw",
          "emoji": "",
          "title": "МК Гіпсові розфарбування",
          "desc": "Розфарбування гіпсових фігурок",
          "category": "extras",
          "audiences": [
            "5+"
          ],
          "images": [
            "/api/media/6afdb2b69aff9e546e768ae4"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-sw3l4kq",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 100
            }
          ],
          "requirements": [],
          "calcLabel": "Гіпсові розфарбування",
          "format": "Інше"
        },
        {
          "id": "new-57qxjig",
          "emoji": "",
          "title": "МК Кашпо",
          "desc": "Розфарбування гіпсових кашпо",
          "category": "extras",
          "audiences": [
            "5+"
          ],
          "images": [
            "/api/media/6afdb2f39aff9e546e768ae7"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-u4srwtt",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 150
            }
          ],
          "requirements": [],
          "calcLabel": "Кашпо",
          "format": "Інше"
        },
        {
          "id": "new-qu9e3qx",
          "emoji": "",
          "title": "МК Шопери",
          "desc": "Розфарбування шоперів",
          "category": "extras",
          "audiences": [
            "6+"
          ],
          "images": [
            "/api/media/6afdb33b9aff9e546e768aea"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-h1rughy",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 150
            }
          ],
          "requirements": [],
          "calcLabel": "Шопер",
          "format": "Інше"
        },
        {
          "id": "new-k26ge05",
          "emoji": "",
          "title": "МК Брелок",
          "desc": "Створення брелка ",
          "category": "extras",
          "audiences": [
            "5+"
          ],
          "images": [
            "/api/media/6afdb3d29aff9e546e768aed"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-u4w6oqs",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 130
            }
          ],
          "requirements": [],
          "calcLabel": "Брелок",
          "format": "Інше"
        },
        {
          "id": "new-60xrto6",
          "emoji": "",
          "title": "МК Картина піском а4",
          "desc": "Створення картини кольоровим піском",
          "category": "extras",
          "audiences": [
            "4+"
          ],
          "images": [
            "/api/media/6afdb4929aff9e546e768af1"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-fgtlj65",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 100
            }
          ],
          "requirements": [],
          "calcLabel": "Картина пісок а4",
          "format": "Інше"
        },
        {
          "id": "new-32johad",
          "emoji": "",
          "title": "МК Картина піском а5",
          "desc": "Створення картини різнокольоровим піском",
          "category": "extras",
          "audiences": [
            "4+"
          ],
          "images": [
            "/api/media/6afdb4f19aff9e546e768af4"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-scmi1lp",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 70
            }
          ],
          "requirements": [],
          "calcLabel": "Картина піском а5",
          "format": "Інше"
        },
        {
          "id": "new-nm9fmr7",
          "emoji": "",
          "title": "МК Баночка бажань",
          "desc": "В баночку насипається різнокольоровий пісок, декорується.",
          "category": "extras",
          "audiences": [
            "4+"
          ],
          "images": [
            "/api/media/6afdb6868b26bc006fba3f81"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-9prhzro",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 100
            }
          ],
          "requirements": [],
          "calcLabel": "Баночка бажань",
          "format": "Інше"
        },
        {
          "id": "new-z4xzryf",
          "emoji": "",
          "title": "МК Скринька мрій",
          "desc": "Розфарбування та декорування деревяної скриньки",
          "category": "extras",
          "audiences": [
            "8+"
          ],
          "images": [
            "/api/media/6afdb7cc77192204caa34db4"
          ],
          "imageAlt": "Скринька мрій",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-ldxkxdf",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 150
            }
          ],
          "requirements": [],
          "calcLabel": "",
          "format": "Інше"
        },
        {
          "id": "new-9dnh8kh",
          "emoji": "",
          "title": "МК Слайм",
          "desc": "Виготовлення слайму ",
          "category": "extras",
          "audiences": [
            "7+"
          ],
          "images": [
            "/api/media/6afdb86277192204caa34db9"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-uh6jvbj",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 150
            }
          ],
          "requirements": [],
          "calcLabel": "",
          "format": "Інше"
        },
        {
          "id": "new-4q1os4d",
          "emoji": "",
          "title": "МК Обруч",
          "desc": "Створення обруча",
          "category": "extras",
          "audiences": [
            "8+"
          ],
          "images": [
            "/api/media/6afdb9269aff9e546e768afa"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-xjl0h51",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 100
            }
          ],
          "requirements": [],
          "calcLabel": "Обруч",
          "format": "Інше"
        },
        {
          "id": "new-61o2b3r",
          "emoji": "",
          "title": "МК Парфюм",
          "desc": "Створення власного парфюма",
          "category": "extras",
          "audiences": [
            "7+"
          ],
          "images": [
            "/api/media/6afdc48f41b38b4b3883943b"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-9kg09xg",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 100
            }
          ],
          "requirements": [],
          "calcLabel": "Парфюм",
          "format": "Інше"
        },
        {
          "id": "new-z8ecx28",
          "emoji": "",
          "title": "МК Спрей для тіла",
          "desc": "Сяй яскраво! Створення спрея для тіла з сяйвом.",
          "category": "extras",
          "audiences": [
            "7+"
          ],
          "images": [
            "/api/media/6afdc5c641b38b4b3883943e"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": false,
          "variants": [
            {
              "id": "new-3y7l0w5",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 100
            }
          ],
          "requirements": [],
          "calcLabel": "Спрей",
          "format": "Інше"
        },
        {
          "id": "new-krlzrhb",
          "emoji": "",
          "title": "МК Фоторамка",
          "desc": "Створення фоторамки на полотні",
          "category": "extras",
          "audiences": [
            "8+"
          ],
          "images": [
            "/api/media/6afdc61141b38b4b38839441"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-4g08rpv",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 200
            }
          ],
          "requirements": [],
          "calcLabel": "Фоторамка",
          "format": "Інше"
        },
        {
          "id": "new-92thfbl",
          "emoji": "",
          "title": "МК Картина 3Д",
          "desc": "Створення 3Д картини, фарбування.",
          "category": "extras",
          "audiences": [
            "8+"
          ],
          "images": [
            "/api/media/6afdc66a41b38b4b38839444"
          ],
          "imageAlt": "",
          "published": true,
          "showOnHome": true,
          "variants": [
            {
              "id": "new-vl93uhl",
              "label": "",
              "pricingUnit": "item",
              "durationMin": 0,
              "price": 150
            }
          ],
          "requirements": [],
          "calcLabel": "Картина 3Д",
          "format": "Інше"
        }
      ]
    },
    "packages": {
      "packages": [
        {
          "id": "mini",
          "name": "Пакет PARTY BOOM ",
          "sub": "",
          "price": "3000грн",
          "period": "/1 година",
          "items": [
            {
              "text": "1 аніматор + ведучий  ",
              "included": true,
              "variantId": "new-quyqs2j"
            },
            {
              "text": " Аніматорська міні програма на  вибір",
              "included": true
            },
            {
              "text": "Паперове шоу",
              "included": true,
              "variantId": "new-zrzfimq"
            },
            {
              "text": "Блиск тату ",
              "included": true,
              "variantId": "new-as4nsad",
              "qty": 10
            },
            {
              "text": "  Винесення святкового торта у подарунок!  Аніматором",
              "included": true,
              "variantId": "new-4ytt7tt"
            },
            {
              "text": "ДО 10 ДІТЕЙ!",
              "included": true
            }
          ],
          "format": "Комбо-програма",
          "bundlePrice": 3000
        },
        {
          "id": "standard",
          "name": "Пакет PARTY BOOM",
          "sub": "",
          "price": "5000грн",
          "period": "/2години",
          "hit": true,
          "items": [
            {
              "text": "1 аніматор + ведучий  ",
              "included": true,
              "variantId": "new-t91s5ff"
            },
            {
              "text": " Аніматорська програма на  вибір",
              "included": true
            },
            {
              "text": "Паперове шоу",
              "included": true,
              "variantId": "new-zrzfimq"
            },
            {
              "text": "Блиск тату ",
              "included": true,
              "variantId": "new-as4nsad",
              "qty": 10
            },
            {
              "text": "  Винесення святкового торта у подарунок! ",
              "included": true,
              "variantId": ""
            },
            {
              "text": "Ростова лялька ",
              "included": true,
              "variantId": "new-t3lvhl0"
            },
            {
              "text": "ДО 10 ДІТЕЙ!",
              "included": true
            }
          ],
          "format": "Комбо-програма",
          "bundlePrice": 5000
        },
        {
          "id": "vip",
          "name": "Пакет PARTY MIX ",
          "sub": "",
          "price": "4000грн",
          "period": "/1година",
          "items": [
            {
              "text": "2 аніматори +ведучий",
              "included": true,
              "variantId": "new-mp2qnr6"
            },
            {
              "text": " Аніматорська міні програма на  вибір",
              "included": true
            },
            {
              "text": "Паперове шоу",
              "included": true,
              "variantId": "new-zrzfimq"
            },
            {
              "text": "Блиск тату ",
              "included": true,
              "variantId": "new-as4nsad",
              "qty": 20
            },
            {
              "text": "  Винесення святкового торта у подарунок! ",
              "included": true,
              "variantId": "new-4ytt7tt"
            },
            {
              "text": "11-20 ДІТЕЙ!",
              "included": true
            }
          ],
          "format": "Комбо-програма",
          "bundlePrice": 4000
        },
        {
          "id": "new-mdukvec",
          "name": "Пакет PARTY MIX ",
          "sub": "",
          "price": "8500грн ",
          "period": "/2години",
          "items": [
            {
              "text": "2 аніматори +ведучий",
              "included": true,
              "variantId": "new-vveuxi8"
            },
            {
              "text": " Аніматорська  програма на  вибір",
              "included": true
            },
            {
              "text": "Паперове шоу, Блиск тату або Бульбашкове шоу або Неонове шоу",
              "included": true,
              "variantId": "new-a96e6ly"
            },
            {
              "text": "1 Майстер клас на вибір: МК Свічка з вощини, МК Картина піском, МК Гіпсові магніти, МК Баночка бажань, МК Міст для тіла , МК Парфюм",
              "included": true,
              "variantId": "new-a96e6ly"
            },
            {
              "text": "  Винесення святкового торта у подарунок! ",
              "included": true,
              "variantId": ""
            },
            {
              "text": "Ростова лялька",
              "included": true,
              "variantId": "new-t3lvhl0"
            },
            {
              "text": "11-20 ДІТЕЙ!",
              "included": true
            }
          ],
          "format": "Комбо-програма",
          "bundlePrice": 8500
        },
        {
          "id": "new-lo91nas",
          "name": "Пакет GAME PORTAL MAX",
          "sub": "GAME COMBO - подвійний драйв!!! Дві розваги-одна вигідна ціна!!!",
          "price": "2500",
          "period": "/1 година",
          "items": [
            {
              "text": "2 VR-окулярів із насиченими іграми",
              "included": true,
              "variantId": "new-qhhmxpi"
            },
            {
              "text": "Консоль, джойстики . Ігри різного жанру ",
              "included": true,
              "variantId": "new-wxt8a9g"
            },
            {
              "text": "Телевізор ",
              "included": true
            },
            {
              "text": "Зручні пуфи",
              "included": true
            }
          ],
          "hit": false,
          "format": "Комбо-програма",
          "bundlePrice": 2500,
          "audiences": [
            "вік 7+"
          ]
        },
        {
          "id": "new-rcmwyje",
          "name": "Пакет GAME PORTAL MAX",
          "sub": "GAME COMBO - подвійний драйв!!! Дві розваги-одна вигідна ціна!!!",
          "price": "4300",
          "period": "/2 години",
          "items": [
            {
              "text": "2 VR-окулярів із насиченими іграми",
              "included": true,
              "variantId": "new-1iq2zgl"
            },
            {
              "text": "Консоль, джойстики . Ігри різного жанру ",
              "included": true,
              "variantId": "new-wswheyg"
            },
            {
              "text": "Телевізор ",
              "included": true
            },
            {
              "text": "Зручні пуфи",
              "included": true
            }
          ],
          "hit": false,
          "format": "Комбо-програма",
          "bundlePrice": 4300,
          "audiences": [
            "вік 7+"
          ]
        }
      ],
      "packageAddons": "Плюс до будь-якого пакета: другий аніматор (+1200 грн) · "
    },
    "calculator": {
      "serviceOptions": [
        "Аніматори",
        "Ростові ляльки",
        "VR-окуляри",
        "PlayStation 4",
        "Комбо-програма "
      ],
      "calcNote": "Сума орієнтовна: її рахуємо з базових цін послуг без урахування пакетних знижок і дороги."
    },
    "assistant": {
      "kidsPerAnimator": 10,
      "ageGroups": [
        {
          "id": "0-3",
          "label": "Малюки (0–3)",
          "refs": [
            "service:animators 1",
            "service:new-c0sebs9",
            "service:new-2m4ievs",
            "service:puppets",
            "service:шоу 1",
            "service:шоу 3",
            "service:new-008nqqs",
            "service:new-dsyteah",
            "package:mini",
            "package:new-mdukvec"
          ],
          "askManager": false
        },
        {
          "id": "4-6",
          "label": "Дошкільнята (4–6)",
          "refs": [
            "service:new-c0sebs9",
            "service:new-2m4ievs",
            "service:animators 1",
            "service:animators 4",
            "service:puppets",
            "service:шоу 1",
            "service:шоу 2",
            "service:шоу 3",
            "service:new-xcfa8tb",
            "service:new-008nqqs",
            "service:new-dsyteah",
            "package:mini",
            "package:standard",
            "package:vip",
            "package:new-mdukvec"
          ]
        },
        {
          "id": "7-11",
          "label": "Школярики (7–11)",
          "refs": [
            "service:new-c0sebs9",
            "service:new-2m4ievs",
            "service:animators 1",
            "service:animators 4",
            "service:puppets",
            "service:vr 1",
            "service:ps 2",
            "service:шоу 1",
            "service:шоу 2",
            "service:шоу 3",
            "service:new-xcfa8tb",
            "service:new-008nqqs",
            "service:new-dsyteah",
            "package:mini",
            "package:standard",
            "package:vip",
            "package:new-mdukvec",
            "package:new-lo91nas",
            "package:new-rcmwyje"
          ]
        },
        {
          "id": "12-17",
          "label": "Підлітки (12–17)",
          "refs": [
            "service:animators 1",
            "service:animators 4",
            "service:puppets",
            "service:vr 1",
            "service:ps 2",
            "service:шоу 3",
            "service:new-xcfa8tb",
            "service:new-008nqqs",
            "package:standard",
            "package:new-mdukvec",
            "package:new-lo91nas",
            "package:new-rcmwyje"
          ]
        },
        {
          "id": "adults",
          "label": "Дорослі",
          "refs": []
        },
        {
          "id": "mixed",
          "label": "Різний вік",
          "refs": []
        }
      ],
      "durations": [
        {
          "min": 30,
          "label": "до 30 хв"
        },
        {
          "min": 60,
          "label": "до 1 год"
        },
        {
          "min": 90,
          "label": "до 1,5 год"
        },
        {
          "min": 120,
          "label": "до 2 год"
        }
      ]
    },
    "seasonalOffers": {
      "enabled": true,
      "image": "/api/media/6afc7ed832598663c6f1aabe",
      "imageAlt": "Сезонна пропозиція Жирафик",
      "title": "Скоро день святого Миколая та  Новий рік!",
      "text": "Не забудьте замовити привітання — Святий Миколай або Санта, Ангел або Ельфійка, ростові ляльки та новорічні програми. Бронюйте заздалегідь, поки є вільні дати.",
      "ctaLabel": "Сезонні послуги",
      "ctaLink": "/services"
    },
    "gallery": {
      "albums": [
        {
          "id": "paper-disco",
          "title": "Паперова дискотека",
          "category": "shows",
          "summary": "Паперовий драйв, яскравий фінал і море радості.",
          "serviceRef": "service:шоу 3",
          "serviceLabel": "Паперове шоу",
          "images": [
            "/brand/demo/gallery/paper-disco-1.svg",
            "/brand/demo/gallery/paper-disco-2.svg",
            "/brand/demo/gallery/paper-disco-3.svg",
            "/brand/demo/gallery/paper-disco-4.svg"
          ],
          "featured": true,
          "published": true,
          "videoUrl": ""
        },
        {
          "id": "favorite-character",
          "title": "Свято з улюбленим героєм",
          "category": "animators",
          "summary": "Тематичні ігри, руханки та весела компанія.",
          "serviceRef": "service:animators 1",
          "serviceLabel": "Аніматорські програми",
          "images": [
            "/brand/demo/gallery/favorite-character-1.svg",
            "/brand/demo/gallery/favorite-character-2.svg",
            "/brand/demo/gallery/favorite-character-3.svg",
            "/brand/demo/gallery/favorite-character-4.svg"
          ],
          "featured": true,
          "published": true,
          "videoUrl": ""
        },
        {
          "id": "giraffe-surprise",
          "title": "Жираф у гостях",
          "category": "mascots",
          "summary": "Експрес-привітання, сюрпризи та святкові фото.",
          "serviceRef": "service:puppets",
          "serviceLabel": "Ростові ляльки",
          "images": [
            "/brand/demo/gallery/giraffe-surprise-1.svg",
            "/brand/demo/gallery/giraffe-surprise-2.svg",
            "/brand/demo/gallery/giraffe-surprise-3.svg",
            "/brand/demo/gallery/giraffe-surprise-4.svg"
          ],
          "featured": true,
          "published": true,
          "videoUrl": ""
        },
        {
          "id": "game-portal",
          "title": "GAME PORTAL · VR + PS4",
          "category": "gaming",
          "summary": "Віртуальні пригоди та змагання в одній програмі.",
          "serviceRef": "service:vr",
          "serviceLabel": "VR та PS4",
          "images": [
            "/brand/demo/gallery/game-portal-1.svg",
            "/brand/demo/gallery/game-portal-2.svg",
            "/brand/demo/gallery/game-portal-3.svg",
            "/brand/demo/gallery/game-portal-4.svg"
          ],
          "featured": false,
          "published": true,
          "videoUrl": ""
        },
        {
          "id": "creative-masterclass",
          "title": "Творча майстерня",
          "category": "workshops",
          "summary": "Свічки, картини, декор та власні маленькі шедеври.",
          "serviceRef": "service:mk-1",
          "serviceLabel": "Майстер-класи",
          "images": [
            "/brand/demo/gallery/creative-masterclass-1.svg",
            "/brand/demo/gallery/creative-masterclass-2.svg",
            "/brand/demo/gallery/creative-masterclass-3.svg",
            "/brand/demo/gallery/creative-masterclass-4.svg"
          ],
          "featured": false,
          "published": true,
          "videoUrl": ""
        },
        {
          "id": "neon-teen-party",
          "title": "Неонова вечірка",
          "category": "teens",
          "summary": "Сучасна атмосфера, музика та світловий настрій.",
          "serviceRef": "service:шоу 2",
          "serviceLabel": "Підліткові вечірки",
          "images": [
            "/brand/demo/gallery/neon-teen-party-1.svg",
            "/brand/demo/gallery/neon-teen-party-2.svg",
            "/brand/demo/gallery/neon-teen-party-3.svg",
            "/brand/demo/gallery/neon-teen-party-4.svg"
          ],
          "featured": true,
          "published": true,
          "videoUrl": "/brand/demo/gallery-demo.mp4"
        },
        {
          "id": "warm-surprise",
          "title": "Привітання для дорослих",
          "category": "adults",
          "summary": "Несподіваний візит і справжні святкові емоції.",
          "serviceRef": "",
          "serviceLabel": "Експрес-привітання",
          "images": [
            "/brand/demo/gallery/warm-surprise-1.svg",
            "/brand/demo/gallery/warm-surprise-2.svg",
            "/brand/demo/gallery/warm-surprise-3.svg",
            "/brand/demo/gallery/warm-surprise-4.svg"
          ],
          "featured": false,
          "published": true,
          "videoUrl": ""
        },
        {
          "id": "winter-magic",
          "title": "Новорічні пригоди",
          "category": "seasonal",
          "summary": "Миколай, Ангел, Санта, Ельфійка та казковий настрій.",
          "serviceRef": "service:new-bmbk4ot",
          "serviceLabel": "Новорічні привітання",
          "images": [
            "/brand/demo/gallery/winter-magic-1.svg",
            "/brand/demo/gallery/winter-magic-2.svg",
            "/brand/demo/gallery/winter-magic-3.svg",
            "/brand/demo/gallery/winter-magic-4.svg"
          ],
          "featured": true,
          "published": true,
          "videoUrl": "/brand/demo/gallery-demo.mp4"
        },
        {
          "id": "graduation",
          "title": "Святковий випускний",
          "category": "school",
          "summary": "Командні ігри, привітання і завершення важливого етапу.",
          "serviceRef": "service:animators 3",
          "serviceLabel": "Програми для колективів",
          "images": [
            "/brand/demo/gallery/graduation-1.svg",
            "/brand/demo/gallery/graduation-2.svg",
            "/brand/demo/gallery/graduation-3.svg",
            "/brand/demo/gallery/graduation-4.svg"
          ],
          "featured": false,
          "published": true,
          "videoUrl": ""
        }
      ]
    }
  },
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
  ]
};

const MINIMAL: Catalog = {
  source: 'fallback',
  services: [],
  packages: [],
  reviews: [],
  timeline: [],
  promises: [],
  trust: [],
  hero: null,
  contacts: {
    phone: '+38 (096) 187-85-79',
    tel: '+380961878579',
    email: 'giraffe.teplik@gmail.com',
    hours: 'щодня з 09:00 до 21:00',
  },
  serviceOptions: [],
  galleryImages: [],
  roadNote: '',
  faq: [],
  gallery: [],
  assistant: { kidsPerAnimator: 10, ageGroups: [], durations: [] },
  seasonal: null,
  calcNote: '',
  roadTariff: 25,
  roadFreeKm: 0,
};

/** Той самий конвеєр, що й для живого API, — офлайн поводиться однаково. */
export const FALLBACK_CATALOG: Catalog = {
  ...(normalizeCatalog(PAYLOAD) ?? MINIMAL),
  source: 'fallback',
};
