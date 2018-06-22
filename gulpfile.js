var gulp        = require("gulp"),
		sass        = require("gulp-sass"),
		browserSync = require("browser-sync"),
		imagemin    = require("gulp-imagemin"),
		concat      = require("gulp-concat"),
		uglify      = require("gulp-uglify-js"),
		cleancss    = require("gulp-clean-css"),
		del         = require("del"),
		cache       = require("gulp-cache"),
		pngquant    = require("imagemin-pngquant"),
		autoprefixer= require("gulp-autoprefixer"),
		wait        = require("gulp-wait"),
		rename      = require("gulp-rename");


//=========== Таск Browser-Sync===========
gulp.task("browser-sync", function() {
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: "src" // Директория для сервера - src
		},
		notify: false // Отключаем уведомления
	});
});


//=========== Таск Sass============
gulp.task("sass", function() {
		return gulp.src("src/sass/**/*.scss") // Берем источник
			.pipe(wait(250))
			.pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
		//.pipe(concat("styles.css"))
			.pipe(autoprefixer())
			.pipe(gulp.dest("src/css")) // Выгружаем результата в папку src/css
			.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});


//=========== Таск сбора CSS-библиотек =========
/*
gulp.task("css-libs", ["sass"], function() {
		return gulp.src("src/libs/magnific-popup/dist/magnific-popup.css") // Выбираем файлы для сбора
			.pipe(gulp.dest("src/css")); // Выгружаем в папку src/css
});
*/

/*==============ПРОБЛЕМА==============
//=========== Таск минификации JS-библиотек=======
gulp.task("scripts", function() { 
		return gulp.src([                  // Берем все необходимые библиотеки
			"src/libs/jquery/dist/jquery.min.js",   // Берем jQuery
			"src/libs/magnific-popup/dist/jquery.magnific-popup.min.js", // Берем Magnific Popup
	])
	.pipe(concat("libs.min.js")) // Собираем их в кучу в новом файле libs.min.js
	.pipe(uglify()) // Сжимаем JS файл
	.pipe(gulp.dest("src/js")); // Выгружаем в папку src/js
});
*/

//============= Таск Watch для работы =========
gulp.task("watch", ["browser-sync", "sass"] , function () {
	gulp.watch("src/sass/**/*.scss", ["sass"]); // Наблюдение за sass файлами в папке sass
	gulp.watch("src/*.html", browserSync.reload); // Наблюдение за HTML файлами в корне проекта
	gulp.watch("src/js/**/*.js", browserSync.reload); // Наблюдение за JS файлами в папке js
});


//=========== Очистка build =========
gulp.task("clean", function() {
		return del.sync("build"); // Удаляем папку build перед сборкой
});


//=========== Очистка кэша =========
gulp.task('clear', function (callback) {
	return cache.clearAll();
})


//=========== Минификация Картинок =======
gulp.task('img', function() {
	gulp.src('src/img/**/*') // Берем все изображения из src
			.pipe(cache(imagemin({
				interlaced: true,
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [pngquant()]
			})))
			.pipe(gulp.dest('build/img')) // Выгружаем на продакшен
});


//=========== Продакшн ========
gulp.task('build', ['clean', 'img', 'css-libs'], function() {

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'src/css/*.css'
		])
	.pipe(cleancss()) // Сжимаем
	.pipe(rename({suffix: ".min"})) // Добавляем суффикс .min
	.pipe(gulp.dest('build/css'))

	var buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('build/fonts'))

	var buildJs = gulp.src('src/js/**/*') // Переносим скрипты в продакшен
	.pipe(gulp.dest('build/js'))

	var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('build'));

});

gulp.task('default', ['watch']);