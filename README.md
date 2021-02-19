# PopTheBallGame
Браузерная игра "Лопни шарики". Написана на JavaScript.

## Техническое задание
Требуется разработать мини-игру "Лопни шарики". Снизу в верх с разной скоростью поднимаются шары разного размера и цвета. Сверху расположена иголка, которую игрок может двигать в левую или правую сторону. Иголка перемещается клавишами "Стрелка вправо" и "Стрелка влево".
1. Если кончик иголки упирается в поднимающийся шар, то шар лопается и засчитывается в текущий счет.
2. Так же есть обратный таймер в 1 минуту. Это время, за которое необходимо лопнуть максимальное количество шаров.
3. Постепенно шаров должно становиться больше и скорость их взлета должна увеличиваться.
4. На шары произвольно может воздействовать ветер с левой или с правой стороны, сдвигая поднимающиеся шары. Чем дальше шар от стороны с которой дует ветер, тем меньше на него воздействие. Так же шары не могут улетать за левую или правую границы.
5. После окончания таймера все текущие шары должны улететь за верхнюю границу экрана и после этого необходимо показать количество пропущенных и лопнувших шаров.

Код реализовать на чистом JS с выполнением на стороне клиента без использования дополнительных библиотек и фреймворков.
