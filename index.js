"use strict";
class Weather {
    city;
    temperatureInCelsius;
    constructor(city, temperatureInCelsius) {
        this.city = city;
        this.temperatureInCelsius = temperatureInCelsius;
    }
}
class ExchangeRates {
    USD;
    EUR;
    GBP;
    constructor(USD, EUR, GBP) {
        this.USD = USD;
        this.EUR = EUR;
        this.GBP = GBP;
    }
}
function isWeatherForecast(type) {
    return 'city' in type && 'temperatureInCelsius' in type;
}
function isExchangeRates(type) {
    return 'USD' in type && 'EUR' in type && 'GBP' in type;
}
class User {
    name;
    constructor(name) {
        this.name = name;
    }
    handleEvent(notification) {
        // обработка разных видов подписок
        if (isWeatherForecast(notification)) {
            console.log(`${this.name} - "Weather Forecast" notification:`);
            console.log(`City - ${notification.city}`);
            console.log(`Temperatute - ${notification.temperatureInCelsius}\n`);
        }
        if (isExchangeRates(notification)) {
            console.log(`${this.name} - "Exchange Rates" notification:`);
            console.log(`${Object.entries(notification).join(' , ')}\n`);
        }
    }
}
class Observable {
    observers = [];
    add(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }
    remove(observer) {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex >= 0) {
            this.observers.splice(observerIndex, 1);
        }
    }
}
// сервис рассылки прогноза погоды
class WeatherForecastObservable extends Observable {
    city;
    notificationArgument;
    get temperatureInCelsius() {
        return Math.floor(Math.random() * 30);
    }
    constructor(city) {
        super();
        this.city = city;
        this.notificationArgument = new Weather(city, this.temperatureInCelsius);
    }
    notify(value) {
        const notification = value || this.notificationArgument;
        this.observers.forEach(observer => observer.handleEvent(notification));
    }
}
// сервис рассылки курса валют
class ExchangeRatesObservable extends Observable {
    notificationArgument = new ExchangeRates(this.USDExchangeRate, this.EURExchangeRate, this.GBPExchangeRate);
    get USDExchangeRate() {
        return Math.floor((Math.random() * 4) + 35);
    }
    get EURExchangeRate() {
        return Math.floor((Math.random() * 5) + 38);
    }
    get GBPExchangeRate() {
        return Math.floor((Math.random() * 6) + 43);
    }
    notify(value) {
        const notification = value || this.notificationArgument;
        this.observers.forEach(observer => observer.handleEvent(notification));
    }
}
// examples
const userA = new User('userA');
const userB = new User('userB');
// создаем сервисы прогноза погоды для разных городов и сервис рассылки курса валют
const weatherForecastInKiev = new WeatherForecastObservable("Kyiv" /* ECitiesOfUkraine.Kyiv */);
const weatherForecastInOdessa = new WeatherForecastObservable("Odesa" /* ECitiesOfUkraine.Odesa */);
const exchangeRatesService = new ExchangeRatesObservable();
// подписка на сервисы
weatherForecastInKiev.add(userA);
exchangeRatesService.add(userA);
weatherForecastInKiev.add(userB);
weatherForecastInOdessa.add(userB);
exchangeRatesService.notify();
weatherForecastInKiev.notify();
weatherForecastInKiev.notify(new Weather("Kyiv" /* ECitiesOfUkraine.Kyiv */, 23));
// error --- используя generic, нельзя подписаться на город, отличный от предоставленного сервисом weatherForecastInKiev
// weatherForecastInKiev.notify (new Weather (ECitiesOfUkraine.Lviv , 23))
