import { useEffect, useState } from "react";
import { addExpense, deleteExpense, getExpenses, updateExpense } from "../services/api";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import ExpenseChart from "../components/ExpenseChart";
import "./Dashboard.css";

function Dashboard() {
    const [filterApplied, setFilterApplied] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [infoMessage, setInfoMessage] = useState(null);

    const getCurrentMonthExpenses = (expenses) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);
            return (
                expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear
            );
        });
    };

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await getExpenses(startDate, endDate);
            const sortedExpenses = data.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );
            setExpenses(sortedExpenses);

            let filtered = [];

            if(!startDate && !endDate) {
                filtered = getCurrentMonthExpenses(sortedExpenses);
            } else {
                filtered = sortedExpenses.filter((expense) => {
                    const expenseDate = new Date(expense.date);
                    return (
                        (!startDate || new Date(expense.date) >= new Date(startDate)) &&
                        (!endDate || new Date(expense.date) <= new Date(endDate))
                    );
                });
            }
            setFilteredExpenses(filtered);
            if (filtered.length === 0 && filterApplied) {
                setInfoMessage("No expenses found for selected period.");
            } else {
                setInfoMessage(null);
            }
            setError(null);            
        } catch (error) {
            setError("Failed to fetch expenses.");
            setInfoMessage(null);
            setExpenses([]);
            setFilteredExpenses([]);
            console.error("Failed to fetch expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [startDate, endDate]);

    const handleAddExpense = async (expense) => {
        try {
            const newExpense = await addExpense(expense);
            const updatedExpenses = [...expenses, newExpense];
            setExpenses(updatedExpenses);

            if(!startDate && !endDate) {
                setFilteredExpenses(getCurrentMonthExpenses(updatedExpenses));
            } else {
                setFilteredExpenses(
                    updatedExpenses.filter((expense) => {
                        const expenseDate = new Date(expense.date);
                        return (
                            (!startDate || new Date(expense.date) >= new Date(startDate)) &&
                            (!endDate || new Date(expense.date) <= new Date(endDate))
                        );
                    })
                );
            }
        } catch (error) {
            console.error("Failed to add expense:", error);
        }
    };

    const handleFilter = () => {
        setFilterApplied(true);
        fetchExpenses();
    };

    const handleDeleteExpense = async (id) => {
        try {
            await deleteExpense(id);
            const updatedExpenses = expenses.filter((expense) => expense.id !== id);
            setExpenses(updatedExpenses);
            if(!startDate && !endDate) {
                setFilteredExpenses(getCurrentMonthExpenses(updatedExpenses));
            } else {
                setFilteredExpenses(
                    updatedExpenses.filter((expense) => {
                        const expenseDate = new Date(expense.date);
                        return (
                            (!startDate || expenseDate >= new Date(startDate)) &&
                            (!endDate || expenseDate <= new Date(endDate))
                        );
                    })
                );
            }
        } catch (err) {
            console.error("Failed to delete expense", err);
        }
    };

    const handleUpdateExpense = async (id, updatedData) => {
        try {
            const updated = await updateExpense(id, updatedData);
            const updatedExpenses = expenses.map((expense) =>
                expense.id === id ? updated : expense
            );
            setExpenses(updatedExpenses);
    
            const updatedFiltered = updatedExpenses.filter((expense) => {
                const expenseDate = new Date(expense.date);
                return (
                    (!startDate || expenseDate >= new Date(startDate)) &&
                    (!endDate || expenseDate <= new Date(endDate))
                );
            });
    
            setFilteredExpenses(startDate || endDate ? updatedFiltered : getCurrentMonthExpenses(updatedExpenses));
        } catch (err) {
            console.error("Failed to update expense:", err);
        }
    };    

    return (
        <div className="dashboard">
            <div className="main-content">
                <header>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Personal Finance Tracker
                    </h1>
                </header>
                <ExpenseForm onAddExpense={handleAddExpense} />
                <div className="my-4">
                    <h2>Filter</h2>
                    <label className="block mb-2">
                        Start Date:
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="ml-2 p-1 border border-gray-300 rounded"
                        />
                    </label>
                    <label className="block mb-2">
                        End Date:
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="ml-2 p-1 border border-gray-300 rounded"
                        />
                    </label>
                    <button
                        onClick={handleFilter}
                        className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Filter
                    </button>
                </div>
                {loading ? (
    <div>Loading...</div>
) : error ? (
    <div className="text-red-500">{error}</div>
) : infoMessage ? (
    <div className="text-gray-500">{infoMessage}</div>
) : (
    <ExpenseList 
        expenses={filteredExpenses}
        onExpenseUpdated={handleUpdateExpense}
        onExpenseDeleted={handleDeleteExpense}
    />
)}
            </div>
            <div className="chart-container">
                <ExpenseChart expenses={filteredExpenses} />
            </div>
        </div>
    );
}

export default Dashboard;