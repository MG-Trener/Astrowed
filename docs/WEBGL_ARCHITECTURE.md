# Rendering strategy

Текущий renderer: SVG/CSS. Отсутствие WebGL — сознательный первый этап и одновременно полноценный fallback. Никаких трёхмерных библиотек в основном bundle.

Замена сцены возможна через пропсы нормализованной карты. WebGL должен подключаться через dynamic import, поддерживать context loss, reduced motion и ручной low-quality toggle. Эти расширения пока не реализованы; измерения GPU/FPS не заявлены.
