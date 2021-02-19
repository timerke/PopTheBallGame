/*
Модуль с кодом игры.
*/

/**
 * Функция возвращает RGB-код случайного цвета.
 * @returns: 16-ый RGB-код цвета.
 */
function get_random_color() {
    let color = '#';
    // Определяем оттенки для трех цветов
    for (let i = 0; i < 3; i++) {
        let c = Math.round(get_random_number(0, 255));
        let c_hex = Number(c).toString(16);
        color += c_hex;
    }
    return color;
}

/**
 * Функция возвращает случайное число в заданном диапазоне.
 * @param min: минимальное допустимое значение случайного числа;
 * @param max: максимальное допустимое значение случайного числа.
 * @returns: случайное число.
 */
function get_random_number(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Функция запускает игру.
 */
let start_game = () => {
    // Очищаем поле
    let field = document.getElementById('game_field');
    field.innerText = '';
    // Запускаем игру
    game.stop();
    game.run();
}

/**
 * Функция останавливает игру.
 */
let stop_game = () => {
    game.stop();
}

/**
 * Класс, реализующий игру.
 */
class Game {

    /**
     * Конструктор.
     */
    constructor() {
        // Поле для вывода времени
        this.timer = document.getElementById('timer');
        // Поле для вывода счета в игре
        this.score_field = document.getElementById('score');
        // Поле для вывода потерянных шариков
        this.losses_field = document.getElementById('losses');
        // Игровое поле
        this.field = document.getElementById('game_field');
        // Время в мс, через которое прорисовывается игровое поле с шарами
        this.DT = 50;
    }

    /**
     * Метод создает шарики.
     */
    create_ball() {
        // Задаем следующий вызов и создание шарика через случайное время
        let dt = get_random_number(100, 2000);
        clearTimeout(this.timer_ball_creation_id);
        this.timer_ball_creation_id = setTimeout(this.create_ball.bind(this), dt);
        // Создаем шарик
        this.total_balls_number++;
        let height = this.field.clientHeight;
        let width = this.field.clientWidth;
        let ball = new Ball(width, height, this.total_balls_number);
        this.field.appendChild(ball.ball);
        this.balls.push(ball);
    }

    /**
     * Метод создает ветер.
     */
    create_wind() {
        // Задаем следующий вызов и создание ветра через  случайное время
        let dt = get_random_number(1000, 10000);
        clearTimeout(this.timer_wind_creation_id);
        this.timer_wind_creation_id = setTimeout(this.create_wind.bind(this), dt);
        // Создаем ветер
        this.wind.create();
    }

    /**
     * Метод отвечает за движение шариков.
     */
    move() {
        for (let i = 0; i < this.balls.length; i++) {
            // Учитываем ветер
            let [a, v] = this.wind.get();
            this.balls[i].influence(a, v);
            // Перемещаем шарик
            let is_inside = this.balls[i].move(this.DT / 1000);
            // Проверяем, пересекаются ли шарик и иголки
            let is_intersection = false;
            if (is_inside) {
                let [x_left, x_right, y] = this.needle.get_xy();
                is_intersection = this.balls[i].check_intersection(x_left, x_right, y);
                if (is_intersection) {
                    // Шарик пересекается с иглой
                    this.score += 1;
                    this.score_field.innerHTML = this.score;
                }
            }
            if (!is_inside || is_intersection) {
                // Если шарик вышел за пределы игрового поля или наткнулся
                // на иголку, удаляем шарик
                let ball = this.balls.splice(i, 1)[0];
                document.getElementById(ball.ball.id).remove();
                this.losses += 1;
                this.losses_field.innerHTML = this.losses;
            }
        }
        // Обнуляем ветер
        this.wind.set_to_zero();
    }

    /**
     * Метод запускает игру.
     */
    run() {
        // Запускаем счетчик времени
        this.time = 0;
        this.timer_id = setInterval(this.run_time.bind(this), 1000);
        // Создаем иголку
        let height = this.field.clientHeight;
        let width = this.field.clientWidth;
        this.needle = new Needle(width, height);
        this.field.appendChild(this.needle.needle);
        // Создаем ветер
        this.wind = new Wind();
        this.timer_wind_creation_id = setTimeout(this.create_wind.bind(this), 100);
        // Запускаем создание шариков
        this.timer_ball_creation_id = setTimeout(this.create_ball.bind(this), 100);
        // Счет в игре
        this.score = 0;
        this.score_field.innerHTML = this.score;
        this.losses = 0;
        this.losses_field.innerText = this.losses;
        // Массив для шариков и полное количество шариков
        this.balls = [];
        this.total_balls_number = 0;
        // Запускаем процесс движения
        this.timer_motion_id = setInterval(this.move.bind(this), this.DT);
    }

    /**
     * Метод отсчитывает время, пройденное от начала игры. Метод вызывается
     * через каждую 1 с.
     */
    run_time() {
        this.time += 1;
        this.timer.innerText = this.time;
        // Если в игре прошло больше 60 сек, то останавливаем игру
        if (this.time >= 60) {
            clearInterval(this.timer_id);
            clearTimeout(this.timer_ball_creation_id);
            clearTimeout(this.timer_motion_id);
        }
    }

    /**
     * Метод останавливает игру.
     */
    stop() {
        if (this.timer_id) {
            clearInterval(this.timer_id);
            clearTimeout(this.timer_ball_creation_id);
            clearTimeout(this.timer_motion_id);
        }
    }
}

/**
 * Класс для шариков.
 */
class Ball {

    /**
     * Конструктор.
     * @param x_max, y_max: максимальные значения для координат x и y;
     * @param id: id для создаваемого шарика.
     */
    constructor(x_max, y_max, id) {
        this.ball = document.createElement('div');
        this.ball.classList.add('ball');
        this.ball.id = id;
        // Определяем случайный цвет шарика
        this.ball.style.backgroundColor = get_random_color();
        // Определяем размеры шарика
        this.r = get_random_number(0, 100);
        this.ball.style.height = `${2 * this.r}px`;
        this.ball.style.width = `${2 * this.r}px`;
        // Определяем горизонтальное положение шарика
        this.x_max = x_max;
        this.y_max = y_max;
        this.x = get_random_number(this.r, x_max - 2 * this.r);
        this.y = this.r;
        this.set_position(this.x, this.y);
        // Случайная скорость движения (по горизонтали и вертикали)
        this.v_x = 0;
        this.v_y = get_random_number(20, 50);
    }

    /**
     * Метод проверяет, находится ли шарик внутри игрового поля.
     * @returns: true, если шарик внутри поля, иначе false.
     */
    check_inside() {
        if (0 > this.x - this.r || this.x + this.r > this.x_max)
            return false;
        if (0 > this.y - this.r || this.y + this.r > this.y_max)
            return false;
        return true;
    }

    /**
     * Метод проверяет пересечение иголки и шарика.
     * @param x_left, x_right, y: координаты x левой и правой сторон иголки,
     * а также координата y нижней стороны.
     * @returns: true, если иголка пересекает шарик, иначе false.
     */
    check_intersection(x_left, x_right, y) {
        if (this.y > y &&
            ((this.x - this.r <= x_left && x_left < this.x + this.r) ||
                (this.x - this.r <= x_right && x_right < this.x + this.r)))
            return true;
        else if (this.check_point_inside(x_left, y) ||
            this.check_point_inside(x_right, y))
            return true;
        return false;
    }

    /**
     * Метод проверяет, находится ли точка внутри шарика.
     * @param x, y: координаты точки.
     * @returns: true, если точка внутри, иначе false.
     */
    check_point_inside(x, y) {
        let r = Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2);
        if (Math.pow(this.r, 2) >= r)
            return true;
        return false;
    }

    /**
     * Метод учитывает влияние ветра.
     * @param a, v: угол и скорость ветра.
     */
    influence(a, v) {
        if (v < 1)
            return;
        // Ветер есть
        const K = 0.001;
        let x = 0;
        if (a > 90)
            x = this.x_max;
        this.v_x += Math.exp(-K * Math.abs(this.x - x)) * v * Math.cos(a * Math.PI / 180);
        this.v_y += Math.exp(-K * Math.abs(this.x - x)) * v * Math.sin(a * Math.PI / 180);
    }

    /**
     * Метод перемещает шарик.
     * @param dt: интервал времени, который прошел с предыдущего вызова.
     */
    move(dt) {
        this.x += this.v_x * dt;
        this.y += this.v_y * dt;
        this.set_position(this.x, this.y);
        return this.check_inside();
    }

    /**
     * Метод задает положение шарика.
     * @param x, y: координаты шарика.
     */
    set_position(x, y) {
        this.ball.style.bottom = `${this.y - this.r}px`;
        this.ball.style.left = `${this.x - this.r}px`;
    }
}

