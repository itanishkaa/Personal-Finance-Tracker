import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

function ExpenseChart({ expenses }) {
    if(expenses.length === 0) {
        return <p>No expenses to display.</p>
    }

    const dates = expenses.map((expense) => new Date(expense.date).toLocaleDateString());
    const amounts = expenses.map((expense) => expense.amount);

    const data = {
        labels: dates,
        datasets: [
            {
                label: "Expenses Over Time",
                data: amounts,
                fill: false,
                backgroundColor: "rgb(75, 192, 192)",
                borderColor: "rgba(75, 192, 192, 0.2)",
            },
        ],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Amount",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
            },
        },
    };

    return <Line data={data} options={options} />;
}

ExpenseChart.propTypes = {
    expenses: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            date: PropTypes.string.isRequired,
            amount: PropTypes.number.isRequired,
            description: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default ExpenseChart;