type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

const escapeCell = (value: string): string => {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
};

export const toCsv = <T>(rows: T[], columns: CsvColumn<T>[]): string => {
  const headerLine = columns.map((column) => escapeCell(column.header)).join(",");
  const dataLines = rows.map((row) =>
    columns
      .map((column) => {
        const raw = column.value(row);
        const text = raw === null || raw === undefined ? "" : String(raw);
        return escapeCell(text);
      })
      .join(",")
  );

  return [headerLine, ...dataLines].join("\n");
};
