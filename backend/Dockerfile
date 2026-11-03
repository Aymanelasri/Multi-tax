FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip

RUN docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . /var/www

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

RUN apt-get install -y apache2 libapache2-mod-php
RUN a2enmod rewrite headers

COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 8080

CMD sh -c "php artisan migrate --force && apache2-foreground"
