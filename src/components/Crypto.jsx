import { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { getCandles, getPrice, getUser, getUsername } from '../helper/helper';
import { Link } from 'react-router-dom';

function Crypto() {
    const priceRef = useRef(0);
    const [, forceRender] = useState({});
    const [cryptoBalance, setCryptoBalance] = useState(0);
    const [amount, setAmount] = useState(0);
    const [, setCandles] = useState([]);
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const [balance, setBalance] = useState(1000);
    const seriesRef = useRef(null);

    // Инициализация графика
    useEffect(() => {
        const chart = createChart(chartContainerRef.current, {
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

    // Получение начальной цены
    useEffect(() => {
        const fetchInitialPrice = async () => {
            try {
                const priceResponse = await getPrice();
                if (priceResponse && priceResponse.price) {
                    priceRef.current = priceResponse.price;
                    forceRender({});
                }
            } catch (error) {
                console.error("Ошибка при получении начальной цены:", error);
            }
        };

        fetchInitialPrice();
    }, []);

    // Инициализация начальных свечей
    useEffect(() => {
        const fetchCandles = async () => {
            try {
                const response = await getCandles();

                if (!response || !Array.isArray(response)) {
                    console.error("Данные не получены или неправильный формат ответа", response);
                    return;
                }

                const uniqueCandles = Array.from(
                    new Map(response.map(candle => [candle.time, candle])).values()
                );

                const sortedCandles = uniqueCandles.sort((a, b) => {
                    return (a.time * 1000 + a.open) - (b.time * 1000 + b.open);
                });

                const candleData = sortedCandles.map(candle => ({
                    time: candle.time,
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                }));

                setCandles(candleData);
                if (seriesRef.current) {
                    seriesRef.current.setData(candleData);
                }
            } catch (error) {
                console.error("Ошибка при получении данных для свечей:", error);
            }
        };

        fetchCandles();
    }, []);

    // Обновление цены и свечей
    useEffect(() => {
        const updatePrice = () => {
            const change = (Math.random() - 0.5) * 5;
            priceRef.current = Math.max(0, Math.round((priceRef.current + change) * 100) / 100);

            setCandles((prevCandles) => {
                if (prevCandles.length === 0) {
                    const currentTime = Date.now();
                    const initialCandle = {
                        time: currentTime / 1000,
                        open: priceRef.current,
                        high: priceRef.current,
                        low: priceRef.current,
                        close: priceRef.current
                    };

                    if (seriesRef.current) {
                        seriesRef.current.setData([initialCandle]);
                    }

                    fetch('http://localhost:8081/api/candles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(initialCandle),
                    }).catch((err) => console.error('Error updating candle:', err));

                    return [initialCandle];
                }

                const currentTime = Date.now();
                const lastCandle = prevCandles[prevCandles.length - 1];

                if (currentTime - lastCandle.time * 1000 >= 5000) {
                    const newCandle = {
                        time: currentTime / 1000,
                        open: lastCandle.close,
                        high: Math.max(lastCandle.close, priceRef.current),
                        low: Math.min(lastCandle.close, priceRef.current),
                        close: priceRef.current,
                    };
                    const newCandles = [...prevCandles, newCandle];
                    if (seriesRef.current) {
                        seriesRef.current.setData(newCandles);
                    }

                    fetch('http://localhost:8081/api/candles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newCandle),
                    }).catch((err) => console.error('Error updating candle:', err));

                    return newCandles;
                }

                const updatedCandle = {
                    ...lastCandle,
                    high: Math.max(lastCandle.high, priceRef.current),
                    low: Math.min(lastCandle.low, priceRef.current),
                    close: priceRef.current,
                };
                const updatedCandles = [...prevCandles.slice(0, -1), updatedCandle];
                if (seriesRef.current) {
                    seriesRef.current.setData(updatedCandles);
                }

                fetch('http://localhost:8081/api/candles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedCandle),
                }).catch((err) => console.error('Error updating candle:', err));

                return updatedCandles;
            });

            fetch('http://localhost:8081/api/price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: priceRef.current }),
            }).catch((err) => console.error('Error updating price:', err));

            forceRender({});
        };

        const interval = setInterval(updatePrice, 1000);
        return () => clearInterval(interval);
    }, []);

    const buyCrypto = () => {
        if (balance < priceRef.current * amount) {
            alert('Недостаточно средств!');
            return;
        }
        if (amount < 0.1) {
            alert('Количество не должно быть меньше 0.1');
            return;
        }
        setBalance(balance - priceRef.current * amount);
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
        setBalance(balance + priceRef.current * amount);
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
        priceRef.current = Math.max(0, priceRef.current + event.effect);
        forceRender({});
    };

    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchUsernameAndData = async () => {
            try {
                const usernameResponse = await getUsername();
                const userResponse = await getUser({ username: usernameResponse.username });
                setData(userResponse.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUsernameAndData();
    }, []);

    if (data == null) return (
        <div className='p-4'>
            <div className="mb-4 bg-gray-900 rounded-lg p-4">
                <div ref={chartContainerRef}></div>
            </div>
            <div className="space-y-4">
                <h1 className="text-xl font-bold mt-1">Цена: ${priceRef.current.toFixed(2)}</h1>
                <Link to='/login'>if you want trade Login</Link>
                <Link to='/register'>or Signup</Link>
            </div>
        </div>
    );

    return (
        <div className="p-4">
            <div className="mb-4 bg-gray-900 rounded-lg p-4">
                <div ref={chartContainerRef}></div>
            </div>
            <div className="space-y-4">
                <h1 className="text-xl font-bold mt-1">Цена: ${priceRef.current.toFixed(2)}</h1>
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
                    {
                        data.username == 'abdulloh'
                            ?
                            <>
                                <button
                                    onClick={randomEvent}
                                >
                                    Случайное событие
                                </button>
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                                    onClick={() => {
                                        priceRef.current += 1;
                                        forceRender({});
                                    }}
                                >
                                    Повысить цену
                                </button>
                                <button
                                    className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'
                                    onClick={() => {
                                        priceRef.current = Math.max(0, priceRef.current - 1);
                                        forceRender({});
                                    }}
                                >
                                    Понизить цену
                                </button>
                            </>
                            :
                            <></>
                    }
                </div>
            </div>
        </div>
    );
}

export default Crypto;