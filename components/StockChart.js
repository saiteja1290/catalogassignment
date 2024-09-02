"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import '../components/FinancialChart.css';

// Register required components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const FinancialChart = () => {
    const [priceData, setPriceData] = useState(null);
    const [selectedTimeFrame, setSelectedTimeFrame] = useState('7'); // 7 days
    const [selectedCoin, setSelectedCoin] = useState('bitcoin'); // default coin is Bitcoin

    useEffect(() => {
        fetchPriceData(selectedTimeFrame, selectedCoin);
    }, [selectedTimeFrame, selectedCoin]);

    const fetchPriceData = async (days, coin) => {
        try {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`
            );
            const data = response.data;
            const prices = data.prices.map(price => ({ x: new Date(price[0]), y: price[1] }));
            const currentPrice = prices[prices.length - 1].y;
            const highPrice = Math.max(...prices.map(price => price.y));
            const priceChange = currentPrice - prices[0].y;
            const percentageChange = ((priceChange / prices[0].y) * 100).toFixed(2);

            setPriceData({
                currentPrice,
                priceChange,
                percentageChange,
                highPrice,
                prices,
            });
        } catch (error) {
            console.error('Error fetching price data:', error);
        }
    };

    const data = {
        datasets: [
            {
                label: `${selectedCoin.charAt(0).toUpperCase() + selectedCoin.slice(1)} Price (USD)`,
                data: priceData ? priceData.prices : [],
                borderColor: '#b52cff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: selectedTimeFrame === '1' ? 'hour' : 'day',
                },
                title: {
                    display: true,
                    text: 'Time',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Price (USD)',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <div className="financial-chart-container text-black">
            <div className="coin-selector">
                <label htmlFor="coin-select">Choose a coin: </label>
                <select
                    id="coin-select"
                    value={selectedCoin}
                    onChange={(e) => setSelectedCoin(e.target.value)}
                >
                    <option value="bitcoin">Bitcoin</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="ripple">Ripple</option>
                    <option value="litecoin">Litecoin</option>
                    <option value="dogecoin">Dogecoin</option>
                </select>
            </div>
            <div className="price-summary">
                <h1 className='font-bold'>{priceData ? priceData.currentPrice.toLocaleString() : 'Loading...'} <span className='text-sm text-gray-700'>USD</span> </h1>
                <p className="price-change text-xs">
                    {priceData ? (priceData.priceChange >= 0 ? '+' : '') + priceData.priceChange.toFixed(2) : ''} ({priceData ? priceData.percentageChange : ''}%)
                </p>
            </div>

            <nav className="chart-navigation">
                <ul>
                    <li>Summary</li>
                    <li className="active">Chart</li>
                    <li>Statistics</li>
                    <li>Analysis</li>
                    <li>Settings</li>
                </ul>
            </nav>

            <div className="chart-container">
                <div className="chart-controls">
                    <button>Fullscreen</button>
                    <button>Compare</button>
                </div>



                <div className="timeframe-selector">
                    {['1', '7', '30', '365'].map((days) => (
                        <button
                            key={days}
                            className={selectedTimeFrame === days ? 'active' : ''}
                            onClick={() => setSelectedTimeFrame(days)}
                        >
                            {days === '1' ? '1d' : days === '7' ? '1w' : days === '30' ? '1m' : '1y'}
                        </button>
                    ))}
                </div>

                <div className="chart">
                    {priceData ? <Line data={data} options={options} /> : 'Loading chart...'}
                </div>
            </div>
        </div>
    );
};

export default FinancialChart;