/**
 * Класс отвечает за иголку.
 */
class Needle {

    /**
     * Конструктор.
     * @param x_max, y_max: максимальные значения для координат x и y;
     */
    constructor(x_max, y_max) {
        this.needle = document.createElement('div');
        this.needle.classList.add('needle');

        document.addEventListener('keydown', this.move.bind(this));
        // Задаем размеры
        this.h = 100;
        this.w = 1;
        this.needle.style.height = `${this.h}px`;
        this.needle.style.width = `${this.w}px`;
        // Задаем положение
        this.x_max = x_max;
        this.y_max = y_max;
        this.x = x_max / 2;
        this.y = y_max - 2 * this.h / 3;
        this.set_position(this.x, this.y);
    }

    /**
     * Метод возвращает координаты левой, правой и нижней сторон иглы.
     * @returns: массив [x_left, x_right, y].
     */
    get_xy() {
        return [this.x - this.w / 2, this.x + this.w / 2, this.y];
    }

    /**
     * Метод управляет перемещением иглы.
     * @param e: событие, вызвавшее метод.
     */
    move(e) {
        let DX = 2;
        if (e.key == 'ArrowLeft')
            this.x -= DX;
        else if (e.key == 'ArrowRight')
            this.x += DX;
        this.set_position(this.x, this.y);
    }

    /**
     * Метод задает положение иголки.
     * @param x, y: координаты иголки.
     */
    set_position(x, y) {
        this.needle.style.bottom = `${this.y}px`;
        this.needle.style.left = `${this.x - this.w / 2}px`;
    }

}

/**
 * Класс отвечает за ветер.
 */
class Wind {

    /**
     * Конструктор.
     */
    constructor() {
        this.a = 0; // угол
        this.v = 0; // скорость
    }

    /**
     * Метод создает ветер в случайном направлении.
     */
    create() {
        // Случайная скорость
        this.v = get_random_number(10, 100);
        // Случайное направление
        this.a = get_random_number(0, 180);
    }

    /**
     * Метод получает угол и скорость ветра.
     * @returns: угол и скорость.
     */
    get() {
        return [this.a, this.v];
    }

    /**
     * Метод обнуляет ветер.
     */
    set_to_zero() {
        this.a = 0;
        this.v = 0;
    }
}

// Объект, отвечающий за игру
let game = new Game();