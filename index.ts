const enum ECitiesOfUkraine {
    Kyiv = 'Kyiv' ,
    Kharkiv = 'Kharkiv' ,
    Odesa = 'Odesa',
    Dnipro = 'Dnipro' ,
    Lviv = 'Lviv'
}
interface IWeather<C extends ECitiesOfUkraine = ECitiesOfUkraine> {
    city : C ,
    temperatureInCelsius : number
}
class Weather<C extends ECitiesOfUkraine> implements IWeather<C> {
    constructor (
        public readonly city : C ,
        public readonly temperatureInCelsius : number
    ) {}
}


const enum ECurrency {
    USD = 'USD',
    EUR = 'EUR' ,
    GBP = 'GBP'
}
interface IExchangeRates extends Record<ECurrency , number> {}
class ExchangeRates implements IExchangeRates {
    constructor (
        public readonly USD : number ,
        public readonly EUR : number ,
        public readonly GBP : number
    ) {}
}


function isWeatherForecast (type : any) : type is IWeather {
    return 'city' in type && 'temperatureInCelsius' in type
}
function isExchangeRates (type : any) : type is IExchangeRates {
    return 'USD' in type && 'EUR' in type && 'GBP' in type
}


interface IWeatherObserver {
    handleEvent : (notification : IWeather) => void
}
interface IExchangeRatesObserver {
    handleEvent : (notification : IExchangeRates) => void
}
class User implements IWeatherObserver , IExchangeRatesObserver {
    constructor (
        public readonly name : string
    ) {}

    handleEvent (notification : IWeather | IExchangeRates) {
        // обработка разных видов подписок
        if  (isWeatherForecast (notification)) {
            console.log (`${this.name} - "Weather Forecast" notification:`)
            console.log (`City - ${notification.city}`)
            console.log (`Temperatute - ${notification.temperatureInCelsius}\n`)
        }
        if (isExchangeRates (notification)) {
            console.log (`${this.name} - "Exchange Rates" notification:`)
            console.log (`${Object.entries (notification).join (' , ')}\n`)
        }
    }
}


// в зависимости от подписки определяем типы рассылок, которые должны принимать подписчики
type ObservableTypes<T> = T extends IWeatherObserver ? IWeather
                        : T extends IExchangeRatesObserver ? IExchangeRates
                        : never

// с помощью generic определяем доступные типы подписчиков, которые, в свою очередь, должны принимать типы ответов от данных рассылок
interface IObservable<O> {
    readonly add : (observer : O) => void
    readonly remove : (observer : O) => void
    readonly notify : (notification ?: ObservableTypes<O>) => void
}
abstract class Observable<O> implements IObservable<O> {
    protected abstract notificationArgument : ObservableTypes<O>
    protected readonly observers : O[] = []

    add (observer : O) {
        if (!this.observers.includes (observer)) {
            this.observers.push (observer)
        }
    }
    remove (observer : O) {
        const observerIndex = this.observers.indexOf (observer)
        if (observerIndex >= 0) {
            this.observers.splice (observerIndex , 1)
        }
    }
    abstract notify (notification ?: ObservableTypes<O>) : void
}


// сервис рассылки прогноза погоды
class WeatherForecastObservable<C extends ECitiesOfUkraine> extends Observable<IWeatherObserver> {
    protected notificationArgument : IWeather<C>

    private get temperatureInCelsius () : number {
        return Math.floor (Math.random () * 30)
    }

    constructor (
        public readonly city : C
    ) {
        super ()

        this.notificationArgument = new Weather (city , this.temperatureInCelsius)
    }

    notify (value ?: IWeather<C>) {
        const notification = value || this.notificationArgument
        this.observers.forEach(observer => observer.handleEvent (notification))
    }
}

// сервис рассылки курса валют
class ExchangeRatesObservable extends Observable<IExchangeRatesObserver> {
    protected notificationArgument : IExchangeRates = new ExchangeRates (this.USDExchangeRate , this.EURExchangeRate , this.GBPExchangeRate)
    
    private get USDExchangeRate () : number {
        return Math.floor ((Math.random () * 4) + 35)
    }
    private get EURExchangeRate () : number {
        return Math.floor ((Math.random () * 5) + 38)
    }
    private get GBPExchangeRate () : number {
        return Math.floor ((Math.random () * 6) + 43)
    }

    notify (value ?: IExchangeRates) {
        const notification = value || this.notificationArgument
        this.observers.forEach(observer => observer.handleEvent (notification))
    }
}


// examples
const userA = new User ('userA')
const userB = new User ('userB')

// создаем сервисы прогноза погоды для разных городов и сервис рассылки курса валют
const weatherForecastInKiev = new WeatherForecastObservable (ECitiesOfUkraine.Kyiv)
const weatherForecastInOdessa = new WeatherForecastObservable (ECitiesOfUkraine.Odesa)
const exchangeRatesService = new ExchangeRatesObservable ()

// подписка на сервисы
weatherForecastInKiev.add (userA)
exchangeRatesService.add (userA)

weatherForecastInKiev.add (userB)
weatherForecastInOdessa.add (userB)

exchangeRatesService.notify ()
weatherForecastInKiev.notify ()
weatherForecastInKiev.notify (new Weather (ECitiesOfUkraine.Kyiv , 23))

// error --- используя generic, нельзя подписаться на город, отличный от предоставленного сервисом weatherForecastInKiev
// weatherForecastInKiev.notify (new Weather (ECitiesOfUkraine.Lviv , 23))