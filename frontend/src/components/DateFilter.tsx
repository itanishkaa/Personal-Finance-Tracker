interface DateFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

function DateFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
}: DateFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        From
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        To
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
        />
      </label>
      <button
        onClick={onApply}
        className="bg-ink hover:bg-ink-soft text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
      >
        Filter
      </button>
      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className="text-sm text-ink-soft hover:text-ink underline underline-offset-2"
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default DateFilter;
