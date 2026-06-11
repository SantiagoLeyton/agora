"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Surface } from "./surface";

interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No hay registros",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <Surface variant="muted" className="py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </Surface>
    );
  }

  return (
    <Surface padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <motion.tr
                key={keyExtractor(row)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIndex * 0.03 }}
                className="group border-b border-border/35 transition-colors last:border-0 hover:bg-muted/40"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-5 py-4 align-middle", col.className)}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Surface>
  );
}
