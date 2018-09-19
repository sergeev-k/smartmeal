"use strict";

/* параметры для gulp-autoprefixer */
var autoprefixerList = [
    'Chrome >= 45',
    // 'Firefox ESR',
    'Edge >= 12',
    'Explorer >= 10',
    'iOS >= 9',
    'Safari >= 9',
    'Android >= 4.4',
    'Opera >= 30'
];
/* пути к исходным файлам (src), к готовым файлам (build), а также к тем, за изменениями которых нужно наблюдать (watch) */
var path = {
    build: {
        html: './build/',
        js: './build/js/',
        css: './build/css/',
        img: './build/img/',
        fonts: './build/fonts/'
    },
    src: {
        html: './src/*.html',
        js: './src/js/*.js',
        style: './src/style/*.scss',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*'
    },
    watch: {
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        css: './src/style/**/*.scss',
        img: './src/img/**/*.*',
        fonts: './srs/fonts/**/*.*'
    },
    clean: './build/'
};
/* настройки сервера */
var config = {
    server: {
        baseDir: './build/'
    },
    notify: false
};

/* подключаем gulp и плагины */
var gulp = require('gulp'), // подключаем Gulp
    posthtml = require('gulp-posthtml'),
    include = require('posthtml-include'),
    webserver = require('browser-sync'), // сервер для работы и автоматического обновления страниц
    plumber = require('gulp-plumber'), // модуль для отслеживания ошибок
    rigger = require('gulp-rigger'), // модуль для импорта содержимого одного файла в другой
    // sourcemaps = require('gulp-sourcemaps'), // модуль для генерации карты исходных файлов
    sass = require('gulp-sass'), // модуль для компиляции SASS (SCSS) в CSS
    autoprefixer = require('gulp-autoprefixer'), // модуль для автоматической установки автопрефиксов
    csso = require('gulp-csso'), // плагин для минимизации CSS
    gcmq = require('gulp-group-css-media-queries'), // группирует медиа
    rename = require('gulp-rename'), // переименовывание файла
    uglify = require("gulp-uglify"), // модуль для минимизации JavaScript
    concat = require('gulp-concat'),
    babel = require('gulp-babel'),
    cache = require('gulp-cache'), // модуль для кэширования
    imagemin = require('gulp-imagemin'), // плагин для сжатия PNG, JPEG, GIF и SVG изображений
    svgstore = require('gulp-svgstore'),
    webp = require('gulp-webp'),
    del = require('del'); // плагин для удаления файлов и каталогов

/* задачи */

// запуск сервера
gulp.task('webserver', function () {
    webserver(config);
});

// сбор html
gulp.task('html:build', function () {
    gulp.src(path.src.html) // выбор всех html файлов по указанному пути
        .pipe(plumber()) // отслеживание ошибок
        .pipe(rigger()) // импорт вложений
        .pipe(posthtml([
            include()
        ]))
        .pipe(gulp.dest(path.build.html)) // выкладывание готовых файлов
        .pipe(webserver.reload({
            stream: true
        })); // перезагрузка сервера
});

// сбор стилей
gulp.task('css:build', function () {
    gulp.src(path.src.style) // получим main.scss
        .pipe(plumber()) // для отслеживания ошибок
        // .pipe(sourcemaps.init()) // инициализируем sourcemap
        
        .pipe(sass()) // scss -> css
        .pipe(autoprefixer({ // добавим префиксы
            browsers: autoprefixerList
        }))
        // .pipe(sourcemaps.write('./')) // записываем sourcemap
        .pipe(gulp.dest(path.build.css)) // выгружаем в build
        .pipe(concat('style.min.css'))
        .pipe(gcmq())
        .pipe(csso())
        // .pipe(rename('style.min.css'))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({
            stream: true
        })); // перезагрузим сервер
});

// сбор js
gulp.task('js:build', function () {
    gulp.src(path.src.js) // получим файл main.js
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(rigger()) // импортируем все указанные файлы в main.js
        .pipe(gulp.dest(path.build.js))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('all.js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify().on('error', function(e){
            console.log(e);
        }))
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({
            stream: true
        })); // перезагрузим сервер
});

// перенос шрифтов
gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

// обработка картинок
gulp.task('image:build', function () {
    gulp.src(path.src.img) // путь с исходниками картинок
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(gulp.dest(path.build.img)); // выгрузка готовых файлов
});

// WEBP
// gulp.task('webp:build', function () {
//     gulp.src('./src/img/**/*.{png,jpg}')
//         .pipe(webp({
//             quality: 90
//         }))
//         .pipe(gulp.dest(path.build.img));
// });

// SPRITE
gulp.task('svg:build', function () {
    gulp.src('./src/img/**/icon-*.svg') // указана папка BUILD готовых чистых svg запускается отдельно для создания спрайта
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename('sprite.svg'))

        .pipe(gulp.dest(path.build.img));
});

// удаление каталога build 
gulp.task('clean:build', function () {
    del.sync(path.clean);
});

// очистка кэша
gulp.task('cache:clear', function () {
    cache.clearAll();
});

// сборка
gulp.task('build', [
    'clean:build',
    'html:build',
    'css:build',
    'js:build',
    'fonts:build',
    'image:build',
    // 'webp:build',
    'svg:build'
]);

// запуск задач при изменении файлов
gulp.task('watch', function () {
    gulp.watch(path.watch.html, ['html:build']);
    gulp.watch(path.watch.css, ['css:build']);
    gulp.watch(path.watch.js, ['js:build']);
    gulp.watch(path.watch.img, ['image:build']);
    // gulp.watch(path.watch.img, ['webp:build']);
    gulp.watch(path.watch.img, ['svg:build']);
    gulp.watch(path.watch.fonts, ['fonts:build']);
});

// задача по умолчанию
gulp.task('default', [
    'clean:build',
    'build',
    'webserver',
    'watch'
]);

