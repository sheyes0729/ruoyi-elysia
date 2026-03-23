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

export type CsvParseOptions = {
  headers: string[];
  skipEmptyRows?: boolean;
};

export const parseCsv = (content: string, options: CsvParseOptions): Record<string, string>[] => {
  const lines = content.split(/\r?\n/).filter((line) => {
    if (options.skipEmptyRows) {
      return line.trim().length > 0;
    }
    return true;
  });

  if (lines.length === 0) {
    return [];
  }

  const headerLine = lines[0];
  const headerMap = new Map<string, number>();

  headerLine.split(",").forEach((header, index) => {
    const normalized = header.trim().replace(/^"|"$/g, "").trim();
    headerMap.set(normalized, index);
  });

  const { headers: requiredHeaders } = options;
  const missingHeaders = requiredHeaders.filter((h) => !headerMap.has(h));
  if (missingHeaders.length > 0) {
    throw new Error(`缺少必需列: ${missingHeaders.join(", ")}`);
  }

  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {continue;}

    const values = parseRow(line);
    const row: Record<string, string> = {};

    for (const header of requiredHeaders) {
      const index = headerMap.get(header);
      if (index !== undefined) {
        row[header] = values[index] ?? "";
      }
    }

    result.push(row);
  }

  return result;
};

const parseRow = (line: string): string[] => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

export type ImportResult<T> = {
  success: T[];
  failures: { row: number; data: Record<string, string>; error: string }[];
};

export const buildCsvTemplate = (
  set: HeaderSetter,
  filename: string,
  headers: { key: string; title: string }[]
): string => {
  set.headers["content-type"] = "text/csv; charset=utf-8";
  set.headers["content-disposition"] = `attachment; filename=${filename}`;
  const headerLine = headers.map((h) => `"${h.title}"`).join(",");
  return `\uFEFF${headerLine}`;
};
