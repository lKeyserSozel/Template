var gulp        = require("gulp"),
		sass        = require("gulp-sass"),
		browserSync = require("browser-sync"),
		imagemin    = require("gulp-imagemin"),
		plumber			=	require("gulp-plumber"),
		concat      = require("gulp-concat"),
		uglify      = require("gulp-uglify"),
		cleancss    = require("gulp-clean-css"),
		del         = require("del"),
		cache       = require("gulp-cache"),
		pngquant    = require("imagemin-pngquant"),
		autoprefixer= require("gulp-autoprefixer"),
		wait        = require("gulp-wait"),
		svgstore		=	require("gulp-svgstore"),
		cheerio			=	require("gulp-cheerio"),
		rename      = require("gulp-rename");



//=========== Browser-Sync===========
gulp.task("browser-sync", function() {
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: "src" // Директория для сервера - src
		},
		notify: false // Отключаем уведомления
	});
});


//=========== Sass============
gulp.task("sass", function() {
		return gulp.src("src/sass/**/*.scss") // Берем источник
			.pipe(plumber()) // Ошибки не останавливают процесс
			.pipe(wait(250))
			.pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
		//.pipe(concat("styles.css"))
			.pipe(autoprefixer())
			.pipe(gulp.dest("src/css")) // Выгружаем результата в папку src/css
			.pipe(cleancss()) // Сжимаем
			.pipe(rename({suffix: ".min"})) // Добавляем суффикс .min
			.pipe(gulp.dest("src/css")) // Выгружаем результата в папку src/css
			.pipe(browserSync.stream()) // Обновляем CSS на странице при изменении
});


//=========== Спрайт SVG =========
gulp.task("sprite", function () {
	return gulp.src("src/img/icon-*.svg")
		.pipe(cheerio({
			run: function ($) {
					$('[fill]').removeAttr('fill');
			},
			parserOptions: { xmlMode: true }
		}))
		.pipe(svgstore({
			inlineSvg:true
		}))
		.pipe(rename("sprite.svg"))
		.pipe(gulp.dest("src/img"));
});

//=========== Сбор CSS-библиотек =========
gulp.task("css-libs", ["sass"], function() {
	return gulp.src("src/libs/*.css") // Выбираем файлы для сбора
		.pipe(gulp.dest("src/css")); // Выгружаем в папку src/css
});

//=========== Минификация и сбор JS-библиотек=======
gulp.task("scripts", function() { 
	return gulp.src("src/libs/*.js")// Берем все необходимые библиотеки
// .pipe(concat("libs.min.js")) // Собираем их в кучу в новом файле libs.min.js
.pipe(uglify()) // Сжимаем JS файл
.pipe(gulp.dest("src/js")); // Выгружаем в папку src/js
});


//============= Watch для работы =========
gulp.task("watch", ["browser-sync", "sass"] , function () {
	gulp.watch("src/sass/**/*.scss", ["sass"]); // Наблюдение за sass файлами в папке sass
	gulp.watch("src/*.html", browserSync.reload); // Наблюдение за HTML файлами в корне проекта
	gulp.watch("src/js/**/*.js", browserSync.reload); // Наблюдение за JS файлами в папке js
});


//=========== Очистка build =========
gulp.task("clean", function() {
		return del.sync("build"); // Удаляем папку build перед сборкой
});


//=========== Минификация Картинок =======
gulp.task('img', ["sprite"], function() {
	gulp.src('src/img/**/*.{png,jpg,svg}') // Берем все изображения из src
			.pipe(imagemin([
					imagemin.gifsicle({interlaced: true}),
    			imagemin.jpegtran({progressive: true}),
    			imagemin.optipng({optimizationLevel: 3}),
    			imagemin.svgo({
        			plugins: [
            		{removeViewBox: true},
								{cleanupIDs: false}
							]
					})
			], {verbose: true}
		))
			.pipe(gulp.dest('build/img')) // Выгружаем на продакшен
});



//=========== Продакшн ========
gulp.task('build', ['clean', 'img', 'sass'], function() { //Если есть библиотеки то вместо sass > csslibs

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'src/css/*.css'
		])
	.pipe(gulp.dest('build/css'))

	var buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('build/fonts'))

	var buildJs = gulp.src('src/js/**/*') // Переносим скрипты в продакшен
	.pipe(gulp.dest('build/js'))

	var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('build'));

});

gulp.task('default', ['watch']);