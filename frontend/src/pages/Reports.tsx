import { useEffect, useState } from "react";
import {
  getMonthlyReport,
  downloadTransactionsCsv,
  downloadMonthlyReportPdf,
} from "../api/reports";
import { extractErrorMessage } from "../api/client";
import type { MonthlyReport } from "../types/reports";
import { formatCurrency, formatDate } from "../utils/format";
import Header from "../components/Header";
import StubCard from "../components/StubCard";

function currentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

// First and last day of the given month, as "YYYY-MM-DD" strings, for
// scoping the CSV export to the same period the report is showing.
function monthBounds(
  month: number,
  year: number,
): { startDate: string; endDate: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return {
    startDate: `${year}-${pad(month)}-01`,
    endDate: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
}

function Reports() {
  const [{ month, year }, setPeriod] = useState(currentMonthYear());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMonthlyReport(month, year);
      setReport(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to load this month's report."));
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handleMonthInputChange = (value: string) => {
    const [y, m] = value.split("-").map(Number);
    if (y && m) setPeriod({ month: m, year: y });
  };

  const handleDownloadCsv = async () => {
    setDownloadError(null);
    setDownloadingCsv(true);
    try {
      await downloadTransactionsCsv(monthBounds(month, year));
    } catch (err) {
      setDownloadError(extractErrorMessage(err, "Failed to download CSV."));
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadError(null);
    setDownloadingPdf(true);
    try {
      await downloadMonthlyReportPdf(month, year);
    } catch (err) {
      setDownloadError(extractErrorMessage(err, "Failed to download PDF."));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const monthInputValue = `${year}-${String(month).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display font-semibold text-xl text-ink mb-1">
              Reports
            </h1>
            <p className="text-sm text-ink-soft">
              Monthly summary and exports.
            </p>
          </div>
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Month
            <input
              type="month"
              value={monthInputValue}
              onChange={(e) => handleMonthInputChange(e.target.value)}
              className="border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
            />
          </label>
        </div>

        {loading ? (
          <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft">
            Loading report…
          </div>
        ) : error ? (
          <div className="bg-brick-light border border-brick/30 rounded-lg p-6 text-center">
            <p className="text-brick font-medium mb-3">{error}</p>
            <button
              onClick={fetchReport}
              className="bg-brick hover:bg-brick/90 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : report ? (
          <>
            <h2 className="font-display font-semibold text-lg text-ink -mb-2">
              {report.period}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StubCard
                label="Income"
                value={formatCurrency(report.income)}
                tone="teal"
              />
              <StubCard
                label="Expenses"
                value={formatCurrency(report.expenses)}
                tone="brick"
              />
              <StubCard
                label="Savings"
                value={formatCurrency(report.savings)}
                tone="ink"
              />
              <StubCard
                label="Savings rate"
                value={`${report.savings_rate.toFixed(1)}%`}
                tone="gold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card border border-line rounded-lg p-5">
                <h3 className="font-display font-semibold text-base mb-2">
                  Top category
                </h3>
                {report.top_category ? (
                  <div className="ledger-row">
                    <span>{report.top_category.name}</span>
                    <span className="ledger-leader" />
                    <span className="amount text-ink">
                      {formatCurrency(report.top_category.amount)}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-ink-soft">
                    No expenses recorded this period.
                  </p>
                )}
              </div>

              <div className="bg-card border border-line rounded-lg p-5">
                <h3 className="font-display font-semibold text-base mb-2">
                  Largest expense
                </h3>
                {report.largest_expense ? (
                  <>
                    <div className="ledger-row">
                      <span>{report.largest_expense.description}</span>
                      <span className="ledger-leader" />
                      <span className="amount text-ink">
                        {formatCurrency(report.largest_expense.amount)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-soft mt-1">
                      {formatDate(report.largest_expense.date)}
                      {report.largest_expense.category_name
                        ? ` · ${report.largest_expense.category_name}`
                        : " · Uncategorized"}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-ink-soft">
                    No expenses recorded this period.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-card border border-line rounded-lg p-5">
              <h3 className="font-display font-semibold text-base mb-1">
                Export
              </h3>
              <p className="text-sm text-ink-soft mb-4">
                Download this period's data as a spreadsheet or a shareable PDF
                summary.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownloadCsv}
                  disabled={downloadingCsv}
                  className="bg-ink hover:bg-ink-soft disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
                >
                  {downloadingCsv ? "Preparing…" : "Download CSV"}
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
                >
                  {downloadingPdf ? "Preparing…" : "Download PDF"}
                </button>
              </div>
              {downloadError && (
                <p className="text-brick text-sm mt-3" role="alert">
                  {downloadError}
                </p>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default Reports;
