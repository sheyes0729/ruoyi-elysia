type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

type HeaderSetter = {
  headers: Record<string, string | number>;
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

export const buildCsvDownload = <T>(
  set: HeaderSetter,
  rows: T[],
  columns: CsvColumn<T>[],
  filename: string
): string => {
  const csv = toCsv(rows, columns);
  set.headers["content-type"] = "text/csv; charset=utf-8";
  set.headers["content-disposition"] = `attachment; filename=${filename}`;
  return `\uFEFF${csv}`;
};
