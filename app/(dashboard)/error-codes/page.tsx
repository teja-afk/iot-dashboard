import { listErrorCodes } from "@/lib/data";
import { ErrorCodesTable } from "@/components/error-codes/error-codes-table";

export const dynamic = "force-dynamic";

export default async function ErrorCodesPage() {
  const codes = await listErrorCodes();

  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-[#f6f8f7] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#17352f]">Error code list</h1>
          <p className="mt-2 text-sm text-slate-500">
            CPU error codes, recovery steps, and revision notes from the error_code_list collection.
          </p>
        </div>
        <ErrorCodesTable codes={codes} />
      </div>
    </main>
  );
}