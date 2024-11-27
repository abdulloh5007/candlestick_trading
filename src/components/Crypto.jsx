import { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { getUser, getUsername } from '../helper/helper';

function Crypto() {
    const [price, setPrice] = useState(100);
    const [balance, setBalance] = useState(1000);
    const [cryptoBalance, setCryptoBalance] = useState(0);
    const [amount, setAmount] = useState(0);
    const [candles, setCandles] = useState([]);
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    // Инициализация графика
    useEffect(() => {
        const chart = createChart(chartContainerRef.current, {
            width: 800,
            height: 400,
            layout: {
                textColor: 'white',
                background: { type: 'solid', color: 'black' },
            },
        });
        chartRef.current = chart;

        const series = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        seriesRef.current = series;

        return () => chart.remove();
    }, []);

    // Инициализация начальных свечей
    useEffect(() => {
        const initialData = [];
        const now = Date.now();
        const basePrice = 100;

        for (let i = 0; i < 30; i++) {
            const time = now - (30 - i) * 5000;
            const volatility = 5;
            const open = basePrice + Math.random() * volatility * 2 - volatility;
            const close = basePrice + Math.random() * volatility * 2 - volatility;
            const high = Math.max(open, close) + Math.random() * volatility;
            const low = Math.min(open, close) - Math.random() * volatility;

            initialData.push({
                time: time / 1000, // Время в секундах
                open,
                high,
                low,
                close,
            });
        }

        setCandles(initialData);
        if (seriesRef.current) {
            seriesRef.current.setData(initialData);
        }
    }, []);

    // Обновление цены и свечей
    useEffect(() => {
        const updatePrice = () => {
            setPrice((prevPrice) => {
                const change = (Math.random() - .5) * 5;
                return Math.max(0, Math.round((prevPrice + change) * 100) / 100);
            });

            setCandles((prevCandles) => {
                const currentTime = Date.now();
                const lastCandle = prevCandles[prevCandles.length - 1];

                // Если прошла минута, создаем новую свечу
                if (currentTime - lastCandle.time * 1000 >= 5000) {
                    const newCandle = {
                        time: currentTime / 1000,
                        open: lastCandle.close,
                        high: Math.max(lastCandle.close, price),
                        low: Math.min(lastCandle.close, price),
                        close: price,
                    };
                    const newCandles = [...prevCandles, newCandle]; // Не срезаем, просто добавляем
                    if (seriesRef.current) {
                        seriesRef.current.setData(newCandles); // Обновляем график с полными данными
                    }
                    return newCandles;
                }

                // Иначе обновляем текущую свечу
                const updatedCandle = {
                    ...lastCandle,
                    high: Math.max(lastCandle.high, price),
                    low: Math.min(lastCandle.low, price),
                    close: price,
                };
                const updatedCandles = [...prevCandles.slice(0, -1), updatedCandle];
                if (seriesRef.current) {
                    seriesRef.current.setData(updatedCandles);
                }
                return updatedCandles;
            });
        };

        const interval = setInterval(updatePrice, 1000);
        return () => clearInterval(interval);
    }, [price]);

    const buyCrypto = () => {
        if (balance < price * amount) {
            alert('Недостаточно средств!');
            return;
        }
        if (amount < 0.1) {
            alert('Количество не должно быть меньше 0.1');
            return;
        }
        setBalance(balance - price * amount);
        setCryptoBalance(Number(cryptoBalance) + Number(amount));
    };

    const sellCrypto = () => {
        if (amount < 0.1) {
            alert('Количество не должно быть меньше 0.1');
            return;
        }
        if (amount > cryptoBalance) {
            alert('Недостаточно криптовалюты для продажи!');
            return;
        }
        setBalance(balance + price * amount);
        setCryptoBalance(cryptoBalance - amount);
    };

    const randomEvent = () => {
        const events = [
            { name: 'Новости: криптовалюта растет!', effect: 10 },
            { name: 'Новости: рынок падает!', effect: -10 },
            { name: 'Нет изменений.', effect: 0 },
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        alert(event.name);
        setPrice((prevPrice) => Math.max(0, prevPrice + event.effect));
    };

    const [userName, setUsername] = useState('')
    const [data, setData] = useState([])

    useEffect(() => {
        getUsername()
            .then(user => setUsername(user.username))
            .catch(error => console.error(error))

        getUser({ username: userName })
            .then(user => setData(user.data))
            .catch(error => console.error(error));
    }, [userName])

    if (data == null) return <div className='p-4'>
        <div className="mb-4 bg-gray-900 rounded-lg p-4">
            <div ref={chartContainerRef}></div>
        </div>
        <div className="space-y-4">
            <h1 className="text-xl font-bold mt-1">Цена: ${price.toFixed(2)}</h1>
        </div>
    </div>

    return (
        <div className="p-4">
            <div className="mb-4 bg-gray-900 rounded-lg p-4">
                <div ref={chartContainerRef}></div>
            </div>
            <div className="space-y-4">
                <h1 className="text-xl font-bold mt-1">Цена: ${price.toFixed(2)}</h1>
                <div className="space-x-4">
                    <span className="font-bold">Криптовалюта: {data.cryptoBalance?.toFixed(1)}</span>
                    <span className="font-bold">Баланс: ${data.balance?.toFixed(2)}</span>
                </div>
                <div className="space-x-2">
                    <input
                        className="border p-2 rounded"
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        placeholder="Кол-во"
                        step="0.1"
                        min="0.1"
                    />
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                        onClick={buyCrypto}
                    >
                        Купить
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        onClick={sellCrypto}
                    >
                        Продать
                    </button>
                    <button
                        onClick={randomEvent}
                    >
                        Случайное событие
                    </button>
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                        onClick={() => setPrice((prev) => prev + 1)}
                    >
                        Повысить цену
                    </button>
                    <button
                        className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'
                        onClick={() => setPrice((prev) => Math.max(0, prev - 1))}
                    >
                        Понизить цену
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Crypto;
