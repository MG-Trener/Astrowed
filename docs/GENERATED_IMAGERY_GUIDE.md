# Generated imagery — expansion

Инструмент: встроенный image_gen (без CLI/API fallback). Новые оригиналы сохранены системой, WebP скопированы в репозиторий. Изображения не содержат вычисляемых значений или текста.

- src/assets/generated/feng-shui.webp: интерьер, hero и карточка направления.
- src/assets/generated/qimen.webp: художественная доска девяти ячеек, hero и карточка.
- src/assets/generated/jade-button.webp: минеральная фактура основных кнопок. Текст и стрелка остаются HTML/SVG.

Изображения импортируются статически; публичная сборка images.unoptimized=true. При мобильной ширине размеры адаптируются; рисунки не вытесняют формы. Точные Багуа, дворцы и активные слои строятся DOM/CSS, не генератором.

## Точные промпты

Дополнительно по прямому запросу пользователя: `src/assets/generated/julia-cosmic-logo.webp`, персональная космическая монограмма «ЮГ». Встроена на страницу эксперта и в блок главной. Создана встроенным image_gen, без генерации лица или фотографии.

### Логотип Юлии
Use case: logo-brand. Asset type: premium personal expert monogram emblem for the Russian Chinese-metaphysics platform Astrowed. Primary request: a cosmic metaphysical logo for Юлия Гаврилычева, with her EXACT Cyrillic initials «ЮГ». These are TWO CYRILLIC letters: Ю (U+042E) and Г (U+0413), NOT Latin letters, NOT Я, NOT ЮТ. Central monogram is very large, legible, exquisitely drawn editorial high-contrast serif typography, brushed pale champagne metal with subtle jade reflections. Surround the monogram with a restrained celestial architecture: two or three fine astronomical orbital arcs, a circular astrolabe ring, a few tiny star-like points in muted gold and soft jade. Suggest a universe and the connection between person, space and time. Square composition 1024x1024, emblem centered with generous breathing room, radial symmetry gently broken by one orbital angle. Background is almost-black blue-green #090d0e, smoothly fading to EXACT dark flat edges, no square border. Stylish precise luxury identity, intelligent mystical atmosphere, high craft, crisp edges, extremely restrained glow and depth. No extra text, no name, no Latin letters, no zodiac icons, no human face, no dragons, no crown, no ornate baroque decoration, no watermark. The Cyrillic ЮГ remains the undeniable focal point and must be clear at small scale.

### Фэн Шуй
Use case: photorealistic-natural. Asset type: wide website editorial hero for Astrowed Feng Shui. Primary request: an atmospheric premium contemporary interior showing thoughtful space and balanced natural materials. Architecture: tranquil dark jade stone room, low walnut desk, pale linen chair, circular window opening to a misty green courtyard, small ceramic vase with a single branch, soft morning light grazing bronze details. Restrained cinematic architectural photography, believable materials, generous negative space, landscape composition 1536x1024. Palette charcoal, jade, warm ivory and muted brass matching a dark observatory website. No people, no text, no logos, no Chinese characters, no magical symbols. Not a diagram or UI screenshot. Elegant, lived-in but uncluttered.

### Ци Мэнь
Use case: stylized-concept. Asset type: wide editorial hero artwork for Astrowed Qi Men Dun Jia section. Primary request: a precision instrument for exploring time and direction, an elegant square nine-chamber board in a dark observatory. Exactly 3 by 3 architectural recessed square cells on one shallow black jade stone slab, a delicate brass circular compass arc suspended above, subtle points of cool light, restrained cinematic haze. Slight elevated three-quarter camera, landscape 1536x1024. Physically realistic stone and brushed brass, dark charcoal background, muted jade and warm ivory highlights. Expensive contemporary museum object, contemplative, uncluttered. No text, no people, no symbols, no pseudo-Chinese glyphs, no logos, no astrology zodiac wheel. This is atmospheric illustration, not a calculated chart or screenshot.

### Материал кнопок
Use case: stylized-concept. Asset type: seamless-looking material texture for premium interactive website buttons. Primary request: a very restrained dark jade mineral surface photographed straight-on, subtle deep forest green stone grain with a few delicate brushed antique brass hairline inclusions near edges. Landscape 1536x1024, flat even soft illumination, low contrast calm center suitable for crisp light text overlay. No object perspective, no letters, no symbols, no UI, no frame, no raised objects, no bright glow. Elegant tactile contemporary observatory aesthetic. This is the material only, not a complete button.

## Космическая библиотека и Ба Цзы — 26.09.2026

Создано встроенным image_gen, без CLI fallback. Рабочие иллюстрации: WebP 1200 × 800, quality 83, оптимизация Sharp.

- `src/assets/generated/bazi-pillars.webp` — 112182 байта, новый hero Ба Цзы, карточка направления на главной и карточка основ в библиотеке.
- `src/assets/generated/library-cosmos.webp` — 160446 байт, новый hero библиотеки.
- Карточки пяти элементов используют ранее сгенерированные wood/fire/earth/metal/water.webp.

### Спецификация промптов новых иллюстраций

**Ба Цзы** — Use case: stylized-concept. Asset type: editorial website hero for Astrowed Ba Zi. Four tall jade and obsidian pillars above a brass celestial astrolabe, deep green-black cosmos, delicate gold constellation lines. Restrained cinematic lighting, physically detailed stone and brushed metal, landscape composition, contemplative observatory aesthetic matching the existing website. No readable text, no labels, no people, no watermark. Decorative artwork, not a calculated chart.

**Библиотека** — Use case: stylized-concept. Asset type: editorial website hero for the Astrowed knowledge library. An open ivory book with a celestial diagram, a floating brass armillary sphere, jade seal and scroll in a cosmic observatory. Deep jade-black palette with warm ivory and muted gold, cinematic soft illumination, landscape composition. No readable text, no people, no watermark. Decorative artwork, not a calculated chart.

### Движение и доступность

Общий `StarMap` в Shell: детерминированная SVG-карта, линии созвездий, мягкое мерцание, медленный сдвиг фоновой дымки. Не перехватывает нажатия, скрыт от скринридеров и при печати. На телефоне сокращено число звёзд. Пауза в футере сохраняется между посещениями; скрытая вкладка и профессиональный режим приостанавливают фон. prefers-reduced-motion отключает CSS-анимации.

Ба Цзы: едва заметное плавание иллюстрации. Библиотека: плавание обложки, два световых блика, мягкое увеличение картинок карточек при наведении/фокусе.

Режим главной «Разрушение» следует обратному кругу порождения (шаг 4 из 5, SVG arc sweep=0). Подпись уточняет истощение источника, чтобы отличать его от режима «Контроль» (шаг 2). Астролябия вращается назад. Расчёт карты не меняется.

Проверено: TypeScript, 62 существующих теста, статическая сборка и 33 маршрута; просмотр desktop и 320 px, переключение режима, отсутствие горизонтального переполнения, загрузка новых иллюстраций, поиск библиотеки и пауза фона.
